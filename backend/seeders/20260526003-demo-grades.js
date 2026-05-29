'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Asume que existe:
    //   - student_id = 1 (Pedro Alumno)
    //   - subject_id = 1 (Matemática)
    //   - subject_id = 2 (Lengua)
    //   - user_id = 3 (docente que crea las notas)

    await queryInterface.bulkInsert('grades', [
      // ─── Matemática ──────────────────────────────────────────
      {
        student_id: 1,
        subject_id: 1,
        grade: 8.50,
        type: 'examen',
        description: 'Examen integrador de números enteros',
        date: '2026-03-15',
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        student_id: 1,
        subject_id: 1,
        grade: 7.00,
        type: 'trabajo',
        description: 'Trabajo práctico: ecuaciones',
        date: '2026-04-10',
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        student_id: 1,
        subject_id: 1,
        grade: 9.00,
        type: 'examen',
        description: 'Examen trimestral de matemática',
        date: '2026-05-20',
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // ─── Lengua ──────────────────────────────────────────────
      {
        student_id: 1,
        subject_id: 2,
        grade: 6.50,
        type: 'examen',
        description: 'Evaluación de comprensión lectora',
        date: '2026-03-20',
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        student_id: 1,
        subject_id: 2,
        grade: 8.00,
        type: 'tarea',
        description: 'Ensayo sobre poesía latinoamericana',
        date: '2026-04-25',
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        student_id: 1,
        subject_id: 2,
        grade: 7.50,
        type: 'oral',
        description: 'Exposición oral: análisis de cuento',
        date: '2026-05-15',
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('grades', null, {});
  },
};
