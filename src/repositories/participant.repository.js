const prisma = require('../config/prisma');

const findParticipantByEmailAndEvent = async (eventId, email) => {
  return await prisma.participant.findUnique({
    where: {
      eventId_email: {
        eventId,
        email,
      },
    },
  });
};

const countParticipantsByEvent = async (eventId) => {
  return await prisma.participant.count({
    where: { eventId },
  });
};

const createParticipant = async (data) => {
  return await prisma.participant.create({
    data,
    select: {
      id: true,
      eventId: true,
      name: true,
      email: true,
      custom_answers: true,
      status: true,
      createdAt: true,
    },
  });
};

module.exports = {
  findParticipantByEmailAndEvent,
  countParticipantsByEvent,
  createParticipant,
};
