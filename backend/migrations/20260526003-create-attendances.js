'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('attendances', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('presente', 'ausente', 'tarde'),
        allowNull: false,
      },
      is_justified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      justification_note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      certificate_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      registered_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('attendances', ['student_id', 'date'], { unique: true });
    await queryInterface.addIndex('attendances', ['date']);
    await queryInterface.addIndex('attendances', ['status']);
    await queryInterface.addIndex('attendances', ['is_justified']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('attendances');
  },
};
