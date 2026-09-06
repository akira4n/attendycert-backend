const prisma = require('../config/prisma');

const findEventBySlug = async (slug) => {
  return await prisma.event.findUnique({
    where: {
      slug,
    },
  });
};

const findPublishedEventBySlug = async (slug) => {
  return await prisma.event.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
  });
};

const findEventById = async (id) => {
  return await prisma.event.findUnique({
    where: { id },
  });
};

const findAllEvents = async ({ skip, limit, where }) => {
  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),

    prisma.event.count({
      where,
    }),
  ]);

  return { events, total };
};

const createEvent = async (data) => {
  return await prisma.event.create({
    data,
  });
};

const updateEvent = async ({ id, data }) => {
  return await prisma.event.update({
    where: { id },
    data,
  });
};

module.exports = {
  findEventBySlug,
  findPublishedEventBySlug,
  findEventById,
  findAllEvents,
  createEvent,
  updateEvent,
};
