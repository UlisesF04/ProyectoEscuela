# VISTAS DEL SISTEMA — Mapa Completo de Pantallas

> Documento canónico de todas las vistas del programa **Optimización de la Gestión Académica y Comunicación Escolar**.
> Organizado por actor, incluyendo vista pública, componentes compartidos y funcionalidad post-MVP.

---

## 1. Mapa General de Navegación

```
[Login] ←── (sin autenticar)
   │
   ├── [Admin Dashboard] ─── Users, Courses, Students, Links, Leaves, Logs, Config
   │
   ├── [Preceptor Dashboard] ─── AttendanceRegister, AttendanceHistory, PendingCertificates
   │
   ├── [Docente Dashboard] ─── Grades, TaskManager, TaskSubmissions, MyLeaves
   │
   └── [Padre Dashboard] ─── ChildGrades, ChildAttendances, ChildTasks, UploadCertificate
                            ↑
                      (notificaciones WhatsApp del bot)
```

---

## 2. Vistas Públicas (Sin Autenticación)

### 2.1 LoginPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/login` |
| **Rol** | Todos (público) |
| **Estado** | ✅ MVP |

**Descripción**: Pantalla de inicio de sesión con formulario de email + contraseña.

**Elementos**:
- Logo / nombre del sistema
- Campo email (validación de formato)
- Campo contraseña (tipo password + toggle visibilidad)
- Botón "Ingresar" con estado de carga (loading spinner)
- Mensajes de error: credenciales inválidas, cuenta desactivada, rate limit excedido

**Interacciones**:
1. Usuario ingresa credenciales → `POST /api/v1/auth/login`
2. Éxito → guarda JWT en AuthContext → redirige al dashboard del rol
3. Error → muestra mensaje en la UI

**Mock / placeholder**:
```
┌──────────────────────────────┐
│      🏫  Gestión Escolar      │
│                              │
│  Email:  ┌────────────────┐ │
│          └────────────────┘ │
│  Contraseña: ┌──────────┐   │
│              └──────────┘   │
│                              │
│  ┌────────────────────────┐  │
│  │       INGRESAR         │  │
│  └────────────────────────┘  │
│                              │
│  ¿Olvidó su contraseña?      │
└──────────────────────────────┘
```

---

### 2.2 UnauthorizedPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/unauthorized` |
| **Rol** | Todos (cuando no tiene permiso) |
| **Estado** | ✅ MVP |

**Descripción**: Pantalla que se muestra cuando un usuario autenticado intenta acceder a una ruta para la que su rol no tiene permisos.

**Elementos**:
- Icono de advertencia/acceso denegado
- Mensaje "No tienes permisos para acceder a esta sección"
- Botón "Volver a mi dashboard" que redirige según el rol
- Botón "Cerrar sesión"

---

### 2.3 NotFoundPage (404)

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `*` (catch-all) |
| **Rol** | Todos |
| **Estado** | ✅ MVP |

**Descripción**: Pantalla para rutas inexistentes.

**Elementos**:
- "404 — Página no encontrada"
- Botón "Volver al inicio"

---

## 3. Vistas del Administrador

### 3.1 AdminDashboard (Layout)

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin` |
| **Rol** | admin |
| **Estado** | ✅ MVP (básico) / 🚀 Post-MVP (analytics) |

**Descripción**: Layout principal del panel admin con navegación lateral/superior y contenido. Incluye cards de resumen.

**MVP**: Barra de navegación + espacio para contenido + cards de resumen con números:
- Usuarios activos totales
- Cursos activos
- Alumnos registrados
- Licencias pendientes (link directo)

**Post-MVP**: Gráficos de evolución, alertas, actividad reciente.

**Navegación**:
| Opción | Sección | Ruta |
|--------|---------|------|
| Dashboard | Resumen | `/admin` |
| Usuarios | CRUD usuarios | `/admin/users` |
| Cursos | Cursos y materias | `/admin/courses` |
| Alumnos | Gestión de alumnos | `/admin/students` |
| Asignaciones | Docentes ↔ Materias | `/admin/assignments` |
| Vínculos | Padres ↔ Alumnos | `/admin/links` |
| Licencias | Aprobar/rechazar | `/admin/leaves` |
| Notificaciones | Logs del bot | `/admin/notifications` |
| Configuración | Ajustes del sistema | `/admin/config` |

---

### 3.2 AdminUsersPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/users` |
| **Rol** | admin |
| **Estado** | ✅ MVP |

**Descripción**: CRUD completo de usuarios del sistema.

**Vistas internas**:
- **Listado**: Tabla con usuarios (email, nombre, rol, estado activo/inactivo). Búsqueda por email/nombre. Filtro por rol.
- **Crear**: Modal o página con formulario: email, contraseña, nombre, apellido, rol (select), teléfono (opcional).
- **Editar**: Mismos campos que crear, pre-cargados. No muestra contraseña (solo opción de reset).
- **Desactivar**: Soft-delete (toggle is_active) con confirmación.

**Endpoints**: `GET /api/v1/users`, `POST /api/v1/users`, `PUT /api/v1/users/:id`, `DELETE /api/v1/users/:id`

**Reglas**: RN-01 (email único), RN-02 (bcrypt 12 rounds)

---

### 3.3 AdminCoursesPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/courses` |
| **Rol** | admin |
| **Estado** | ✅ MVP |

**Descripción**: Gestión de cursos y sus materias asociadas.

**Vistas internas**:
- **Listado de cursos**: Tabla con nombre, año, división, nivel. Botón "Ver materias" por fila.
- **Crear curso**: Formulario: nombre, año, división, nivel.
- **Materias del curso**: Tabla anidada o expandible con las materias. Botón "Agregar materia".
- **Crear materia**: Nombre de la materia.

**Endpoints**: `GET /api/v1/courses`, `POST /api/v1/courses`, `GET /api/v1/courses/:id/subjects`, `POST /api/v1/courses/:id/subjects`

---

### 3.4 AdminStudentsPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/students` |
| **Rol** | admin |
| **Estado** | ✅ MVP |

**Descripción**: CRUD de alumnos.

**Vistas internas**:
- **Listado**: Tabla con nombre, DNI, curso, estado activo/inactivo. Filtros por curso y estado.
- **Crear**: Nombre, apellido, DNI, fecha de nacimiento, curso (select).
- **Editar**: Mismos campos.
- **Ver**: Detalle completo del alumno con datos personales.

**Endpoints**: `GET /api/v1/students`, `POST /api/v1/students`, `PUT /api/v1/students/:id`

---

### 3.5 AdminTeacherAssignmentsPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/assignments` |
| **Rol** | admin |
| **Estado** | ✅ MVP |

**Descripción**: Asignación de docentes a materias (tabla teacher_subject).

**Vistas internas**:
- **Listado**: Tabla con docente, materia, curso. Filtros por docente y curso.
- **Asignar**: Selector de docente + selector de materia. Validación de duplicado (no asignar el mismo docente dos veces a la misma materia).

**Endpoint**: `POST /api/v1/subjects/:id/teachers`, `GET /api/v1/subjects/:id/teachers`

**Reglas**: RN-04 (docente solo opera en materias asignadas)

---

### 3.6 AdminParentLinksPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/links` |
| **Rol** | admin |
| **Estado** | ✅ MVP |

**Descripción**: Vinculación padre/tutor ↔ alumno (tabla parent_student).

**Vistas internas**:
- **Listado**: Tabla con padre, alumno, relación (madre/padre/tutor). Filtros.
- **Crear vínculo**: Selector de padre (rol=padre) + selector de alumno + tipo de relación.
- **Eliminar vínculo**: Con confirmación.

**Endpoints**: `POST /api/v1/students/:id/parents`, `GET /api/v1/students/:id/parents`

**Reglas**: RN-03 (padre solo ve datos de sus hijos vinculados)

---

### 3.7 AdminLeavesPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/leaves` |
| **Rol** | admin |
| **Estado** | ✅ MVP |

**Descripción**: Aprobación/rechazo de licencias docentes.

**Vistas internas**:
- **Pendientes**: Tarjetas o tabla con licencias en estado 'pendiente', ordenadas por fecha de solicitud. Cada tarjeta muestra: docente, tipo, fechas, días solicitados.
- **Historial**: Todas las licencias con filtros por estado, docente, fechas.
- **Acción**: Botones "Aprobar" / "Rechazar" con modal de confirmación (opcional: nota).

**Endpoints**: `GET /api/v1/teacher-leaves`, `PUT /api/v1/teacher-leaves/:id/status`

**Reglas**: RN-19 (solo admin aprueba/rechaza)

---

### 3.8 AdminNotificationLogsPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/notifications` |
| **Rol** | admin |
| **Estado** | ✅ MVP |

**Descripción**: Auditoría de todas las notificaciones enviadas por el agente Python.

**Vistas internas**:
- **Tabla de logs**: Columnas: fecha, destinatario, alumno relacionado, tipo de alerta, canal, estado (enviado/fallido).
- **Filtros**: Por tipo de alerta, estado, rango de fechas, destinatario.
- **Detalle**: Al hacer clic en un log: mensaje completo, código de error si falló, timestamp exacto.

**Endpoint**: `GET /api/v1/notifications/logs`

---

### 3.9 AdminConfigurationPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/config` |
| **Rol** | admin |
| **Estado** | ✅ MVP (básico) |

**Descripción**: Configuración del sistema.

**Opciones**:
- Umbral de ausencias críticas (entero, default: 10)
- Horario de ejecución del agente
- Toggle para habilitar/deshabilitar cada tipo de alerta
- (Futuro: personalización de mensajes WhatsApp)

**Reglas**: RN-18 (umbral configurable de ausencias críticas)

---

## 4. Vistas del Preceptor

### 4.1 PreceptorDashboard (Layout)

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/preceptor` |
| **Rol** | preceptor |
| **Estado** | ✅ MVP |

**Descripción**: Layout con navegación específica del preceptor.

**Navegación**:
| Opción | Ruta |
|--------|------|
| Registrar Asistencia | `/preceptor/attendance/register` |
| Historial de Asistencias | `/preceptor/attendance/history` |
| Justificaciones Pendientes | `/preceptor/justify` |

---

### 4.2 AttendanceRegisterPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/preceptor/attendance/register` |
| **Rol** | preceptor, admin |
| **Estado** | ✅ MVP |

**Descripción**: Registro diario de asistencia por curso. Es la vista más compleja del preceptor.

**Flujo**:
1. Selector de curso (dropdown). Selector de fecha (default: hoy).
2. Se carga la grilla de alumnos del curso seleccionado.
3. Cada fila: nombre del alumno + 3 botones de estado (presente/ausente/tarde) + indicador visual de estado actual (colores).
4. Botón "Guardar todo" que envía en batch.

**Elementos**:
- Selector de curso (carga `GET /api/v1/courses`)
- Selector de fecha (date picker)
- Grilla (`AttendanceGrid.jsx`) con filas de alumnos:
  - Columna: Apellido y Nombre
  - Columna: Estado (3 botones toggle)
  - Columna: Registrado por (nombre del preceptor)
  - Color coding: verde=presente, rojo=ausente, amarillo=tarde, gris=sin registro
- Indicador de alumnos ya registrados (icono check)
- Resumen: total alumnos, presentes, ausentes, tarde
- Botón "Guardar" (solo envía cambios no guardados)

**Endpoints**: `POST /api/v1/attendances` (individual o batch), `GET /api/v1/students?course_id=X`

**Flujo asociado**: Flujo 2 — Registro de asistencia diaria

**Mock / placeholder**:
```
┌──────────────────────────────────────────┐
│  📋 Registro de Asistencia               │
│                                          │
│  Curso: [1° A ▼]   Fecha: [26/05/2026]  │
│                                          │
│  ┌────────┬────────┬──────┬──────┬─────┐ │
│  │ Alumno │ Presente│Ausente│ Tarde│     │ │
│  ├────────┼────────┼───────┼──────┼─────┤ │
│  │ Pérez  │   ●    │   ○   │   ○  │  ✓  │ │
│  │ García │   ○    │   ●   │   ○  │  ✓  │ │
│  │ López  │   ○    │   ○   │   ●  │  ✓  │ │
│  │ Martínez│   ○   │   ○   │   ○  │     │ │
│  └────────┴────────┴───────┴──────┴─────┘ │
│                                          │
│  Resumen: 4/4 registrados                │
│  Presentes: 2  Ausentes: 1  Tarde: 1     │
│                                          │
│  [  Guardar Asistencia  ]                │
└──────────────────────────────────────────┘
```

---

### 4.3 AttendanceHistoryPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/preceptor/attendance/history` |
| **Rol** | preceptor, admin, docente (lectura), padre (solo hijos) |
| **Estado** | ✅ MVP |

**Descripción**: Historial completo de asistencias de un alumno con resumen de totales.

**Vistas internas**:
- **Buscador**: Selector de alumno (con filtro por curso) o selector de curso para ver todos.
- **Tabla**: Fecha, estado, ¿justificada?, certificado (link), registrado por.
- **Resumen**: Total de días, presentes, ausentes, tardes, justificadas, % de asistencia.
- **Filtros**: Rango de fechas, estado, justificada/no justificada.

**Endpoint**: `GET /api/v1/students/:id/attendances`

**Reglas**: RN-09 (resumen de totales disponible)

---

### 4.4 PendingCertificatesPage / JustifyAttendancePage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/preceptor/justify` |
| **Rol** | preceptor, admin |
| **Estado** | ✅ MVP |

**Descripción**: Revisión de certificados subidos por padres y justificación de inasistencias.

**Vistas internas**:
- **Lista de pendientes**: Inasistencias con certificado subido pero no justificadas aún. Cada item: alumno, fecha, enlace al certificado (abre en otra pestaña o modal), botón "Justificar".
- **Modal de confirmación**: "¿Está seguro de justificar esta inasistencia? Esta acción es irreversible." (RN-07)
- **Historial de justificadas**: Inasistencias ya justificadas con fecha de justificación.

**Endpoints**: `PUT /api/v1/attendances/:id/justify`, `POST /api/v1/certificates/upload`

**Flujo asociado**: Flujo 5 — Justificación de inasistencia

---

## 5. Vistas del Docente

### 5.1 DocenteDashboard (Layout)

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/docente` |
| **Rol** | docente |
| **Estado** | ✅ MVP |

**Descripción**: Layout con navegación específica del docente.

**Navegación**:
| Opción | Ruta |
|--------|------|
| Calificaciones | `/docente/grades` |
| Tareas | `/docente/tasks` |
| Mis Licencias | `/docente/leaves` |

---

### 5.2 GradesPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/docente/grades` |
| **Rol** | docente |
| **Estado** | ✅ MVP |

**Descripción**: Carga y gestión de calificaciones por materia y período. Es la vista principal del docente.

**Vistas internas**:
- **Selector de materia**: Dropdown con solo las materias asignadas al docente (carga `teacher_subject`).
- **Selector de período**: 1er_trimestre, 2do_trimestre, 3er_trimestre, recuperatorio.
- **Tabla de alumnos**: Cada fila: alumno + input de nota (1.00 - 10.00) + notas anteriores (historial). Los valores se cargan si ya existen para ese período.
- **Edición**: Al hacer clic en una nota existente, se habilita la edición. Botón guardar por fila o batch.
- **Promedio**: Cálculo automático del promedio por materia (visual, se actualiza en frontend).
- **Validaciones**: Rango 1-10 (RN-10), período válido (RN-11), materia asignada (RN-04).

**Endpoints**: `GET /api/v1/students/:id/grades`, `POST /api/v1/grades`, `PUT /api/v1/grades/:id`, `DELETE /api/v1/grades/:id`

**Flujo asociado**: Flujo 3 — Carga de calificación

**Mock / placeholder**:
```
┌──────────────────────────────────────────────┐
│  📝 Calificaciones                           │
│                                              │
│  Materia: [Matemática ▼]  Período: [1° Trim ▼]│
│                                              │
│  ┌──────────┬─────────┬──────────┬─────────┐ │
│  │ Alumno   │ Nota    │ Promedio │ Acción  │ │
│  ├──────────┼─────────┼──────────┼─────────┤ │
│  │ Pérez    │ [ 7.50 ]│   7.50   │  💾     │ │
│  │ García   │ [ 4.00 ]│   4.00   │  💾     │ │
│  │ López    │ [  ]    │    —     │  💾     │ │
│  └──────────┴─────────┴──────────┴─────────┘ │
│                                              │
│  [ Guardar Todas las Notas ]                 │
└──────────────────────────────────────────────┘
```

---

### 5.3 TasksPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/docente/tasks` |
| **Rol** | docente |
| **Estado** | ✅ MVP |

**Descripción**: Creación y gestión de tareas.

**Vistas internas**:
- **Listado de tareas**: Tarjetas o tabla con título, materia, fecha de vencimiento, count de entregados/pendientes. Ordenado por fecha de vencimiento (próximas primero).
- **Crear tarea**: Modal con título, descripción (textarea), materia (solo las asignadas), fecha de vencimiento (date picker, >= hoy según RN-13).
- **Editar/Eliminar**: Solo el docente propietario puede editar/eliminar.
- **Dashboard de entregas** (ver TaskSubmissionsPage): Al hacer clic en una tarea, se navega a las submissions.

**Endpoints**: `GET /api/v1/subjects/:id/tasks`, `POST /api/v1/tasks`, `PUT /api/v1/tasks/:id`, `DELETE /api/v1/tasks/:id`

**Reglas**: RN-13 (due_date >= today), RN-14 (transacción atómica task + submissions)

**Flujo asociado**: Flujo 6 — Creación de tarea con generación automática de submissions

---

### 5.4 TaskSubmissionsPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/docente/tasks/:taskId/submissions` |
| **Rol** | docente |
| **Estado** | ✅ MVP |

**Descripción**: Registro de estado de entregas para una tarea específica.

**Elementos**:
- **Header**: Título de la tarea, materia, fecha de vencimiento.
- **Tabla de alumnos**: Cada fila: alumno + estado actual (pendiente/entregada/tarde) + selector para cambiar estado.
- **Selector de estado**: Botones toggle unidireccionales (pendiente → entregada, pendiente → tarde). No se puede revertir (RN-15).
- **Color coding**: Rojo = pendiente/vencida, verde = entregada, naranja = tarde.
- **Filtros**: Por estado de entrega.

**Reglas**: RN-15 (máquina de estados unidireccional)

---

### 5.5 MyLeavesPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/docente/leaves` |
| **Rol** | docente |
| **Estado** | ✅ MVP |

**Descripción**: Solicitud y consulta de licencias del docente.

**Vistas internas**:
- **Solicitar licencia**: Formulario: tipo (select: Enfermedad, Personal, Gremial), fecha inicio, fecha fin, notas. Validación: end_date >= start_date (RN-20). Cálculo automático de días.
- **Historial**: Tabla con todas las licencias del docente: fechas, tipo, estado, días usados.
- **Resumen**: Días totales solicitados en el año.

**Endpoints**: `POST /api/v1/teacher-leaves`, `GET /api/v1/teacher-leaves/me`

**Flujo asociado**: Flujo 7 — Ciclo de vida de una licencia docente

---

## 6. Vistas del Padre / Tutor

### 6.1 PadreDashboard (Layout)

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/padre` |
| **Rol** | padre |
| **Estado** | ✅ MVP |

**Descripción**: Layout con navegación específica del padre.

**Si tiene múltiples hijos vinculados**: Selector de hijo al inicio (se mantiene en sesión o se cambia fácilmente).

**Navegación**:
| Opción | Ruta |
|--------|------|
| Calificaciones | `/padre/grades` |
| Asistencias | `/padre/attendances` |
| Tareas | `/padre/tasks` |
| Subir Certificado | `/padre/upload-certificate` |

---

### 6.2 ChildGradesPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/padre/grades` |
| **Rol** | padre |
| **Estado** | ✅ MVP |

**Descripción**: Visualización de calificaciones del hijo organizadas por materia y período.

**Elementos**:
- **Selector de hijo** (si tiene múltiples): Tabs o dropdown arriba.
- **Tabla por materia**: Materia + notas por período + promedio general.
- **Gráfico simple** (post-MVP): Evolución de notas por período.

**Reglas**: RN-03 (solo datos de hijos vinculados, HTTP 403 si no)

---

### 6.3 ChildAttendancesPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/padre/attendances` |
| **Rol** | padre |
| **Estado** | ✅ MVP |

**Descripción**: Historial de asistencias del hijo con resumen.

**Elementos**:
- **Selector de hijo** (si tiene múltiples)
- **Resumen**: Total días, presentes, ausentes, tardes, justificadas, % de asistencia
- **Tabla**: Fecha, estado, justificada (con icono), enlace a certificado si existe
- **Indicador de alerta**: Si el % de asistencia está por debajo del umbral crítico

---

### 6.4 ChildTasksPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/padre/tasks` |
| **Rol** | padre |
| **Estado** | ✅ MVP |

**Descripción**: Tareas del hijo con estado de entrega.

**Elementos**:
- **Selector de hijo** (si tiene múltiples)
- **Listado**: Materia, título, fecha de vencimiento, estado (pendiente/entregada/tarde)
- **Filtro**: Por estado (pendiente/entregadas/todas)
- **Indicador de urgencia**: Tareas próximas a vencer (≤ 2 días) resaltadas

---

### 6.5 UploadCertificatePage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/padre/upload-certificate` |
| **Rol** | padre |
| **Estado** | ✅ MVP |

**Descripción**: Subida de certificado para justificar inasistencia.

**Elementos**:
- **Selector de hijo** (si tiene múltiples)
- **Selector de inasistencia**: Dropdown con ausencias no justificadas del hijo (fecha + estado)
- **Dropzone / file picker**: Solo JPG/PNG/PDF, ≤ 5MB
- **Vista previa**: Preview del archivo seleccionado
- **Botón de subida**: Con barra de progreso
- **Mensaje de confirmación**: "Certificado subido. El preceptor lo revisará."

**Reglas**: RN-08 (tipo y tamaño de archivo), RN-07 (justificación irreversible por parte del preceptor)

**Flujo asociado**: Flujo 5 — Justificación de inasistencia

---

## 7. Vistas y Componentes Compartidos (Sistema)

### 7.1 AppRoutes (Router principal)

| Atributo | Detalle |
|----------|---------|
| **Ubicación** | `frontend/src/routes/AppRoutes.jsx` |
| **Rol** | Sistema |
| **Estado** | ✅ MVP |

**Descripción**: Definición centralizada de todas las rutas del frontend con protección por rol.

**Estructura conceptual**:
```
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/unauthorized" element={<UnauthorizedPage />} />

  {/* Admin */}
  <Route path="/admin" element={<ProtectedRoute role="admin" />}>
    <Route index element={<AdminDashboard />} />
    <Route path="users" element={<AdminUsersPage />} />
    <Route path="courses" element={<AdminCoursesPage />} />
    <Route path="students" element={<AdminStudentsPage />} />
    <Route path="assignments" element={<AdminTeacherAssignmentsPage />} />
    <Route path="links" element={<AdminParentLinksPage />} />
    <Route path="leaves" element={<AdminLeavesPage />} />
    <Route path="notifications" element={<AdminNotificationLogsPage />} />
    <Route path="config" element={<AdminConfigurationPage />} />
  </Route>

  {/* Preceptor */}
  <Route path="/preceptor" element={<ProtectedRoute role="preceptor" />}>
    <Route index element={<PreceptorDashboard />} />
    <Route path="attendance/register" element={<AttendanceRegisterPage />} />
    <Route path="attendance/history" element={<AttendanceHistoryPage />} />
    <Route path="justify" element={<PendingCertificatesPage />} />
  </Route>

  {/* Docente */}
  <Route path="/docente" element={<ProtectedRoute role="docente" />}>
    <Route index element={<DocenteDashboard />} />
    <Route path="grades" element={<GradesPage />} />
    <Route path="tasks" element={<TasksPage />} />
    <Route path="tasks/:taskId/submissions" element={<TaskSubmissionsPage />} />
    <Route path="leaves" element={<MyLeavesPage />} />
  </Route>

  {/* Padre */}
  <Route path="/padre" element={<ProtectedRoute role="padre" />}>
    <Route index element={<PadreDashboard />} />
    <Route path="grades" element={<ChildGradesPage />} />
    <Route path="attendances" element={<ChildAttendancesPage />} />
    <Route path="tasks" element={<ChildTasksPage />} />
    <Route path="upload-certificate" element={<UploadCertificatePage />} />
  </Route>

  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

---

### 7.2 ProtectedRoute (Wrapper)

| Atributo | Detalle |
|----------|---------|
| **Ubicación** | `frontend/src/routes/ProtectedRoute.jsx` |
| **Rol** | Sistema |
| **Estado** | ✅ MVP |

**Descripción**: Componente wrapper que verifica autenticación y rol antes de renderizar una ruta.

**Comportamiento**:
- Sin token → redirige a `/login`
- Token expirado → redirige a `/login`
- Rol no autorizado → redirige a `/unauthorized`
- Token válido + rol correcto → renderiza el children (Outlet de React Router)

---

### 7.3 AuthContext (Estado global de sesión)

| Atributo | Detalle |
|----------|---------|
| **Ubicación** | `frontend/src/context/AuthContext.jsx` |
| **Rol** | Sistema |
| **Estado** | ✅ MVP |

**Descripción**: Contexto global de autenticación usando Context API + useReducer.

**Estado**:
```js
{
  user: null | { id, role, first_name, last_name },
  token: null | string,
  isAuthenticated: false,
  loading: true,  // mientras verifica token existente
}
```

**Acciones**: login(token, user), logout(), checkAuth()

---

### 7.4 DataTable (Componente reutilizable)

| Atributo | Detalle |
|----------|---------|
| **Ubicación** | `frontend/src/components/DataTable.jsx` |
| **Rol** | Sistema |
| **Estado** | ✅ MVP |

**Descripción**: Tabla genérica reutilizable para listar datos con búsqueda, filtros, paginación y acciones.

**Props**: columns, data, loading, onSearch, onFilter, actions (botones por fila), emptyMessage.

---

### 7.5 LoadingSkeleton / EmptyState / ErrorBoundary

| Componente | Propósito | Estado |
|------------|-----------|--------|
| **LoadingSkeleton** | Esqueleto de carga mientras se obtienen datos (Chakra UI Skeleton) | ✅ MVP |
| **EmptyState** | Mensaje y acción cuando no hay datos ("No hay alumnos registrados") | ✅ MVP |
| **ErrorBoundary** | Captura errores de renderizado en cada dashboard | ✅ MVP |
| **ErrorAlert** | Snackbar/toast para errores de API (429, 500, etc.) | ✅ MVP |

---

## 8. Vistas Post-MVP (Futuras)

### 8.1 StudentAnalyticsPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/analytics` |
| **Rol** | admin |
| **Estado** | 🚀 Post-MVP |

**Descripción**: Tablero analítico con gráficos evolutivos del estudiante.

**Elementos**:
- Evolución de calificaciones por materia (línea de tiempo)
- Tasa de asistencia por período (bar chart)
- Comparativa entre alumnos del mismo curso
- Alertas de rendimiento decreciente
- Exportación de reportes (PDF/CSV)

---

### 8.2 InternalChatPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/chat` |
| **Rol** | Todos (según permisos) |
| **Estado** | 🚀 Post-MVP |

**Descripción**: Sistema de mensajería interna entre actores.

**Funcionalidad**:
- Chat entre docente ↔ preceptor (coordinación de asistencias)
- Chat docente ↔ administrador (temas académicos)
- Chat administrador ↔ padre (comunicación institucional)
- No incluye chat entre padres, ni chat alumno-docente (por seguridad)

---

### 8.3 AttendanceQRPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/preceptor/attendance/qr` |
| **Rol** | preceptor |
| **Estado** | 🚀 Post-MVP |

**Descripción**: Opción de registro de asistencia mediante código QR. Cada alumno tiene un QR único que el preceptor escanea para marcar presente.

---

### 8.4 ExportReportPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/reports` |
| **Rol** | admin |
| **Estado** | 🚀 Post-MVP |

**Descripción**: Generación y descarga de reportes en PDF/CSV:
- Reporte de calificaciones por curso y período
- Reporte de asistencias por alumno
- Reporte de licencias docentes
- Estadísticas generales del período

---

### 8.5 NotificationPreferencesPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/padre/notifications` |
| **Rol** | padre |
| **Estado** | 🚀 Post-MVP |

**Descripción**: Preferencias de notificaciones para el padre:
- Elegir qué tipos de alerta recibir
- Elegir canal (WhatsApp, email)
- Elegir horario de recepción (no molestar en horas nocturnas)

---

## 9. Resumen Completo de Vistas

| # | Vista | Ruta | Rol | MVP |
|:-:|-------|------|:---:|:---:|
| 1 | LoginPage | `/login` | público | ✅ |
| 2 | UnauthorizedPage | `/unauthorized` | todos | ✅ |
| 3 | NotFoundPage | `*` | todos | ✅ |
| 4 | AdminDashboard | `/admin` | admin | ✅ |
| 5 | AdminUsersPage | `/admin/users` | admin | ✅ |
| 6 | AdminCoursesPage | `/admin/courses` | admin | ✅ |
| 7 | AdminStudentsPage | `/admin/students` | admin | ✅ |
| 8 | AdminTeacherAssignmentsPage | `/admin/assignments` | admin | ✅ |
| 9 | AdminParentLinksPage | `/admin/links` | admin | ✅ |
| 10 | AdminLeavesPage | `/admin/leaves` | admin | ✅ |
| 11 | AdminNotificationLogsPage | `/admin/notifications` | admin | ✅ |
| 12 | AdminConfigurationPage | `/admin/config` | admin | ✅ |
| 13 | PreceptorDashboard | `/preceptor` | preceptor | ✅ |
| 14 | AttendanceRegisterPage | `/preceptor/attendance/register` | preceptor | ✅ |
| 15 | AttendanceHistoryPage | `/preceptor/attendance/history` | preceptor | ✅ |
| 16 | PendingCertificatesPage | `/preceptor/justify` | preceptor | ✅ |
| 17 | DocenteDashboard | `/docente` | docente | ✅ |
| 18 | GradesPage | `/docente/grades` | docente | ✅ |
| 19 | TasksPage | `/docente/tasks` | docente | ✅ |
| 20 | TaskSubmissionsPage | `/docente/tasks/:id/submissions` | docente | ✅ |
| 21 | MyLeavesPage | `/docente/leaves` | docente | ✅ |
| 22 | PadreDashboard | `/padre` | padre | ✅ |
| 23 | ChildGradesPage | `/padre/grades` | padre | ✅ |
| 24 | ChildAttendancesPage | `/padre/attendances` | padre | ✅ |
| 25 | ChildTasksPage | `/padre/tasks` | padre | ✅ |
| 26 | UploadCertificatePage | `/padre/upload-certificate` | padre | ✅ |
| 27 | StudentAnalyticsPage | `/admin/analytics` | admin | 🚀 |
| 28 | InternalChatPage | `/chat` | múltiples | 🚀 |
| 29 | AttendanceQRPage | `/preceptor/attendance/qr` | preceptor | 🚀 |
| 30 | ExportReportPage | `/admin/reports` | admin | 🚀 |
| 31 | NotificationPreferencesPage | `/padre/notifications` | padre | 🚀 |

---

## 10. Componentes Reutilizables (Compartidos entre vistas)

| Componente | Uso |
|------------|-----|
| `DataTable` | Todas las tablas del sistema (usuarios, alumnos, logs, etc.) |
| `GradeForm` | Input de calificación con validación de rango, usado en GradesPage y ChildGradesPage |
| `AttendanceGrid` | Grilla de asistencias, usado en AttendanceRegisterPage y ChildAttendancesPage |
| `ProtectedRoute` | Wrapper de todas las rutas protegidas |
| `AuthContext` | Estado global de autenticación |
| `useApi` | Hook personalizado para llamadas API con token, loading, error |
| `ErrorBoundary` | Captura de errores en cada dashboard |
| `LoadingSkeleton` | Esqueleto de carga para tablas y cards |
| `EmptyState` | Mensaje cuando no hay datos (con icono y acción) |
| `ErrorAlert` | Toast/snackbar para errores de API |
| `ChildSelector` | Dropdown para padres con múltiples hijos, usado en las 4 vistas del padre |

---

> **Leyenda**: ✅ MVP = incluido en el alcance del producto mínimo viable. 🚀 Post-MVP = planificado para futuras iteraciones.
>
> Este documento es la fuente de verdad para planificar, proponer e implementar todas las vistas del frontend.
> Cada vista listada aquí corresponde a al menos un componente de página en `frontend/src/pages/`.
