const gradeRepository = require('../../repositories/gradeRepository');
const { Student, Subject, TeacherSubject, Course, Grade } = require('../../models');
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

  async getStudentGrades(studentId, subjectId) {
    const student = await Student.findByPk(studentId);
    if (!student) throw new AppError('Estudiante no encontrado', 404);

    if (subjectId) {
      return gradeRepository.findByStudentAndSubject(studentId, subjectId);
    }

    const grades = await Grade.findAll({
      where: { student_id: studentId },
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

  async updateGrade(id, data) {
    const grade = await gradeRepository.findById(id);
    if (!grade) throw new AppError('Nota no encontrada', 404);

    const updated = await gradeRepository.update(id, data);
    return updated;
  },

  async deleteGrade(id) {
    const grade = await gradeRepository.findById(id);
    if (!grade) throw new AppError('Nota no encontrada', 404);
    await gradeRepository.delete(id);
  },

  async getSubjectGrades(subjectId) {
    const subject = await Subject.findByPk(subjectId);
    if (!subject) throw new AppError('Materia no encontrada', 404);

    return Grade.findAll({
      where: { subject_id: subjectId },
      include: [{ model: Student, as: 'Student' }],
      order: [['date', 'DESC']],
    });
  },
};

module.exports = gradesService;
