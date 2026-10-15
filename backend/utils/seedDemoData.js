const bcrypt = require('bcrypt');
const {
  sequelize, User, Course, Subject, Student, TeacherSubject, ParentStudent, Grade, Licence,
} = require('../models');

// First-run fixture only: never reset accounts or replace an existing school's data.
async function seedDemoData(password = process.env.DEMO_PASSWORD) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Los datos de demostración solo están disponibles en desarrollo o test.');
  }
  if (!password || password.length < 8) {
    throw new Error('Configurá DEMO_PASSWORD con al menos 8 caracteres para crear las cuentas de prueba.');
  }

  return sequelize.transaction(async (transaction) => {
    // Serialize concurrent first starts; the lock is released on commit/rollback.
    await sequelize.query('SELECT pg_advisory_xact_lock(20261002, 12)', { transaction });
    const counts = await Promise.all([User, Course, Subject, Student].map(
      model => model.count({ transaction, paranoid: false })
    ));
    if (counts.some(count => count > 0)) return false;

    const passwordHash = await bcrypt.hash(password, 12);
    const [admin, preceptor, docente, padre] = await User.bulkCreate([
      { role: 'admin', first_name: 'Admin', last_name: 'Sistema' },
      { role: 'preceptor', first_name: 'Carlos', last_name: 'Preceptor' },
      { role: 'docente', first_name: 'María', last_name: 'Docente' },
      { role: 'padre', first_name: 'Juan', last_name: 'Padre' },
    ].map(user => ({
      ...user,
      email: `${user.role}@escuela.edu`,
      password_hash: passwordHash,
      is_active: true,
    })), { transaction, returning: true });

    const year = new Date().getFullYear();
    const course = await Course.create({
      name: '1° A', year, division: 'A', level: 'Secundaria',
    }, { transaction });
    const subjects = await Subject.bulkCreate([
      { name: 'Matemática', course_id: course.id },
      { name: 'Lengua', course_id: course.id },
    ], { transaction, returning: true });
    const student = await Student.create({
      first_name: 'Pedro', last_name: 'Alumno', dni: '40123456',
      birth_date: `${year - 13}-05-15`, course_id: course.id, is_active: true,
    }, { transaction });

    await TeacherSubject.bulkCreate(subjects.map(subject => ({
      user_id: docente.id, subject_id: subject.id,
    })), { transaction });
    await ParentStudent.create({
      user_id: padre.id, student_id: student.id, relationship: 'padre',
    }, { transaction });
    const sampleGrades = [[8.5, 7, 9], [6.5, 8, 7.5]];
    await Grade.bulkCreate(subjects.flatMap((subject, index) => [
      { grade: sampleGrades[index][0], date: `${year}-03-15`, description: 'Primera evaluación' },
      { grade: sampleGrades[index][1], date: `${year}-06-15`, description: 'Segunda evaluación' },
      { grade: sampleGrades[index][2], date: `${year}-09-15`, description: 'Tercera evaluación' },
    ].map(grade => ({
      ...grade, type: 'examen', student_id: student.id,
      subject_id: subject.id, created_by: docente.id,
    }))), { transaction });
    await Licence.bulkCreate([
      { user_id: docente.id, title: 'Licencia de demostración' },
      { user_id: preceptor.id, title: 'Documento de demostración' },
      { user_id: padre.id, title: 'Justificativo de demostración' },
    ], { transaction });

    console.log(`✓ Cuentas de demostración creadas (administrador: ${admin.email})`);
    return true;
  });
}

module.exports = seedDemoData;
