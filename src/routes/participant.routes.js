const express = require('express');
const router = express.Router();

const participantController = require('../controllers/participant.controller');
const validate = require('../middlewares/validate.middleware');
const { uploadAny } = require('../middlewares/upload.middleware');
const {
  registerParticipantSchema,
} = require('../validations/participant.validation');

router.post(
  '/:slug/register',
  uploadAny.any(),
  validate(registerParticipantSchema),
  participantController.registerParticipant,
);

module.exports = router;
