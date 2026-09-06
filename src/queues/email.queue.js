const { Queue } = require('bullmq');
const { redisOptions } = require('../config/redis');

const emailQueue = new Queue('emailQueue', {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
});

const addEmailJob = async (type, payload) => {
  await emailQueue.add(type, {
    type,
    data: payload,
  });
};

module.exports = {
  emailQueue,
  addEmailJob,
};
