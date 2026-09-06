const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const generateCertificatePDF = async ({
  template_url,
  name,
  certificate_number,
  cert_name_x,
  cert_name_y,
  cert_number_x,
  cert_number_y,
}) => {
  const response = await fetch(template_url);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF template from URL: ${template_url}`);
  }
  const templateArrayBuffer = await response.arrayBuffer();

  const pdfDoc = await PDFDocument.load(templateArrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const page = pdfDoc.getPages()[0];

  if (typeof cert_name_x === 'number' && typeof cert_name_y === 'number') {
    const fontSize = 28;
    const textWidth = font.widthOfTextAtSize(name, fontSize);

    const xPos = cert_name_x - textWidth / 2;

    page.drawText(name, {
      x: xPos < 0 ? cert_name_x : xPos,
      y: cert_name_y,
      size: fontSize,
      font: font,
      color: rgb(0.12, 0.16, 0.23), // Dark Slate
    });
  }

  if (typeof cert_number_x === 'number' && typeof cert_number_y === 'number') {
    const fontSize = 14;
    const textWidth = fontRegular.widthOfTextAtSize(
      certificate_number,
      fontSize,
    );

    const xPos = cert_number_x - textWidth / 2;

    page.drawText(certificate_number, {
      x: xPos < 0 ? cert_number_x : xPos,
      y: cert_number_y,
      size: fontSize,
      font: fontRegular,
      color: rgb(0.39, 0.45, 0.55),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

module.exports = { generateCertificatePDF };
