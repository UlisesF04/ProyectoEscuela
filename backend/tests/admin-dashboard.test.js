process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('../app');
const http = require('http');
const { sequelize, Setting } = require('../models');

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

  console.log('\n📋 Admin Dashboard Integration Tests\n');

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

  async function loginAs(email, password = 'password123') {
    const res = await fetchJson('POST', '/auth/login', { email, password });
    if (res.status === 200 && res.authTokenCookie) {
      return res.authTokenCookie;
    }
    return null;
  }

  adminCookie = await loginAs('admin@escuela.edu');
  assert(!!adminCookie, 'Admin login successful');

  preceptorCookie = await loginAs('preceptor@escuela.edu');
  assert(!!preceptorCookie, 'Preceptor login successful');

  // ===================================================================
  // 4.1 — Admin Stats returns aggregated data
  // ===================================================================
  console.log('\n── 4.1 Admin Stats ──');

  let statsData;
  try {
    const res = await fetchJson('GET', '/admin/stats', null, {}, adminCookie);
    assert(res.status === 200, 'GET /admin/stats returns 200');
    assert(res.body?.data !== undefined, 'Response has data object');
    statsData = res.body.data;
    assert(typeof statsData.users === 'number' && statsData.users >= 1,
      `users is a number >= 1 (got ${statsData.users})`);
    assert(typeof statsData.courses === 'number' && statsData.courses >= 1,
      `courses is a number >= 1 (got ${statsData.courses})`);
    assert(typeof statsData.students === 'number' && statsData.students >= 1,
      `students is a number >= 1 (got ${statsData.students})`);
    assert(typeof statsData.pendingLeaves === 'number',
      `pendingLeaves is a number (got ${statsData.pendingLeaves})`);
    assert(typeof statsData.newLeaves === 'number',
      `newLeaves is a number (got ${statsData.newLeaves})`);
    assert(typeof statsData.studentsAtRisk === 'number',
      `studentsAtRisk is a number (got ${statsData.studentsAtRisk})`);
    assert(Array.isArray(statsData.recentNotifications),
      `recentNotifications is an array (got ${typeof statsData.recentNotifications})`);
  } catch (err) {
    assert(false, `Admin stats test failed: ${err.message}`);
  }

  // ===================================================================
  // 4.1b — POST /admin/stats/page-visit records visit
  // ===================================================================
  console.log('\n── 4.1b Page Visit ──');

  try {
    const res = await fetchJson('POST', '/admin/stats/page-visit', { page: '/admin/leaves' }, {}, adminCookie);
    assert(res.status === 200, 'POST /admin/stats/page-visit returns 200');
    assert(res.body?.success === true, 'Response has success: true');
  } catch (err) {
    assert(false, `Page visit test failed: ${err.message}`);
  }

  // Verify that newLeaves is now 0 (or at least correct) after recording a page visit
  try {
    const res = await fetchJson('GET', '/admin/stats', null, {}, adminCookie);
    assert(res.status === 200, 'GET /admin/stats after page-visit returns 200');
    assert(typeof res.body.data.newLeaves === 'number',
      `newLeaves is a number after visit (got ${res.body.data.newLeaves})`);
  } catch (err) {
    assert(false, `Stats after page-visit test failed: ${err.message}`);
  }

  // Clean up any leftover settings from previous test runs
  try {
    await Setting.destroy({ where: {}, force: true });
  } catch (_) { /* ignore */ }

  // ===================================================================
  // 4.2 — Config GET returns defaults
  // ===================================================================
  console.log('\n── 4.2 Config GET ──');

  try {
    const res = await fetchJson('GET', '/config', null, {}, adminCookie);
    assert(res.status === 200, 'GET /config returns 200');
    assert(res.body?.data !== undefined, 'Response has data object');
    assert(res.body.data.absence_threshold === 10,
      `absence_threshold defaults to 10 (got ${res.body.data.absence_threshold})`);
    assert(res.body.data.notification_time === '18:00',
      `notification_time defaults to '18:00' (got ${res.body.data.notification_time})`);
    assert(res.body.data.alerts_enabled !== undefined, 'Response has alerts_enabled');
    const ae = res.body.data.alerts_enabled;
    assert(typeof ae === 'object' && ae.absence === true && ae.low_grade === true && ae.overdue_task === true,
      'alerts_enabled has absence, low_grade, overdue_task keys set to true');
  } catch (err) {
    assert(false, `Config GET test failed: ${err.message}`);
  }

  // ===================================================================
  // 4.3 — Config PUT persistence and validation
  // ===================================================================
  console.log('\n── 4.3 Config PUT ──');

  // Change absence_threshold to 15
  try {
    const res = await fetchJson('PUT', '/config', { absence_threshold: 15 }, {}, adminCookie);
    assert(res.status === 200, 'PUT /config with absence_threshold=15 returns 200');
    assert(res.body?.data?.absence_threshold === 15,
      `absence_threshold is 15 after update (got ${res.body?.data?.absence_threshold})`);
  } catch (err) {
    assert(false, `Config PUT to 15 failed: ${err.message}`);
  }

  // Verify persistence
  try {
    const res = await fetchJson('GET', '/config', null, {}, adminCookie);
    assert(res.status === 200, 'GET /config after update returns 200');
    assert(res.body?.data?.absence_threshold === 15,
      `absence_threshold persisted as 15 (got ${res.body?.data?.absence_threshold})`);
  } catch (err) {
    assert(false, `Config persistence verification failed: ${err.message}`);
  }

  // Restore default
  try {
    const res = await fetchJson('PUT', '/config', { absence_threshold: 10 }, {}, adminCookie);
    assert(res.status === 200, 'PUT /config to restore default 10 returns 200');
    assert(res.body?.data?.absence_threshold === 10,
      `absence_threshold restored to 10 (got ${res.body?.data?.absence_threshold})`);
  } catch (err) {
    assert(false, `Config restore to 10 failed: ${err.message}`);
  }

  // Verify restore
  try {
    const res = await fetchJson('GET', '/config', null, {}, adminCookie);
    assert(res.status === 200, 'GET /config after restore returns 200');
    assert(res.body?.data?.absence_threshold === 10,
      `absence_threshold is 10 after restore (got ${res.body?.data?.absence_threshold})`);
  } catch (err) {
    assert(false, `Config restore verification failed: ${err.message}`);
  }

  // Validation: absence_threshold = 0 (below min)
  try {
    const res = await fetchJson('PUT', '/config', { absence_threshold: 0 }, {}, adminCookie);
    assert(res.status === 400,
      `PUT /config with absence_threshold=0 returns 400 (got ${res.status})`);
  } catch (err) {
    assert(false, `Config validation 0 failed: ${err.message}`);
  }

  // Validation: absence_threshold = 51 (above max)
  try {
    const res = await fetchJson('PUT', '/config', { absence_threshold: 51 }, {}, adminCookie);
    assert(res.status === 400,
      `PUT /config with absence_threshold=51 returns 400 (got ${res.status})`);
  } catch (err) {
    assert(false, `Config validation 51 failed: ${err.message}`);
  }

  // ===================================================================
  // 4.4 — Notifications with filters
  // ===================================================================
  console.log('\n── 4.4 Notifications ──');

  // Get all notifications
  try {
    const res = await fetchJson('GET', '/notifications', null, {}, adminCookie);
    assert(res.status === 200, 'GET /notifications returns 200');
    assert(Array.isArray(res.body), `Response body is an array (got ${typeof res.body})`);
  } catch (err) {
    assert(false, `Notifications GET failed: ${err.message}`);
  }

  // Filter by alert_type
  try {
    const res = await fetchJson('GET', '/notifications?alert_type=absence', null, {}, adminCookie);
    assert(res.status === 200, 'GET /notifications?alert_type=absence returns 200');
    assert(Array.isArray(res.body), 'Filtered response is an array');
    const allMatch = res.body.every(n => n.alert_type === 'absence');
    assert(allMatch, `All filtered notifications have alert_type=absence (or empty array)`);
  } catch (err) {
    assert(false, `Notifications filter by alert_type failed: ${err.message}`);
  }

  // Filter by status
  try {
    const res = await fetchJson('GET', '/notifications?status=enviado', null, {}, adminCookie);
    assert(res.status === 200, 'GET /notifications?status=enviado returns 200');
    assert(Array.isArray(res.body), 'Filtered response is an array');
    const allMatch = res.body.every(n => n.status === 'enviado');
    assert(allMatch, `All filtered notifications have status=enviado (or empty array)`);
  } catch (err) {
    assert(false, `Notifications filter by status failed: ${err.message}`);
  }

  // ===================================================================
  // 4.5 — Non-admin rejection (403/401)
  // ===================================================================
  console.log('\n── 4.5 Non-admin Rejection ──');

  // Preceptor gets 403 on admin stats
  try {
    const res = await fetchJson('GET', '/admin/stats', null, {}, preceptorCookie);
    assert(res.status === 403,
      `Preceptor GET /admin/stats returns 403 (got ${res.status})`);
  } catch (err) {
    assert(false, `Preceptor admin stats rejection failed: ${err.message}`);
  }

  // Preceptor gets 403 on config endpoints
  try {
    const res = await fetchJson('GET', '/config', null, {}, preceptorCookie);
    assert(res.status === 403,
      `Preceptor GET /config returns 403 (got ${res.status})`);
  } catch (err) {
    assert(false, `Preceptor config GET rejection failed: ${err.message}`);
  }

  try {
    const res = await fetchJson('PUT', '/config', { absence_threshold: 15 }, {}, preceptorCookie);
    assert(res.status === 403,
      `Preceptor PUT /config returns 403 (got ${res.status})`);
  } catch (err) {
    assert(false, `Preceptor config PUT rejection failed: ${err.message}`);
  }

  // Preceptor gets 403 on notifications
  try {
    const res = await fetchJson('GET', '/notifications', null, {}, preceptorCookie);
    assert(res.status === 403,
      `Preceptor GET /notifications returns 403 (got ${res.status})`);
  } catch (err) {
    assert(false, `Preceptor notifications rejection failed: ${err.message}`);
  }

  // Unauthenticated gets 401 on admin stats
  try {
    const res = await fetchJson('GET', '/admin/stats');
    assert(res.status === 401,
      `Unauthenticated GET /admin/stats returns 401 (got ${res.status})`);
  } catch (err) {
    assert(false, `Unauthenticated admin stats rejection failed: ${err.message}`);
  }

  // Unauthenticated gets 401 on config
  try {
    const res = await fetchJson('GET', '/config');
    assert(res.status === 401,
      `Unauthenticated GET /config returns 401 (got ${res.status})`);
  } catch (err) {
    assert(false, `Unauthenticated config rejection failed: ${err.message}`);
  }

  // Unauthenticated gets 401 on notifications
  try {
    const res = await fetchJson('GET', '/notifications');
    assert(res.status === 401,
      `Unauthenticated GET /notifications returns 401 (got ${res.status})`);
  } catch (err) {
    assert(false, `Unauthenticated notifications rejection failed: ${err.message}`);
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
