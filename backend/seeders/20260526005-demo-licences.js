'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('licences', [
      {
        user_id: 3, // docente
        title: 'Licencia por enfermedad - Gripe',
        file_url: null,
        file_name: null,
        file_mime: null,
        file_size: null,
        file_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 4, // padre
        title: 'Certificado de inasistencia - Juan Pérez',
        file_url: null,
        file_name: null,
        file_mime: null,
        file_size: null,
        file_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 2, // preceptor
        title: 'Licencia personal - Trámites bancarios',
        file_url: null,
        file_name: null,
        file_mime: null,
        file_size: null,
        file_data: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('licences', null, {});
  },
};
