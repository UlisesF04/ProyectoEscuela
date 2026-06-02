const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
  key: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    allowNull: false,
  },
  value: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
}, {
  tableName: 'settings',
  timestamps: true,
  underscored: true,
});

module.exports = Setting;
