const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const validate = require('../middlewares/validate.middleware');
const { eventSchema } = require('../validations/event.validation');
const protectAdmin = require('../middlewares/auth.middleware');

// admin routes
router.get('/admin', protectAdmin, eventController.getAllEventsAdmin);
router.get('/admin/:id', protectAdmin, eventController.getEventById);
router.post(
  '/',
  protectAdmin,
  validate(eventSchema),
  eventController.createEvent,
);

// public routes
router.get('/:slug', eventController.getEventBySlug);

module.exports = router;
