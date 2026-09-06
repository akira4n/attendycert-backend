const generateTicketEmailHTML = ({ name, eventTitle, ticket_id }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f7; color: #51545e; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 1px solid #eaeaec; padding-bottom: 20px; }
        .content { padding: 20px 0; }
        .ticket-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .ticket-id { font-family: monospace; font-size: 20px; font-weight: bold; color: #2563eb; letter-spacing: 1px; }
        .footer { text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #eaeaec; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Pendaftaran Berhasil!</h2>
        </div>
        <div class="content">
          <p>Halo <strong>${name}</strong>,</p>
          <p>Terima kasih telah mendaftar pada acara <strong>${eventTitle}</strong>. Berikut adalah Tiket Pendaftaran resmi kamu:</p>
          
          <div class="ticket-box">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">TICKET ID / QR CODE</p>
            <div class="ticket-id">${ticket_id}</div>
          </div>

          <p>Simpan email ini dan tunjukkan Ticket ID atau QR Code di atas kepada panitia saat registrasi ulang di lokasi acara.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AttendyCert. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { generateTicketEmailHTML };
