const attendanceRepository = require('../../repositories/attendanceRepository');
const { Student } = require('../../models');
const AppError = require('../../utils/AppError');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, '..', '..', 'uploads', 'certificates');

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024;

const attendancesService = {
  async register(data, userId) {
    const { student_id, date, status } = data;

    const student = await Student.findByPk(student_id);
    if (!student) {
      throw new AppError('El alumno no existe', 404);
    }

    const existing = await attendanceRepository.findByStudentAndDate(student_id, date);
    if (existing) {
      throw new AppError('Ya existe un registro para este alumno en esta fecha', 409);
    }

    return attendanceRepository.create({
      student_id,
      date,
      status,
      registered_by: userId,
    });
  },

  async batchRegister(records, userId) {
    if (!Array.isArray(records) || records.length === 0) {
      throw new AppError('Debe proporcionar un array de registros', 400);
    }

    const created = [];

    for (const record of records) {
      const { student_id, date, status } = record;

      const student = await Student.findByPk(student_id);
      if (!student) {
        throw new AppError(`El alumno con ID ${student_id} no existe`, 404);
      }

      const existing = await attendanceRepository.findByStudentAndDate(student_id, date);
      if (existing) {
        throw new AppError(`Ya existe un registro para el alumno ${student_id} en la fecha ${date}`, 409);
      }

      const attendance = await attendanceRepository.create({
        student_id,
        date,
        status,
        registered_by: userId,
      });

      created.push(attendance);
    }

    return created;
  },

  async update(id, data) {
    const attendance = await attendanceRepository.findById(id);
    if (!attendance) {
      throw new AppError('Registro de asistencia no encontrado', 404);
    }

    const updated = await attendanceRepository.update(id, data);
    return updated;
  },

  async justify(id, justificationData) {
    const attendance = await attendanceRepository.findById(id);
    if (!attendance) {
      throw new AppError('Registro de asistencia no encontrado', 404);
    }

    if (attendance.is_justified) {
      throw new AppError('Esta inasistencia ya fue justificada', 409);
    }

    if (attendance.status !== 'ausente') {
      throw new AppError('Solo se pueden justificar inasistencias', 400);
    }

    const updateData = {
      is_justified: true,
      justification_note: justificationData.justification_note || null,
    };

    return attendanceRepository.update(id, updateData);
  },

  async getStudentHistory(studentId, filters = {}) {
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new AppError('Alumno no encontrado', 404);
    }

    const records = await attendanceRepository.findByStudentId(studentId, filters);
    const summary = await attendanceRepository.getSummaryByStudentId(studentId);

    return { records, summary };
  },

  async uploadCertificate(attendanceId, file, userId) {
    const attendance = await attendanceRepository.findById(attendanceId);
    if (!attendance) {
      throw new AppError('Registro de asistencia no encontrado', 404);
    }

    if (!file) {
      throw new AppError('Debe adjuntar un archivo', 400);
    }

    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      fs.unlinkSync(file.path);
      throw new AppError('El archivo debe ser JPG, PNG o PDF', 400);
    }

    if (file.size > MAX_SIZE) {
      fs.unlinkSync(file.path);
      throw new AppError('El archivo no debe superar los 5MB', 400);
    }

    const certificateUrl = `/uploads/certificates/${file.filename}`;

    await attendanceRepository.update(attendanceId, {
      certificate_url: certificateUrl,
      is_justified: true,
      justification_note: attendance.justification_note || 'Justificado con certificado',
    });

    return certificateUrl;
  },
};

module.exports = attendancesService;
