'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('docentes', [
      { usuario_id: 2, nombre: 'Carlos', apellido: 'García', dni: '12345678', dias_licencia_total: 15, dias_usados: 0, created_at: new Date(), updated_at: new Date() },
      { usuario_id: 3, nombre: 'María', apellido: 'López', dni: '87654321', dias_licencia_total: 15, dias_usados: 0, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('docentes', null, {});
  },
};
