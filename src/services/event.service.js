const eventRepo = require('../repositories/event.repository');

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
  const event = await eventRepo.findEventBySlug(slug);

  if (!event) {
    const error = new Error('Event not found.');
    error.status = 404;
    throw error;
  }

  return event;
};

module.exports = {
  createEvent,
  getEventBySlug,
};
