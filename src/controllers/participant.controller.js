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

module.exports = {
  registerParticipant,
};
