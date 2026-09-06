const express = require('express');
const router = express.Router();

const participantController = require('../controllers/participant.controller');
const validate = require('../middlewares/validate.middleware');
const { uploadAny } = require('../middlewares/upload.middleware');
const {
  registerParticipantSchema,
  checkInSchema,
} = require('../validations/participant.validation');
const protectAdmin = require('../middlewares/auth.middleware');

// public routes
router.post(
  '/:slug/register',
  uploadAny.any(),
  validate(registerParticipantSchema),
  participantController.registerParticipant,
);

// admin routes
router.post(
  '/:eventId/check-in',
  protectAdmin,
  validate(checkInSchema),
  participantController.checkIn,
);

router.get(
  '/:eventId/participants',
  protectAdmin,
  participantController.getParticipants,
);

module.exports = router;
