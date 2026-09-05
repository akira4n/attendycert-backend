const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const validate = require('../middlewares/validate.middleware');
const {
  eventSchema,
  updateEventSchema,
} = require('../validations/event.validation');
const protectAdmin = require('../middlewares/auth.middleware');
const { uploadPdf } = require('../middlewares/upload.middleware');

// admin routes
router.get('/admin', protectAdmin, eventController.getAllEventsAdmin);
router.get('/admin/:id', protectAdmin, eventController.getEventById);
router.post(
  '/',
  protectAdmin,
  validate(eventSchema),
  eventController.createEvent,
);
router.patch(
  '/:id',
  protectAdmin,
  uploadPdf.single('template_pdf'),
  validate(updateEventSchema),
  eventController.updateEvent,
);

// public routes
router.get('/:slug', eventController.getEventBySlug);

module.exports = router;
