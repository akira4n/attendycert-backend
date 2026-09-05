const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const validate = require('../middlewares/validate.middleware');
const { eventSchema } = require('../validations/event.validation');
const protectAdmin = require('../middlewares/auth.middleware');

router.get('/:slug', eventController.getEventBySlug);
router.post(
  '/',
  protectAdmin,
  validate(eventSchema),
  eventController.createEvent,
);

module.exports = router;
