import models from '../../models/index.js';
import { Op } from 'sequelize';

const { Certificado, Inasistencia, Estudiante, Usuario, Tutor, EstudianteTutor } = models;

// Helper: get Tutor model ID from user ID
async function getTutorId(userId) {
  const tutor = await Tutor.findOne({ where: { usuario_id: userId } });
  return tutor ? tutor.id : null;
}

// POST /upload — upload a certificate file
export async function uploadCertificate(req, res, next) {
  try {
    const { estudiante_id, inasistencia_id } = req.body;

    if (!estudiante_id) {
      return res.status(400).json({ message: 'estudiante_id es requerido' });
    }

    // Verify student exists
    const student = await Estudiante.findByPk(estudiante_id);
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    // RN-09: Tutor can only upload for their own children
    if (req.user.rol === 'tutor') {
      const tutorId = await getTutorId(req.user.id);
      if (!tutorId) return res.status(404).json({ message: 'Tutor no encontrado' });
      const relation = await EstudianteTutor.findOne({
        where: { estudiante_id, tutor_id: tutorId },
      });
      if (!relation) {
        return res.status(403).json({ message: 'No puedes subir certificados para este estudiante' });
      }
    }

    // Handle file or URL
    let filename = 'sin_archivo';
    let url = null;
    let file_size = null;

    if (req.file) {
      filename = req.file.originalname;
      url = `/uploads/certificates/${req.file.filename}`;
      file_size = req.file.size;
    } else if (req.body.url) {
      url = req.body.url;
      filename = req.body.filename || url.split('/').pop() || 'enlace_externo';
    } else {
      return res.status(400).json({ message: 'Debe proporcionar un archivo o una URL' });
    }

    // If inasistencia_id is provided, verify it belongs to the student
    if (inasistencia_id) {
      const absence = await Inasistencia.findOne({
        where: { id: inasistencia_id, estudiante_id },
      });
      if (!absence) {
        return res.status(404).json({ message: 'Inasistencia no encontrada para este estudiante' });
      }
    }

    const certificate = await Certificado.create({
      estudiante_id,
      inasistencia_id: inasistencia_id || null,
      filename,
      url,
      file_size,
      uploaded_by: req.user.id,
      estado: 'pendiente',
    });

    return res.status(201).json({
      message: 'Certificado subido correctamente',
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
}

// GET /pending/:estudiante_id — list pending certificates for a student
export async function getPendingCertificates(req, res, next) {
  try {
    const estudianteId = parseInt(req.params.estudiante_id, 10);

    // RN-09: Tutor can only see their own children
    if (req.user.rol === 'tutor') {
      const tutorId = await getTutorId(req.user.id);
      if (!tutorId) return res.status(404).json({ message: 'Tutor no encontrado' });
      const relation = await EstudianteTutor.findOne({
        where: { estudiante_id: estudianteId, tutor_id: tutorId },
      });
      if (!relation) {
        return res.status(403).json({ message: 'No tienes acceso a este estudiante' });
      }
    }

    const student = await Estudiante.findByPk(estudianteId);
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    const pendings = await Certificado.findAll({
      where: { estudiante_id: estudianteId, estado: 'pendiente' },
      include: [
        { model: Usuario, as: 'subidoPor', attributes: ['email', 'rol'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json({
      estudiante_id: estudianteId,
      total: pendings.length,
      data: pendings,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /:id/approve — approve certificate (admin only), marks absence as justified (RN-13)
export async function approveCertificate(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);

    const certificate = await Certificado.findByPk(id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificado no encontrado' });
    }

    if (certificate.estado !== 'pendiente') {
      return res.status(400).json({ message: `El certificado ya fue ${certificate.estado}` });
    }

    certificate.estado = 'aprobado';
    await certificate.save();

    // RN-13: Mark associated absence as justified
    if (certificate.inasistencia_id) {
      const absence = await Inasistencia.findByPk(certificate.inasistencia_id);
      if (absence) {
        absence.justificada = true;
        absence.certificado_id = certificate.id;
        absence.modificado_por = req.user.id;
        await absence.save();
      }
    }

    return res.json({
      message: 'Certificado aprobado. Inasistencia marcada como justificada (RN-13)',
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /:id/reject — reject certificate with comment (admin only)
export async function rejectCertificate(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { comentario } = req.body;

    if (!comentario) {
      return res.status(400).json({ message: 'Debe proporcionar un comentario de rechazo' });
    }

    const certificate = await Certificado.findByPk(id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificado no encontrado' });
    }

    if (certificate.estado !== 'pendiente') {
      return res.status(400).json({ message: `El certificado ya fue ${certificate.estado}` });
    }

    certificate.estado = 'rechazado';
    certificate.comentario_rechazo = comentario;
    await certificate.save();

    return res.json({
      message: 'Certificado rechazado',
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
}

// GET / — list all certificates (admin) or by student
export async function listCertificates(req, res, next) {
  try {
    const { estudiante_id, estado } = req.query;
    const where = {};

    if (estudiante_id) {
      const student = await Estudiante.findByPk(parseInt(estudiante_id, 10));
      if (!student) {
        return res.status(404).json({ message: 'Estudiante no encontrado' });
      }
      where.estudiante_id = parseInt(estudiante_id, 10);

      // RN-09: Tutor can only see their own children
      if (req.user.rol === 'tutor') {
        const tutorId = await getTutorId(req.user.id);
        if (!tutorId) return res.status(404).json({ message: 'Tutor no encontrado' });
        const relation = await EstudianteTutor.findOne({
          where: { estudiante_id: where.estudiante_id, tutor_id: tutorId },
        });
        if (!relation) {
          return res.status(403).json({ message: 'No tienes acceso a este estudiante' });
        }
      }
    }

    if (estado) {
      where.estado = estado;
    }

    const certificates = await Certificado.findAll({
      where,
      include: [
        { model: Estudiante, attributes: ['nombre', 'apellido', 'dni'] },
        { model: Usuario, as: 'subidoPor', attributes: ['email', 'rol'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json({
      total: certificates.length,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
}

// GET /:id — get single certificate details
export async function getCertificate(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const certificate = await Certificado.findByPk(id, {
      include: [
        { model: Estudiante, attributes: ['nombre', 'apellido', 'dni'] },
        { model: Usuario, as: 'subidoPor', attributes: ['email', 'rol'] },
        { model: Inasistencia, as: 'inasistencia', attributes: ['fecha', 'justificada'] },
      ],
    });

    if (!certificate) {
      return res.status(404).json({ message: 'Certificado no encontrado' });
    }

    return res.json(certificate);
  } catch (error) {
    next(error);
  }
}
