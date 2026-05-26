const sequelize = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Course = require('./Course');
const Subject = require('./Subject');
const TeacherSubject = require('./TeacherSubject');
const ParentStudent = require('./ParentStudent');

// ─── User associations ─────────────────────────────────────────
User.hasMany(TeacherSubject, { foreignKey: 'user_id' });
User.hasMany(ParentStudent, { foreignKey: 'user_id' });

// ─── Student associations ──────────────────────────────────────
Student.belongsTo(Course, { foreignKey: 'course_id' });
Student.hasMany(ParentStudent, { foreignKey: 'student_id' });

// ─── Course associations ───────────────────────────────────────
Course.hasMany(Subject, { foreignKey: 'course_id' });
Course.hasMany(Student, { foreignKey: 'course_id' });

// ─── Subject associations ──────────────────────────────────────
Subject.belongsTo(Course, { foreignKey: 'course_id' });
Subject.hasMany(TeacherSubject, { foreignKey: 'subject_id' });

// ─── TeacherSubject associations ───────────────────────────────
TeacherSubject.belongsTo(User, { foreignKey: 'user_id' });
TeacherSubject.belongsTo(Subject, { foreignKey: 'subject_id' });

// ─── ParentStudent associations ────────────────────────────────
ParentStudent.belongsTo(User, { foreignKey: 'user_id' });
ParentStudent.belongsTo(Student, { foreignKey: 'student_id' });

module.exports = {
  sequelize,
  User,
  Student,
  Course,
  Subject,
  TeacherSubject,
  ParentStudent,
};
