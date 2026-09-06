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

const findParticipantByTicketAndEvent = async (ticket_id, eventId) => {
  return await prisma.participant.findFirst({
    where: {
      ticket_id,
      eventId,
    },
  });
};

const updateParticipantStatus = async (id, status) => {
  return await prisma.participant.update({
    where: { id },
    data: { status },
  });
};

const findParticipantsByEvent = async (
  eventId,
  { search, status, page = 1, limit = 10 },
) => {
  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    eventId,
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { ticket_id: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [total, participants] = await Promise.all([
    prisma.participant.count({ where }),
    prisma.participant.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    participants,
  };
};

module.exports = {
  findParticipantByEmailAndEvent,
  countParticipantsByEvent,
  createParticipant,
  findParticipantByTicketAndEvent,
  updateParticipantStatus,
  findParticipantsByEvent,
};
