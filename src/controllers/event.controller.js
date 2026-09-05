const eventService = require('../services/event.service');

const createEvent = async (req, res, next) => {
  try {
    const adminId = req.admin.id;
    const event = await eventService.createEvent({ ...req.body, adminId });

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

const getEventBySlug = async (req, res, next) => {
  try {
    const event = await eventService.getEventBySlug(req.params.slug);

    res.status(200).json({
      success: true,
      message: 'Event retrieved successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEventBySlug,
};
