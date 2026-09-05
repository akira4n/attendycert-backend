const prisma = require('../config/prisma');

const findEventBySlug = async (slug) => {
  return await prisma.event.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
  });
};

const createEvent = async (data) => {
  return await prisma.event.create({
    data,
  });
};

module.exports = {
  findEventBySlug,
  createEvent,
};
