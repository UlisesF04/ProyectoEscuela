// seed.mjs — Run all seeders in order
import sequelize from './config/database.js';
import models from './models/index.js';
import bcrypt from 'bcryptjs';

async function runAllSeeders() {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected\n');

    console.log('📊 Syncing models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced\n');

    console.log('🌱 Running seeders...\n');

    // 001 - Usuarios
    console.log('  Seeding: usuarios...');
    try {
      const hash = await bcrypt.hash('123456', 10);
      const usuarios = [
        { email: 'admin@escuela.com', password_hash: await bcrypt.hash('admin123', 10), rol: 'admin', whatsapp_number: null, created_at: new Date(), updated_at: new Date() },
        { email: 'docente1@escuela.com', password_hash: await bcrypt.hash('docente123', 10), rol: 'docente', whatsapp_number: null, created_at: new Date(), updated_at: new Date() },
        { email: 'docente2@escuela.com', password_hash: await bcrypt.hash('docente123', 10), rol: 'docente', whatsapp_number: null, created_at: new Date(), updated_at: new Date() },
        { email: 'tutor1@email.com', password_hash: await bcrypt.hash('tutor123', 10), rol: 'tutor', whatsapp_number: '+541111111111', created_at: new Date(), updated_at: new Date() },
        { email: 'tutor2@email.com', password_hash: await bcrypt.hash('tutor123', 10), rol: 'tutor', whatsapp_number: '+542222222222', created_at: new Date(), updated_at: new Date() },
        { email: 'preceptor@escuela.com', password_hash: await bcrypt.hash('preceptor123', 10), rol: 'preceptor', whatsapp_number: null, created_at: new Date(), updated_at: new Date() },
      ];
      await models.Usuario.bulkCreate(usuarios, { ignoreDuplicates: true });
      console.log('    ✓ 6 usuarios inserted');
    } catch (e) {
      console.log(`    ✗ Error: ${e.message}`);
    }

    // 002 - Cursos
    console.log('  Seeding: cursos...');
    try {
      const cursos = [
        { nombre: '1er año - A', anio: 1, division: 'A', created_at: new Date(), updated_at: new Date() },
        { nombre: '1er año - B', anio: 1, division: 'B', created_at: new Date(), updated_at: new Date() },
        { nombre: '2do año - A', anio: 2, division: 'A', created_at: new Date(), updated_at: new Date() },
        { nombre: '2do año - B', anio: 2, division: 'B', created_at: new Date(), updated_at: new Date() },
        { nombre: '3er año - A', anio: 3, division: 'A', created_at: new Date(), updated_at: new Date() },
        { nombre: '3er año - B', anio: 3, division: 'B', created_at: new Date(), updated_at: new Date() },
      ];
      await models.Curso.bulkCreate(cursos, { ignoreDuplicates: true });
      console.log('    ✓ 6 cursos inserted');
    } catch (e) {
      console.log(`    ✗ Error: ${e.message}`);
    }

    // 003 - Docentes
    console.log('  Seeding: docentes...');
    try {
      const docentes = [
        { usuario_id: 2, nombre: 'Juan', apellido: 'García', dni: '12345678', dias_licencia_total: 15, dias_usados: 0, created_at: new Date(), updated_at: new Date() },
        { usuario_id: 3, nombre: 'María', apellido: 'Rodríguez', dni: '87654321', dias_licencia_total: 15, dias_usados: 0, created_at: new Date(), updated_at: new Date() },
      ];
      await models.Docente.bulkCreate(docentes, { ignoreDuplicates: true });
      console.log('    ✓ 2 docentes inserted');
    } catch (e) {
      console.log(`    ✗ Error: ${e.message}`);
    }

    // 004 - Estudiantes
    console.log('  Seeding: estudiantes...');
    try {
      const estudiantes = [
        { nombre: 'Carlos', apellido: 'López', dni: '11111111', curso_id: 1, created_at: new Date(), updated_at: new Date() },
        { nombre: 'Ana', apellido: 'Martínez', dni: '22222222', curso_id: 1, created_at: new Date(), updated_at: new Date() },
        { nombre: 'Pedro', apellido: 'González', dni: '33333333', curso_id: 1, created_at: new Date(), updated_at: new Date() },
        { nombre: 'Laura', apellido: 'Pérez', dni: '44444444', curso_id: 2, created_at: new Date(), updated_at: new Date() },
        { nombre: 'Luis', apellido: 'Sánchez', dni: '55555555', curso_id: 2, created_at: new Date(), updated_at: new Date() },
        { nombre: 'Diego', apellido: 'Hernández', dni: '66666666', curso_id: 3, created_at: new Date(), updated_at: new Date() },
      ];
      await models.Estudiante.bulkCreate(estudiantes, { ignoreDuplicates: true });
      console.log('    ✓ 6 estudiantes inserted');
    } catch (e) {
      console.log(`    ✗ Error: ${e.message}`);
    }

    // 005 - Tutores
    console.log('  Seeding: tutores...');
    try {
      const tutores = [
        { usuario_id: 4, nombre: 'Roberto', apellido: 'López', dni: '99999999', telefono: '+541111111111', created_at: new Date(), updated_at: new Date() },
        { usuario_id: 5, nombre: 'Beatriz', apellido: 'Martínez', dni: '88888888', telefono: '+542222222222', created_at: new Date(), updated_at: new Date() },
      ];
      await models.Tutor.bulkCreate(tutores, { ignoreDuplicates: true });
      console.log('    ✓ 2 tutores inserted');
    } catch (e) {
      console.log(`    ✗ Error: ${e.message}`);
    }

    // 006 - EstudianteTutor (relationships)
    console.log('  Seeding: estudiante-tutor relationships...');
    try {
      const relationships = [
        { estudiante_id: 1, tutor_id: 1, created_at: new Date(), updated_at: new Date() },
        { estudiante_id: 2, tutor_id: 1, created_at: new Date(), updated_at: new Date() },
        { estudiante_id: 3, tutor_id: 2, created_at: new Date(), updated_at: new Date() },
        { estudiante_id: 4, tutor_id: 2, created_at: new Date(), updated_at: new Date() },
        { estudiante_id: 5, tutor_id: 1, created_at: new Date(), updated_at: new Date() },
      ];
      await models.EstudianteTutor.bulkCreate(relationships, { ignoreDuplicates: true });
      console.log('    ✓ 5 relationships inserted');
    } catch (e) {
      console.log(`    ✗ Error: ${e.message}`);
    }

    // 007 - Materias
    console.log('  Seeding: materias...');
    try {
      const materias = [
        { nombre: 'Matemáticas', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Lengua', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Historia', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Biología', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Física', created_at: new Date(), updated_at: new Date() },
      ];
      await models.Materia.bulkCreate(materias, { ignoreDuplicates: true });
      console.log('    ✓ 5 materias inserted');
    } catch (e) {
      console.log(`    ✗ Error: ${e.message}`);
    }

    // 008 - DocenteMateria (assignments)
    console.log('  Seeding: docente-materia assignments...');
    try {
      const assignments = [
        { docente_id: 1, materia_id: 1, created_at: new Date(), updated_at: new Date() },
        { docente_id: 1, materia_id: 2, created_at: new Date(), updated_at: new Date() },
        { docente_id: 2, materia_id: 3, created_at: new Date(), updated_at: new Date() },
        { docente_id: 2, materia_id: 4, created_at: new Date(), updated_at: new Date() },
      ];
      await models.DocenteMateria.bulkCreate(assignments, { ignoreDuplicates: true });
      console.log('    ✓ 4 assignments inserted');
    } catch (e) {
      console.log(`    ✗ Error: ${e.message}`);
    }

    console.log('\n✅ All seeders completed!');
    console.log('\n📋 Test credentials:');
    console.log('  - Admin: admin@escuela.com / admin123');
    console.log('  - Docente: docente1@escuela.com / docente123');
    console.log('  - Tutor: tutor1@email.com / tutor123');
    console.log('\n🚀 You can now start the backend with: npm run dev');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

runAllSeeders();
