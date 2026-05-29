'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('grades', {
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
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      grade: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('examen', 'trabajo', 'tarea', 'oral', 'otro'),
        allowNull: false,
        defaultValue: 'examen',
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      created_by: {
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

    await queryInterface.addIndex('grades', ['student_id']);
    await queryInterface.addIndex('grades', ['subject_id']);
    await queryInterface.addIndex('grades', ['student_id', 'subject_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('grades');
  },
};
