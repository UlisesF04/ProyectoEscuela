const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ParentStudent = sequelize.define('ParentStudent', {
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
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id',
    },
  },
  relationship: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'parent_student',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['user_id', 'student_id'] },
    { fields: ['student_id'] },
  ],
});

module.exports = ParentStudent;
