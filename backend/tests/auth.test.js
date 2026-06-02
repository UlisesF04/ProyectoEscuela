// Set test environment so rate limiter uses higher limits
process.env.NODE_ENV = 'test';

// Load .env for local database connection
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const app = require('../app');
const http = require('http');
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

  console.log('\n📋 Auth Tests\n');

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

  function fetchJson(method, urlPath, body, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = `${baseUrl}${urlPath}`;
      const options = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
      };
      const req = http.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  // ─── Test 1: Login exitoso ───────────────────────────────────
  console.log('── Login Exitoso ──');

  try {
    const res = await fetchJson('POST', '/auth/login', {
      email: 'admin@escuela.edu',
      password: 'password123',
    });
    assert(res.status === 200, 'Login returns 200');
    assert(!!res.body.token, 'Response contains token');
    assert(res.body.user?.role === 'admin', 'User role is admin');
    assert(!!res.body.user?.first_name, 'Response includes first_name');
    assert(!!res.body.user?.last_name, 'Response includes last_name');
    assert(!res.body.user?.password_hash, 'Response does NOT include password_hash');
  } catch (err) {
    assert(false, `Login exitoso failed: ${err.message}`);
  }

  // ─── Test 2: Login para cada rol ─────────────────────────────
  console.log('\n── Login para cada Rol ──');

  const roles = [
    { email: 'admin@escuela.edu', role: 'admin' },
    { email: 'preceptor@escuela.edu', role: 'preceptor' },
    { email: 'docente@escuela.edu', role: 'docente' },
    { email: 'padre@escuela.edu', role: 'padre' },
  ];

  for (const { email, role } of roles) {
    try {
      const res = await fetchJson('POST', '/auth/login', {
        email,
        password: 'password123',
      });
      assert(res.status === 200 && res.body.user?.role === role, `Login exitoso para ${role}`);
    } catch (err) {
      assert(false, `Login para ${role} failed: ${err.message}`);
    }
  }

  // ─── Test 3: Credenciales inválidas ──────────────────────────
  console.log('\n── Credenciales Inválidas ──');

  try {
    // Email inexistente
    let res = await fetchJson('POST', '/auth/login', {
      email: 'noexiste@escuela.edu',
      password: 'password123',
    });
    assert(res.status === 401, 'Email inexistente returns 401');
    assert(res.body.message === 'Credenciales inválidas', 'Mensaje genérico por seguridad');

    // Password incorrecto
    res = await fetchJson('POST', '/auth/login', {
      email: 'admin@escuela.edu',
      password: 'wrongpassword',
    });
    assert(res.status === 401, 'Password incorrecto returns 401');
    assert(res.body.message === 'Credenciales inválidas', 'Mismo mensaje que email inexistente');
  } catch (err) {
    assert(false, `Credenciales inválidas failed: ${err.message}`);
  }

  // ─── Test 4: Cuenta desactivada ─────────────────────────────
  console.log('\n── Cuenta Desactivada ──');

  try {
    // Create a temporary inactive user for testing
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('test1234', 12);
    const inactiveUser = await User.create({
      email: 'inactive@test.com',
      password_hash: hash,
      role: 'docente',
      first_name: 'Inactive',
      last_name: 'User',
      is_active: false,
    });

    const res = await fetchJson('POST', '/auth/login', {
      email: 'inactive@test.com',
      password: 'test1234',
    });
    assert(res.status === 401, 'Inactive account returns 401');
    assert(res.body.message === 'Tu cuenta ha sido desactivada', 'Mensaje específico para cuenta desactivada');

    // Cleanup
    await inactiveUser.destroy();
  } catch (err) {
    assert(false, `Cuenta desactivada failed: ${err.message}`);
  }

  // ─── Test 5: Validación de campos ────────────────────────────
  console.log('\n── Validación de Campos ──');

  try {
    // Email vacío
    let res = await fetchJson('POST', '/auth/login', {
      email: '',
      password: 'password123',
    });
    assert(res.status === 400, 'Email vacío returns 400');
    assert(Array.isArray(res.body.errors), 'Response has errors array');

    // Password muy corto
    res = await fetchJson('POST', '/auth/login', {
      email: 'admin@escuela.edu',
      password: '123',
    });
    assert(res.status === 400, 'Password muy corto returns 400');
    assert(Array.isArray(res.body.errors), 'Response has errors array');

    // Email inválido
    res = await fetchJson('POST', '/auth/login', {
      email: 'invalido',
      password: 'password123',
    });
    assert(res.status === 400, 'Email inválido returns 400');
  } catch (err) {
    assert(false, `Validación de campos failed: ${err.message}`);
  }

  // ─── Test 6: Ruta protegida sin token ────────────────────────
  console.log('\n── Ruta Protegida sin Token ──');

  try {
    // GET /me sin token
    let res = await fetchJson('GET', '/auth/me');
    assert(res.status === 401, 'GET /me sin token returns 401');
    assert(res.body.message === 'Token no proporcionado', 'Mensaje: Token no proporcionado');

    // GET /me con token inválido
    res = await fetchJson('GET', '/auth/me', null, {
      Authorization: 'Bearer token-invalido',
    });
    assert(res.status === 401, 'GET /me con token inválido returns 401');
    assert(res.body.message === 'Token inválido o expirado', 'Mensaje: Token inválido o expirado');
  } catch (err) {
    assert(false, `Ruta protegida sin token failed: ${err.message}`);
  }

  // ─── Test 7: GET /me con token válido ────────────────────────
  console.log('\n── GET /me con Token Válido ──');

  try {
    // First login to get a valid token
    const loginRes = await fetchJson('POST', '/auth/login', {
      email: 'admin@escuela.edu',
      password: 'password123',
    });
    const token = loginRes.body.token;

    const res = await fetchJson('GET', '/auth/me', null, {
      Authorization: `Bearer ${token}`,
    });
    assert(res.status === 200, 'GET /me returns 200');
    assert(res.body.email === 'admin@escuela.edu', 'Returns correct email');
    assert(res.body.role === 'admin', 'Returns correct role');
    assert(!res.body.password_hash, 'Does NOT expose password_hash');
  } catch (err) {
    assert(false, `GET /me con token válido failed: ${err.message}`);
  }

  // ─── Test 8: Logout ─────────────────────────────────────────
  console.log('\n── Logout ──');

  try {
    const loginRes = await fetchJson('POST', '/auth/login', {
      email: 'admin@escuela.edu',
      password: 'password123',
    });
    const token = loginRes.body.token;

    const res = await fetchJson('POST', '/auth/logout', null, {
      Authorization: `Bearer ${token}`,
    });
    assert(res.status === 200, 'Logout returns 200');
    assert(!!res.body.message, 'Response has message');
  } catch (err) {
    assert(false, `Logout failed: ${err.message}`);
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
