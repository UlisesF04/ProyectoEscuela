'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('estudiantes', [
      // Curso 1 (1ero A) — IDs 1-3
      { nombre: 'Juan', apellido: 'Pérez', dni: '11111111', curso_id: 1, created_at: new Date(), updated_at: new Date() },
      { nombre: 'Ana', apellido: 'Gómez', dni: '22222222', curso_id: 1, created_at: new Date(), updated_at: new Date() },
      { nombre: 'Luis', apellido: 'Martínez', dni: '33333333', curso_id: 1, created_at: new Date(), updated_at: new Date() },
      // Curso 2 (2do B) — IDs 4-6
      { nombre: 'Sofía', apellido: 'Rodríguez', dni: '44444444', curso_id: 2, created_at: new Date(), updated_at: new Date() },
      { nombre: 'Diego', apellido: 'Fernández', dni: '55555555', curso_id: 2, created_at: new Date(), updated_at: new Date() },
      { nombre: 'Laura', apellido: 'Sánchez', dni: '66666666', curso_id: 2, created_at: new Date(), updated_at: new Date() },
      // Curso 3 (3ero C) — IDs 7-9
      { nombre: 'Pedro', apellido: 'Díaz', dni: '77777777', curso_id: 3, created_at: new Date(), updated_at: new Date() },
      { nombre: 'Camila', apellido: 'Torres', dni: '88888888', curso_id: 3, created_at: new Date(), updated_at: new Date() },
      { nombre: 'Martín', apellido: 'Ruiz', dni: '99999999', curso_id: 3, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('estudiantes', null, {});
  },
};
