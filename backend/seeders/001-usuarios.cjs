'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hash = await bcrypt.hash('123456', 10);

    await queryInterface.bulkInsert('usuarios', [
      { email: 'admin@escuela.com', password_hash: await bcrypt.hash('admin123', 10), rol: 'admin', whatsapp_number: null, created_at: new Date(), updated_at: new Date() },
      { email: 'docente1@escuela.com', password_hash: await bcrypt.hash('docente123', 10), rol: 'docente', whatsapp_number: null, created_at: new Date(), updated_at: new Date() },
      { email: 'docente2@escuela.com', password_hash: await bcrypt.hash('docente123', 10), rol: 'docente', whatsapp_number: null, created_at: new Date(), updated_at: new Date() },
      { email: 'tutor1@email.com', password_hash: await bcrypt.hash('tutor123', 10), rol: 'tutor', whatsapp_number: '+541111111111', created_at: new Date(), updated_at: new Date() },
      { email: 'tutor2@email.com', password_hash: await bcrypt.hash('tutor123', 10), rol: 'tutor', whatsapp_number: '+542222222222', created_at: new Date(), updated_at: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', null, {});
  },
};
