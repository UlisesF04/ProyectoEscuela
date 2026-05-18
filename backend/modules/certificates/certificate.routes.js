import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import {
  uploadCertificate,
  getPendingCertificates,
  approveCertificate,
  rejectCertificate,
  listCertificates,
  getCertificate,
} from './certificate.controller.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Multer config — max 5MB
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/certificates'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `cert-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no permitido. Use: PDF, JPG, PNG, WEBP'));
    }
  },
});

const router = Router();

// POST /upload — subir certificado (admin, docente, tutor)
router.post('/upload', authenticate, upload.single('archivo'), uploadCertificate);

// GET / — listar todos (admin) o filtrar
router.get('/', authenticate, authorize('admin', 'docente', 'tutor'), listCertificates);

// GET /pending/:estudiante_id — pendientes por alumno
router.get('/pending/:estudiante_id', authenticate, authorize('admin', 'docente', 'tutor'), getPendingCertificates);

// GET /:id — detalle de certificado
router.get('/:id', authenticate, getCertificate);

// PUT /:id/approve — aprobar (admin)
router.put('/:id/approve', authenticate, authorize('admin'), approveCertificate);

// PUT /:id/reject — rechazar (admin)
router.put('/:id/reject', authenticate, authorize('admin'), rejectCertificate);

export default router;
