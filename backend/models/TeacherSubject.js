const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeacherSubject = sequelize.define('TeacherSubject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id',
    },
  },
}, {
  tableName: 'teacher_subject',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['user_id', 'subject_id'] },
    { fields: ['subject_id'] },
  ],
});

module.exports = TeacherSubject;
