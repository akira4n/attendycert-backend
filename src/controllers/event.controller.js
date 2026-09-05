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

const getAllEventsAdmin = async (req, res, next) => {
  try {
    const result = await eventService.getAllEventsAdmin(req.query);

    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: result.events,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event retrieved successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedEvent = await eventService.updateEvent(id, req.body, req.file);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEventBySlug,
  getAllEventsAdmin,
  getEventById,
  updateEvent,
};
