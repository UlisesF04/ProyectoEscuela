'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('docente_materia', [
      // Docente 1 -> materias de 1ero y 2do (IDs 1-4)
      { docente_id: 1, materia_id: 1, created_at: new Date(), updated_at: new Date() },
      { docente_id: 1, materia_id: 2, created_at: new Date(), updated_at: new Date() },
      { docente_id: 1, materia_id: 3, created_at: new Date(), updated_at: new Date() },
      { docente_id: 1, materia_id: 4, created_at: new Date(), updated_at: new Date() },
      // Docente 2 -> materias de 3ero (IDs 5-6)
      { docente_id: 2, materia_id: 5, created_at: new Date(), updated_at: new Date() },
      { docente_id: 2, materia_id: 6, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('docente_materia', null, {});
  },
};
