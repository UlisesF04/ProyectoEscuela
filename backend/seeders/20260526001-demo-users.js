'use strict';

// ⚠️ IMPORTANTE: Este seeder es SOLO para desarrollo local.
// En producción, el seeder retorna inmediatamente gracias al guard NODE_ENV.
// La contraseña por defecto se puede override con DEMO_PASSWORD env var.

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Seeders no deben ejecutarse en producción. Saltando.');
      return;
    }
    const demoPassword = process.env.DEMO_PASSWORD;
    if (!demoPassword) {
      console.error('FATAL: Variable DEMO_PASSWORD no configurada. Seeders abortados.');
      return;
    }
    const passwordHash = await bcrypt.hash(demoPassword, 12);

    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@escuela.edu',
        password_hash: passwordHash,
        role: 'admin',
        first_name: 'Admin',
        last_name: 'Sistema',
        phone_whatsapp: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'preceptor@escuela.edu',
        password_hash: passwordHash,
        role: 'preceptor',
        first_name: 'Carlos',
        last_name: 'Preceptor',
        phone_whatsapp: '+54111234567',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'docente@escuela.edu',
        password_hash: passwordHash,
        role: 'docente',
        first_name: 'Maria',
        last_name: 'Docente',
        phone_whatsapp: '+54117654321',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'padre@escuela.edu',
        password_hash: passwordHash,
        role: 'padre',
        first_name: 'Juan',
        last_name: 'Padre',
        phone_whatsapp: '+54119876543',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
