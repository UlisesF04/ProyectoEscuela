const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, '..', 'uploads', 'certificates');

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const crypto = require('crypto');
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
    const safeExt = allowedExts.includes(ext) ? ext : '.bin';
    const uniqueName = crypto.randomUUID();
    cb(null, `cert-${uniqueName}${safeExt}`);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('El archivo debe ser JPG, PNG o PDF', 400), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

module.exports = upload;
