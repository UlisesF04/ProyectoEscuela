const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Licence = sequelize.define('Licence', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  file_mime: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  file_data: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
  },
}, {
  tableName: 'licences',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
  ],
});

module.exports = Licence;
