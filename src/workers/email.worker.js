require('dotenv').config();

const { Worker } = require('bullmq');
const { redisOptions } = require('../config/redis');
const transporter = require('../config/mailer');
const prisma = require('../config/prisma');
const {
  generateTicketEmailHTML,
} = require('../templates/email/ticket.template');
const {
  generateCertificateEmailHTML,
} = require('../templates/email/certificate.template');
const { generateCertificatePDF } = require('../utils/pdf.util');

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
        const {
          participantId,
          name,
          email,
          certificate_number,
          template_url,
          cert_name_x,
          cert_name_y,
          cert_number_x,
          cert_number_y,
          eventTitle,
        } = data;

        const pdfBuffer = await generateCertificatePDF({
          template_url,
          name,
          certificate_number,
          cert_name_x,
          cert_name_y,
          cert_number_x,
          cert_number_y,
        });

        const html = generateCertificateEmailHTML({
          name,
          eventTitle,
          certificate_number,
        });

        await transporter.sendMail({
          from:
            process.env.SMTP_FROM || '"AttendyCert" <no-reply@attendycert.com>',
          to: email,
          subject: `[Sertifikat Resmi] ${eventTitle} - ${name}`,
          html,
          attachments: [
            {
              filename: `Sertifikat_${name.replace(/\s+/g, '_')}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        });

        await prisma.participant.update({
          where: { id: participantId },
          data: { status: 'CERTIFICATE_SENT' },
        });
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

emailWorker.on('failed', async (job, err) => {
  console.error(
    `[EmailWorker] Job ${job?.id} failed with error: ${err.message}`,
  );

  if (job && job.data.type === 'SEND_CERTIFICATE') {
    const maxAttempts = job.opts.attempts || 3;

    if (job.attemptsMade >= maxAttempts) {
      try {
        await prisma.participant.update({
          where: { id: job.data.data.participantId },
          data: { status: 'FAILED' },
        });
        console.log(
          `[EmailWorker] Participant ${job.data.data.participantId} status updated to FAILED.`,
        );
      } catch (updateError) {
        console.error(
          `[EmailWorker] Failed to update participant status to FAILED:`,
          updateError,
        );
      }
    }
  }
});

module.exports = emailWorker;
