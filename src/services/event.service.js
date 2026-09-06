const eventRepo = require('../repositories/event.repository');
const { uploadToCloudinary } = require('../config/cloudinary');

const createEvent = async ({
  title,
  slug,
  registration_deadline,
  max_quota,
  form_schema,
  adminId,
}) => {
  const existingEvent = await eventRepo.findEventBySlug(slug);

  if (existingEvent) {
    const error = new Error(
      'Event slug already exists. Please use another unique slug.',
    );
    error.status = 400;
    throw error;
  }

  const formattedDeadline = registration_deadline
    ? new Date(registration_deadline)
    : null;

  const event = await eventRepo.createEvent({
    title,
    slug,
    registration_deadline: formattedDeadline,
    max_quota,
    form_schema,
    adminId,
  });

  return event;
};

const getEventBySlug = async (slug) => {
  const event = await eventRepo.findPublishedEventBySlug(slug);

  if (!event) {
    const error = new Error('Event not found.');
    error.status = 404;
    throw error;
  }

  return event;
};

const getEventById = async (id) => {
  const event = await eventRepo.findEventById(id);

  if (!event) {
    const error = new Error('Event not found.');
    error.status = 404;
    throw error;
  }

  return event;
};

const getAllEventsAdmin = async ({ page = 1, limit = 10, search, status }) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const skip = (pageNum - 1) * limitNum;

  const where = {};

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  if (status) {
    where.status = status;
  }

  const { events, total } = await eventRepo.findAllEvents({
    skip,
    limit: limitNum,
    where,
  });

  const totalPages = Math.ceil(total / limitNum);

  return {
    events,
    meta: { page: pageNum, limit: limitNum, totalItems: total, totalPages },
  };
};

const updateEvent = async ({ id, updateData, file }) => {
  const existingEvent = await eventRepo.findEventById(id);
  if (!existingEvent) {
    const error = new Error('Event not found.');
    error.status = 404;
    throw error;
  }

  if (updateData.status) {
    if (existingEvent.status === 'PUBLISHED' && updateData.status === 'DRAFT') {
      const error = new Error('Cannot revert a PUBLISHED event back to DRAFT.');
      error.status = 400;
      throw error;
    }

    if (
      existingEvent.status === 'COMPLETED' &&
      updateData.status !== 'COMPLETED'
    ) {
      const error = new Error('Cannot change the status of a COMPLETED event.');
      error.status = 400;
      throw error;
    }
  }

  if (
    (existingEvent.status === 'PUBLISHED' ||
      existingEvent.status === 'COMPLETED') &&
    updateData.form_schema !== undefined
  ) {
    const error = new Error(
      'Form schema cannot be modified once the event is PUBLISHED or COMPLETED.',
    );
    error.status = 400;
    throw error;
  }

  if (updateData.slug && updateData.slug !== existingEvent.slug) {
    const existingSlug = await eventRepo.findEventBySlug(updateData.slug);
    if (existingSlug) {
      const error = new Error(
        'Event slug already exists. Please use another unique slug.',
      );
      error.status = 400;
      throw error;
    }
  }

  if (file) {
    const uploadResult = await uploadToCloudinary(
      file.buffer,
      'attendycert/templates',
    );
    updateData.template_url = uploadResult.secure_url;
  }

  if (updateData.registration_deadline) {
    updateData.registration_deadline = new Date(
      updateData.registration_deadline,
    );
  }

  const updatedEvent = await eventRepo.updateEvent({ id, data: updateData });
  return updatedEvent;
};

module.exports = {
  createEvent,
  getEventBySlug,
  getEventById,
  getAllEventsAdmin,
  updateEvent,
};
