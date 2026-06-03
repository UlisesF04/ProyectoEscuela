const attendanceRepository = require('../../repositories/attendanceRepository');
const { Student, Course, Subject, TeacherSubject } = require('../../models');
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

    const results = [];

    for (const record of records) {
      const { student_id, date, status } = record;

      const student = await Student.findByPk(student_id);
      if (!student) {
        throw new AppError(`El alumno con ID ${student_id} no existe`, 404);
      }

      // Verify the student belongs to a valid course
      if (!student.course_id) {
        throw new AppError(`El alumno con ID ${student_id} no tiene un curso asignado`, 400);
      }

      const course = await Course.findByPk(student.course_id);
      if (!course) {
        throw new AppError(`El curso del alumno con ID ${student_id} no existe`, 404);
      }

      const existing = await attendanceRepository.findByStudentAndDate(student_id, date);
      if (existing) {
        const updated = await attendanceRepository.update(existing.id, { status, registered_by: userId });
        results.push(updated);
      } else {
        const attendance = await attendanceRepository.create({
          student_id,
          date,
          status,
          registered_by: userId,
        });
        results.push(attendance);
      }
    }

    return results;
  },

  async update(id, data) {
    const attendance = await attendanceRepository.findById(id);
    if (!attendance) {
      throw new AppError('Registro de asistencia no encontrado', 404);
    }

    const allowedFields = ['status'];
    const filtered = {};
    allowedFields.forEach(f => { if (data[f] !== undefined) filtered[f] = data[f]; });
    const updated = await attendanceRepository.update(id, filtered);
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

  async getCourseAttendance(courseId, date, userId, role) {
    // Verificar que el docente está asignado a materias de este curso
    if (role === 'docente') {
      const teacherSubjects = await TeacherSubject.findAll({
        where: { user_id: userId },
        include: [{ model: Subject, where: { course_id: courseId }, attributes: [] }]
      });
      if (teacherSubjects.length === 0) {
        throw new AppError('No estás asignado a este curso', 403);
      }
    }

    const students = await Student.findAll({
      where: { course_id: courseId, is_active: true },
      attributes: ['id', 'first_name', 'last_name'],
    });

    const attendances = await attendanceRepository.findByCourseAndDate(courseId, date);

    const attMap = {};
    attendances.forEach((a) => {
      attMap[a.student_id] = { status: a.status, is_justified: a.is_justified };
    });

    const records = students.map((s) => ({
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      status: attMap[s.id]?.status || null,
      is_justified: attMap[s.id]?.is_justified || false,
    }));

    const counts = { presente: 0, ausente: 0, tarde: 0, justificadas: 0 };
    attendances.forEach((a) => {
      if (counts[a.status] !== undefined) counts[a.status]++;
      if (a.is_justified) counts.justificadas++;
    });

    return { records, summary: { ...counts, total: students.length } };
  },

  async uploadCertificate(attendanceId, file, userId, role) {
    const attendance = await attendanceRepository.findById(attendanceId);
    if (!attendance) {
      throw new AppError('Registro de asistencia no encontrado', 404);
    }

    if (role === 'padre') {
      const { ParentStudent } = require('../../models');
      const link = await ParentStudent.findOne({
        where: { user_id: userId, student_id: attendance.student_id }
      });
      if (!link) throw new AppError('No tienes permiso para justificar esta asistencia', 403);
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
