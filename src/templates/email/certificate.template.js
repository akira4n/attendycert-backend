const generateCertificateEmailHTML = ({
  name,
  eventTitle,
  certificate_number,
}) => {
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
        .cert-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0; }
        .cert-num { font-family: monospace; font-size: 16px; font-weight: bold; color: #166534; }
        .footer { text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #eaeaec; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Sertifikat Kehadiran Resmi 🎓</h2>
        </div>
        <div class="content">
          <p>Halo <strong>${name}</strong>,</p>
          <p>Terima kasih atas partisipasi aktif kamu dalam acara <strong>${eventTitle}</strong>.</p>
          <p>Sertifikat kamu telah terbit. Berkas PDF sertifikat dapat kamu unduh langsung melalui lampiran (attachment) pada email ini.</p>
          
          <div class="cert-box">
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #15803d;">NOMOR SERTIFIKAT</p>
            <div class="cert-num">${certificate_number}</div>
          </div>

          <p>Sampai jumpa di acara kami berikutnya!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AttendyCert. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { generateCertificateEmailHTML };
