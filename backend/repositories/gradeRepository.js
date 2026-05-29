const { Grade, Subject, Course } = require('../models');

const gradeRepository = {
  async findById(id) {
    return Grade.findByPk(id);
  },

  async findByStudent(studentId) {
    return Grade.findAll({
      where: { student_id: studentId },
      include: [{ model: Subject, as: 'Subject' }],
      order: [['date', 'DESC']],
    });
  },

  async findBySubject(subjectId) {
    return Grade.findAll({ where: { subject_id: subjectId } });
  },

  async findByStudentAndSubject(studentId, subjectId) {
    return Grade.findAll({
      where: { student_id: studentId, subject_id: subjectId },
      order: [['date', 'DESC']],
    });
  },

  async findAll(filter = {}) {
    return Grade.findAll({ where: filter });
  },

  async create(data) {
    return Grade.create(data);
  },

  async update(id, data) {
    const grade = await Grade.findByPk(id);
    if (!grade) return null;
    return grade.update(data);
  },

  async delete(id) {
    const grade = await Grade.findByPk(id);
    if (!grade) return null;
    return grade.destroy();
  },
};

module.exports = gradeRepository;
