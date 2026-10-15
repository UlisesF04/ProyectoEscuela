const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const initializeDatabase = require('../config/initializeDatabase');
const seedDemoData = require('../utils/seedDemoData');
const { sequelize, User, Student, Course, Subject, Grade, ParentStudent, TeacherSubject } = require('../models');

async function run() {
  if (process.env.NODE_ENV !== 'test' || !sequelize.getDatabaseName().endsWith('_test')) {
    throw new Error('Bootstrap tests require NODE_ENV=test and a dedicated database ending in _test.');
  }

  await initializeDatabase({ seed: true });
  const tables = await sequelize.getQueryInterface().showAllTables();
  for (const table of ['users', 'courses', 'subjects', 'students', 'teacher_subject',
    'parent_student', 'grades', 'attendances', 'licences', 'notification_logs', 'settings', 'chats', 'messages']) {
    assert.ok(tables.includes(table), `Missing first-run table: ${table}`);
  }
  const admin = await User.scope('withPassword').findOne({ where: { email: 'admin@escuela.edu' } });
  assert.ok(admin);
  assert.ok(await bcrypt.compare(process.env.DEMO_PASSWORD, admin.password_hash));
  const parent = await User.findOne({ where: { email: 'padre@escuela.edu' } });
  const teacher = await User.findOne({ where: { email: 'docente@escuela.edu' } });
  assert.ok(await ParentStudent.findOne({ where: { user_id: parent.id } }));
  assert.equal(await TeacherSubject.count({ where: { user_id: teacher.id } }), 2);
  assert.equal(await Grade.count(), 6);
  console.log('PASS: fresh database, demo login credentials, grades and family/teacher links.');

  const models = [User, Student, Course, Subject, Grade, ParentStudent, TeacherSubject];
  const before = await Promise.all(models.map(model => model.count()));
  const originalName = admin.first_name;
  try {
    await admin.update({ first_name: 'Edited after first start' });
    await initializeDatabase({ seed: true });
    await Promise.all([seedDemoData('different-demo-password'), seedDemoData('different-demo-password')]);
    assert.deepEqual(await Promise.all(models.map(model => model.count())), before);
    const persisted = await User.scope('withPassword').findByPk(admin.id);
    assert.equal(persisted.first_name, 'Edited after first start');
    assert.equal(persisted.password_hash, admin.password_hash);
    console.log('PASS: repeated/concurrent initialization preserves data and passwords.');
  } finally {
    await admin.update({ first_name: originalName });
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => sequelize.close());
