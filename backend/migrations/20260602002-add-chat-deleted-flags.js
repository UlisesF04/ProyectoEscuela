'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('chats', 'deleted_by_user1', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('chats', 'deleted_by_user2', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('chats', 'cleared_at_user1', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('chats', 'cleared_at_user2', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('chats', 'deleted_by_user1');
    await queryInterface.removeColumn('chats', 'deleted_by_user2');
    await queryInterface.removeColumn('chats', 'cleared_at_user1');
    await queryInterface.removeColumn('chats', 'cleared_at_user2');
  },
};
