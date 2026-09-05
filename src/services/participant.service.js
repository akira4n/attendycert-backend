const prisma = require('../config/prisma');
const participantRepo = require('../repositories/participant.repository');
const eventRepo = require('../repositories/event.repository');
const { uploadToCloudinary } = require('../config/cloudinary');
const {
  buildDynamicFormSchema,
} = require('../validations/participant.validation');

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

      if (event.max_quota !== null && event.max_quota !== undefined) {
        const currentCount = await tx.participant.count({
          where: { eventId: event.id },
        });

        if (currentCount >= event.max_quota) {
          const error = new Error('Event registration quota is full.');
          error.status = 400;
          throw error;
        }
      }

      const existingParticipant = await tx.participant.findUnique({
        where: {
          eventId_email: {
            eventId: event.id,
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
          eventId: event.id,
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

module.exports = {
  registerParticipant,
};
