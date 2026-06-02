const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Chat extends Model {}

Chat.init({
  user1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user2_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  last_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  last_message_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deleted_by_user1: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  deleted_by_user2: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  cleared_at_user1: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  cleared_at_user2: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  sequelize,
  modelName: 'Chat',
  tableName: 'chats',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user1_id', 'user2_id'],
    },
  ],
});

module.exports = Chat;
