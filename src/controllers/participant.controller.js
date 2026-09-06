const participantService = require('../services/participant.service');

const registerParticipant = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { name, email, custom_answers } = req.body;

    const result = await participantService.registerParticipant({
      slug,
      name,
      email,
      custom_answers,
      files: req.files,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const checkIn = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { ticket_id } = req.body;

    const participant = await participantService.checkInParticipant(
      eventId,
      ticket_id,
    );

    return res.status(200).json({
      success: true,
      message: 'Check-in successful. Welcome to the event!',
      data: { participant },
    });
  } catch (error) {
    next(error);
  }
};

const getParticipants = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const result = await participantService.getEventParticipants(
      eventId,
      req.query,
    );

    return res.status(200).json({
      success: true,
      message: 'Participants fetched successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const generateCertificates = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const result = await participantService.generateCertificates(
      eventId,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: { queued_count: result.queued_count },
    });
  } catch (error) {
    next(error);
  }
};

const resendCertificate = async (req, res, next) => {
  try {
    const { eventId, participantId } = req.params;
    const result = await participantService.resendParticipantCertificate(
      eventId,
      participantId,
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerParticipant,
  checkIn,
  getParticipants,
  generateCertificates,
  resendCertificate,
};
