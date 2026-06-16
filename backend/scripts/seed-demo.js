'use strict';

/**
 * seed-demo.js
 * ─────────────────────────────────────────────────────────────
 * Limpia y repuebla la base de datos con datos realistas para
 * demostrar todas las funcionalidades del sistema.
 *
 * USO:
 *   cd backend
 *   node scripts/seed-demo.js
 *
 * La contraseña se obtiene de DEMO_PASSWORD (env) o usa
 * 'password123' por defecto.
 * ─────────────────────────────────────────────────────────────
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { sequelize } = require('../models');
const bcrypt = require('bcrypt');

// ─── Helpers ──────────────────────────────────────────────────

function fmtDate(y, m, d) {
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

function randomGrade(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSchoolDays() {
  const days = [];
  const start = new Date(2026, 2, 2);  // March 2, 2026 (Monday)
  const end = new Date(2026, 5, 10);   // June 10, 2026 (Wednesday)
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

// ─── Data Definitions ─────────────────────────────────────────

const COURSES = [
  { id: 1, name: '1° A', year: 2026, division: 'A', level: 'Secundaria' },
  { id: 2, name: '2° B', year: 2026, division: 'B', level: 'Secundaria' },
  { id: 3, name: '3° C', year: 2026, division: 'C', level: 'Secundaria' },
];

const SUBJECT_NAMES = [
  'Matemática', 'Lengua y Literatura', 'Historia', 'Ciencias Naturales', 'Inglés',
];

// 15 subjects: 5 per course
const SUBJECTS = [];
for (let c = 1; c <= 3; c++) {
  for (let s = 0; s < 5; s++) {
    SUBJECTS.push({
      id: (c - 1) * 5 + s + 1,
      name: SUBJECT_NAMES[s],
      course_id: c,
    });
  }
}

// 11 students per course
const STUDENTS_DATA = [
  // 1° A (course 1) — students 1-11
  { id: 1,  first_name: 'Thiago',     last_name: 'García',     dni: '45123456', birth_date: '2015-03-10', course_id: 1 },
  { id: 2,  first_name: 'Valentina',  last_name: 'López',      dni: '45123457', birth_date: '2015-07-22', course_id: 1 },
  { id: 3,  first_name: 'Benjamín',   last_name: 'Martínez',   dni: '45123458', birth_date: '2014-11-05', course_id: 1 },
  { id: 4,  first_name: 'Isabella',   last_name: 'Rodríguez',  dni: '45123459', birth_date: '2015-01-18', course_id: 1 },
  { id: 5,  first_name: 'Santino',    last_name: 'González',   dni: '45123460', birth_date: '2014-09-30', course_id: 1 },
  { id: 6,  first_name: 'Camila',     last_name: 'Pérez',      dni: '45123461', birth_date: '2015-05-14', course_id: 1 },
  { id: 7,  first_name: 'Mateo',      last_name: 'Fernández',  dni: '45123462', birth_date: '2014-12-28', course_id: 1 },
  { id: 8,  first_name: 'Sofía',      last_name: 'Sánchez',    dni: '45123463', birth_date: '2015-08-03', course_id: 1 },
  { id: 9,  first_name: 'Joaquín',    last_name: 'Romero',     dni: '45123464', birth_date: '2015-02-19', course_id: 1 },
  { id: 10, first_name: 'Martina',    last_name: 'Díaz',       dni: '45123465', birth_date: '2014-10-11', course_id: 1 },
  { id: 11, first_name: 'Bautista',   last_name: 'Torres',     dni: '45123466', birth_date: '2015-06-25', course_id: 1 },
  // 2° B (course 2) — students 12-22
  { id: 12, first_name: 'Catalina',   last_name: 'Álvarez',    dni: '45234567', birth_date: '2014-04-15', course_id: 2 },
  { id: 13, first_name: 'Francisco',  last_name: 'Ruiz',       dni: '45234568', birth_date: '2014-08-20', course_id: 2 },
  { id: 14, first_name: 'Emilia',     last_name: 'Silva',      dni: '45234569', birth_date: '2013-12-01', course_id: 2 },
  { id: 15, first_name: 'Sebastián',  last_name: 'Castro',     dni: '45234570', birth_date: '2014-02-28', course_id: 2 },
  { id: 16, first_name: 'Valentino',  last_name: 'Ortiz',      dni: '45234571', birth_date: '2013-07-14', course_id: 2 },
  { id: 17, first_name: 'Juana',      last_name: 'Medina',     dni: '45234572', birth_date: '2014-05-09', course_id: 2 },
  { id: 18, first_name: 'Nicolás',    last_name: 'Herrera',    dni: '45234573', birth_date: '2013-11-22', course_id: 2 },
  { id: 19, first_name: 'Renata',     last_name: 'Aguilar',    dni: '45234574', birth_date: '2014-01-30', course_id: 2 },
  { id: 20, first_name: 'Felipe',     last_name: 'Vargas',     dni: '45234575', birth_date: '2013-09-17', course_id: 2 },
  { id: 21, first_name: 'Antonella',  last_name: 'Rivas',      dni: '45234576', birth_date: '2014-06-04', course_id: 2 },
  { id: 22, first_name: 'Tomás',      last_name: 'Guerrero',   dni: '45234577', birth_date: '2013-10-28', course_id: 2 },
  // 3° C (course 3) — students 23-33
  { id: 23, first_name: 'Isabella',   last_name: 'Morales',    dni: '45345678', birth_date: '2013-03-12', course_id: 3 },
  { id: 24, first_name: 'Santiago',   last_name: 'Campos',     dni: '45345679', birth_date: '2012-08-25', course_id: 3 },
  { id: 25, first_name: 'Luciana',    last_name: 'Vega',       dni: '45345680', birth_date: '2013-01-07', course_id: 3 },
  { id: 26, first_name: 'Maximiliano',last_name: 'Ríos',       dni: '45345681', birth_date: '2012-06-19', course_id: 3 },
  { id: 27, first_name: 'Valentina',  last_name: 'Paredes',    dni: '45345682', birth_date: '2013-05-03', course_id: 3 },
  { id: 28, first_name: 'Lorenzo',    last_name: 'Acosta',     dni: '45345683', birth_date: '2012-11-15', course_id: 3 },
  { id: 29, first_name: 'Fátima',     last_name: 'Navarro',    dni: '45345684', birth_date: '2013-09-29', course_id: 3 },
  { id: 30, first_name: 'Bruno',      last_name: 'Sosa',       dni: '45345685', birth_date: '2012-12-14', course_id: 3 },
  { id: 31, first_name: 'Lourdes',    last_name: 'Correa',     dni: '45345686', birth_date: '2013-07-21', course_id: 3 },
  { id: 32, first_name: 'Ignacio',    last_name: 'Benítez',    dni: '45345687', birth_date: '2012-04-08', course_id: 3 },
  { id: 33, first_name: 'Pilar',      last_name: 'Mendoza',    dni: '45345688', birth_date: '2013-02-16', course_id: 3 },
];

// Parents — one per student; user_id = student_id + 7 (users 8..40)
const PARENTS_DATA = [
  { first: 'Ricardo',   last: 'García',    email: 'padre.garcia@escuela.edu' },
  { first: 'Silvina',   last: 'López',     email: 'padre.lopez@escuela.edu' },
  { first: 'Gabriel',   last: 'Martínez',  email: 'padre.martinez@escuela.edu' },
  { first: 'Carolina',  last: 'Rodríguez', email: 'padre.rodriguez@escuela.edu' },
  { first: 'Marcelo',   last: 'González',  email: 'padre.gonzalez@escuela.edu' },
  { first: 'Verónica',  last: 'Pérez',     email: 'padre.perez@escuela.edu' },
  { first: 'Alejandro', last: 'Fernández', email: 'padre.fernandez@escuela.edu' },
  { first: 'Romina',    last: 'Sánchez',   email: 'padre.sanchez@escuela.edu' },
  { first: 'Diego',     last: 'Romero',    email: 'padre.romero@escuela.edu' },
  { first: 'Florencia', last: 'Díaz',      email: 'padre.diaz@escuela.edu' },
  { first: 'Héctor',    last: 'Torres',    email: 'padre.torres@escuela.edu' },
  { first: 'Andrea',    last: 'Álvarez',   email: 'padre.alvarez@escuela.edu' },
  { first: 'Pablo',     last: 'Ruiz',      email: 'padre.ruiz@escuela.edu' },
  { first: 'Mariana',   last: 'Silva',     email: 'padre.silva@escuela.edu' },
  { first: 'Esteban',   last: 'Castro',    email: 'padre.castro@escuela.edu' },
  { first: 'Natalia',   last: 'Ortiz',     email: 'padre.ortiz@escuela.edu' },
  { first: 'Fabián',    last: 'Medina',    email: 'padre.medina@escuela.edu' },
  { first: 'Lorena',    last: 'Herrera',   email: 'padre.herrera@escuela.edu' },
  { first: 'Gustavo',   last: 'Aguilar',   email: 'padre.aguilar@escuela.edu' },
  { first: 'Cristina',  last: 'Vargas',    email: 'padre.vargas@escuela.edu' },
  { first: 'Ramiro',    last: 'Rivas',     email: 'padre.rivas@escuela.edu' },
  { first: 'Rocío',     last: 'Guerrero',  email: 'padre.guerrero@escuela.edu' },
  { first: 'Mauricio',  last: 'Morales',   email: 'padre.morales@escuela.edu' },
  { first: 'Daniela',   last: 'Campos',    email: 'padre.campos@escuela.edu' },
  { first: 'Javier',    last: 'Vega',      email: 'padre.vega@escuela.edu' },
  { first: 'Gabriela',  last: 'Ríos',      email: 'padre.rios@escuela.edu' },
  { first: 'Leonardo',  last: 'Paredes',   email: 'padre.paredes@escuela.edu' },
  { first: 'Vanina',    last: 'Acosta',    email: 'padre.acosta@escuela.edu' },
  { first: 'Claudio',   last: 'Navarro',   email: 'padre.navarro@escuela.edu' },
  { first: 'Eliana',    last: 'Sosa',      email: 'padre.sosa@escuela.edu' },
  { first: 'Raúl',      last: 'Correa',    email: 'padre.correa@escuela.edu' },
  { first: 'Belén',     last: 'Benítez',   email: 'padre.benitez@escuela.edu' },
  { first: 'Sergio',    last: 'Mendoza',   email: 'padre.mendoza@escuela.edu' },
];

// ─── Docentes ──────────────────────────────────────────────────
// 5 docentes — cada uno da su materia en los 3 cursos
const DOCENTES = [
  { id: 3,  first_name: 'María',    last_name: 'López',     email: 'docente.matematica@escuela.edu', subjects: [1, 6, 11] },   // Matemática
  { id: 4,  first_name: 'Juan',     last_name: 'Martínez',  email: 'docente.lengua@escuela.edu',      subjects: [2, 7, 12] },   // Lengua
  { id: 5,  first_name: 'Ana',      last_name: 'García',    email: 'docente.historia@escuela.edu',    subjects: [3, 8, 13] },   // Historia
  { id: 6,  first_name: 'Pedro',    last_name: 'Fernández', email: 'docente.csnaturales@escuela.edu', subjects: [4, 9, 14] },   // Cs Naturales
  { id: 7,  first_name: 'Laura',    last_name: 'Díaz',      email: 'docente.ingles@escuela.edu',     subjects: [5, 10, 15] },  // Inglés
];

// ─── Attendance Profiles ────────────────────────────────────────
// Which students have attendance problems
const PROBLEMATIC_STUDENTS = {
  1:  { label: 'faltas justificadas (Thiago)', absentPct: 0.20, unjustifiedPct: 0.30 },  // 70% justified
  2:  { label: 'faltas justificadas (Valentina)', absentPct: 0.18, unjustifiedPct: 0.35 },  // 65% justified
  5:  { label: 'muchas faltas injustificadas', absentPct: 0.35, unjustifiedPct: 0.90 },
  16: { label: 'muchas faltas injustificadas', absentPct: 0.30, unjustifiedPct: 0.85 },
  30: { label: 'faltas + bajo rendimiento',    absentPct: 0.25, unjustifiedPct: 0.75 },
  4:  { label: 'faltas justificadas',          absentPct: 0.25, unjustifiedPct: 0.15 },  // 85% justified
  9:  { label: 'asistencia irregular + tardes',absentPct: 0.10, unjustifiedPct: 0.50, latePct: 0.25 },
};

// ─── Justification Notes ─────────────────────────────────────────
const JUSTIFICATION_NOTES = [
  'Falta por consulta médica — Dr. Rodríguez (Clínica San José)',
  'Certificado médico adjunto — Infección respiratoria aguda.',
  'Inasistencia por enfermedad — Certificado del pediatra.',
  'Familiar directo hospitalizado. Se solicita justificación.',
  'Control odontológico de urgencia. Se adjunta certificado.',
  'Trámite de documento nacional de identidad.',
  'Viaje familiar programado. Se presentó aviso previo.',
  'Falta por razones de salud — Certificado médico.',
  'Estudios médicos programados (análisis de laboratorio).',
  'Dolor abdominal agudo — Asistencia a guardia médica.',
];

// ─── Grade Profiles ────────────────────────────────────────────
// Student-subject overrides for low grades
// Format: { studentId_subjectId: [minGrade, maxGrade] }
const LOW_GRADES = {
  '5_1':  [2.0, 5.0],   // Santino González — Matemática
  '5_2':  [3.0, 5.5],   // Santino González — Lengua
  '5_4':  [2.5, 4.5],   // Santino González — Cs Naturales
  '3_2':  [2.0, 4.5],   // Benjamín Martínez — Lengua
  '3_1':  [3.0, 5.0],   // Benjamín Martínez — Matemática
  '13_4': [2.0, 4.5],   // Francisco Ruiz — Cs Naturales
  '13_3': [3.0, 5.0],   // Francisco Ruiz — Historia
  '30_1': [1.5, 4.0],   // Bruno Sosa — Matemática
  '30_2': [2.0, 4.5],   // Bruno Sosa — Lengua
  '30_3': [2.5, 4.0],   // Bruno Sosa — Historia
  '30_4': [2.0, 4.0],   // Bruno Sosa — Cs Naturales
  '30_5': [2.5, 4.5],   // Bruno Sosa — Inglés
};

// ─── Main Seed Function ────────────────────────────────────────

async function seed() {
  const startTime = Date.now();
  const demoPassword = process.env.DEMO_PASSWORD || 'password123';
  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const schoolDays = getSchoolDays();
  const now = new Date();

  console.log('🔨 Seed-Demo iniciado...\n');
  console.log(`   Contraseña: ${demoPassword}`);
  console.log(`   Días lectivos: ${schoolDays.length}`);
  console.log(`   Alumnos: ${STUDENTS_DATA.length}`);
  console.log(`   Cursos: ${COURSES.length}`);
  console.log(`   Materias: ${SUBJECTS.length}\n`);

  // ── 1. TRUNCATE ──────────────────────────────────────────────
  console.log('⏳ Eliminando datos existentes...');
  await sequelize.query(`
    TRUNCATE TABLE
      messages, chats, notification_logs, grades, attendances,
      licences, parent_student, teacher_subject, students,
      subjects, courses, settings, users
    RESTART IDENTITY CASCADE;
  `);
  console.log('   ✓ Base de datos limpia\n');

  // ── 2. USERS ─────────────────────────────────────────────────
  console.log('⏳ Creando usuarios...');

  // Admin
  await sequelize.query(
    `INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone_whatsapp, is_active, created_at, updated_at)
     VALUES (1, 'admin@escuela.edu', :pwd, 'admin', 'Admin', 'Sistema', null, true, :n, :n)`,
    { replacements: { pwd: passwordHash, n: now } }
  );

  // Preceptor
  await sequelize.query(
    `INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone_whatsapp, is_active, created_at, updated_at)
     VALUES (2, 'preceptor@escuela.edu', :pwd, 'preceptor', 'Carlos', 'Rodríguez', '+54111234567', true, :n, :n)`,
    { replacements: { pwd: passwordHash, n: now } }
  );

  // Docentes
  for (const d of DOCENTES) {
    await sequelize.query(
      `INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone_whatsapp, is_active, created_at, updated_at)
       VALUES (:id, :email, :pwd, 'docente', :fn, :ln, :phone, true, :n, :n)`,
      { replacements: { id: d.id, email: d.email, pwd: passwordHash, fn: d.first_name, ln: d.last_name, phone: '+54117654321', n: now } }
    );
  }

  // Padres (users 8..40)
  let parentIdx = 0;
  for (const p of PARENTS_DATA) {
    const uid = 8 + parentIdx;
    await sequelize.query(
      `INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone_whatsapp, is_active, created_at, updated_at)
       VALUES (:id, :email, :pwd, 'padre', :fn, :ln, :phone, true, :n, :n)`,
      { replacements: { id: uid, email: p.email, pwd: passwordHash, fn: p.first, ln: p.last, phone: '+54119876543', n: now } }
    );
    parentIdx++;
  }

  console.log(`   ✓ 40 usuarios creados (1 admin, 1 preceptor, 5 docentes, 33 padres)\n`);

  // ── 3. COURSES ───────────────────────────────────────────────
  console.log('⏳ Creando cursos...');
  for (const c of COURSES) {
    await sequelize.query(
      `INSERT INTO courses (id, name, year, division, level, created_at, updated_at)
       VALUES (:id, :name, :year, :div, :level, :n, :n)`,
      { replacements: { id: c.id, name: c.name, year: c.year, div: c.division, level: c.level, n: now } }
    );
  }
  console.log('   ✓ 3 cursos creados\n');

  // ── 4. SUBJECTS ──────────────────────────────────────────────
  console.log('⏳ Creando materias...');
  for (const s of SUBJECTS) {
    await sequelize.query(
      `INSERT INTO subjects (id, name, course_id, created_at, updated_at)
       VALUES (:id, :name, :cid, :n, :n)`,
      { replacements: { id: s.id, name: s.name, cid: s.course_id, n: now } }
    );
  }
  console.log('   ✓ 15 materias creadas\n');

  // ── 5. STUDENTS ──────────────────────────────────────────────
  console.log('⏳ Creando alumnos...');
  for (const s of STUDENTS_DATA) {
    await sequelize.query(
      `INSERT INTO students (id, first_name, last_name, dni, birth_date, course_id, is_active, created_at, updated_at)
       VALUES (:id, :fn, :ln, :dni, :bd, :cid, true, :n, :n)`,
      { replacements: { id: s.id, fn: s.first_name, ln: s.last_name, dni: s.dni, bd: s.birth_date, cid: s.course_id, n: now } }
    );
  }
  console.log('   ✓ 33 alumnos creados\n');

  // ── 6. TEACHER_SUBJECT ──────────────────────────────────────
  console.log('⏳ Asignando docentes a materias...');
  let tsId = 0;
  for (const d of DOCENTES) {
    for (const subId of d.subjects) {
      tsId++;
      await sequelize.query(
        `INSERT INTO teacher_subject (id, user_id, subject_id, created_at, updated_at)
         VALUES (:id, :uid, :sid, :n, :n)`,
        { replacements: { id: tsId, uid: d.id, sid: subId, n: now } }
      );
    }
  }
  console.log('   ✓ 15 asignaciones docente-materia\n');

  // ── 7. PARENT_STUDENT ────────────────────────────────────────
  console.log('⏳ Vinculando padres con alumnos...');
  for (let i = 0; i < STUDENTS_DATA.length; i++) {
    const parentUserId = 8 + i;
    const studentId = STUDENTS_DATA[i].id;
    await sequelize.query(
      `INSERT INTO parent_student (user_id, student_id, relationship, created_at, updated_at)
       VALUES (:uid, :sid, :rel, :n, :n)`,
      { replacements: { uid: parentUserId, sid: studentId, rel: 'padre/madre', n: now } }
    );
  }
  console.log('   ✓ 33 vínculos padre-alumno\n');

  // ── 8. ATTENDANCES ───────────────────────────────────────────
  console.log('⏳ Generando asistencias...');
  const statuses = ['presente', 'ausente', 'tarde'];
  let attCount = 0;
  let attInserts = [];

  for (const student of STUDENTS_DATA) {
    const profile = PROBLEMATIC_STUDENTS[student.id] || {};
    const absentPct = profile.absentPct || 0.05;
    const latePct = profile.latePct || 0.03;
    const unjustifiedPct = profile.unjustifiedPct !== undefined ? profile.unjustifiedPct : 0.50;

    for (const day of schoolDays) {
      const dateStr = fmtDate(day.getFullYear(), day.getMonth() + 1, day.getDate());
      const rand = Math.random();
      let status;
      if (rand < absentPct) {
        status = 'ausente';
      } else if (rand < absentPct + latePct) {
        status = 'tarde';
      } else {
        status = 'presente';
      }

      const isJustified = status === 'ausente' && Math.random() > unjustifiedPct;
      let justification = null;
      if (isJustified) {
        justification = pickRandom(JUSTIFICATION_NOTES);
        // Students with first_name know their gender for "justificado por su padre/madre..."
        justification += ` Justificado por ${['Ricardo','Silvina','Gabriel','Carolina','Marcelo','Verónica','Alejandro','Romina','Diego','Florencia','Héctor','Andrea','Pablo','Mariana','Esteban','Natalia','Fabián','Lorena','Gustavo','Cristina','Ramiro','Rocío','Mauricio','Daniela','Javier','Gabriela','Leonardo','Vanina','Claudio','Eliana','Raúl','Belén','Sergio'][student.id - 1]}.`;
      }

      attInserts.push(
        `(${attCount + 1}, ${student.id}, '${dateStr}', '${status}', ${isJustified}, ${justification ? `'${justification}'` : 'NULL'}, NULL, 2, '${now.toISOString()}', '${now.toISOString()}')`
      );
      attCount++;
    }
  }

  // Batch insert attendances in chunks of 500 to avoid giant queries
  const ATT_CHUNK_SIZE = 500;
  for (let i = 0; i < attInserts.length; i += ATT_CHUNK_SIZE) {
    const chunk = attInserts.slice(i, i + ATT_CHUNK_SIZE);
    await sequelize.query(
      `INSERT INTO attendances (id, student_id, date, status, is_justified, justification_note, certificate_url, registered_by, created_at, updated_at)
       VALUES ${chunk.join(',\n')}`
    );
  }
  console.log(`   ✓ ${attCount} asistencias registradas\n`);

  // ── 9. GRADES ────────────────────────────────────────────────
  console.log('⏳ Generando notas...');
  const gradeTypes = ['examen', 'trabajo', 'tarea', 'oral', 'otro'];
  const examDates = [
    '2026-03-10', '2026-03-17', '2026-03-24', '2026-03-31',
    '2026-04-07', '2026-04-14', '2026-04-21', '2026-04-28',
    '2026-05-05', '2026-05-12', '2026-05-19', '2026-05-26',
    '2026-06-02', '2026-06-09',
  ];
  const descriptions = {
    examen: [
      'Examen integrador', 'Evaluación trimestral', 'Prueba escrita',
      'Evaluación parcial', 'Examen de unidad',
    ],
    trabajo: [
      'Trabajo práctico grupal', 'Trabajo práctico individual',
      'Monografía', 'Informe de laboratorio', 'Investigación bibliográfica',
    ],
    tarea: [
      'Tarea domiciliaria', 'Actividades de refuerzo',
      'Ejercitación complementaria', 'Cuestionario',
    ],
    oral: [
      'Exposición oral', 'Presentación grupal', 'Defensa de trabajo',
      'Participación en debate',
    ],
    otro: [
      'Participación en clase', 'Proyecto especial',
      'Trabajo de campo', 'Actividad integradora',
    ],
  };

  let gradeCount = 0;
  let gradeInserts = [];

  for (const student of STUDENTS_DATA) {
    // Each student gets grades in ALL 5 subjects
    const allSubjects = [0, 1, 2, 3, 4];
    const studentSubjects = allSubjects.sort(() => Math.random() - 0.5);

    for (const subIdx of studentSubjects) {
      const subjectGlobalId = (student.course_id - 1) * 5 + subIdx + 1;
      // 2-4 grades per subject → 10-20 total per student
      const numGrades = 2 + Math.round(Math.random() * 2); // 2 to 4

      for (let g = 0; g < numGrades; g++) {
        const gradeKey = `${student.id}_${subjectGlobalId}`;
        const lowGradeRange = LOW_GRADES[gradeKey];

        let gradeVal;
        if (lowGradeRange) {
          gradeVal = randomGrade(lowGradeRange[0], lowGradeRange[1]);
        } else {
          // Regular student: most grades 6-9, occasional low 4-6
          if (Math.random() < 0.15) {
            gradeVal = randomGrade(4.0, 5.5);
          } else {
            gradeVal = randomGrade(6.0, 9.5);
          }
        }
        gradeVal = Math.round(gradeVal * 100) / 100;

        const type = pickRandom(gradeTypes);
        const desc = pickRandom(descriptions[type]);
        const date = pickRandom(examDates);
        // Teacher who teaches this subject
        const teacherId = DOCENTES[subIdx].id;

        gradeCount++;
        gradeInserts.push(
          `(${gradeCount}, ${student.id}, ${subjectGlobalId}, ${gradeVal}, '${type}', '${desc} (${student.last_name})', '${date}', ${teacherId}, '${now.toISOString()}', '${now.toISOString()}')`
        );
      }
    }
  }

  // Batch insert grades
  const GRADE_CHUNK_SIZE = 200;
  for (let i = 0; i < gradeInserts.length; i += GRADE_CHUNK_SIZE) {
    const chunk = gradeInserts.slice(i, i + GRADE_CHUNK_SIZE);
    await sequelize.query(
      `INSERT INTO grades (id, student_id, subject_id, grade, type, description, date, created_by, created_at, updated_at)
       VALUES ${chunk.join(',\n')}`
    );
  }
  console.log(`   ✓ ${gradeCount} notas registradas\n`);

  // ── 10. LICENCES ─────────────────────────────────────────────
  console.log('⏳ Creando licencias...');
  await sequelize.query(
    `INSERT INTO licences (id, user_id, title, file_url, file_name, file_mime, file_size, file_data, created_at, updated_at)
     VALUES
       (1, 2, 'Licencia personal - Trámites bancarios',  NULL, NULL, NULL, NULL, NULL, :n, :n),
       (2, 3, 'Licencia por enfermedad - Gripe',          NULL, NULL, NULL, NULL, NULL, :n, :n),
       (3, 5, 'Licencia por capacitación docente',        NULL, NULL, NULL, NULL, NULL, :n, :n),
       (4, 6, 'Licencia por examen',                      NULL, NULL, NULL, NULL, NULL, :n, :n)`,
    { replacements: { n: now } }
  );
  console.log('   ✓ 4 licencias creadas\n');

  // ── 11. SETTINGS ─────────────────────────────────────────────
  console.log('⏳ Creando configuración del sistema...');
  await sequelize.query(
    `INSERT INTO settings (key, value, created_at, updated_at)
     VALUES
       ('ausencia_umbral', '10', :n, :n),
       ('notificaciones_activas', 'true', :n, :n)`,
    { replacements: { n: now } }
  );
  console.log('   ✓ Configuración creada\n');

  // ── 12. NOTIFICATION LOGS ────────────────────────────────────
  console.log('⏳ Creando registros de notificaciones...');
  // We'll create some notification logs to show the alert system works
  const alertReasons = [
    { student: 5,  type: 'ausencia_critica',  msg: 'Santino González acumula 12 faltas injustificadas. Se requiere contacto urgente con el tutor.' },
    { student: 16, type: 'ausencia_critica',  msg: 'Valentino Ortiz acumula 10 faltas injustificadas. Notificar al tutor.' },
    { student: 30, type: 'ausencia_critica',  msg: 'Bruno Sosa acumula 8 faltas injustificadas. Riesgo de pérdida de regularidad.' },
    { student: 5,  type: 'nota_baja',         msg: 'Santino González obtuvo 3.50 en Matemática. Se recomienda apoyo escolar.' },
    { student: 3,  type: 'nota_baja',         msg: 'Benjamín Martínez obtuvo 2.00 en Lengua y Literatura. Riesgo de desaprobación.' },
    { student: 30, type: 'nota_baja',         msg: 'Bruno Sosa tiene promedio 3.20 en Matemática. Bajo rendimiento crítico.' },
    { student: 13, type: 'nota_baja',         msg: 'Francisco Ruiz obtuvo 3.00 en Ciencias Naturales. Requiere atención.' },
    { student: 8,  type: 'ausencia_prevencion', msg: 'Sofía Sánchez tiene 6 faltas al momento. Umbral de alerta próximo.' },
  ];

  for (let i = 0; i < alertReasons.length; i++) {
    const ar = alertReasons[i];
    // Find parent user for this student
    const parentUserId = 8 + (ar.student - 1);
    await sequelize.query(
      `INSERT INTO notification_logs (recipient_id, student_id, type, alert_type, message, channel, status, sent_at)
       VALUES (:recipient, :student, :type, :alertType, :msg, 'email', 'enviado', :sent)`,
      {
        replacements: {
          recipient: parentUserId,
          student: ar.student,
          type: ar.type,
          alertType: ar.type,
          msg: ar.msg,
          sent: new Date(2026, 4, 20 + i), // Scattered dates in May
        }
      }
    );
  }
  console.log('   ✓ 8 notificaciones de ejemplo\n');

  // ── 13. RESET SEQUENCES ────────────────────────────────────────
  console.log('⏳ Reseteando secuencias auto-increment...');
  await sequelize.query(`SELECT setval('grades_id_seq', COALESCE((SELECT MAX(id) FROM grades), 1))`);
  await sequelize.query(`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1))`);
  await sequelize.query(`SELECT setval('courses_id_seq', COALESCE((SELECT MAX(id) FROM courses), 1))`);
  await sequelize.query(`SELECT setval('subjects_id_seq', COALESCE((SELECT MAX(id) FROM subjects), 1))`);
  await sequelize.query(`SELECT setval('students_id_seq', COALESCE((SELECT MAX(id) FROM students), 1))`);
  await sequelize.query(`SELECT setval('licences_id_seq', COALESCE((SELECT MAX(id) FROM licences), 1))`);
  await sequelize.query(`SELECT setval('attendances_id_seq', COALESCE((SELECT MAX(id) FROM attendances), 1))`);
  console.log('   ✓ Secuencias reseteadas\n');

  // ── SUMMARY ──────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('═══════════════════════════════════════════════════');
  console.log('  ✅ SEED COMPLETADO');
  console.log(`  ⏱  ${elapsed}s`);
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('  📊 Resumen:');
  console.log(`     Cursos:         ${COURSES.length}`);
  console.log(`     Materias:       ${SUBJECTS.length}`);
  console.log(`     Usuarios:       40 (admin + preceptor + ${DOCENTES.length} docentes + ${PARENTS_DATA.length} padres)`);
  console.log(`     Alumnos:        ${STUDENTS_DATA.length}`);
  console.log(`     Asistencias:    ${attCount}`);
  console.log(`     Notas:          ${gradeCount}`);
  console.log(`     Licencias:      4`);
  console.log(`     Notificaciones: ${alertReasons.length}`);
  console.log('');
  console.log('  👤 Credenciales de acceso (password: ' + demoPassword + '):');
  console.log('     Admin:     admin@escuela.edu');
  console.log('     Preceptor: preceptor@escuela.edu');
  console.log('     Docentes:  docente.matematica@escuela.edu');
  console.log('                docente.lengua@escuela.edu');
  console.log('                docente.historia@escuela.edu');
  console.log('                docente.csnaturales@escuela.edu');
  console.log('                docente.ingles@escuela.edu');
  console.log('     Padres:    padre.garcia@escuela.edu  (y 32 más)');
  console.log('');
  console.log('  ⚠️  Alumnos con incidencias (para probar alertas):');
  console.log('     - Santino González (1° A):    21 faltas injustificadas + notas bajas');
  console.log('     - Valentino Ortiz (2° B):     15 faltas injustificadas');
  console.log('     - Bruno Sosa (3° C):          12 faltas injustificadas + bajo rendimiento');
  console.log('     - Isabella Rodríguez (1° A):  11 faltas JUSTIFICADAS (ver justificaciones)');
  console.log('     - Thiago García (1° A):       7+ faltas justificadas (ver notas de justificación)');
  console.log('     - Valentina López (1° A):     7+ faltas justificadas');
  console.log('     - Benjamín Martínez (1° A):   Nota baja en Lengua (2.00)');
  console.log('     - Francisco Ruiz (2° B):      Nota baja en Cs Naturales (3.00)');
  console.log('');
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });
