const sequelize = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Course = require('./Course');
const Subject = require('./Subject');
const TeacherSubject = require('./TeacherSubject');
const ParentStudent = require('./ParentStudent');
const Attendance = require('./Attendance');
const Grade = require('./Grade');

// ─── User associations ─────────────────────────────────────────
User.hasMany(TeacherSubject, { foreignKey: 'user_id' });
User.hasMany(ParentStudent, { foreignKey: 'user_id' });
User.hasMany(Attendance, { foreignKey: 'registered_by', as: 'registrar' });
User.hasMany(Grade, { foreignKey: 'created_by', as: 'grades' });

// ─── Student associations ──────────────────────────────────────
Student.belongsTo(Course, { foreignKey: 'course_id' });
Student.hasMany(ParentStudent, { foreignKey: 'student_id' });
Student.hasMany(Attendance, { foreignKey: 'student_id' });
Student.hasMany(Grade, { foreignKey: 'student_id' });

// ─── Course associations ───────────────────────────────────────
Course.hasMany(Subject, { foreignKey: 'course_id' });
Course.hasMany(Student, { foreignKey: 'course_id' });

// ─── Subject associations ──────────────────────────────────────
Subject.belongsTo(Course, { foreignKey: 'course_id' });
Subject.hasMany(TeacherSubject, { foreignKey: 'subject_id' });
Subject.hasMany(Grade, { foreignKey: 'subject_id' });

// ─── TeacherSubject associations ───────────────────────────────
TeacherSubject.belongsTo(User, { foreignKey: 'user_id' });
TeacherSubject.belongsTo(Subject, { foreignKey: 'subject_id' });

// ─── ParentStudent associations ────────────────────────────────
ParentStudent.belongsTo(User, { foreignKey: 'user_id' });
ParentStudent.belongsTo(Student, { foreignKey: 'student_id' });

// ─── Attendance associations ───────────────────────────────────
Attendance.belongsTo(Student, { foreignKey: 'student_id' });
Attendance.belongsTo(User, { foreignKey: 'registered_by', as: 'registrar' });

// ─── Grade associations ────────────────────────────────────────
Grade.belongsTo(Student, { foreignKey: 'student_id' });
Grade.belongsTo(Subject, { foreignKey: 'subject_id' });
Grade.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });

module.exports = {
  sequelize,
  User,
  Student,
  Course,
  Subject,
  TeacherSubject,
  ParentStudent,
  Attendance,
  Grade,
};
