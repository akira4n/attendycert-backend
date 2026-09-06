const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const allowedFiles = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.pdf': ['application/pdf', 'application/x-pdf'],
};

const uploadPdf = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMimeTypes = allowedFiles[ext];

    if (ext !== '.pdf' || !allowedMimeTypes?.includes(file.mimetype)) {
      const error = new Error('Only PDF files are allowed.');
      error.status = 400;
      return cb(error, false);
    }

    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadAny = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMimeTypes = allowedFiles[ext];

    if (!allowedMimeTypes || !allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error(
        'Only JPG, PNG, and PDF files are allowed for dynamic form uploads.',
      );
      error.status = 400;
      return cb(error, false);
    }

    cb(null, true);
  },
  limits: {
    fileSize: 3 * 1024 * 1024,
    files: 10,
  },
});

module.exports = { uploadPdf, uploadAny };
