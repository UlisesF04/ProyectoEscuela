const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationLog = sequelize.define('NotificationLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'students',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  alert_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  channel: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'email',
  },
  status: {
    type: DataTypes.ENUM('enviado', 'fallido'),
    defaultValue: 'enviado',
  },
  sent_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'notification_logs',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['student_id'] },
    { fields: ['type'] },
    { fields: ['alert_type'] },
    { fields: ['status'] },
    { fields: ['sent_at'] },
  ],
});

module.exports = NotificationLog;
