// Set test environment so rate limiter uses higher limits
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';

// Load .env for local database connection
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('../app');
const http = require('http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize, User } = require('../models');

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

  console.log('\n📋 Auth Preventivos Tests\n');

  // ─── Setup: create test server ───────────────────────────────
  let server;
  let baseUrl;

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

  let adminCookie;

  // ─── Test 1: Password change — success ───────────────────────
  console.log('── Password Change — Success ──');

  try {
  // Login admin first
  const loginRes = await fetchJson('POST', '/auth/login', {
    email: 'admin@escuela.edu',
    password: 'password123',
  });
  adminCookie = loginRes.authTokenCookie;
  assert(!!adminCookie, 'Admin login successful, got cookie');

  // Change password
  const res = await fetchJson('PUT', '/auth/password', {
    current_password: 'password123',
    new_password: 'newpass12345',
  }, {}, adminCookie);
  assert(res.status === 200, 'Password change returns 200');
  assert(res.body.message === 'Contraseña actualizada exitosamente', 'Success message returned');

  // Verify new password works
  const loginRes2 = await fetchJson('POST', '/auth/login', {
    email: 'admin@escuela.edu',
    password: 'newpass12345',
  });
  assert(loginRes2.status === 200, 'Login with new password works');
  adminCookie = loginRes2.authTokenCookie;

  // Restore old password
  await fetchJson('PUT', '/auth/password', {
    current_password: 'newpass12345',
    new_password: 'password123',
  }, {}, adminCookie);
  } catch (err) {
    assert(false, `Password change success failed: ${err.message}`);
  }

  // ─── Test 2: Password change — wrong old password ────────────
  console.log('\n── Password Change — Wrong Old Password ──');

  try {
  const res = await fetchJson('PUT', '/auth/password', {
    current_password: 'wrongpassword',
    new_password: 'newpass12345',
  }, {}, adminCookie);
    assert(res.status === 401, 'Wrong old password returns 401');
    assert(res.body.message === 'Contraseña actual incorrecta', 'Error message is correct');
  } catch (err) {
    assert(false, `Wrong old password failed: ${err.message}`);
  }

  // ─── Test 3: Password change — weak new password ─────────────
  console.log('\n── Password Change — Weak New Password ──');

  try {
  const res = await fetchJson('PUT', '/auth/password', {
    current_password: 'password123',
    new_password: 'short',
  }, {}, adminCookie);
    assert(res.status === 400, 'Weak password returns 400');
    assert(Array.isArray(res.body.errors), 'Validation errors array returned');
  } catch (err) {
    assert(false, `Weak password failed: ${err.message}`);
  }

  // ─── Test 4: Account lockout ───────────────────────────────
  console.log('\n── Account Lockout ──');

  try {
    // Create temporary user for lockout test
    const hash = await bcrypt.hash('testpassword', 12);
    const testUser = await User.create({
      email: 'lockout-test@test.com',
      password_hash: hash,
      role: 'docente',
      first_name: 'Lockout',
      last_name: 'Test',
      is_active: true,
    });

    let userModel = await User.scope('withPassword').findByPk(testUser.id);
    assert(userModel.failed_attempts === 0, 'Initial failed_attempts is 0');
    assert(userModel.locked_until === null, 'Initial locked_until is null');

    // 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await fetchJson('POST', '/auth/login', {
        email: 'lockout-test@test.com',
        password: 'wrongpassword',
      });
    }

    // Verify lockout
    const res = await fetchJson('POST', '/auth/login', {
      email: 'lockout-test@test.com',
      password: 'wrongpassword',
    });
    assert(res.status === 423, 'Locked account returns 423');
    assert(res.body.message.includes('Cuenta bloqueada'), 'Lockout message returned');

    // Cannot log in even with correct password
    const resCorrect = await fetchJson('POST', '/auth/login', {
      email: 'lockout-test@test.com',
      password: 'testpassword',
    });
    assert(resCorrect.status === 423, 'Correct password also blocked during lockout');

      // Reset lockout for cleanup — re-fetch to get fresh instance
      const freshUser = await User.scope('withPassword').findByPk(testUser.id);
      await freshUser.update({ failed_attempts: 0, locked_until: null });
      userModel = await User.scope('withPassword').findByPk(testUser.id);
      assert(userModel.failed_attempts === 0, 'After reset, failed_attempts is 0');
      assert(userModel.locked_until === null, 'After reset, locked_until is null');

    // Cleanup
    await testUser.destroy();
  } catch (err) {
    assert(false, `Account lockout failed: ${err.message}`);
  }

  // ─── Test 5: User creation — preceptor cannot create docente ──
  console.log('\n── User Creation — Preceptor Restriction ──');

  try {
  // Login as preceptor
  const loginRes = await fetchJson('POST', '/auth/login', {
    email: 'preceptor@escuela.edu',
    password: 'password123',
  });
  const preceptorCookie = loginRes.authTokenCookie;
  assert(!!preceptorCookie, 'Preceptor login successful');

  // Try to create docente — should fail
  const res = await fetchJson('POST', '/users', {
    email: 'new-docente@test.com',
    password: 'password123',
    first_name: 'New',
    last_name: 'Docente',
    role: 'docente',
  }, {}, preceptorCookie);
  assert(res.status === 403, 'Preceptor creating docente returns 403');
  assert(res.body.message === 'Preceptor solo puede crear cuentas de padre', 'Error message is correct');

  // Preceptor can create padre
  const resPadre = await fetchJson('POST', '/users', {
    email: 'new-padre-preceptor@test.com',
    password: 'password123',
    first_name: 'New',
    last_name: 'Padre',
    role: 'padre',
  }, {}, preceptorCookie);
    assert(resPadre.status === 201, 'Preceptor creating padre returns 201');

    // Cleanup
    await User.destroy({ where: { email: 'new-padre-preceptor@test.com' } });
  } catch (err) {
    assert(false, `Preceptor restriction failed: ${err.message}`);
  }

  // ─── Cleanup ─────────────────────────────────────────────────
  server.close();

  // ─── Summary ─────────────────────────────────────────────────
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
  await sequelize.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
