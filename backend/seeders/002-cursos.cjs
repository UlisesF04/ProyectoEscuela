'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('cursos', [
      { nombre: '1ero', anio: 1, division: 'A', created_at: new Date(), updated_at: new Date() },
      { nombre: '2do', anio: 2, division: 'B', created_at: new Date(), updated_at: new Date() },
      { nombre: '3ero', anio: 3, division: 'C', created_at: new Date(), updated_at: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('cursos', null, {});
  },
};
