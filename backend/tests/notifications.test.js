// Set test environment so rate limiter uses higher limits
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.SERVICE_API_KEY = 'test-service-key-123';

// Load .env for local database connection
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('../app');
const http = require('http');
const { sequelize, NotificationLog } = require('../models');

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

  console.log('\n\u{1F4CB} Notification Tests\n');

  // --- Setup: create test server ---
  let server;
  let baseUrl;
  let adminCookie;

  try {
    await sequelize.authenticate();
    assert(true, 'Database connection successful');
  } catch (err) {
    assert(false, `Database connection failed: ${err.message}`);
    console.log('\n\u{274C} Cannot proceed without database. Ensure PostgreSQL is running.');
    console.log(`\n\u{1F4CA} Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
    process.exit(1);
  }

  // Sync notification_logs table for tests
  try {
    await NotificationLog.sync({ force: true });
    assert(true, 'notification_logs table synced');
  } catch (err) {
    assert(false, `notification_logs sync failed: ${err.message}`);
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

  // --- Login helpers ---
  async function loginAs(email, password = 'password123') {
    const res = await fetchJson('POST', '/auth/login', { email, password });
    if (res.status === 200 && res.authTokenCookie) {
      return res.authTokenCookie;
    }
    return null;
  }

  // --- Authenticate ---
  adminCookie = await loginAs('admin@escuela.edu');
  assert(!!adminCookie, 'Admin login successful');

  // ===================================================================
  // SECTION 7.1 — POST /api/v1/notifications/trigger
  // ===================================================================
  console.log('\n--- 7.1 POST /api/v1/notifications/trigger ---');

  // 1. No auth header → 401
  try {
    const res = await fetchJson('POST', '/notifications/trigger');
    assert(res.status === 401, 'Trigger without auth returns 401');
  } catch (err) {
    assert(false, `Trigger no auth test failed: ${err.message}`);
  }

  // 2. Invalid bearer key → 401
  try {
    const res = await fetchJson('POST', '/notifications/trigger', null, {
      Authorization: 'Bearer wrong-key-xyz',
    });
    assert(res.status === 401, 'Trigger with invalid key returns 401');
  } catch (err) {
    assert(false, `Trigger invalid key test failed: ${err.message}`);
  }

  // 3. Valid bearer key → 200
  try {
    const res = await fetchJson('POST', '/notifications/trigger', null, {
      Authorization: 'Bearer test-service-key-123',
    });
    assert(res.status === 200, 'Trigger with valid key returns 200');
    assert(res.body.status === 'ok', 'Response body has status: ok');
    assert(res.body.scheduled === true, 'Response body has scheduled: true');
    assert(res.body.summary && typeof res.body.summary === 'object', 'Response body has summary object');
  } catch (err) {
    assert(false, `Trigger valid key test failed: ${err.message}`);
  }

  // ===================================================================
  // SECTION 7.2 — GET /api/v1/notifications
  // ===================================================================
  console.log('\n--- 7.2 GET /api/v1/notifications ---');

  // 4. GET notifications without auth → 401
  try {
    const res = await fetchJson('GET', '/notifications');
    assert(res.status === 401, 'GET notifications without auth returns 401');
  } catch (err) {
    assert(false, `GET notifications no auth test failed: ${err.message}`);
  }

  // 5. GET notifications with admin role → 200
  try {
    const res = await fetchJson('GET', '/notifications', null, {}, adminCookie);
    assert(res.status === 200, 'GET notifications with admin returns 200');
    assert(Array.isArray(res.body), 'Response body is an array');
  } catch (err) {
    assert(false, `GET notifications admin test failed: ${err.message}`);
  }

  // ===================================================================
  // Summary
  // ===================================================================
  console.log(`\n\u{1F4CA} Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);

  server.close();
  await sequelize.close();

  if (failed > 0) {
    console.log('\n\u{274C} Failed tests:');
    failures.forEach(f => console.log(`   - ${f}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
