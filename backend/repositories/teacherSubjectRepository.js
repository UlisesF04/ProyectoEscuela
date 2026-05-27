const { TeacherSubject } = require('../models');

const teacherSubjectRepository = {
  async findById(id) {
    return TeacherSubject.findByPk(id);
  },

  async findAll(filter = {}) {
    return TeacherSubject.findAll({ where: filter });
  },

  async create(data) {
    return TeacherSubject.create(data);
  },

  async delete(id) {
    const assignment = await TeacherSubject.findByPk(id);
    if (!assignment) return null;
    return assignment.destroy();
  },

  async findBySubject(subjectId) {
    return TeacherSubject.findAll({ where: { subject_id: subjectId } });
  },

  async findByTeacher(userId) {
    return TeacherSubject.findAll({ where: { user_id: userId } });
  },
};

module.exports = teacherSubjectRepository;
