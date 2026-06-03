// Set test environment so rate limiter uses higher limits
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';

// Load .env for local database connection
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('../app');
const http = require('http');
const { sequelize, Attendance } = require('../models');

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

  console.log('\n📋 Attendance Tests\n');

  // ─── Setup: create test server ───────────────────────────────
  let server;
  let baseUrl;
let adminCookie;
let preceptorCookie;
let docenteCookie;
let padreCookie;
  let testStudentId;
  let testCourseId;

  try {
    await sequelize.authenticate();
    assert(true, 'Database connection successful');
  } catch (err) {
    assert(false, `Database connection failed: ${err.message}`);
    console.log('\n❌ Cannot proceed without database. Ensure PostgreSQL is running.');
    console.log(`📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
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
        headers: { 'Content-Type': 'application/json', ...headers, ...(cookies ? { Cookie: cookies } : {}) },
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
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = { raw: data };
          }
          resolve({ status: res.statusCode, body: parsed, cookies: setCookies, authTokenCookie });
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  // ─── Login helpers ────────────────────────────────────────────
  async function loginAs(email) {
    const res = await fetchJson('POST', '/auth/login', { email, password: 'password123' });
    return res.authTokenCookie;
  }

  // ─── Seed data ────────────────────────────────────────────────
  try {
    const { User, Student, Course } = require('../models');

    // Get existing seed data
    const admin = await User.findOne({ where: { email: 'admin@escuela.edu' } });
    const preceptor = await User.findOne({ where: { email: 'preceptor@escuela.edu' } });
    const docente = await User.findOne({ where: { email: 'docente@escuela.edu' } });
    const padre = await User.findOne({ where: { email: 'padre@escuela.edu' } });
    const student = await Student.findOne({ include: ['Course'], order: [['id', 'ASC']] });

    if (!admin || !preceptor || !docente || !padre || !student) {
      throw new Error('Seed data not found. Run migrations and seeders first.');
    }

    testStudentId = student.id;
    testCourseId = student.course_id;

  adminCookie = await loginAs('admin@escuela.edu');
  preceptorCookie = await loginAs('preceptor@escuela.edu');
  docenteCookie = await loginAs('docente@escuela.edu');
  padreCookie = await loginAs('padre@escuela.edu');

  assert(!!adminCookie, 'Admin login successful');
  assert(!!preceptorCookie, 'Preceptor login successful');
  assert(!!docenteCookie, 'Docente login successful');
  assert(!!padreCookie, 'Padre login successful');
} catch (err) {
  assert(false, `Setup failed: ${err.message}`);
  console.log(`📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
  await sequelize.close();
  server.close();
  process.exit(1);
}


  // Generate unique date for this test run
  const testDate = new Date().toISOString().split('T')[0];
  const uniqueDate = `2026-06-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
  let createdAttendanceId;

  // ===================================================================
  // SECTION 1 — Register Attendance (RN-05, RN-06)
  // ===================================================================
  console.log('\n── Register Attendance ──');

  // 1.1 Successful registration
  try {
    const res = await fetchJson('POST', '/attendances', {
      student_id: testStudentId,
      date: uniqueDate,
      status: 'presente',
    }, {}, preceptorCookie);
    createdAttendanceId = res.body.data?.id;
    assert(res.status === 201, 'Register attendance returns 201');
    assert(res.body.status === 'success', 'Response has success status');
    assert(res.body.data?.student_id === testStudentId, 'Response includes student_id');
    assert(res.body.data?.status === 'presente', 'Response includes correct status');
    assert(!!createdAttendanceId, 'Created attendance has an id');
  } catch (err) {
    assert(false, `Register attendance failed: ${err.message}`);
  }

  // 1.2 Duplicate registration → 409 (RN-05)
  try {
    const res = await fetchJson('POST', '/attendances', {
      student_id: testStudentId,
      date: uniqueDate,
      status: 'ausente',
    }, {}, preceptorCookie);
    assert(res.status === 409, 'Duplicate attendance returns 409');
    assert(res.body.message?.includes('Ya existe'), 'Error message mentions existing record');
  } catch (err) {
    assert(false, `Duplicate attendance test failed: ${err.message}`);
  }

  // 1.3 Preceptor can register
  try {
    const otherDate = '2026-06-15';
    const res = await fetchJson('POST', '/attendances', {
      student_id: testStudentId,
      date: otherDate,
      status: 'ausente',
    }, {}, preceptorCookie);
    assert(res.status === 201, 'Preceptor can register attendance');
    // Cleanup
    if (res.body.data?.id) {
      await Attendance.destroy({ where: { id: res.body.data.id }, force: true });
    }
  } catch (err) {
    assert(false, `Preceptor register test failed: ${err.message}`);
  }

  // 1.4 Admin can register
  try {
    const otherDate = '2026-06-20';
    const res = await fetchJson('POST', '/attendances', {
      student_id: testStudentId,
      date: otherDate,
      status: 'tarde',
    }, {}, adminCookie);
    assert(res.status === 201, 'Admin can register attendance');
    if (res.body.data?.id) {
      await Attendance.destroy({ where: { id: res.body.data.id }, force: true });
    }
  } catch (err) {
    assert(false, `Admin register test failed: ${err.message}`);
  }

  // 1.5 Docente cannot register (RN-06)
  try {
    const otherDate = '2026-06-25';
    const res = await fetchJson('POST', '/attendances', {
      student_id: testStudentId,
      date: otherDate,
      status: 'presente',
    }, {}, docenteCookie);
    assert(res.status === 403, 'Docente cannot register attendance (returns 403)');
  } catch (err) {
    assert(false, `Docente register test failed: ${err.message}`);
  }

  // 1.6 Padre cannot register (RN-06)
  try {
    const otherDate = '2026-06-26';
    const res = await fetchJson('POST', '/attendances', {
      student_id: testStudentId,
      date: otherDate,
      status: 'presente',
    }, {}, padreCookie);
    assert(res.status === 403, 'Padre cannot register attendance (returns 403)');
  } catch (err) {
    assert(false, `Padre register test failed: ${err.message}`);
  }

  // 1.7 Unauthenticated → 401
  try {
    const res = await fetchJson('POST', '/attendances', {
      student_id: testStudentId,
      date: '2026-07-01',
      status: 'presente',
    });
    assert(res.status === 401, 'Unauthenticated returns 401');
  } catch (err) {
    assert(false, `Unauthenticated test failed: ${err.message}`);
  }

  // 1.8 Invalid status
  try {
    const res = await fetchJson('POST', '/attendances', {
      student_id: testStudentId,
      date: '2026-07-05',
      status: 'invalido',
    }, {}, preceptorCookie);
    assert(res.status === 400, 'Invalid status returns 400');
    assert(res.body.errors, 'Response has errors array');
  } catch (err) {
    assert(false, `Invalid status test failed: ${err.message}`);
  }

  // ===================================================================
  // SECTION 2 — Batch Registration
  // ===================================================================
  console.log('\n── Batch Registration ──');

  // 2.1 Successful batch
  try {
    const records = [
      { student_id: testStudentId, date: '2026-07-10', status: 'presente' },
      { student_id: testStudentId, date: '2026-07-11', status: 'ausente' },
    ];
    const res = await fetchJson('POST', '/attendances/batch', { records }, {}, preceptorCookie);
    assert(res.status === 201, 'Batch register returns 201');
    assert(Array.isArray(res.body.data), 'Response data is an array');
    assert(res.body.data.length === 2, 'Created 2 records');
    // Cleanup
    for (const rec of res.body.data) {
      if (rec.id) await Attendance.destroy({ where: { id: rec.id }, force: true });
    }
  } catch (err) {
    assert(false, `Batch register failed: ${err.message}`);
  }

  // 2.2 Empty batch
  try {
    const res = await fetchJson('POST', '/attendances/batch', { records: [] }, {}, preceptorCookie);
    assert(res.status === 400, 'Empty batch returns 400');
  } catch (err) {
    assert(false, `Empty batch test failed: ${err.message}`);
  }

  // ===================================================================
  // SECTION 3 — Update Attendance
  // ===================================================================
  console.log('\n── Update Attendance ──');

  if (createdAttendanceId) {
    // 3.1 Successful update
    try {
      const res = await fetchJson('PUT', `/attendances/${createdAttendanceId}`, {
        status: 'tarde',
      }, {}, preceptorCookie);
      assert(res.status === 200, 'Update attendance returns 200');
      assert(res.body.data?.status === 'tarde', 'Status was updated');
    } catch (err) {
      assert(false, `Update attendance failed: ${err.message}`);
    }

    // 3.2 Non-existent record
    try {
      const res = await fetchJson('PUT', '/attendances/999999', {
        status: 'presente',
      }, {}, preceptorCookie);
      assert(res.status === 404, 'Update non-existent returns 404');
    } catch (err) {
      assert(false, `Update non-existent test failed: ${err.message}`);
    }
  }

  // ===================================================================
  // SECTION 4 — Justify Attendance (RN-07)
  // ===================================================================
  console.log('\n── Justify Attendance ──');

  // Create an 'ausente' record to justify
  let justifyAttendanceId;
  try {
    const res = await fetchJson('POST', '/attendances', {
      student_id: testStudentId,
      date: '2026-06-30',
      status: 'ausente',
    }, {}, preceptorCookie);
    justifyAttendanceId = res.body.data?.id;
    assert(!!justifyAttendanceId, 'Created ausente record for justification test');
  } catch (err) {
    assert(false, `Setup justification test failed: ${err.message}`);
  }

  if (justifyAttendanceId) {
    // 4.1 Successful justification
    try {
      const res = await fetchJson('PUT', `/attendances/${justifyAttendanceId}/justify`, {
        justification_note: 'Certificado médico presentado',
      }, {}, preceptorCookie);
      assert(res.status === 200, 'Justify attendance returns 200');
      assert(res.body.data?.is_justified === true, 'Attendance is justified');
    } catch (err) {
      assert(false, `Justify attendance failed: ${err.message}`);
    }

    // 4.2 Double justification → 409 (RN-07 - irreversible)
    try {
      const res = await fetchJson('PUT', `/attendances/${justifyAttendanceId}/justify`, {
        justification_note: 'Intento doble',
      }, {}, preceptorCookie);
      assert(res.status === 409, 'Double justification returns 409');
      assert(res.body.message?.includes('ya fue justificada'), 'Error message mentions already justified');
    } catch (err) {
      assert(false, `Double justification test failed: ${err.message}`);
    }
  }

  // 4.3 Justify a 'presente' record → 400
  try {
    const res = await fetchJson('POST', '/attendances', {
      student_id: testStudentId,
      date: '2026-07-02',
      status: 'presente',
    }, {}, preceptorCookie);
    const presenteId = res.body.data?.id;
    if (presenteId) {
      const justifyRes = await fetchJson('PUT', `/attendances/${presenteId}/justify`, {
        justification_note: 'Test',
      }, {}, preceptorCookie);
      assert(justifyRes.status === 400, 'Justify presente record returns 400');
      await Attendance.destroy({ where: { id: presenteId }, force: true });
    }
  } catch (err) {
    assert(false, `Justify presente test failed: ${err.message}`);
  }

  // 4.4 Non-existent record
  try {
    const res = await fetchJson('PUT', '/attendances/999999/justify', {
      justification_note: 'Test',
    }, {}, preceptorCookie);
    assert(res.status === 404, 'Justify non-existent returns 404');
  } catch (err) {
    assert(false, `Justify non-existent test failed: ${err.message}`);
  }

  // ===================================================================
  // SECTION 5 — Attendance History (RN-09)
  // ===================================================================
  console.log('\n── Attendance History ──');

  // 5.1 Preceptor can view history
  try {
    const res = await fetchJson('GET', `/attendances/students/${testStudentId}`, null, {}, preceptorCookie);
    assert(res.status === 200, 'Preceptor can view history');
    assert(Array.isArray(res.body.data), 'Response data is an array');
    assert(res.body.summary, 'Response includes summary');
    assert(typeof res.body.summary.total_days === 'number', 'Summary has total_days');
    assert(typeof res.body.summary.total_absences === 'number', 'Summary has total_absences');
  } catch (err) {
    assert(false, `Preceptor history test failed: ${err.message}`);
  }

  // 5.2 Admin can view history
  try {
    const res = await fetchJson('GET', `/attendances/students/${testStudentId}`, null, {}, adminCookie);
    assert(res.status === 200, 'Admin can view history');
  } catch (err) {
    assert(false, `Admin history test failed: ${err.message}`);
  }

  // 5.3 Non-existent student
  try {
    const res = await fetchJson('GET', '/attendances/students/999999', null, {}, preceptorCookie);
    assert(res.status === 404, 'Non-existent student returns 404');
  } catch (err) {
    assert(false, `Non-existent student test failed: ${err.message}`);
  }

  // ===================================================================
  // SECTION 6 — Unauthenticated Access
  // ===================================================================
  console.log('\n── Unauthenticated Access ──');

  try {
    const res = await fetchJson('GET', '/attendances/students/1');
    assert(res.status === 401, 'GET history without token returns 401');
  } catch (err) {
    assert(false, `Unauthenticated history test failed: ${err.message}`);
  }

  try {
    const res = await fetchJson('PUT', '/attendances/1/justify', { justification_note: 'test' });
    assert(res.status === 401, 'PUT justify without token returns 401');
  } catch (err) {
    assert(false, `Unauthenticated justify test failed: ${err.message}`);
  }

  // ===================================================================
  // SECTION 7 — Cleanup test data
  // ===================================================================
  console.log('\n── Cleanup ──');

  try {
    // Clean up all test attendance records for the unique date
    await Attendance.destroy({
      where: { date: uniqueDate },
      force: true,
    });
    await Attendance.destroy({
      where: { date: '2026-06-30' },
      force: true,
    });
    await Attendance.destroy({
      where: { date: '2026-07-10' },
      force: true,
    });
    await Attendance.destroy({
      where: { date: '2026-07-11' },
      force: true,
    });
    await Attendance.destroy({
      where: { date: '2026-07-02' },
      force: true,
    });
    assert(true, 'Test data cleaned up');
  } catch (err) {
    assert(false, `Cleanup failed: ${err.message}`);
  }

  // ─── Results ──────────────────────────────────────────────────
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);

  server.close();
  await sequelize.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
