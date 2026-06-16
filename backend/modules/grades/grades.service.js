const gradeRepository = require('../../repositories/gradeRepository');
const { Student, Subject, TeacherSubject, Course, Grade, ParentStudent } = require('../../models');
const AppError = require('../../utils/AppError');
const { Op } = require('sequelize');

const gradesService = {
  async createGrade(data, userId) {
    const { student_id, subject_id, grade, type, description, date: rawDate } = data;
    const date = rawDate || new Date().toISOString().split('T')[0];

    const subject = await Subject.findByPk(subject_id);
    if (!subject) throw new AppError('Materia no encontrada', 404);

    const student = await Student.findByPk(student_id);
    if (!student) throw new AppError('Estudiante no encontrado', 404);

    // Verificar que el docente está asignado a esta materia
    const assignment = await TeacherSubject.findOne({
      where: { user_id: userId, subject_id }
    });
    if (!assignment) {
      throw new AppError('No estás asignado a esta materia', 403);
    }

    const gradeRecord = await gradeRepository.create({
      student_id,
      subject_id,
      grade,
      type: type || 'examen',
      description: description || null,
      date,
      created_by: userId,
    });

    return gradeRecord;
  },

  async getStudentGrades(studentId, subjectId, userId, role) {
    const student = await Student.findByPk(studentId);
    if (!student) throw new AppError('Estudiante no encontrado', 404);

    // Authorization checks
    const where = { student_id: studentId };

    if (role === 'docente') {
      const teacherSubjects = await TeacherSubject.findAll({ where: { user_id: userId } });
      const teacherSubjectIds = teacherSubjects.map(s => s.subject_id);
      if (teacherSubjectIds.length === 0) {
        throw new AppError('No tienes materias asignadas', 403);
      }
      where.subject_id = { [Op.in]: teacherSubjectIds };
    } else if (role === 'padre') {
      const link = await ParentStudent.findOne({ where: { user_id: userId, student_id: studentId } });
      if (!link) throw new AppError('No tienes permiso para ver notas de este alumno', 403);
    }

    if (subjectId) {
      if (role === 'docente') {
        const teacherSubjects = await TeacherSubject.findAll({ where: { user_id: userId } });
        const teacherSubjectIds = teacherSubjects.map(s => s.subject_id);
        if (!teacherSubjectIds.includes(parseInt(subjectId))) {
          throw new AppError('No estás asignado a esta materia', 403);
        }
      }
      where.subject_id = subjectId;
      return gradeRepository.findByStudentAndSubject(studentId, subjectId);
    }

    const grades = await Grade.findAll({
      where,
      include: [{ model: Subject, as: 'Subject' }],
      order: [['date', 'DESC']],
    });

    return grades;
  },

  async getStudentGradesBySubject(studentId, subjectIds) {
    const grades = await Grade.findAll({
      where: {
        student_id: studentId,
        subject_id: { [Op.in]: subjectIds },
      },
      include: [{ model: Subject, as: 'Subject' }],
      order: [['date', 'DESC']],
    });
    return grades;
  },

  async updateGrade(id, data, userId, role) {
    const grade = await gradeRepository.findById(id);
    if (!grade) throw new AppError('Nota no encontrada', 404);

    // Solo el creador o admin pueden modificar
    if (grade.created_by !== userId && role !== 'admin') {
      throw new AppError('No tienes permiso para modificar esta calificación', 403);
    }

    const allowedFields = ['grade', 'description', 'type'];
    const filtered = {};
    allowedFields.forEach(f => { if (data[f] !== undefined) filtered[f] = data[f]; });
    const updated = await gradeRepository.update(id, filtered);
    return updated;
  },

  async deleteGrade(id) {
    const grade = await gradeRepository.findById(id);
    if (!grade) throw new AppError('Nota no encontrada', 404);
    await gradeRepository.delete(id);
  },

  async getSubjectGrades(subjectId, userId, role) {
    const subject = await Subject.findByPk(subjectId);
    if (!subject) throw new AppError('Materia no encontrada', 404);

    if (role !== 'admin') {
      const assignment = await TeacherSubject.findOne({
        where: { user_id: userId, subject_id: subjectId }
      });
      if (!assignment) throw new AppError('No estás asignado a esta materia', 403);
    }

    return Grade.findAll({
      where: { subject_id: subjectId },
      include: [{ model: Student, as: 'Student' }],
      order: [['date', 'DESC']],
    });
  },
};

module.exports = gradesService;
