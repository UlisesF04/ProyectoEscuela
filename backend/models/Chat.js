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
