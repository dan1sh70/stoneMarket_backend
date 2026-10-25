const multer = require('multer');
const path = require('path');

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf'
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed formats: JPG, PNG, WEBP, and PDF up to 10MB.'), false);
  }
};

const storage = multer.memoryStorage();

const attachmentUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_ATTACHMENT_SIZE,
    files: 5 // max 5 files per request
  }
});

module.exports = attachmentUpload;
