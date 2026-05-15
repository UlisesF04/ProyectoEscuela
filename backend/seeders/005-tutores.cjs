'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('tutores', [
      { usuario_id: 4, nombre: 'Roberto', apellido: 'Mendoza', whatsapp_number: '+541111111111', created_at: new Date(), updated_at: new Date() },
      { usuario_id: 5, nombre: 'Patricia', apellido: 'Silva', whatsapp_number: '+542222222222', created_at: new Date(), updated_at: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tutores', null, {});
  },
};
