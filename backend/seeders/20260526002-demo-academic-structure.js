'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ─── Course ──────────────────────────────────────────────
    const [course] = await queryInterface.bulkInsert('courses', [
      {
        name: '1° A',
        year: 2026,
        division: 'A',
        level: 'Secundaria',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], { returning: true });

    const courseId = course?.id || 1;

    // ─── Subjects ────────────────────────────────────────────
    const [mathSubject, langSubject] = await queryInterface.bulkInsert('subjects', [
      {
        name: 'Matemática',
        course_id: courseId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Lengua',
        course_id: courseId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], { returning: true });

    const mathId = mathSubject?.id || 1;
    const langId = langSubject?.id || 2;

    // ─── Student ─────────────────────────────────────────────
    const [student] = await queryInterface.bulkInsert('students', [
      {
        first_name: 'Pedro',
        last_name: 'Alumno',
        dni: '40123456',
        birth_date: '2010-05-15',
        course_id: courseId,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], { returning: true });

    const studentId = student?.id || 1;

    // ─── TeacherSubject ──────────────────────────────────────
    await queryInterface.bulkInsert('teacher_subject', [
      {
        user_id: 3, // docente
        subject_id: mathId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 3, // docente
        subject_id: langId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ─── ParentStudent ───────────────────────────────────────
    await queryInterface.bulkInsert('parent_student', [
      {
        user_id: 4, // padre
        student_id: studentId,
        relationship: 'padre',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('parent_student', null, {});
    await queryInterface.bulkDelete('teacher_subject', null, {});
    await queryInterface.bulkDelete('students', null, {});
    await queryInterface.bulkDelete('subjects', null, {});
    await queryInterface.bulkDelete('courses', null, {});
  },
};
