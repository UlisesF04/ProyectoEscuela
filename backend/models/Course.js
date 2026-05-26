const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  division: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  level: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'courses',
  timestamps: true,
  underscored: true,
});

module.exports = Course;
