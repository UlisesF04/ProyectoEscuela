# Flujos Principales

Cada flujo se documenta extremo a extremo, mostrando la interacción entre componentes.

---

## Flujo 1: Inicio de sesión

**Disparador**: El usuario accede a la URL del sistema sin estar autenticado
**Actor**: Cualquier rol (admin, preceptor, docente, padre)

**Pasos**:
1. **Frontend** redirige al usuario a `/login` (detecta que no hay token en AuthContext)
2. **Usuario** ingresa email y contraseña en el formulario
3. **Frontend** envía `POST /api/v1/auth/login` con `{ email, password }` al backend
4. **Backend** — Middleware `validationMiddleware` valida que email y password no estén vacíos
5. **Backend** — Controller `authController.login()` recibe la request
6. **Backend** — Service `authService.login()`:
   - Busca al usuario por email en `userRepository.findByEmail()`
   - Si no existe → lanza `AppError(401, 'Credenciales inválidas')`
   - Si `is_active === false` → lanza `AppError(401, 'Cuenta desactivada')`
   - Compara password con bcrypt
   - Si no coincide → lanza `AppError(401, 'Credenciales inválidas')`
   - Genera JWT con payload `{ id, role, email, iat, exp }` (HS256, exp: 8h)
7. **Backend** devuelve `{ token, user: { id, role, first_name, last_name } }`
8. **Frontend** guarda token en AuthContext (memoria), actualiza estado global
9. **Frontend** redirige al dashboard correspondiente según el rol (`/admin`, `/preceptor`, `/docente`, `/padre`)

**Casos de error**:
| Condición | Código | Manejo |
|-----------|:------:|--------|
| Credenciales inválidas | 401 | Mensaje "Credenciales inválidas" en la UI |
| Cuenta desactivada | 401 | Mensaje "Tu cuenta ha sido desactivada" |
| Error de servidor | 500 | Mensaje genérico + log en backend |
| Rate limit excedido (10 intentos/15min) | 429 | Mensaje "Demasiados intentos. Intente más tarde" |

---

## Flujo 2: Registro de asistencia diaria (Preceptor)

**Disparador**: El preceptor necesita registrar la asistencia del día para un curso
**Actor**: Preceptor (también admin)

**Pasos**:
1. **Preceptor** inicia sesión y accede al panel de asistencias
2. **Frontend** carga `GET /api/v1/courses` → lista de cursos
3. **Preceptor** selecciona un curso y la fecha (por defecto: hoy)
4. **Frontend** carga `GET /api/v1/students?course_id=X` → alumnos del curso
5. **Preceptor** ve el listado de alumnos con selector de estado (presente/ausente/tarde) por fila
6. **Preceptor** completa los estados y confirma
7. **Frontend** envía `POST /api/v1/attendances` por cada alumno (o batch):
   - Body: `{ student_id, date, status }`
   - Header: `Authorization: Bearer <token>`
8. **Backend** — Middleware `authMiddleware` valida JWT y extrae `req.user`
9. **Backend** — Middleware `roleMiddleware` verifica rol = preceptor o admin
10. **Backend** — Service `attendanceService.register()`:
    - Valida que no exista ya un registro para `student_id + date`
    - Si existe → HTTP 409 Conflict
    - Crea registro en `attendances` con `registered_by = req.user.id`
11. **Backend** devuelve 201 con el registro creado
12. **Frontend** actualiza la UI: marca como registrado y muestra confirmación

**Casos de error**:
| Condición | Código | Manejo |
|-----------|:------:|--------|
| Registro duplicado (mismo alumno + fecha) | 409 | "Ya existe un registro para este alumno en esta fecha. ¿Desea editarlo?" |
| Token expirado | 401 | Redirección al login |
| Rol no autorizado | 403 | Redirección a /unauthorized |

---

## Flujo 3: Carga de calificación (Docente)

**Disparador**: El docente necesita cargar una nota para un alumno
**Actor**: Docente

**Pasos**:
1. **Docente** inicia sesión y accede al panel de calificaciones
2. **Frontend** carga las materias asignadas al docente (`teacher_subject`)
3. **Docente** selecciona materia → **Frontend** carga `GET /api/v1/students?course_id=X`
4. **Docente** selecciona alumno y período (`1er_trimestre`, `2do_trimestre`, etc.)
5. **Docente** ingresa valor (1.00 - 10.00) y opcionalmente observaciones
6. **Frontend** valida cliente: rango 1-10, período válido
7. **Frontend** envía `POST /api/v1/grades`:
   - Body: `{ student_id, subject_id, value, period, grade_date, notes }`
8. **Backend** — authMiddleware + roleMiddleware (rol = docente)
9. **Backend** — Service `gradeService.createGrade()`:
    - Verifica que `teacher_id` tenga asignada `subject_id` en `teacher_subject` (RN-04)
    - Si no → HTTP 403 "No tenés asignada esta materia"
    - Valida `value` entre 1.00 y 10.00 (RN-10)
    - Valida `period` válido (RN-11)
    - Crea registro en `grades` con `teacher_id = req.user.id`
10. **Backend** devuelve 201 con la calificación creada
11. **Frontend** actualiza la tabla de notas del alumno

**Casos de error**:
| Condición | Código | Manejo |
|-----------|:------:|--------|
| Materia no asignada al docente | 403 | "No tenés asignada esta materia" |
| Nota fuera de rango | 400 | "La nota debe estar entre 1.00 y 10.00" |
| Período inválido | 400 | "Período no válido. Use: 1er_trimestre, 2do_trimestre, 3er_trimestre o recuperatorio" |

---

## Flujo 4: Notificación automática de inasistencias críticas (Bot)

**Disparador**: Ejecución del ciclo diario del agente Python (post-jornada escolar)
**Actor**: Bot Automatizado (actor no humano)

**Pasos**:
1. **Agente Python** se activa según scheduler (APScheduler, ej: 18:00 hs diario)
2. **Agente** ejecuta tarea `db_reader.py`:
   - Conecta a PostgreSQL (misma BD que la app web)
   - Query: alumnos con ≥ X inasistencias no justificadas (X = umbral configurado, defecto: 10)
   - Query: excluye alumnos ya notificados hoy del mismo tipo (RN-16)
3. **Agente** para cada alumno que cumple la condición:
   - Busca en `parent_student` los padres/tutores vinculados
   - Busca `phone_whatsapp` del padre en `users`
4. **Agente** ejecuta tarea `notifier.py`:
   - Construye mensaje: "Su hijo/a [nombre] acumula [N] inasistencias no justificadas. Comuníquese con la institución."
   - Envía vía Twilio WhatsApp API
5. **Agente** registra resultado en `notification_logs`:
   - Si Twilio responde OK → status = 'enviado'
   - Si Twilio devuelve error → status = 'fallido'
6. **Agente** repite pasos 3-5 para las otras alertas (CALIFICACION_BAJA, TAREA_PENDIENTE, RIESGO_REGULARIDAD, LICENCIA_DOCENTE_VENCIMIENTO)

**Máquina de estados del envío**:
```
[Evaluación] → [Condición cumple] → [Envío Twilio] → [Éxito] → log='enviado'
                                                    → [Fallo] → log='fallido'
                                                    → [Ya notificado hoy] → skip
```

**Casos de error**:
| Condición | Manejo |
|-----------|--------|
| Error de conexión a BD | Log de error + reintento en próximo ciclo |
| Twilio rechaza el mensaje | Log con status 'fallido' + código de error Twilio |
| Padre sin WhatsApp registrado | Skip + log informativo (sin alerta) |
| Múltiples alumnos críticos | Procesamiento secuencial con timeout entre mensajes |

---

## Flujo 5: Justificación de inasistencia (Preceptor con certificado del padre)

**Disparador**: Un padre sube un certificado y el preceptor lo procesa
**Actores**: Padre (subida), Preceptor (aprobación)

**Pasos**:
1. **Padre** accede al sistema y localiza una ausencia no justificada de su hijo
2. **Padre** hace clic en "Subir certificado"
3. **Padre** selecciona archivo (JPG/PNG/PDF, ≤ 5MB)
4. **Frontend** valida tipo y tamaño del archivo (RN-08)
5. **Frontend** envía `POST /api/v1/certificates/upload`:
   - Body: `multipart/form-data` con `{ file, attendance_id }`
6. **Backend** — Middleware `authMiddleware` (rol: padre)
7. **Backend** — Service `certificateService.upload()`:
   - Re-valida tipo MIME y tamaño
   - Sube archivo a Cloudinary (o Railway Volume)
   - Asocia URL al registro `attendances` (no cambia estado aún)
8. **Frontend** muestra mensaje: "Certificado subido. El preceptor lo revisará."
9. **Preceptor** inicia sesión, ve alerta de certificados pendientes
10. **Preceptor** accede al detalle de la inasistencia, ve el certificado
11. **Preceptor** confirma justificación → `PUT /api/v1/attendances/:id/justify`
12. **Backend** cambia `is_justified = true` + registra `justification_note` + operación irreversible (RN-07)
13. **Backend** devuelve 200
14. **Frontend** actualiza estado a "justificada" visible para el padre

**Casos de error**:
| Condición | Código | Manejo |
|-----------|:------:|--------|
| Archivo inválido (>5MB o tipo no permitido) | 400 | "El archivo debe ser JPG, PNG o PDF y no superar 5MB" |
| Inasistencia ya justificada | 409 | "Esta inasistencia ya fue justificada" (RN-07) |
| Alumno no vinculado al padre | 403 | "No tienes permisos para este alumno" (RN-03) |

---

## Flujo 6: Creación de tarea con generación automática de submissions

**Disparador**: El docente crea una nueva tarea para un curso
**Actor**: Docente

**Pasos**:
1. **Docente** accede al panel de tareas y selecciona "Nueva tarea"
2. **Frontend** muestra formulario: título, descripción, materia (de las asignadas), fecha de vencimiento
3. **Docente** completa y confirma
4. **Frontend** valida que `due_date >= today` (RN-13)
5. **Frontend** envía `POST /api/v1/tasks`:
   - Body: `{ title, description, subject_id, due_date }`
6. **Backend** — authMiddleware + roleMiddleware (rol = docente)
7. **Backend** — Service `taskService.createTask()`:
    - Inicia **transacción Sequelize** (RN-14)
    - Crea registro en `tasks` con `teacher_id = req.user.id`
    - Busca todos los `students` del curso asociado a la `subject_id`
    - Para cada alumno, crea registro en `task_submissions` con `status = 'pendiente'`
    - Si alguna creación falla → ROLLBACK completo
    - Si todo OK → COMMIT
8. **Backend** devuelve 201 con `{ task, submissions_count: N }`
9. **Frontend** redirige al listado de tareas del curso

**Casos de error**:
| Condición | Código | Manejo |
|-----------|:------:|--------|
| due_date anterior a hoy | 400 | "La fecha de vencimiento no puede ser anterior a la fecha actual" |
| Materia no asignada al docente | 403 | "No tenés asignada esta materia" |
| Error en transacción (ej: BD caída) | 500 | ROLLBACK automático + "Error al crear la tarea. Intente nuevamente" |

---

## Flujo 7: Ciclo de vida de una licencia docente

**Disparador**: Un docente necesita solicitar una licencia
**Actores**: Docente, Administrador

**Pasos**:
1. **Docente** accede al formulario de licencias
2. **Docente** completa: tipo (Enfermedad/Personal/Gremial), fecha inicio, fecha fin
3. **Frontend** valida: `end_date >= start_date` (RN-20)
4. **Frontend** envía `POST /api/v1/teacher-leaves`:
   - Body: `{ leave_type, start_date, end_date, notes }`
5. **Backend** — Calcula `days_used = end_date - start_date + 1`
6. **Backend** — Crea licencia con `status = 'pendiente'`
7. **Backend** devuelve 201
8. **Administrador** accede al panel de licencias pendientes
9. **Admin** ve la solicitud con detalle (docente, fechas, días)
10. **Admin** aprueba o rechaza → `PUT /api/v1/teacher-leaves/:id/status`
    - Body: `{ status: 'aprobada' | 'rechazada' }`
11. **Backend** — Service `teacherLeaveService.updateStatus()`:
    - Verifica que quien aprueba es admin (RN-19)
    - Cambia estado y registra `approved_by = req.user.id`
    - Si ya estaba aprobada/rechazada → HTTP 409
12. **Backend** devuelve 200
13. **Docente** puede consultar el resultado en su panel (US-022)

**Casos de error**:
| Condición | Código | Manejo |
|-----------|:------:|--------|
| Fecha fin < fecha inicio | 400 | "La fecha de fin no puede ser anterior a la fecha de inicio" |
| Licencia ya procesada | 409 | "Esta licencia ya fue aprobada/rechazada" |
| Usuario no es admin | 403 | "Solo el administrador puede aprobar licencias" (RN-19) |
