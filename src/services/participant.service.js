const prisma = require('../config/prisma');
const participantRepo = require('../repositories/participant.repository');
const eventRepo = require('../repositories/event.repository');
const { uploadToCloudinary } = require('../config/cloudinary');
const {
  buildDynamicFormSchema,
} = require('../validations/participant.validation');
const { addEmailJob } = require('../queues/email.queue');

const registerParticipant = async ({
  slug,
  name,
  email,
  custom_answers = {},
  files = [],
}) => {
  const event = await eventRepo.findPublishedEventBySlug(slug);
  if (!event) {
    const error = new Error('Event not found.');
    error.status = 404;
    throw error;
  }

  if (event.registration_deadline) {
    const now = new Date();
    const deadline = new Date(event.registration_deadline);
    if (now > deadline) {
      const error = new Error('Registration for this event has closed.');
      error.status = 400;
      throw error;
    }
  }

  if (event.form_schema && Array.isArray(event.form_schema)) {
    for (const field of event.form_schema) {
      if (field.type === 'file') {
        const uploadedFile = files.find((f) => f.fieldname === field.name);

        if (uploadedFile) {
          const uploadResult = await uploadToCloudinary(
            uploadedFile.buffer,
            'attendycert/participant-uploads',
          );
          custom_answers[field.name] = uploadResult.secure_url;
        }
      }
    }

    const dynamicSchema = buildDynamicFormSchema(event.form_schema);
    const validationResult = dynamicSchema.safeParse(custom_answers);

    if (!validationResult.success) {
      const firstError =
        validationResult.error.issues[0]?.message || 'Invalid form answers.';
      const error = new Error(firstError);
      error.status = 400;
      throw error;
    }

    custom_answers = validationResult.data;
  }

  try {
    const newParticipant = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM "Event" WHERE id = ${event.id} FOR UPDATE`;

      const lockedEvent = await tx.event.findUnique({
        where: { id: event.id },
      });

      if (!lockedEvent || lockedEvent.status !== 'PUBLISHED') {
        const error = new Error('Event is no longer available.');
        error.status = 400;
        throw error;
      }

      if (
        lockedEvent.registration_deadline &&
        new Date() > lockedEvent.registration_deadline
      ) {
        const error = new Error('Registration for this event has closed.');
        error.status = 400;
        throw error;
      }

      if (
        lockedEvent.max_quota !== null &&
        lockedEvent.max_quota !== undefined
      ) {
        const currentCount = await tx.participant.count({
          where: { eventId: lockedEvent.id },
        });

        if (currentCount >= lockedEvent.max_quota) {
          const error = new Error('Event registration quota is full.');
          error.status = 400;
          throw error;
        }
      }

      const existingParticipant = await tx.participant.findUnique({
        where: {
          eventId_email: {
            eventId: lockedEvent.id,
            email,
          },
        },
      });

      if (existingParticipant) {
        const error = new Error('Email is already registered for this event.');
        error.status = 400;
        throw error;
      }

      return await tx.participant.create({
        data: {
          eventId: lockedEvent.id,
          name,
          email,
          custom_answers,
        },
        select: {
          id: true,
          ticket_id: true,
          eventId: true,
          name: true,
          email: true,
          custom_answers: true,
          status: true,
          createdAt: true,
        },
      });
    });

    addEmailJob('SEND_TICKET', {
      participantId: newParticipant.id,
      name: newParticipant.name,
      email: newParticipant.email,
      ticket_id: newParticipant.ticket_id,
      eventTitle: event.title,
    }).catch((error) => {
      console.error('[EmailQueue] Failed to enqueue ticket email:', error);
    });

    return {
      participant: newParticipant,
      event: {
        title: event.title,
        slug: event.slug,
      },
    };
  } catch (error) {
    if (error.code === 'P2002') {
      const customError = new Error(
        'Email is already registered for this event.',
      );
      customError.status = 400;
      throw customError;
    }
    throw error;
  }
};

const checkInParticipant = async ({ eventId, ticketId }) => {
  const participant = await participantRepo.findParticipantByTicketAndEvent({
    ticketId,
    eventId,
  });

  if (!participant) {
    const error = new Error(
      'Participant or Ticket ID not found for this event.',
    );
    error.status = 404;
    throw error;
  }

  if (participant.status === 'ATTENDED') {
    const error = new Error('Participant has already checked in previously.');
    error.status = 400;
    throw error;
  }

  const updatedParticipant = await participantRepo.updateParticipantStatus({
    id: participant.id,
    status: 'ATTENDED',
  });

  return updatedParticipant;
};

const getEventParticipants = async ({ eventId, queryParams }) => {
  return await participantRepo.findParticipantsByEvent({
    eventId,
    ...queryParams,
  });
};

const generateCertificates = async ({ eventId, prefix = 'CERT/AC/2026' }) => {
  const event = await eventRepo.findEventById(eventId);
  if (!event) {
    const error = new Error('Event not found.');
    error.status = 404;
    throw error;
  }

  if (!event.template_url) {
    const error = new Error(
      'Event does not have a certificate PDF template uploaded.',
    );
    error.status = 400;
    throw error;
  }

  const { finalParticipants } = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;

    const eligibleParticipants = await tx.participant.findMany({
      where: {
        eventId,
        status: { in: ['ATTENDED', 'FAILED'] },
      },
      orderBy: { name: 'asc' },
    });

    if (eligibleParticipants.length === 0) {
      return { finalParticipants: [] };
    }

    const existingCertCount = await tx.participant.count({
      where: {
        eventId,
        certificate_number: { not: null },
      },
    });

    const currentYear = new Date().getFullYear();
    const preparedList = [];
    let newCertIndex = 0;

    for (const p of eligibleParticipants) {
      let certNum = p.certificate_number;

      if (!certNum) {
        const seq = String(existingCertCount + newCertIndex + 1).padStart(
          3,
          '0',
        );
        certNum = `${seq}/${prefix}/${event.slug.toUpperCase()}/${currentYear}`;
        newCertIndex++;
      }

      const updatedParticipant = await tx.participant.update({
        where: { id: p.id },
        data: {
          certificate_number: certNum,
          status: 'PROCESSING',
        },
      });

      preparedList.push(updatedParticipant);
    }

    return { finalParticipants: preparedList };
  });

  if (finalParticipants.length === 0) {
    return {
      queued_count: 0,
      message:
        'No eligible attended or failed participants found for certificate distribution.',
    };
  }

  let successCount = 0;
  let failedEnqueueCount = 0;

  for (const participant of finalParticipants) {
    try {
      await addEmailJob('SEND_CERTIFICATE', {
        participantId: participant.id,
        name: participant.name,
        email: participant.email,
        certificate_number: participant.certificate_number,
        template_url: event.template_url,
        cert_name_x: event.cert_name_x,
        cert_name_y: event.cert_name_y,
        cert_number_x: event.cert_number_x,
        cert_number_y: event.cert_number_y,
        eventTitle: event.title,
      });
      successCount++;
    } catch (enqueueError) {
      console.error(
        `[EmailQueue] Failed to enqueue certificate for ${participant.email}:`,
        enqueueError,
      );

      await prisma.participant.update({
        where: { id: participant.id },
        data: { status: 'FAILED' },
      });
      failedEnqueueCount++;
    }
  }

  return {
    queued_count: successCount,
    failed_enqueue_count: failedEnqueueCount,
    message: `Certificate distribution queued for ${successCount} participants.${
      failedEnqueueCount > 0
        ? ` ${failedEnqueueCount} participants failed to queue and marked as FAILED.`
        : ''
    }`,
  };
};

const resendParticipantCertificate = async ({ eventId, participantId }) => {
  const event = await eventRepo.findEventById(eventId);
  if (!event || !event.template_url) {
    const error = new Error('Event or certificate template not found.');
    error.status = 404;
    throw error;
  }

  const participant = await participantRepo.findParticipantById(participantId);
  if (!participant || participant.eventId !== eventId) {
    const error = new Error('Participant not found for this event.');
    error.status = 404;
    throw error;
  }

  if (participant.status === 'REGISTERED') {
    const error = new Error(
      'Cannot send certificate. Participant has not checked in (REGISTERED).',
    );
    error.status = 400;
    throw error;
  }

  if (!participant.certificate_number) {
    const existingCertCount = await prisma.participant.count({
      where: { eventId, certificate_number: { not: null } },
    });
    const seq = String(existingCertCount + 1).padStart(3, '0');
    const currentYear = new Date().getFullYear();

    participant.certificate_number = `${seq}/RESEND/${event.slug.toUpperCase()}/${currentYear}`;

    await prisma.participant.update({
      where: { id: participant.id },
      data: {
        certificate_number: participant.certificate_number,
        status: 'PROCESSING',
      },
    });
  } else {
    await prisma.participant.update({
      where: { id: participant.id },
      data: { status: 'PROCESSING' },
    });
  }

  try {
    await addEmailJob('SEND_CERTIFICATE', {
      participantId: participant.id,
      name: participant.name,
      email: participant.email,
      certificate_number: participant.certificate_number,
      template_url: event.template_url,
      cert_name_x: event.cert_name_x,
      cert_name_y: event.cert_name_y,
      cert_number_x: event.cert_number_x,
      cert_number_y: event.cert_number_y,
      eventTitle: event.title,
    });
  } catch (enqueueError) {
    console.error(
      `[EmailQueue] Failed to enqueue resend job for ${participant.email}:`,
      enqueueError,
    );

    await prisma.participant.update({
      where: { id: participant.id },
      data: { status: 'FAILED' },
    });

    const error = new Error(
      'Failed to queue email job. Status updated to FAILED.',
    );
    error.status = 500;
    throw error;
  }

  return { message: `Resend certificate job queued for ${participant.email}` };
};

module.exports = {
  registerParticipant,
  checkInParticipant,
  getEventParticipants,
  generateCertificates,
  resendParticipantCertificate,
};
