'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('estudiante_tutor', [
      // Estudiantes 1-5 con tutor 1
      { estudiante_id: 1, tutor_id: 1, created_at: new Date(), updated_at: new Date() },
      { estudiante_id: 2, tutor_id: 1, created_at: new Date(), updated_at: new Date() },
      { estudiante_id: 3, tutor_id: 1, created_at: new Date(), updated_at: new Date() },
      { estudiante_id: 4, tutor_id: 1, created_at: new Date(), updated_at: new Date() },
      { estudiante_id: 5, tutor_id: 1, created_at: new Date(), updated_at: new Date() },
      // Estudiantes 6-9 con tutor 2
      { estudiante_id: 6, tutor_id: 2, created_at: new Date(), updated_at: new Date() },
      { estudiante_id: 7, tutor_id: 2, created_at: new Date(), updated_at: new Date() },
      { estudiante_id: 8, tutor_id: 2, created_at: new Date(), updated_at: new Date() },
      { estudiante_id: 9, tutor_id: 2, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('estudiante_tutor', null, {});
  },
};
