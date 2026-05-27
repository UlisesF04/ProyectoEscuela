const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('presente', 'ausente', 'tarde'),
    allowNull: false,
  },
  is_justified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  justification_note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  certificate_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  registered_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'attendances',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['student_id', 'date'] },
    { fields: ['date'] },
    { fields: ['status'] },
    { fields: ['is_justified'] },
  ],
});

module.exports = Attendance;
