'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('materias', [
      // Curso 1
      { nombre: 'Matemática', curso_id: 1, created_at: new Date(), updated_at: new Date() },
      { nombre: 'Lengua', curso_id: 1, created_at: new Date(), updated_at: new Date() },
      // Curso 2
      { nombre: 'Matemática', curso_id: 2, created_at: new Date(), updated_at: new Date() },
      { nombre: 'Lengua', curso_id: 2, created_at: new Date(), updated_at: new Date() },
      // Curso 3
      { nombre: 'Matemática', curso_id: 3, created_at: new Date(), updated_at: new Date() },
      { nombre: 'Lengua', curso_id: 3, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('materias', null, {});
  },
};
