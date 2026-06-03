'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('messages', ['chat_id'], { name: 'idx_messages_chat_id' });
    await queryInterface.addIndex('messages', ['created_at'], { name: 'idx_messages_created_at' });
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('messages', 'idx_messages_chat_id');
    await queryInterface.removeIndex('messages', 'idx_messages_created_at');
  }
};
