// Set test environment so rate limiter uses higher limits
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';

// Load .env for local database connection
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('../app');
const http = require('http');
const { sequelize, User, Course, Subject, Student, ParentStudent } = require('../models');

async function runTests() {
  let passed = 0;
  let failed = 0;
  const failures = [];

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ ${name}`);
      passed++;
    } else {
      console.log(`  ❌ ${name}`);
      failed++;
      failures.push(name);
    }
  }

  console.log('\n📋 Admin Panel Integration Tests\n');

  // ─── Setup: create test server ───────────────────────────────
  let server;
  let baseUrl;
let adminCookie;
let preceptorCookie;

  try {
    await sequelize.authenticate();
    assert(true, 'Database connection successful');
  } catch (err) {
    assert(false, `Database connection failed: ${err.message}`);
    console.log('\n❌ Cannot proceed without database. Ensure PostgreSQL is running.');
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
    process.exit(1);
  }

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api/v1`;
      resolve();
    });
  });

  function fetchJson(method, urlPath, body, headers = {}, cookies = '') {
    return new Promise((resolve, reject) => {
      const url = `${baseUrl}${urlPath}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...(cookies ? { Cookie: cookies } : {}),
        },
      };
      const req = http.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const setCookies = res.headers['set-cookie'] || [];
          let authTokenCookie = '';
          for (const sc of setCookies) {
            if (sc.startsWith('authToken=')) {
              authTokenCookie = sc.split(';')[0];
              break;
            }
          }
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data), cookies: setCookies, authTokenCookie });
          } catch {
            resolve({ status: res.statusCode, body: data, cookies: setCookies, authTokenCookie });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  // ─── Login helpers ───────────────────────────────────────────
  async function loginAs(email, password = 'password123') {
    const res = await fetchJson('POST', '/auth/login', { email, password });
    if (res.status === 200 && res.authTokenCookie) {
      return res.authTokenCookie;
    }
    return null;
  }

  // ─── Authenticate ────────────────────────────────────────────
adminCookie = await loginAs('admin@escuela.edu');
assert(!!adminCookie, 'Admin login successful');

preceptorCookie = await loginAs('preceptor@escuela.edu');
assert(!!preceptorCookie, 'Preceptor login successful');

  function adminHeaders() {
    return {};
  }

  function preceptorHeaders() {
    return {};
  }

  // Pre-cleanup any leftover test users from previous runs
  try {
    await User.destroy({ where: { email: 'test-docente@test.com' }, force: true });
    await User.destroy({ where: { email: 'hard-delete-test@test.com' }, force: true });
    await User.destroy({ where: { email: 'reactivate-test@test.com' }, force: true });
  } catch (_) { /* ignore */ }

  // ===================================================================
  // SECTION 6.1 — Users CRUD
  // ===================================================================
  console.log('\n── 6.1 Users CRUD ──');

  let createdUserId;

  // 1. Create a new user
  try {
    const res = await fetchJson('POST', '/users', {
      email: 'test-docente@test.com',
      password: 'testpass123',
      first_name: 'Test',
      last_name: 'Docente',
      role: 'docente',
    }, adminHeaders(), adminCookie);
    assert(res.status === 201, 'Create user returns 201');
    assert(res.body.status === 'success', 'Response has success status');
    assert(res.body.data?.email === 'test-docente@test.com', 'Response includes created user email');
    assert(!res.body.data?.password_hash, 'Response does NOT include password_hash');
    createdUserId = res.body.data?.id;
    assert(!!createdUserId, 'Created user has an id');
  } catch (err) {
    assert(false, `Create user failed: ${err.message}`);
  }

  // 2. Duplicate email returns 409
  try {
    const res = await fetchJson('POST', '/users', {
      email: 'test-docente@test.com',
      password: 'testpass123',
      first_name: 'Otro',
      last_name: 'Docente',
      role: 'docente',
    }, adminHeaders(), adminCookie);
    assert(res.status === 409, 'Duplicate email returns 409');
    assert(res.body.message?.includes('registrado'), 'Error message mentions email registered');
  } catch (err) {
    assert(false, `Duplicate email test failed: ${err.message}`);
  }

  // 3. Get all users
  try {
    const res = await fetchJson('GET', '/users', null, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Get all users returns 200');
    assert(Array.isArray(res.body.data), 'Response data is an array');
    assert(res.body.data.length >= 4, `Returns at least 4 users (got ${res.body.data.length})`);
    // Verify no password_hash leaked
    const hasHash = res.body.data.some(u => u.password_hash);
    assert(!hasHash, 'No user in list has password_hash');
  } catch (err) {
    assert(false, `Get all users failed: ${err.message}`);
  }

  // 4. Get user by role
  try {
    const res = await fetchJson('GET', '/users/role/docente', null, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Get users by role returns 200');
    assert(Array.isArray(res.body.data), 'Response data is an array');
    const allDocentes = res.body.data.every(u => u.role === 'docente');
    assert(allDocentes, 'All returned users have role "docente"');
  } catch (err) {
    assert(false, `Get users by role failed: ${err.message}`);
  }

  // 5. Get user by ID
  try {
    const res = await fetchJson('GET', `/users/${createdUserId}`, null, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Get user by ID returns 200');
    assert(res.body.data?.id === createdUserId, 'Returns correct user');
  } catch (err) {
    assert(false, `Get user by ID failed: ${err.message}`);
  }

  // 6. Get non-existent user returns 404
  try {
    const res = await fetchJson('GET', '/users/999999', null, adminHeaders(), adminCookie);
    assert(res.status === 404, 'Get non-existent user returns 404');
  } catch (err) {
    assert(false, `Get non-existent user failed: ${err.message}`);
  }

  // 7. Update user
  try {
    const res = await fetchJson('PUT', `/users/${createdUserId}`, {
      first_name: 'Updated',
      last_name: 'Name',
    }, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Update user returns 200');
    assert(res.body.data?.first_name === 'Updated', 'First name was updated');
    assert(res.body.data?.last_name === 'Name', 'Last name was updated');
  } catch (err) {
    assert(false, `Update user failed: ${err.message}`);
  }

  // 8. Cannot change role
  try {
    const res = await fetchJson('PUT', `/users/${createdUserId}`, {
      role: 'preceptor',
    }, adminHeaders(), adminCookie);
    assert(res.status === 400, 'Changing role returns 400');
  } catch (err) {
    assert(false, `Change role test failed: ${err.message}`);
  }

  // 9. Update with duplicate email returns 409
  try {
    const res = await fetchJson('PUT', `/users/${createdUserId}`, {
      email: 'preceptor@escuela.edu',
    }, adminHeaders(), adminCookie);
    assert(res.status === 409, 'Update to duplicate email returns 409');
  } catch (err) {
    assert(false, `Update duplicate email test failed: ${err.message}`);
  }

  // 10. Deactivate user (soft delete)
  try {
    const res = await fetchJson('DELETE', `/users/${createdUserId}`, null, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Deactivate user returns 200');
    assert(res.body.message?.includes('desactivado'), 'Success message mentions desactivado');
  } catch (err) {
    assert(false, `Deactivate user failed: ${err.message}`);
  }

  // 11. Deactivated user shows as inactive in list
  try {
    const res = await fetchJson('GET', '/users', null, adminHeaders(), adminCookie);
    const deactivatedUser = res.body.data.find(u => u.id === createdUserId);
    assert(!!deactivatedUser, 'Deactivated user still appears in list');
    assert(deactivatedUser.is_active === false, 'Deactivated user has is_active = false');
  } catch (err) {
    assert(false, `Deactivated user list test failed: ${err.message}`);
  }

  // 12. Cannot deactivate already deactivated user
  try {
    const res = await fetchJson('DELETE', `/users/${createdUserId}`, null, adminHeaders(), adminCookie);
    assert(res.status === 409, 'Deactivating already deactivated user returns 409');
  } catch (err) {
    assert(false, `Double deactivate test failed: ${err.message}`);
  }

  // 13. Cannot deactivate admin
  try {
    const res = await fetchJson('DELETE', '/users/1', null, adminHeaders(), adminCookie);
    assert(res.status === 400, 'Deactivating admin returns 400');
  } catch (err) {
    assert(false, `Deactivate admin test failed: ${err.message}`);
  }

  // 14. Reactivate user (update with is_active: true)
  try {
    const res = await fetchJson('PUT', `/users/${createdUserId}`, {
      is_active: true,
    }, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Reactivate user returns 200');
    assert(res.body.data?.is_active === true, 'User is active again');
  } catch (err) {
    assert(false, `Reactivate user failed: ${err.message}`);
  }

  // 15. Reactivated user appears in list with is_active = true
  try {
    const res = await fetchJson('GET', '/users', null, adminHeaders(), adminCookie);
    const userBack = res.body.data.find(u => u.id === createdUserId);
    assert(!!userBack, 'Reactivated user appears in list');
    assert(userBack.is_active === true, 'Reactivated user has is_active = true');
  } catch (err) {
    assert(false, `Reactivated user list test failed: ${err.message}`);
  }

  // 16. Bulk get users
  try {
    const res = await fetchJson('POST', '/users/bulk/get', {
      ids: [1, 2, 3],
    }, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Bulk get returns 200');
    assert(Array.isArray(res.body.data), 'Response data is an array');
    assert(res.body.data.length === 3, 'Returns all requested users');
  } catch (err) {
    assert(false, `Bulk get users failed: ${err.message}`);
  }

  // 17. Validation: missing required fields
  try {
    const res = await fetchJson('POST', '/users', {
      email: 'incomplete@test.com',
      // missing password, first_name, last_name, role
    }, adminHeaders(), adminCookie);
    assert(res.status === 400, 'Create user with missing fields returns 400');
    assert(Array.isArray(res.body.errors), 'Response has errors array');
  } catch (err) {
    assert(false, `Validation test failed: ${err.message}`);
  }

  // 18. Validation: invalid email format
  try {
    const res = await fetchJson('POST', '/users', {
      email: 'not-an-email',
      password: 'testpass123',
      first_name: 'Valid',
      last_name: 'User',
      role: 'docente',
    }, adminHeaders(), adminCookie);
    assert(res.status === 400, 'Invalid email returns 400');
  } catch (err) {
    assert(false, `Invalid email validation test failed: ${err.message}`);
  }

  // 19. Validation: invalid role
  try {
    const res = await fetchJson('POST', '/users', {
      email: 'badrole@test.com',
      password: 'testpass123',
      first_name: 'Valid',
      last_name: 'User',
      role: 'superadmin',
    }, adminHeaders(), adminCookie);
    assert(res.status === 400, 'Invalid role returns 400');
  } catch (err) {
    assert(false, `Invalid role validation test failed: ${err.message}`);
  }

  // ─── Hard Delete & Reactivation Tests ────────────────────────
  console.log('\n── Hard Delete & Reactivation ──');

  // Create a user to test permanent delete
  let hardDeleteUserId;
  try {
    const res = await fetchJson('POST', '/users', {
      email: 'hard-delete-test@test.com',
      password: 'testpass123',
      first_name: 'Hard',
      last_name: 'Delete',
      role: 'docente',
    }, adminHeaders(), adminCookie);
    hardDeleteUserId = res.body.data?.id;
    assert(!!hardDeleteUserId, 'Created user for hard delete test');
  } catch (err) {
    assert(false, `Setup for hard delete test failed: ${err.message}`);
  }

  // Cannot permanently delete an active user
  if (hardDeleteUserId) {
    try {
      const res = await fetchJson('DELETE', `/users/${hardDeleteUserId}/permanent`, null, adminHeaders(), adminCookie);
      assert(res.status === 400, 'Cannot permanent-delete active user (returns 400)');
      assert(res.body.message?.includes('desactivar'), 'Error message mentions desactivar');
    } catch (err) {
      assert(false, `Permanent delete active user test failed: ${err.message}`);
    }
  }

  // Cannot permanently delete admin
  try {
    const res = await fetchJson('DELETE', '/users/1/permanent', null, adminHeaders(), adminCookie);
    assert(res.status === 400, 'Cannot permanent-delete admin (returns 400)');
  } catch (err) {
    assert(false, `Permanent delete admin test failed: ${err.message}`);
  }

  // First deactivate, then permanently delete
  if (hardDeleteUserId) {
    try {
      await fetchJson('DELETE', `/users/${hardDeleteUserId}`, null, adminHeaders(), adminCookie);
      const res = await fetchJson('DELETE', `/users/${hardDeleteUserId}/permanent`, null, adminHeaders(), adminCookie);
      assert(res.status === 200, 'Permanent delete after deactivation returns 200');
    } catch (err) {
      assert(false, `Permanent delete after deactivation test failed: ${err.message}`);
    }
  }

  // Verify the user is truly gone (404)
  if (hardDeleteUserId) {
    try {
      const res = await fetchJson('GET', `/users/${hardDeleteUserId}`, null, adminHeaders(), adminCookie);
      assert(res.status === 404, 'Permanently deleted user returns 404');
    } catch (err) {
      assert(false, `Verify deleted user test failed: ${err.message}`);
    }
  }

  // Reactivate a deactivated user
  let reactivateUserId;
  try {
    const res = await fetchJson('POST', '/users', {
      email: 'reactivate-test@test.com',
      password: 'testpass123',
      first_name: 'Reactivate',
      last_name: 'Test',
      role: 'padre',
    }, adminHeaders(), adminCookie);
    reactivateUserId = res.body.data?.id;
    assert(!!reactivateUserId, 'Created user for reactivation test');

    // Deactivate
    await fetchJson('DELETE', `/users/${reactivateUserId}`, null, adminHeaders(), adminCookie);

    // Reactivate via PUT
    const reactRes = await fetchJson('PUT', `/users/${reactivateUserId}`, { is_active: true }, adminHeaders(), adminCookie);
    assert(reactRes.status === 200, 'Reactivate user returns 200');
    assert(reactRes.body.data?.is_active === true, 'User is_active is true after reactivation');
  } catch (err) {
    assert(false, `Reactivation test failed: ${err.message}`);
  }

  // Cleanup
  try {
    await User.destroy({ where: { email: 'hard-delete-test@test.com' }, force: true });
    await User.destroy({ where: { email: 'reactivate-test@test.com' }, force: true });
  } catch (_) { /* ignore cleanup errors */ }

  const ts = Date.now(); // unique suffix for test data

  // ===================================================================
  // SECTION 6.2 — Courses & Subjects CRUD
  // ===================================================================
  console.log('\n── 6.2 Courses & Subjects CRUD ──');

  let createdCourseId;
  let createdSubjectId;

  // 1. Create a new course
  try {
    const res = await fetchJson('POST', '/courses', {
      name: 'Test Course',
      year: 2026,
      division: 'T',
      level: 'Secundaria',
    }, adminHeaders(), adminCookie);
    assert(res.status === 201, 'Create course returns 201');
    assert(res.body.status === 'success', 'Response has success status');
    assert(res.body.data?.name === 'Test Course', 'Response includes created course name');
    createdCourseId = res.body.data?.id;
    assert(!!createdCourseId, 'Created course has an id');
  } catch (err) {
    assert(false, `Create course failed: ${err.message}`);
  }

  // 2. Get all courses
  try {
    const res = await fetchJson('GET', '/courses', null, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Get all courses returns 200');
    assert(Array.isArray(res.body.data), 'Response data is an array');
    assert(res.body.data.length >= 2, `Returns at least 2 courses (got ${res.body.data.length})`);
  } catch (err) {
    assert(false, `Get all courses failed: ${err.message}`);
  }

  // 3. Get course by ID
  try {
    const res = await fetchJson('GET', `/courses/${createdCourseId}`, null, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Get course by ID returns 200');
    assert(res.body.data?.id === createdCourseId, 'Returns correct course');
  } catch (err) {
    assert(false, `Get course by ID failed: ${err.message}`);
  }

  // 4. Update course
  try {
    const res = await fetchJson('PUT', `/courses/${createdCourseId}`, {
      name: 'Updated Course',
    }, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Update course returns 200');
    assert(res.body.data?.name === 'Updated Course', 'Course name was updated');
  } catch (err) {
    assert(false, `Update course failed: ${err.message}`);
  }

  // 5. Create subject under course
  try {
    const res = await fetchJson('POST', `/courses/${createdCourseId}/subjects`, {
      name: 'Test Subject',
    }, adminHeaders(), adminCookie);
    assert(res.status === 201, 'Create subject returns 201');
    assert(res.body.data?.name === 'Test Subject', 'Response includes created subject name');
    createdSubjectId = res.body.data?.id;
    assert(!!createdSubjectId, 'Created subject has an id');
  } catch (err) {
    assert(false, `Create subject failed: ${err.message}`);
  }

  // 6. Get subjects for course
  try {
    const res = await fetchJson('GET', `/courses/${createdCourseId}/subjects`, null, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Get subjects returns 200');
    assert(Array.isArray(res.body.data), 'Response data is an array');
    const hasTestSubject = res.body.data.some(s => s.id === createdSubjectId);
    assert(hasTestSubject, 'Created subject is in the list');
  } catch (err) {
    assert(false, `Get subjects failed: ${err.message}`);
  }

  // 7. Get subject by ID
  try {
    const res = await fetchJson('GET', `/subjects/${createdSubjectId}`, null, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Get subject by ID returns 200');
    assert(res.body.data?.id === createdSubjectId, 'Returns correct subject');
  } catch (err) {
    assert(false, `Get subject by ID failed: ${err.message}`);
  }

  // 8. Create subject with missing name returns 400
  try {
    const res = await fetchJson('POST', `/courses/${createdCourseId}/subjects`, {}, adminHeaders(), adminCookie);
    assert(res.status === 400, 'Create subject with empty body returns 400');
  } catch (err) {
    assert(false, `Create subject validation test failed: ${err.message}`);
  }

  // 9. Validate course required fields
  try {
    const res = await fetchJson('POST', '/courses', {
      name: 'Incomplete',
      // missing year
    }, adminHeaders(), adminCookie);
    assert(res.status === 400, 'Create course with missing year returns 400');
  } catch (err) {
    assert(false, `Course validation test failed: ${err.message}`);
  }

  // 10. Delete course (soft delete)
  try {
    const res = await fetchJson('DELETE', `/courses/${createdCourseId}`, null, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Delete course returns 200');
  } catch (err) {
    assert(false, `Delete course failed: ${err.message}`);
  }

  // 11. Deleted course not in list
  try {
    const res = await fetchJson('GET', '/courses', null, adminHeaders(), adminCookie);
    const courseStillListed = res.body.data.some(c => c.id === createdCourseId);
    assert(!courseStillListed, 'Deleted course not in list (or marked inactive)');
  } catch (err) {
    assert(false, `Deleted course list test failed: ${err.message}`);
  }

  // Cleanup
  try {
    await Subject.destroy({ where: { id: createdSubjectId }, force: true });
    await Course.destroy({ where: { id: createdCourseId }, force: true });
  } catch (_) { /* ignore */ }

  // ===================================================================
  // SECTION 6.3 — Students & Parent Linking
  // ===================================================================
  console.log('\n── 6.3 Students & Parent Linking ──');

  // Pre-cleanup any leftover test students
  try {
    const oldStudents = await Student.findAll({ where: { dni: [studentDni] } });
    for (const s of oldStudents) {
      await ParentStudent.destroy({ where: { student_id: s.id }, force: true });
      await s.destroy({ force: true });
    }
  } catch (_) { /* ignore */ }

  let createdStudentId;

  // Get a valid course ID from seed data
  let seedCourseId;
  try {
    const course = await Course.findOne();
    seedCourseId = course?.id;
  } catch (_) { /* ignore */ }

  const studentDni = `${90000000 + (ts % 10000000)}`;

  // Pre-cleanup any leftover student with this DNI
  try {
    const oldStudent = await Student.findOne({ where: { dni: studentDni } });
    if (oldStudent) {
      await ParentStudent.destroy({ where: { student_id: oldStudent.id }, force: true });
      await oldStudent.destroy({ force: true });
    }
  } catch (_) { /* ignore */ }

  // 1. Create a new student
  try {
    const res = await fetchJson('POST', '/students', {
      first_name: 'Test',
      last_name: 'Student',
      dni: studentDni,
      birth_date: '2010-06-01',
      course_id: seedCourseId || 1,
    }, adminHeaders(), adminCookie);
    assert(res.status === 201, 'Create student returns 201');
    assert(res.body.status === 'success', 'Response has success status');
    assert(res.body.data?.first_name === 'Test', 'Response includes created student name');
    createdStudentId = res.body.data?.id;
    assert(!!createdStudentId, 'Created student has an id');
  } catch (err) {
    assert(false, `Create student failed: ${err.message}`);
  }

  // 2. Get all students
  try {
    const res = await fetchJson('GET', '/students', null, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Get all students returns 200');
    assert(Array.isArray(res.body.data), 'Response data is an array');
    assert(res.body.data.length >= 2, `Returns at least 2 students (got ${res.body.data.length})`);
  } catch (err) {
    assert(false, `Get all students failed: ${err.message}`);
  }

  // 3. Get student by ID
  try {
    const res = await fetchJson('GET', `/students/${createdStudentId}`, null, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Get student by ID returns 200');
    assert(res.body.data?.id === createdStudentId, 'Returns correct student');
  } catch (err) {
    assert(false, `Get student by ID failed: ${err.message}`);
  }

  // 4. Update student
  try {
    const res = await fetchJson('PUT', `/students/${createdStudentId}`, {
      first_name: 'Updated',
      last_name: 'StudentName',
    }, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Update student returns 200');
    assert(res.body.data?.first_name === 'Updated', 'Student first name was updated');
    assert(res.body.data?.last_name === 'StudentName', 'Student last name was updated');
  } catch (err) {
    assert(false, `Update student failed: ${err.message}`);
  }

  // 5. Deactivate student (soft delete — based on is_active field if exists, else delete)
  try {
    const res = await fetchJson('DELETE', `/students/${createdStudentId}`, null, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Deactivate student returns 200');
  } catch (err) {
    assert(false, `Deactivate student failed: ${err.message}`);
  }

  // 6. Link parent to student
  try {
    const res = await fetchJson('POST', `/students/${createdStudentId}/parents`, {
      user_id: 4, // padre user from seed
      relationship: 'padre',
    }, adminHeaders(), adminCookie);
    assert(res.status === 201, 'Link parent returns 201');
    assert(res.body.data?.user_id === 4, 'Parent is linked to correct user');
  } catch (err) {
    assert(false, `Link parent failed: ${err.message}`);
  }

  // 7. Get parents for student
  try {
    const res = await fetchJson('GET', `/students/${createdStudentId}/parents`, null, adminHeaders(), adminCookie);
    assert(res.status === 200, 'Get parents returns 200');
    assert(Array.isArray(res.body.data), 'Response data is an array');
    const hasPadre = res.body.data.some(p => p.User?.id === 4 || p.user_id === 4);
    assert(hasPadre, 'Linked parent appears in parents list');
  } catch (err) {
    assert(false, `Get parents failed: ${err.message}`);
  }

  // 8. Link parent with invalid user_id returns 400
  try {
    const res = await fetchJson('POST', `/students/${createdStudentId}/parents`, {
      user_id: 'invalid',
    }, adminHeaders(), adminCookie);
    assert(res.status === 400, 'Link parent with invalid user_id returns 400');
  } catch (err) {
    assert(false, `Link parent validation test failed: ${err.message}`);
  }

  // 9. Get non-existent student returns 404
  try {
    const res = await fetchJson('GET', '/students/999999', null, adminHeaders(), adminCookie);
    assert(res.status === 404, 'Get non-existent student returns 404');
  } catch (err) {
    assert(false, `Get non-existent student failed: ${err.message}`);
  }

  // 10. Student validation: missing required fields
  try {
    const res = await fetchJson('POST', '/students', {
      first_name: 'NoCourse',
      last_name: 'Student',
      // missing course_id
    }, adminHeaders(), adminCookie);
    assert(res.status === 400, 'Create student with missing course_id returns 400');
  } catch (err) {
    assert(false, `Student validation test failed: ${err.message}`);
  }

  // ─── Student permanent delete & reactivation ─────────────────
  console.log('\n── Student Hard Delete & Reactivation ──');

  let hardDeleteStudentId;
  const hardDeleteDni = `${80000000 + ((ts + 1) % 10000000)}`;
  try {
    const res = await fetchJson('POST', '/students', {
      first_name: 'Hard',
      last_name: 'DeleteStudent',
      dni: hardDeleteDni,
      course_id: seedCourseId || 1,
    }, adminHeaders(), adminCookie);
    hardDeleteStudentId = res.body.data?.id;
    assert(!!hardDeleteStudentId, 'Created student for hard delete test');
  } catch (err) {
    assert(false, `Setup student hard delete failed: ${err.message}`);
  }

  if (hardDeleteStudentId) {
    // Cannot permanent-delete active student
    try {
      const res = await fetchJson('DELETE', `/students/${hardDeleteStudentId}/permanent`, null, adminHeaders(), adminCookie);
      assert(res.status === 400, 'Cannot permanent-delete active student (returns 400)');
    } catch (err) {
      assert(false, `Student permanent delete active test failed: ${err.message}`);
    }

    // Deactivate then permanent delete
    try {
      await fetchJson('DELETE', `/students/${hardDeleteStudentId}`, null, adminHeaders(), adminCookie);
      const res = await fetchJson('DELETE', `/students/${hardDeleteStudentId}/permanent`, null, adminHeaders(), adminCookie);
      assert(res.status === 200, 'Student permanent delete after deactivation returns 200');
    } catch (err) {
      assert(false, `Student permanent delete after deactivation test failed: ${err.message}`);
    }

    // Verify 404
    try {
      const res = await fetchJson('GET', `/students/${hardDeleteStudentId}`, null, adminHeaders(), adminCookie);
      assert(res.status === 404, 'Permanently deleted student returns 404');
    } catch (err) {
      assert(false, `Verify deleted student test failed: ${err.message}`);
    }
  }

  // Reactivate a deactivated student
  const reactivateDni = `${80000000 + ((ts + 2) % 10000000)}`;
  try {
    const res = await fetchJson('POST', '/students', {
      first_name: 'Reactivate',
      last_name: 'Student',
      dni: reactivateDni,
      course_id: seedCourseId || 1,
    }, adminHeaders(), adminCookie);
    const reactivateStudentId = res.body.data?.id;
    assert(!!reactivateStudentId, 'Created student for reactivation test');

    if (reactivateStudentId) {
      // Deactivate
      await fetchJson('DELETE', `/students/${reactivateStudentId}`, null, adminHeaders(), adminCookie);
      // Reactivate via PUT
      const reactRes = await fetchJson('PUT', `/students/${reactivateStudentId}`, { is_active: true }, adminHeaders(), adminCookie);
      assert(reactRes.status === 200, 'Reactivate student returns 200');
      assert(reactRes.body.data?.is_active === true, 'Student is_active is true after reactivation');
    }
  } catch (err) {
    assert(false, `Student reactivation test failed: ${err.message}`);
  }

  // Cleanup leftover test students
  try {
    const s1 = await Student.findOne({ where: { dni: hardDeleteDni } });
    if (s1) { await ParentStudent.destroy({ where: { student_id: s1.id }, force: true }); await s1.destroy({ force: true }); }
    const s2 = await Student.findOne({ where: { dni: reactivateDni } });
    if (s2) { await ParentStudent.destroy({ where: { student_id: s2.id }, force: true }); await s2.destroy({ force: true }); }
  } catch (_) { /* ignore */ }

  // Cleanup created student (by DNI to be safe if ID wasn't captured)
  try {
    const cleanupStudent = await Student.findOne({ where: { dni: studentDni } });
    if (cleanupStudent) {
      // Also clean up any parent-student links
      await ParentStudent.destroy({ where: { student_id: cleanupStudent.id }, force: true });
      await cleanupStudent.destroy({ force: true });
    }
  } catch (_) { /* ignore */ }
  try {
    await Student.destroy({ where: { dni: studentDni }, force: true });
  } catch (_) { /* ignore */ }

  // ===================================================================
  // SECTION 6.4 — Permissions (403 for non-admin)
  // ===================================================================
  console.log('\n── 6.4 Permissions (non-admin → 403) ──');

  const protectedEndpoints = [
    { method: 'POST', path: '/users', body: { email: 'perm-test@test.com', password: 'testpass123', first_name: 'Perm', last_name: 'Test', role: 'docente' } },
    { method: 'GET', path: '/users' },
    { method: 'GET', path: '/users/1' },
    { method: 'PUT', path: '/users/1', body: { first_name: 'Hack' } },
    { method: 'DELETE', path: '/users/1' },
    { method: 'DELETE', path: '/users/1/permanent' },
    { method: 'POST', path: '/users/bulk/get', body: { ids: [1] } },
    { method: 'POST', path: '/courses', body: { name: 'Hack Course', year: 2026 } },
    { method: 'PUT', path: '/courses/1', body: { name: 'Hack' } },
    { method: 'DELETE', path: '/courses/1' },
    { method: 'POST', path: '/courses/1/subjects', body: { name: 'Hack Subject' } },
    { method: 'GET', path: '/subjects/1' },
  ];

  for (const ep of protectedEndpoints) {
    try {
      const res = await fetchJson(ep.method, ep.path, ep.body || null, preceptorHeaders(), preceptorCookie);
      const isForbidden = res.status === 403;
      assert(isForbidden, `${ep.method} ${ep.path} returns 403 (got ${res.status})`);
    } catch (err) {
      assert(false, `${ep.method} ${ep.path} permission test failed: ${err.message}`);
    }
  }

  // Preceptor-allowed student/subject endpoints (not 403)
  const preceptorAllowedEndpoints = [
    { method: 'POST', path: '/students', body: { first_name: 'Hack', last_name: 'Student', course_id: 1 }, expectNot: 403 },
    { method: 'PUT', path: '/students/1', body: { first_name: 'Hack' }, expectNot: 403 },
    { method: 'DELETE', path: '/students/1', expectNot: 403 },
    { method: 'POST', path: '/students/1/parents', body: { user_id: 2 }, expectNot: 403 },
    { method: 'POST', path: '/subjects/1/teachers', body: { user_id: 2 }, expectNot: 403 },
  ];

  for (const ep of preceptorAllowedEndpoints) {
    try {
      const res = await fetchJson(ep.method, ep.path, ep.body || null, preceptorHeaders(), preceptorCookie);
      assert(res.status !== 403, `${ep.method} ${ep.path} does NOT return 403 (got ${res.status})`);
    } catch (err) {
      assert(false, `${ep.method} ${ep.path} preceptor-allowed test failed: ${err.message}`);
    }
  }

  // Also test that unauthenticated requests return 401
  console.log('\n── 6.4b Unauthenticated → 401 ──');
  const unauthEndpoints = [
    { method: 'GET', path: '/users' },
    { method: 'POST', path: '/courses', body: { name: 'Unauth', year: 2026 } },
    { method: 'GET', path: '/students' },
  ];

  for (const ep of unauthEndpoints) {
    try {
      const res = await fetchJson(ep.method, ep.path, ep.body || null);
      const isUnauthorized = res.status === 401;
      assert(isUnauthorized, `${ep.method} ${ep.path} returns 401 (got ${res.status})`);
    } catch (err) {
      assert(false, `${ep.method} ${ep.path} unauth test failed: ${err.message}`);
    }
  }

  // ===================================================================
  // Summary
  // ===================================================================
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);

  server.close();
  await sequelize.close();

  if (failed > 0) {
    console.log('\n❌ Failed tests:');
    failures.forEach(f => console.log(`   - ${f}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
