require('dotenv').config();

const { Worker } = require('bullmq');
const { redisOptions } = require('../config/redis');
const transporter = require('../config/mailer');
const {
  generateTicketEmailHTML,
} = require('../templates/email/ticket.template');

const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    const { type, data } = job.data;

    switch (type) {
      case 'SEND_TICKET': {
        const { name, email, eventTitle, ticket_id } = data;
        const html = generateTicketEmailHTML({ name, eventTitle, ticket_id });

        await transporter.sendMail({
          from:
            process.env.SMTP_FROM || '"AttendyCert" <no-reply@attendycert.com>',
          to: email,
          subject: `[Tiket Resmi] Pendaftaran Acara: ${eventTitle}`,
          html,
        });
        break;
      }

      case 'SEND_CERTIFICATE': {
        break;
      }

      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  },
  {
    connection: redisOptions,
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 1000,
    },
  },
);

emailWorker.on('completed', (job) => {
  console.log(
    `[EmailWorker] Job ${job.id} (${job.data.type}) successfully sent to ${job.data.data.email}`,
  );
});

emailWorker.on('failed', (job, err) => {
  console.error(
    `[EmailWorker] Job ${job?.id} failed with error: ${err.message}`,
  );
});

module.exports = emailWorker;
