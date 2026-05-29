const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'students', key: 'id' },
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'subjects', key: 'id' },
  },
  grade: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 10,
    },
  },
  type: {
    type: DataTypes.ENUM('examen', 'trabajo', 'tarea', 'oral', 'otro'),
    allowNull: false,
    defaultValue: 'examen',
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'grades',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['student_id'] },
    { fields: ['subject_id'] },
    { fields: ['student_id', 'subject_id'] },
  ],
});

module.exports = Grade;
