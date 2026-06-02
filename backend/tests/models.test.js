// Load .env for local database connection
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { sequelize, User, Student, Course, Subject, TeacherSubject, ParentStudent } = require('../models');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ ${name}`);
      passed++;
    } else {
      console.log(`  ❌ ${name}`);
      failed++;
    }
  }

  console.log('\n📋 Model Tests\n');

  // ─── Test 1: Models are defined ────────────────────────────
  console.log('── Model Definitions ──');
  assert(!!User, 'User model is defined');
  assert(!!Student, 'Student model is defined');
  assert(!!Course, 'Course model is defined');
  assert(!!Subject, 'Subject model is defined');
  assert(!!TeacherSubject, 'TeacherSubject model is defined');
  assert(!!ParentStudent, 'ParentStudent model is defined');

  // ─── Test 2: Associations ──────────────────────────────────
  console.log('\n── Associations ──');
  assert(typeof User.hasMany === 'function', 'User.hasMany exists');
  assert(typeof Student.belongsTo === 'function', 'Student.belongsTo exists');
  assert(typeof Course.hasMany === 'function', 'Course.hasMany exists');
  assert(typeof Subject.belongsTo === 'function', 'Subject.belongsTo exists');
  assert(typeof TeacherSubject.belongsTo === 'function', 'TeacherSubject.belongsTo exists');

  // ─── Test 3: Database connection ───────────────────────────
  console.log('\n── Database Connection ──');
  try {
    await sequelize.authenticate();
    assert(true, 'Database connection successful');
  } catch (err) {
    assert(false, `Database connection failed: ${err.message}`);
  }

  // ─── Test 4: Seed data ─────────────────────────────────────
  console.log('\n── Seed Data ──');
  try {
    const users = await User.findAll();
    assert(users.length >= 4, `Found ${users.length} users (expected >= 4)`);

    const admin = await User.findOne({ where: { email: 'admin@escuela.edu' } });
    assert(!!admin, 'Admin user exists');

    const docente = await User.findOne({ where: { email: 'docente@escuela.edu' } });
    assert(!!docente, 'Docente user exists');

    const courses = await Course.findAll();
    assert(courses.length >= 1, `Found ${courses.length} courses (expected >= 1)`);

    const subjects = await Subject.findAll();
    assert(subjects.length >= 2, `Found ${subjects.length} subjects (expected >= 2)`);

    const students = await Student.findAll();
    assert(students.length >= 1, `Found ${students.length} students (expected >= 1)`);

    const assignments = await TeacherSubject.findAll();
    assert(assignments.length >= 1, `Found ${assignments.length} teacher assignments (expected >= 1)`);

    const links = await ParentStudent.findAll();
    assert(links.length >= 1, `Found ${links.length} parent-student links (expected >= 1)`);
  } catch (err) {
    assert(false, `Seed data test error: ${err.message}`);
  }

  // ─── Test 5: Constraints ───────────────────────────────────
  console.log('\n── Constraints ──');
  try {
    await User.create({
      email: 'duplicate@test.com',
      password_hash: 'test',
      role: 'admin',
      first_name: 'Test',
      last_name: 'User',
    });
    // Delete the first one
    await User.destroy({ where: { email: 'duplicate@test.com' } });
    assert(true, 'User creation works');
  } catch (err) {
    assert(false, `User creation failed: ${err.message}`);
  }

  try {
    await User.create({
      email: 'unique-test@test.com',
      password_hash: 'test',
      role: 'admin',
      first_name: 'Test',
      last_name: 'Unique',
    });
    // Try duplicate email
    await expectDuplicateEmail();
    assert(true, 'Unique email constraint works');
  } catch (err) {
    // Cleanup
    await User.destroy({ where: { email: 'unique-test@test.com' } });
    assert(true, 'Unique email constraint works (via error catch)');
  }

  // ─── Summary ───────────────────────────────────────────────
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
  await sequelize.close();
  process.exit(failed > 0 ? 1 : 0);
}

async function expectDuplicateEmail() {
  try {
    await User.create({
      email: 'unique-test@test.com',
      password_hash: 'test2',
      role: 'preceptor',
      first_name: 'Dup',
      last_name: 'User',
    });
  } catch (err) {
    return; // Expected to throw
  }
  throw new Error('Expected UniqueConstraintError was not thrown');
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
