const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = [
    'application/pdf',
    'application/x-pdf',
    'application/octet-stream',
  ];

  if (ext === '.pdf' || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      'Only PDF files are allowed for certificate templates.',
    );
    error.status = 400;
    cb(error, false);
  }
};

const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit 5 MB
  },
});

module.exports = { uploadPdf };
