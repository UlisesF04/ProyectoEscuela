// Set test environment so rate limiter uses higher limits
process.env.NODE_ENV = 'test';

// Load .env for local database connection
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('../app');
const http = require('http');
const { sequelize, User, Student, Course, Subject, TeacherSubject, ParentStudent, Grade } = require('../models');
const AppError = require('../utils/AppError');
const studentsService = require('../modules/students/students.service');

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

  function assertThrows(fn, expectedMessage, name) {
    try {
      fn();
    } catch (err) {
      if (err instanceof AppError && err.message === expectedMessage) {
        assert(true, name);
        return;
      }
      assert(false, `${name} (got: ${err.message})`);
      return;
    }
    assert(false, `${name} (no se lanzó la excepción esperada)`);
  }

  // Para asincrónicas, envolvemos en una IIFE
  async function assertAsyncThrows(fn, expectedMessage, name) {
    try {
      await fn();
    } catch (err) {
      if (err instanceof AppError && err.message === expectedMessage) {
        assert(true, name);
        return;
      }
      assert(false, `${name} (got: ${err.message})`);
      return;
    }
    assert(false, `${name} (no se lanzó la excepción esperada)`);
  }

  console.log('\n📋 C-07 Grades Evolution Tests\n');

  // ─── Setup: DB connection ───────────────────────────────
  try {
    await sequelize.authenticate();
    assert(true, 'Database connection successful');
  } catch (err) {
    assert(false, `Database connection failed: ${err.message}`);
    console.log('\n❌ Cannot proceed without database. Ensure PostgreSQL is running.');
    process.exit(1);
  }

  // ─── Test 1: Padre ve evolución de su hijo vinculado ──────
  console.log('\n── Padre: hijo vinculado (RN-03) ──');
  try {
    const padre = await User.findOne({ where: { email: 'padre@escuela.edu' } });
    const student = await Student.findOne({ where: { dni: '40123456' } });

    const data = await studentsService.getEvolutionForStudent(student.id, {
      id: padre.id,
      role: 'padre',
    });

    assert(data.student.id === student.id, 'Devuelve info del estudiante correcto');
    assert(Array.isArray(data.subjects), 'Devuelve array de subjects');
    assert(data.subjects.length === 2, `Devuelve 2 materias (esperado 2, obtuvo ${data.subjects.length})`);

    const math = data.subjects.find((s) => s.name === 'Matemática');
    const lengua = data.subjects.find((s) => s.name === 'Lengua');
    assert(!!math, 'Incluye Matemática');
    assert(!!lengua, 'Incluye Lengua');
    assert(math.grades.length === 3, `Matemática tiene 3 notas (esperado 3, obtuvo ${math.grades.length})`);
    assert(lengua.grades.length === 3, `Lengua tiene 3 notas (esperado 3, obtuvo ${lengua.grades.length})`);

    // Verificar promedio de matemática: (8.5 + 7.0 + 9.0) / 3 = 8.17 (redondeado a 2 decimales)
    assert(math.average === 8.17, `Promedio Matemática = 8.17 (obtenido: ${math.average})`);
    // Lengua: (6.5 + 8.0 + 7.5) / 3 = 7.33
    assert(lengua.average === 7.33, `Promedio Lengua = 7.33 (obtenido: ${lengua.average})`);

    // Verificar orden cronológico ASC
    const mathDates = math.grades.map((g) => g.date);
    const sortedDates = [...mathDates].sort();
    assert(JSON.stringify(mathDates) === JSON.stringify(sortedDates), 'Notas de Matemática están en orden cronológico ASC');
  } catch (err) {
    assert(false, `Padre OK failed: ${err.message}`);
  }

  // ─── Test 2: Padre sin vínculo es bloqueado (403) ──────
  console.log('\n── Padre: sin vínculo (403, RN-03) ──');
  try {
    // Crear un padre huérfano (no vinculado a nadie)
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('test1234', 12);
    const orphanPadre = await User.create({
      email: `orphan-padre-${Date.now()}@test.com`,
      password_hash: hash,
      role: 'padre',
      first_name: 'Orphan',
      last_name: 'Padre',
      is_active: true,
    });

    const student = await Student.findOne({ where: { dni: '40123456' } });
    await assertAsyncThrows(
      () => studentsService.getEvolutionForStudent(student.id, {
        id: orphanPadre.id,
        role: 'padre',
      }),
      'No tienes permiso para ver la evolución de este estudiante',
      'Padre sin vínculo recibe 403 con mensaje específico'
    );

    await orphanPadre.destroy();
  } catch (err) {
    assert(false, `Padre sin vínculo failed: ${err.message}`);
  }

  // ─── Test 3: Docente ve solo SUS materias (RN-04) ──────
  console.log('\n── Docente: solo materias asignadas (RN-04) ──');
  try {
    const docente = await User.findOne({ where: { email: 'docente@escuela.edu' } });
    const student = await Student.findOne({ where: { dni: '40123456' } });

    // docente@escuela.edu está asignado a Matemática (id=1) y Lengua (id=2)
    // Por lo tanto, ve ambas materias
    const data = await studentsService.getEvolutionForStudent(student.id, {
      id: docente.id,
      role: 'docente',
    });

    assert(data.subjects.length === 2, `Docente con 2 asignaturas ve 2 materias (obtenido: ${data.subjects.length})`);
  } catch (err) {
    assert(false, `Docente con 2 materias failed: ${err.message}`);
  }

  // ─── Test 4: Docente con una sola materia ve solo esa ──────
  console.log('\n── Docente: filtro por materia específica ──');
  try {
    const docente = await User.findOne({ where: { email: 'docente@escuela.edu' } });
    const student = await Student.findOne({ where: { dni: '40123456' } });

    // Eliminar asignación a Lengua temporalmente
    const assignment = await TeacherSubject.findOne({
      where: { user_id: docente.id, subject_id: 2 },
    });
    const backup = { ...assignment.dataValues };
    await assignment.destroy();

    try {
      const data = await studentsService.getEvolutionForStudent(student.id, {
        id: docente.id,
        role: 'docente',
      });

      assert(data.subjects.length === 1, `Docente con 1 asignatura ve 1 materia (obtenido: ${data.subjects.length})`);
      assert(data.subjects[0].name === 'Matemática', 'Solo ve Matemática');
    } finally {
      // Restaurar la asignación
      await TeacherSubject.create(backup);
    }
  } catch (err) {
    assert(false, `Docente con 1 materia failed: ${err.message}`);
  }

  // ─── Test 5: Docente sin asignaciones → 403 ──────
  console.log('\n── Docente: sin asignaciones (403) ──');
  try {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('test1234', 12);
    const docenteSinMaterias = await User.create({
      email: `lonely-docente-${Date.now()}@test.com`,
      password_hash: hash,
      role: 'docente',
      first_name: 'Lonely',
      last_name: 'Docente',
      is_active: true,
    });

    const student = await Student.findOne({ where: { dni: '40123456' } });
    await assertAsyncThrows(
      () => studentsService.getEvolutionForStudent(student.id, {
        id: docenteSinMaterias.id,
        role: 'docente',
      }),
      'No tenés materias asignadas. No podés ver la evolución de calificaciones.',
      'Docente sin materias recibe 403 con mensaje específico'
    );

    await docenteSinMaterias.destroy();
  } catch (err) {
    assert(false, `Docente sin materias failed: ${err.message}`);
  }

  // ─── Test 6: Admin ve TODAS las materias ──────
  console.log('\n── Admin: sin restricciones ──');
  try {
    const admin = await User.findOne({ where: { email: 'admin@escuela.edu' } });
    const student = await Student.findOne({ where: { dni: '40123456' } });

    const data = await studentsService.getEvolutionForStudent(student.id, {
      id: admin.id,
      role: 'admin',
    });

    assert(data.subjects.length === 2, `Admin ve las 2 materias (obtenido: ${data.subjects.length})`);
  } catch (err) {
    assert(false, `Admin failed: ${err.message}`);
  }

  // ─── Test 7: Estudiante sin calificaciones → array vacío ──────
  console.log('\n── Estudiante sin calificaciones ──');
  try {
    // Crear un estudiante nuevo sin notas
    const course = await Course.findOne();
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('test1234', 12);

    // Necesitamos un padre temporal para crear el estudiante sin error de FK
    // Como students no tiene FK de padre, no hace falta
    const newStudent = await Student.create({
      first_name: 'Empty',
      last_name: 'Grades',
      dni: `empty-${Date.now()}`,
      course_id: course.id,
      is_active: true,
    });

    const admin = await User.findOne({ where: { email: 'admin@escuela.edu' } });
    const data = await studentsService.getEvolutionForStudent(newStudent.id, {
      id: admin.id,
      role: 'admin',
    });

    assert(data.student.id === newStudent.id, 'Devuelve info del estudiante sin notas');
    assert(data.subjects.length === 0, `Devuelve 0 materias para estudiante sin notas (obtenido: ${data.subjects.length})`);

    await newStudent.destroy();
  } catch (err) {
    assert(false, `Estudiante sin notas failed: ${err.message}`);
  }

  // ─── Test 8: Estudiante inexistente → 404 ──────
  console.log('\n── Estudiante inexistente (404) ──');
  try {
    const admin = await User.findOne({ where: { email: 'admin@escuela.edu' } });
    await assertAsyncThrows(
      () => studentsService.getEvolutionForStudent(99999, {
        id: admin.id,
        role: 'admin',
      }),
      'Estudiante no encontrado',
      'ID de estudiante inexistente devuelve 404'
    );
  } catch (err) {
    assert(false, `Estudiante inexistente failed: ${err.message}`);
  }

  // ─── Test 9: Endpoint HTTP — padre OK ──────
  console.log('\n── HTTP: padre ve a su hijo (200) ──');
  let server;
  let baseUrl;
  try {
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

    // Login como padre
    const loginRes = await fetchJson('POST', '/auth/login', {
      email: 'padre@escuela.edu',
      password: 'password123',
    });
    const padreToken = loginRes.body.token;
    assert(!!padreToken, 'Padre login OK');

    const student = await Student.findOne({ where: { dni: '40123456' } });

    // GET /students/:id/evolution como padre
    const res = await fetchJson('GET', `/students/${student.id}/evolution`, null, {
      Authorization: `Bearer ${padreToken}`,
    });

    assert(res.status === 200, `GET evolution como padre devuelve 200 (obtenido: ${res.status})`);
    assert(!!res.body.data, 'Response tiene data');
    assert(res.body.data.student.id === student.id, 'Response.student.id correcto');
    assert(Array.isArray(res.body.data.subjects), 'Response.subjects es array');
    assert(res.body.data.subjects.length === 2, '2 materias en response');
  } catch (err) {
    assert(false, `HTTP padre OK failed: ${err.message}`);
  }

  // ─── Test 10: HTTP — preceptor NO tiene acceso (403) ──────
  console.log('\n── HTTP: preceptor sin acceso (403) ──');
  try {
    function fetchJson2(method, urlPath, body, headers = {}) {
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

    const loginRes = await fetchJson2('POST', '/auth/login', {
      email: 'preceptor@escuela.edu',
      password: 'password123',
    });
    const preceptorToken = loginRes.body.token;
    const student = await Student.findOne({ where: { dni: '40123456' } });

    const res = await fetchJson2('GET', `/students/${student.id}/evolution`, null, {
      Authorization: `Bearer ${preceptorToken}`,
    });

    assert(res.status === 403, `GET evolution como preceptor devuelve 403 (obtenido: ${res.status})`);
  } catch (err) {
    assert(false, `HTTP preceptor failed: ${err.message}`);
  }

  // ─── Test 11: HTTP — sin token (401) ──────
  console.log('\n── HTTP: sin token (401) ──');
  try {
    function fetchJson3(method, urlPath, body, headers = {}) {
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

    const student = await Student.findOne({ where: { dni: '40123456' } });
    const res = await fetchJson3('GET', `/students/${student.id}/evolution`);

    assert(res.status === 401, `GET evolution sin token devuelve 401 (obtenido: ${res.status})`);
  } catch (err) {
    assert(false, `HTTP sin token failed: ${err.message}`);
  }

  // ─── Cleanup ─────────────────────────────────────────────
  if (server) server.close();

  // ─── Summary ─────────────────────────────────────────────
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failures.length > 0) {
    console.log('❌ Failed tests:');
    failures.forEach((f) => console.log(`   - ${f}`));
  }
  await sequelize.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
