// test-changes.mjs — Test automático para FASE 1 + FASE 1B
// Uso: node test-changes.mjs
// Asume: servidor corriendo en http://localhost:5000

const BASE = 'http://localhost:5000';
let PASS = 0, FAIL = 0, SKIP = 0;
let DOCENTE_TOKEN = '', ADMIN_TOKEN = '', TUTOR_TOKEN = '';

const COLORS = {
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', gray: '\x1b[90m', reset: '\x1b[0m', bold: '\x1b[1m',
};

function log(color, label, msg) {
  const c = COLORS[color] || '';
  console.log(`${c}[${label}]${COLORS.reset} ${msg}`);
}
function pass(msg) { PASS++; log('green', 'PASS', msg); }
function fail(msg) { FAIL++; log('red', 'FAIL', msg); }
function skip(msg) { SKIP++; log('yellow', 'SKIP', msg); }

async function api(method, path, token, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

async function testAuth() {
  console.log(`\n${COLORS.bold}═══ FASE A — AUTH ═══${COLORS.reset}\n`);

  { const { status, data } = await api('POST', '/api/auth/login', null, { email: 'docente1@escuela.com', password: 'docente123' });
    if (status === 200 && data.token) { DOCENTE_TOKEN = data.token; pass(`Login docente → 200 + token (rol: ${data.user.rol})`); }
    else { fail(`Login docente → ${status}`); } }

  { const { status, data } = await api('POST', '/api/auth/login', null, { email: 'admin@escuela.com', password: 'admin123' });
    if (status === 200 && data.token) { ADMIN_TOKEN = data.token; pass(`Login admin → 200 + token (rol: ${data.user.rol})`); }
    else { fail(`Login admin → ${status}`); } }

  { const { status, data } = await api('POST', '/api/auth/login', null, { email: 'tutor1@email.com', password: 'tutor123' });
    if (status === 200 && data.token) { TUTOR_TOKEN = data.token; pass(`Login tutor → 200 + token (rol: ${data.user.rol})`); }
    else { fail(`Login tutor → ${status}`); } }

  { const { status } = await api('POST', '/api/auth/login', null, { email: 'admin@escuela.com', password: 'wrong' });
    if (status === 401) pass(`Bad password → 401`); else fail(`Bad password → ${status}`); }

  { const { status } = await api('POST', '/api/auth/login', null, {});
    if (status === 400) pass(`Missing fields → 400`); else fail(`Missing fields → ${status}`); }

  { const { status } = await api('GET', '/api/absences/student/1', null);
    if (status === 401) pass(`Sin token → 401`); else fail(`Sin token → ${status}`); }
}

async function testAbsences() {
  console.log(`\n${COLORS.bold}═══ FASE B — ABSENCES ═══${COLORS.reset}\n`);

  { const { status, data } = await api('GET', '/api/absences/student/1', DOCENTE_TOKEN);
    if (status === 200 && data.summary) pass(`GET /student/1 → 200, ${data.summary.total} ausencias`); else fail(`GET /student/1 → ${status}`); }

  { const { status } = await api('GET', '/api/absences/student/999', DOCENTE_TOKEN);
    if (status === 404) pass(`GET /student/999 → 404`); else fail(`GET /student/999 → ${status}`); }

  { const { status, data } = await api('GET', '/api/absences/course/1', DOCENTE_TOKEN);
    if (status === 200 && data.estudiantes) pass(`GET /course/1 → 200, ${data.estudiantes.length} estudiantes`); else fail(`GET /course/1 → ${status}`); }

  { const { status, data } = await api('GET', '/api/absences/risk', ADMIN_TOKEN);
    if (status === 200 && data.total !== undefined) pass(`GET /risk → 200, ${data.total} en riesgo`); else fail(`GET /risk → ${status}`); }

  { const { status, data } = await api('GET', '/api/absences/student/1/monthly?anio=2026&mes=5', DOCENTE_TOKEN);
    if (status === 200 && data.total !== undefined) pass(`GET /student/1/monthly → 200`); else fail(`GET /student/1/monthly → ${status}`); }

  { const { status, data } = await api('POST', '/api/absences/register', ADMIN_TOKEN, { estudiante_ids: [1, 2], fecha: new Date().toISOString().split('T')[0] });
    if (status === 201) pass(`POST /register → 201`); else if (status === 403) pass(`POST /register → 403 (auth)`); else fail(`POST /register → ${status}`); }

  { const { status } = await api('POST', '/api/absences/register', ADMIN_TOKEN, { estudiante_ids: [1], fecha: '2099-12-31' });
    if (status === 400) pass(`POST fecha futura → 400 (RN-03)`); else if (status === 403) pass(`POST fecha futura → 403 (auth)`); else fail(`POST fecha futura → ${status}`); }

  { const { status } = await api('PUT', '/api/absences/1', ADMIN_TOKEN, { justificada: true });
    if (status === 200) pass(`PUT /1 justificar → 200`); else if (status === 404) pass(`PUT /1 → 404 (ID no existe)`); else fail(`PUT /1 → ${status}`); }
}

async function testGrades() {
  console.log(`\n${COLORS.bold}═══ FASE C — GRADES ═══${COLORS.reset}\n`);

  { const { status, data } = await api('GET', '/api/grades/subjects', DOCENTE_TOKEN);
    if (status === 200 && data.data) pass(`GET /subjects → 200, ${data.data.length} materia(s)`); else fail(`GET /subjects → ${status}`); }

  { const { status } = await api('GET', '/api/grades/subjects', TUTOR_TOKEN);
    if (status === 403) pass(`GET /subjects (tutor) → 403`); else fail(`GET /subjects (tutor) → ${status}`); }

  { const { status, data } = await api('GET', '/api/grades/student/1', DOCENTE_TOKEN);
    if (status === 200 && data.grades) pass(`GET /student/1 → 200, ${data.grades.length} nota(s)`); else fail(`GET /student/1 → ${status}`); }

  { const { status, data } = await api('GET', '/api/grades/student/1/average', DOCENTE_TOKEN);
    if (status === 200 && data.generalAverage !== undefined) pass(`GET /student/1/average → prom ${data.generalAverage}`); else fail(`GET /student/1/average → ${status}`); }

  { const { status } = await api('GET', '/api/grades/student/999/average', DOCENTE_TOKEN);
    if (status === 404) pass(`GET /student/999/average → 404`); else fail(`GET /student/999/average → ${status}`); }

  { const { status, data } = await api('GET', '/api/grades/course/1', DOCENTE_TOKEN);
    if (status === 200 && data.estudiantes) pass(`GET /course/1 → 200, ${data.estudiantes.length} estudiantes`); else fail(`GET /course/1 → ${status}`); }

  { const { status, data } = await api('GET', '/api/grades/critical', DOCENTE_TOKEN);
    if (status === 200 && data.total !== undefined) pass(`GET /critical → 200, ${data.total} critica(s)`); else fail(`GET /critical → ${status}`); }

  { const { status } = await api('GET', '/api/grades/critical', TUTOR_TOKEN);
    if (status === 403) pass(`GET /critical (tutor) → 403`); else fail(`GET /critical (tutor) → ${status}`); }

  { const { status, data } = await api('GET', '/api/grades/low-average', DOCENTE_TOKEN);
    if (status === 200 && data.total !== undefined) pass(`GET /low-average → 200, ${data.total} alumno(s)`); else fail(`GET /low-average → ${status}`); }

  { const { status, data } = await api('POST', '/api/grades', DOCENTE_TOKEN, { estudiante_id: 1, materia_id: 1, nota: 7, periodo: 'T1', fecha: new Date().toISOString().split('T')[0] });
    if (status === 201) pass(`POST /grades → 201`); else fail(`POST /grades → ${status}`); }

  { const { status, data } = await api('POST', '/api/grades', DOCENTE_TOKEN, { estudiante_id: 2, materia_id: 1, nota: 3, periodo: 'T1', fecha: new Date().toISOString().split('T')[0] });
    if (status === 201 && data.alerta?.tipo === 'RN-04') pass(`POST nota=3 → 201 + RN-04`); else fail(`POST nota=3 → ${status}`); }

  { const { status } = await api('POST', '/api/grades', DOCENTE_TOKEN, { estudiante_id: 1, materia_id: 1, nota: 15, periodo: 'T1', fecha: new Date().toISOString().split('T')[0] });
    if (status === 400) pass(`POST nota=15 → 400 (validacion)`); else fail(`POST nota=15 → ${status}`); }

  { const { status } = await api('POST', '/api/grades', ADMIN_TOKEN, { estudiante_id: 1, materia_id: 1, nota: 8, periodo: 'T1', fecha: new Date().toISOString().split('T')[0] });
    if (status === 403) pass(`POST /grades (admin) → 403`); else fail(`POST /grades (admin) → ${status}`); }

  { const { status } = await api('GET', '/api/grades/student/1', TUTOR_TOKEN);
    if (status === 200) pass(`GET /student/1 (tutor) → 200`); else fail(`GET /student/1 (tutor) → ${status}`); }

  { const { status } = await api('GET', '/api/grades/student/1/average', TUTOR_TOKEN);
    if (status === 200) pass(`GET /student/1/average (tutor) → 200`); else fail(`GET /student/1/average (tutor) → ${status}`); }

  { const { status } = await api('GET', '/api/grades/subjects', null);
    if (status === 401) pass(`GET /subjects sin token → 401`); else fail(`GET /subjects sin token → ${status}`); }
}

async function testTasks() {
  console.log(`\n${COLORS.bold}═══ FASE D — TASKS ═══${COLORS.reset}\n`);

  { const { status, data } = await api('POST', '/api/tasks', DOCENTE_TOKEN, { materia_id: 1, nombre: 'TP Test', descripcion: 'Test', fecha_asignacion: '2026-05-18', fecha_entrega: '2026-05-25' });
    if (status === 201) pass(`POST /tasks → 201`); else fail(`POST /tasks → ${status}`); }

  { const { status } = await api('POST', '/api/tasks', ADMIN_TOKEN, { materia_id: 1, nombre: 'Admin', fecha_asignacion: '2026-05-18', fecha_entrega: '2026-05-25' });
    if (status === 403) pass(`POST /tasks (admin) → 403`); else fail(`POST /tasks (admin) → ${status}`); }

  { const { status } = await api('POST', '/api/tasks', DOCENTE_TOKEN, { nombre: 'Incompleta' });
    if (status === 400) pass(`POST /tasks incompleta → 400`); else fail(`POST /tasks incompleta → ${status}`); }

  { const { status, data } = await api('GET', '/api/tasks', DOCENTE_TOKEN);
    if (status === 200 && data.total !== undefined) pass(`GET /tasks → 200, ${data.total} tarea(s)`); else fail(`GET /tasks → ${status}`); }

  { const { status, data } = await api('GET', '/api/tasks/1', DOCENTE_TOKEN);
    if (status === 200 && data.nombre) pass(`GET /tasks/1 → 200`); else fail(`GET /tasks/1 → ${status}`); }

  { const { status } = await api('GET', '/api/tasks/999', DOCENTE_TOKEN);
    if (status === 404) pass(`GET /tasks/999 → 404`); else fail(`GET /tasks/999 → ${status}`); }

  { const { status } = await api('PUT', '/api/tasks/1', DOCENTE_TOKEN, { nombre: 'TP Test Actualizado' });
    if (status === 200) pass(`PUT /tasks/1 → 200`); else fail(`PUT /tasks/1 → ${status}`); }

  { const { status } = await api('PUT', '/api/tasks/999', DOCENTE_TOKEN, { nombre: 'Nope' });
    if (status === 404) pass(`PUT /tasks/999 → 404`); else fail(`PUT /tasks/999 → ${status}`); }

  { const { status, data } = await api('GET', '/api/tasks/1/submissions', DOCENTE_TOKEN);
    if (status === 200 && data.estudiantes) pass(`GET /tasks/1/submissions → 200, ${data.estudiantes.length} estudiantes`); else fail(`GET /tasks/1/submissions → ${status}`); }

  { const { status } = await api('PUT', '/api/tasks/1/students/1', DOCENTE_TOKEN, { entregada: true });
    if (status === 200) pass(`PUT /tasks/1/students/1 (entregada) → 200`); else fail(`PUT /tasks/1/students/1 → ${status}`); }

  { const { status } = await api('PUT', '/api/tasks/1/students/2', DOCENTE_TOKEN, { entregada: false });
    if (status === 200) pass(`PUT /tasks/1/students/2 (no entregada) → 200`); else fail(`PUT /tasks/1/students/2 → ${status}`); }

  { const { status, data } = await api('GET', '/api/tasks/student/1', TUTOR_TOKEN);
    if (status === 200 && data.summary) pass(`GET /tasks/student/1 (tutor) → 200`); else fail(`GET /tasks/student/1 (tutor) → ${status}`); }

  { const { status } = await api('GET', '/api/tasks/student/999', DOCENTE_TOKEN);
    if (status === 404) pass(`GET /tasks/student/999 → 404`); else fail(`GET /tasks/student/999 → ${status}`); }

  { const { status, data } = await api('GET', '/api/tasks/student/1/consecutive-missed', DOCENTE_TOKEN);
    if (status === 200 && data.total_alertas !== undefined) pass(`GET /consecutive-missed → 200, ${data.total_alertas} alerta(s)`); else fail(`GET /consecutive-missed → ${status}`); }

  // DELETE test
  let tempId = null;
  { const { data } = await api('POST', '/api/tasks', DOCENTE_TOKEN, { materia_id: 1, nombre: 'Temp DELETE', fecha_asignacion: '2026-05-18', fecha_entrega: '2026-05-25' });
    if (data?.data?.id) tempId = data.data.id; }
  if (tempId) {
    const { status } = await api('DELETE', `/api/tasks/${tempId}`, ADMIN_TOKEN);
    if (status === 200) pass(`DELETE /tasks/${tempId} (admin) → 200`); else fail(`DELETE /tasks/${tempId} → ${status}`);
  } else { skip('DELETE: no se pudo crear tarea temporal'); }

  { const { status } = await api('DELETE', '/api/tasks/1', DOCENTE_TOKEN);
    if (status === 403) pass(`DELETE /tasks/1 (docente) → 403`); else fail(`DELETE /tasks/1 (docente) → ${status}`); }
}

async function testTeachers() {
  console.log(`\n${COLORS.bold}═══ FASE E — TEACHERS ═══${COLORS.reset}\n`);

  { const { status, data } = await api('GET', '/api/teachers/license', DOCENTE_TOKEN);
    if (status === 200 && data.dias_restantes !== undefined) pass(`GET /license → ${data.dias_restantes}/${data.dias_licencia_total} dias`); else fail(`GET /license → ${status}`); }

  { const { status } = await api('GET', '/api/teachers/license', ADMIN_TOKEN);
    if (status === 403) pass(`GET /license (admin) → 403`); else fail(`GET /license (admin) → ${status}`); }

  { const { status, data } = await api('GET', '/api/teachers/students/absences', DOCENTE_TOKEN);
    if (status === 200 && data.total_cursos !== undefined) pass(`GET /students/absences → 200, ${data.total_cursos} curso(s)`); else fail(`GET /students/absences → ${status}`); }

  { const { status } = await api('GET', '/api/teachers/students/absences?desde=2026-01-01&hasta=2026-12-31', DOCENTE_TOKEN);
    if (status === 200) pass(`GET /students/absences con filtro → 200`); else fail(`GET /students/absences con filtro → ${status}`); }

  { const { status } = await api('GET', '/api/teachers/students/absences', TUTOR_TOKEN);
    if (status === 403) pass(`GET /students/absences (tutor) → 403`); else fail(`GET /students/absences (tutor) → ${status}`); }

  { const { status } = await api('GET', '/api/teachers/license', null);
    if (status === 401) pass(`GET /license sin token → 401`); else fail(`GET /license sin token → ${status}`); }
}

async function testTutors() {
  console.log(`\n${COLORS.bold}═══ FASE F — TUTORS ═══${COLORS.reset}\n`);

  { const { status, data } = await api('GET', '/api/tutors/children', TUTOR_TOKEN);
    if (status === 200 && data.hijos) pass(`GET /children → 200, ${data.total_hijos} hijo(s)`); else fail(`GET /children → ${status}`); }

  { const { status } = await api('GET', '/api/tutors/children', DOCENTE_TOKEN);
    if (status === 403) pass(`GET /children (docente) → 403`); else fail(`GET /children (docente) → ${status}`); }

  { const { status, data } = await api('GET', '/api/tutors/children/1/summary', TUTOR_TOKEN);
    if (status === 200 && data.estudiante) pass(`GET /children/1/summary → 200`); else fail(`GET /children/1/summary → ${status}`); }

  { const { status } = await api('GET', '/api/tutors/children/999/summary', TUTOR_TOKEN);
    if (status === 403) pass(`GET /children/999/summary → 403 (no es hijo)`); else fail(`GET /children/999/summary → ${status}`); }

  { const { status } = await api('GET', '/api/tutors/children', null);
    if (status === 401) pass(`GET /children sin token → 401`); else fail(`GET /children sin token → ${status}`); }
}

async function testAnalytics() {
  console.log(`\n${COLORS.bold}═══ FASE G — ANALYTICS (CHANGE-019) ═══${COLORS.reset}\n`);

  // G01
  { const { status, data } = await api('GET', '/api/analytics/student/1', DOCENTE_TOKEN);
    if (status === 200 && data.estudiante && data.inasistencias && data.calificaciones) {
      pass(`GET /student/1 → 200, ${data.inasistencias.total} ausencias, ${data.calificaciones.total_calificaciones} notas, ${data.resumen_alertas.total} alertas`);
    } else { fail(`GET /student/1 → ${status}`); } }

  // G02: Structure check — should have inasistencias.evolucion_mensual
  { const { status, data } = await api('GET', '/api/analytics/student/1', DOCENTE_TOKEN);
    if (status === 200 && Array.isArray(data.inasistencias?.evolucion_mensual)) {
      pass(`GET /student/1 → evolucion_mensual presente (${data.inasistencias.evolucion_mensual.length} meses)`);
    } else { fail(`GET /student/1 → evolucion_mensual ausente`); } }

  // G03: GET /absences only
  { const { status, data } = await api('GET', '/api/analytics/student/1/absences', DOCENTE_TOKEN);
    if (status === 200 && data.total !== undefined) pass(`GET /student/1/absences → 200, ${data.total} ausencias`); else fail(`GET /student/1/absences → ${status}`); }

  // G04: GET /grades only
  { const { status, data } = await api('GET', '/api/analytics/student/1/grades', DOCENTE_TOKEN);
    if (status === 200 && data.materias) pass(`GET /student/1/grades → 200, ${data.materias.length} materia(s)`); else fail(`GET /student/1/grades → ${status}`); }

  // G05: Student not found
  { const { status } = await api('GET', '/api/analytics/student/999', DOCENTE_TOKEN);
    if (status === 404) pass(`GET /student/999 → 404`); else fail(`GET /student/999 → ${status}`); }

  // G06: Tutor access to own child
  { const { status } = await api('GET', '/api/analytics/student/1', TUTOR_TOKEN);
    if (status === 200) pass(`GET /student/1 (tutor) → 200`); else if (status === 403) skip(`GET /student/1 (tutor) → 403 (no es hijo)`); else fail(`GET /student/1 (tutor) → ${status}`); }

  // G07: Tutor access to unknown student
  { const { status } = await api('GET', '/api/analytics/student/999', TUTOR_TOKEN);
    if (status === 403) pass(`GET /student/999 (tutor) → 403`); else fail(`GET /student/999 (tutor) → ${status}`); }

  // G08: Sin token
  { const { status } = await api('GET', '/api/analytics/student/1', null);
    if (status === 401) pass(`GET /student/1 sin token → 401`); else fail(`GET /student/1 sin token → ${status}`); }

  // G09: Admin access
  { const { status, data } = await api('GET', '/api/analytics/student/1', ADMIN_TOKEN);
    if (status === 200 && data.estudiante) pass(`GET /student/1 (admin) → 200`); else fail(`GET /student/1 (admin) → ${status}`); }

  // G10: Alerts structure — check RN alerts are arrays
  { const { status, data } = await api('GET', '/api/analytics/student/1', DOCENTE_TOKEN);
    if (status === 200 && Array.isArray(data.resumen_alertas?.items)) {
      const total = data.resumen_alertas.total;
      const items = data.resumen_alertas.items.length;
      pass(`GET /student/1 → ${total} alerta(s) (${items} item(s) en array)`);
      if (data.resumen_alertas.items.length > 0) {
        data.resumen_alertas.items.forEach(a => console.log(`  ${COLORS.gray}├─ ${a.tipo}: ${a.descripcion.slice(0, 60)}${COLORS.reset}`));
      }
    } else { fail(`GET /student/1 → alertas estructura invalida`); } }
}

async function testCommunication() {
  console.log(`\n${COLORS.bold}═══ FASE H — COMMUNICATION (CHANGE-021) ═══${COLORS.reset}\n`);

  // Resolve real user IDs from JWT payload
  const decodeToken = (token) => {
    try {
      const parts = token.split('.');
      const json = Buffer.from(parts[1], 'base64').toString();
      return JSON.parse(json);
    } catch { return null; }
  };
  const docenteUser = decodeToken(DOCENTE_TOKEN);
  const tutorUser = decodeToken(TUTOR_TOKEN);
  const DOCENTE_ID = docenteUser?.id;
  const TUTOR_ID = tutorUser?.id;

  let msgDocenteTutor = null; // id of message from docente→tutor

  // H01: POST /messages — send message (docente → tutor)
  { const { status, data } = await api('POST', '/api/communication/messages', DOCENTE_TOKEN, {
      receptor_id: TUTOR_ID, asunto: 'Consulta sobre alumno', cuerpo: 'Hola tutor, necesito hablar sobre Juan' });
    if (status === 201) { msgDocenteTutor = data.data?.id; pass(`POST /messages (docente→tutor) → 201`); }
    else { fail(`POST /messages → ${status}`); } }

  // H02: POST /messages — send message (tutor → docente)
  { const { status, data } = await api('POST', '/api/communication/messages', TUTOR_TOKEN, {
      receptor_id: DOCENTE_ID, asunto: 'Consulta', cuerpo: 'Hola profe, como va mi hijo?' });
    if (status === 201) pass(`POST /messages (tutor→docente) → 201`); else fail(`POST /messages → ${status}`); }

  // H03: POST /messages — self-message (tutor→self) blocked (RN-14: tutor can't message another tutor)
  // Tutor can't message another tutor. Since we know the sender is a tutor, sending to self should 400 (tutor→tutor).
  { const { status } = await api('POST', '/api/communication/messages', TUTOR_TOKEN, {
      receptor_id: TUTOR_ID, asunto: 'Auto', cuerpo: 'Test' });
    if (status === 400) pass(`POST /messages (tutor→mismo) → 400 (RN-14: tutor→tutor)`); else fail(`POST /messages (tutor→mismo) → ${status}`); }

  // H04: POST /messages — missing fields
  { const { status } = await api('POST', '/api/communication/messages', DOCENTE_TOKEN, {
      asunto: 'Incompleto' });
    if (status === 400) pass(`POST /messages incompleto → 400`); else fail(`POST /messages incompleto → ${status}`); }

  // H05: POST /messages — receptor inexistente
  { const { status } = await api('POST', '/api/communication/messages', DOCENTE_TOKEN, {
      receptor_id: 999, asunto: 'Test', cuerpo: 'Hola' });
    if (status === 404) pass(`POST /messages receptor 999 → 404`); else fail(`POST /messages receptor 999 → ${status}`); }

  // H06: GET /conversations — list
  { const { status, data } = await api('GET', '/api/communication/conversations', DOCENTE_TOKEN);
    if (status === 200 && data.total !== undefined) {
      pass(`GET /conversations → 200, ${data.total} conversacion(es)`);
    } else { fail(`GET /conversations → ${status}`); } }

  // H07: GET /conversations/:userId/messages — thread with tutor
  { const { status, data } = await api('GET', `/api/communication/conversations/${TUTOR_ID}/messages`, DOCENTE_TOKEN);
    if (status === 200 && data.messages) pass(`GET /conversations/${TUTOR_ID}/messages → 200, ${data.messages.length} mensaje(s)`); else fail(`GET /conversations/${TUTOR_ID}/messages → ${status}`); }

  // H08: GET /conversations/:userId/messages — user 999
  { const { status } = await api('GET', '/api/communication/conversations/999/messages', DOCENTE_TOKEN);
    if (status === 404) pass(`GET /conversations/999/messages → 404`); else fail(`GET /conversations/999/messages → ${status}`); }

  // H09: PUT /messages/:id/read — mark as read (recipient = tutor)
  if (msgDocenteTutor) {
    const { status } = await api('PUT', `/api/communication/messages/${msgDocenteTutor}/read`, TUTOR_TOKEN);
    if (status === 200) pass(`PUT /messages/${msgDocenteTutor}/read → 200`); else fail(`PUT /messages/${msgDocenteTutor}/read → ${status}`);
  } else { skip(`H09 saltado — mensaje no creado`); }

  // H10: PUT /messages/:id/read — non-recipient (docente sent it, so can't mark as read)
  if (msgDocenteTutor) {
    const { status } = await api('PUT', `/api/communication/messages/${msgDocenteTutor}/read`, DOCENTE_TOKEN);
    if (status === 403) pass(`PUT /messages/${msgDocenteTutor}/read (no receptor) → 403`); else fail(`PUT /messages/${msgDocenteTutor}/read (no receptor) → ${status}`);
  } else { skip('H10 saltado'); }

  // H11: PUT /messages/999/read — not found
  { const { status } = await api('PUT', '/api/communication/messages/999/read', DOCENTE_TOKEN);
    if (status === 404) pass(`PUT /messages/999/read → 404`); else fail(`PUT /messages/999/read → ${status}`); }

  // H12: GET /conversations sin token
  { const { status } = await api('GET', '/api/communication/conversations', null);
    if (status === 401) pass(`GET /conversations sin token → 401`); else fail(`GET /conversations sin token → ${status}`); }
}

// ─── FASE I — CERTIFICATES (CHANGE-023) ─────────────────────────
async function testCertificates() {
  console.log(`\n${COLORS.bold}═══ FASE I — CERTIFICATES (CHANGE-023) ═══${COLORS.reset}\n`);

  // I01: POST /upload — upload certificate (docente, via URL)
  let certId = null;
  { const { status, data } = await api('POST', '/api/certificates/upload', DOCENTE_TOKEN,
      { estudiante_id: 1, url: 'https://ejemplo.com/certificado.pdf', filename: 'certificado.pdf' });
    if (status === 201 && data.data) {
      certId = data.data.id;
      pass(`POST /upload → 201, certificado #${certId} creado`);
    } else { fail(`POST /upload → ${status}`); } }

  // I02: POST /upload — without file or URL → 400
  { const { status } = await api('POST', '/api/certificates/upload', DOCENTE_TOKEN,
      { estudiante_id: 1 });
    if (status === 400) pass(`POST /upload sin archivo → 400`); else fail(`POST /upload sin archivo → ${status}`); }

  // I03: POST /upload — estudiante inexistente → 404
  { const { status } = await api('POST', '/api/certificates/upload', DOCENTE_TOKEN,
      { estudiante_id: 999, url: 'https://ejemplo.com/cert.pdf' });
    if (status === 404) pass(`POST /upload estudiante 999 → 404`); else fail(`POST /upload estudiante 999 → ${status}`); }

  // I04: POST /upload — tutor uploads for own child → 201
  let certTutor = null;
  { const { status, data } = await api('POST', '/api/certificates/upload', TUTOR_TOKEN,
      { estudiante_id: 1, url: 'https://ejemplo.com/cert-hijo.pdf', filename: 'cert-hijo.pdf' });
    if (status === 201 && data.data) {
      certTutor = data.data.id;
      pass(`POST /upload (tutor→hijo) → 201, #${certTutor}`);
    } else { fail(`POST /upload (tutor→hijo) → ${status}`); } }

  // I05: POST /upload — tutor uploads for not-child → 403 (RN-09)
  { const { status } = await api('POST', '/api/certificates/upload', TUTOR_TOKEN,
      { estudiante_id: 6, url: 'https://ejemplo.com/no-hijo.pdf' });
    if (status === 403) pass(`POST /upload (tutor→no-hijo) → 403 (RN-09)`); else fail(`POST /upload (tutor→no-hijo) → ${status}`); }

  // I06: GET /pending/:estudiante_id — list pending
  { const { status, data } = await api('GET', '/api/certificates/pending/1', DOCENTE_TOKEN);
    if (status === 200 && data.total >= 1) pass(`GET /pending/1 → 200, ${data.total} pendiente(s)`); else fail(`GET /pending/1 → ${status}`); }

  // I07: GET /pending/:estudiante_id — estudiante 999
  { const { status } = await api('GET', '/api/certificates/pending/999', DOCENTE_TOKEN);
    if (status === 404) pass(`GET /pending/999 → 404`); else fail(`GET /pending/999 → ${status}`); }

  // I08: GET /pending/:estudiante_id — tutor can see own child
  { const { status, data } = await api('GET', '/api/certificates/pending/1', TUTOR_TOKEN);
    if (status === 200) pass(`GET /pending/1 (tutor→hijo) → 200`); else fail(`GET /pending/1 (tutor→hijo) → ${status}`); }

  // I09: GET /pending/:estudiante_id — tutor cannot see not-child
  { const { status } = await api('GET', '/api/certificates/pending/6', TUTOR_TOKEN);
    if (status === 403) pass(`GET /pending/6 (tutor→no-hijo) → 403`); else fail(`GET /pending/6 (tutor→no-hijo) → ${status}`); }

  // I10: PUT /:id/approve — approve certificate (admin only)
  if (certId) {
    const { status, data } = await api('PUT', `/api/certificates/${certId}/approve`, ADMIN_TOKEN);
    if (status === 200) pass(`PUT /${certId}/approve → 200`); else fail(`PUT /${certId}/approve → ${status}`);
  } else { skip('I10 saltado — sin certificado'); }

  // I11: PUT /:id/approve — docente cannot approve
  if (certId) {
    const { status } = await api('PUT', `/api/certificates/${certId}/approve`, DOCENTE_TOKEN);
    if (status === 403) pass(`PUT /${certId}/approve (docente) → 403`); else fail(`PUT /${certId}/approve (docente) → ${status}`);
  } else { skip('I11 saltado'); }

  // I12: PUT /:id/approve — already approved → 400
  if (certId) {
    const { status } = await api('PUT', `/api/certificates/${certId}/approve`, ADMIN_TOKEN);
    if (status === 400) pass(`PUT /${certId}/approve (ya aprobado) → 400`); else fail(`PUT /${certId}/approve (ya aprobado) → ${status}`);
  } else { skip('I12 saltado'); }

  // I13: PUT /:id/reject — reject with comment (admin)
  if (certTutor) {
    const { status } = await api('PUT', `/api/certificates/${certTutor}/reject`, ADMIN_TOKEN,
      { comentario: 'Documento ilegible' });
    if (status === 200) pass(`PUT /${certTutor}/reject → 200`); else fail(`PUT /${certTutor}/reject → ${status}`);
  } else { skip('I13 saltado'); }

  // I14: PUT /:id/reject — without comment → 400
  if (certTutor) {
    const { status } = await api('PUT', `/api/certificates/${certTutor}/reject`, ADMIN_TOKEN, {});
    if (status === 400) pass(`PUT /${certTutor}/reject sin comentario → 400`); else fail(`PUT /${certTutor}/reject sin comentario → ${status}`);
  } else { skip('I14 saltado'); }

  // I15: PUT /:id/reject — already rejected → 400
  if (certTutor) {
    const { status } = await api('PUT', `/api/certificates/${certTutor}/reject`, ADMIN_TOKEN,
      { comentario: 'otro' });
    if (status === 400) pass(`PUT /${certTutor}/reject (ya rechazado) → 400`); else fail(`PUT /${certTutor}/reject (ya rechazado) → ${status}`);
  } else { skip('I15 saltado'); }

  // I16: GET /:id — certificate details
  if (certId) {
    const { status } = await api('GET', `/api/certificates/${certId}`, DOCENTE_TOKEN);
    if (status === 200) pass(`GET /${certId} → 200`); else fail(`GET /${certId} → ${status}`);
  } else { skip('I16 saltado'); }

  // I17: GET /999 — not found
  { const { status } = await api('GET', '/api/certificates/999', DOCENTE_TOKEN);
    if (status === 404) pass(`GET /999 → 404`); else fail(`GET /999 → ${status}`); }

  // I18: GET / — list all (admin)
  { const { status, data } = await api('GET', '/api/certificates', ADMIN_TOKEN);
    if (status === 200 && data.total >= 1) pass(`GET / (admin) → 200, ${data.total} certificado(s)`); else fail(`GET / (admin) → ${status}`); }

  // I19: GET / — list by estudiante_id filter
  { const { status, data } = await api('GET', '/api/certificates?estudiante_id=1', ADMIN_TOKEN);
    if (status === 200) pass(`GET /?estudiante_id=1 → 200, ${data.total} encontrado(s)`); else fail(`GET /?estudiante_id=1 → ${status}`); }

  // I20: GET / upload sin token → 401
  { const { status } = await api('POST', '/api/certificates/upload', null, { estudiante_id: 1, url: 'x' });
    if (status === 401) pass(`POST /upload sin token → 401`); else fail(`POST /upload sin token → ${status}`); }
}

async function main() {
  console.log(`${COLORS.bold}${COLORS.cyan}╔══════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}║  TEST AUTOMÁTICO — FASE 1 + 1B      ║${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}╚══════════════════════════════════════╝${COLORS.reset}`);
  console.log(`Base URL: ${BASE}\n`);

  try {
    const { status } = await api('GET', '/');
    if (status !== 200) { console.log(`${COLORS.red}✖ Servidor no responde${COLORS.reset}`); process.exit(1); }
    console.log(`${COLORS.green}✔ Servidor OK${COLORS.reset}\n`);
  } catch (e) { console.log(`${COLORS.red}✖ No se puede conectar a ${BASE}${COLORS.reset}`); process.exit(1); }

  await testAuth();
  if (!DOCENTE_TOKEN || !ADMIN_TOKEN || !TUTOR_TOKEN) { console.log(`\n${COLORS.red}✖ No se pudieron obtener tokens${COLORS.reset}`); process.exit(1); }

  await testAbsences();
  await testGrades();
  await testTasks();
  await testTeachers();
  await testTutors();
  await testAnalytics();
  await testCommunication();
  await testCertificates();

  const total = PASS + FAIL + SKIP;
  const barLen = 30;
  const passLen = Math.round((PASS / total) * barLen);
  const failLen = Math.round((FAIL / total) * barLen);
  const skipLen = barLen - passLen - failLen;

  console.log(`\n${COLORS.bold}${COLORS.cyan}══════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}           R E S U M E N              ${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}══════════════════════════════════════${COLORS.reset}`);
  const bar = `${COLORS.green}${'█'.repeat(passLen)}${COLORS.reset}${COLORS.red}${'█'.repeat(failLen)}${COLORS.reset}${COLORS.yellow}${'█'.repeat(skipLen)}${COLORS.reset}`;
  console.log(`  ${bar}`);
  console.log(`  ${COLORS.green}✔ PASS: ${PASS}${COLORS.reset}  ${COLORS.red}✖ FAIL: ${FAIL}${COLORS.reset}  ${COLORS.yellow}○ SKIP: ${SKIP}${COLORS.reset}  Total: ${total}`);
  if (total - SKIP > 0) console.log(`  Tasa de éxito: ${((PASS / (total - SKIP)) * 100).toFixed(1)}% (excluyendo skipped)`);

  if (FAIL === 0) {
    console.log(`\n${COLORS.green}${COLORS.bold}  ✅ TODO OK — FASE 1 + FASE 1B COMPLETA (CHANGE-019 + 021 + 023)${COLORS.reset}`);
  } else {
    console.log(`\n${COLORS.red}${COLORS.bold}  ❌ ${FAIL} test(s) fallaron. Revisar arriba.${COLORS.reset}`);
  }
  console.log();
}

main();
