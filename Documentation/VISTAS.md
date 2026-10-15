# VISTAS COMPLETAS DEL SISTEMA — Especificación para Google Stitch

> Documento canónico de todas las vistas del sistema de gestión escolar.
> Organizado por rol. Cada vista incluye: propósito, layout, componentes, datos requeridos, estados.
> Última actualización: 2026-05-29

---

## 1. VISTAS PÚBLICAS (Sin autenticación)

---

### 1.1 LoginPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/login` |
| **Propósito** | Autenticación de usuarios del sistema |
| **Layout** | Centro de pantalla, tarjeta blanca sobre fondo degradado/color institucional |

**Componentes**:
- Logo del sistema + nombre "Gestión Escolar"
- Campo email (input type="email" con validación de formato)
- Campo contraseña (input type="password" con toggle de visibilidad)
- Botón "Ingresar" con estado loading (spinner)
- Mensajes de error: "Credenciales inválidas", "Cuenta desactivada", "Demasiados intentos"

**Datos**: `POST /api/v1/auth/login` → `{ email, password }`

**Estados**:
- **Loading**: Botón deshabilitado con spinner, inputs bloqueados
- **Error**: Mensaje de error arriba del botón con color rojo
- **Rate limited**: Banner "Demasiados intentos. Intente de nuevo en X minutos"
- **Cuenta desactivada**: Error específico "Su cuenta ha sido desactivada. Contacte al administrador"

---

### 1.2 UnauthorizedPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/unauthorized` |
| **Propósito** | Mostrar cuando un usuario autenticado no tiene permisos para una sección |
| **Layout** | Centro de pantalla, minimalista |

**Componentes**:
- Icono de candado/acceso denegado grande
- Título "Acceso no autorizado"
- Subtítulo "No tienes permisos para acceder a esta sección"
- Botón "Volver a mi dashboard" (redirige según rol)
- Botón "Cerrar sesión"

---

### 1.3 NotFoundPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `*` (catch-all) |
| **Propósito** | Rutas inexistentes |
| **Layout** | Centro de pantalla |

**Componentes**:
- Número "404" grande
- "Página no encontrada"
- Botón "Volver al inicio"
- Ilustración o icono decorativo

---

## 2. VISTAS DEL ADMINISTRADOR

---

### 2.1 AdminDashboard — Resumen / Overview

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin` |
| **Propósito** | Panel principal con cards de resumen del sistema, acceso rápido a secciones |
| **Layout** | Sidebar colapsable + header con avatar + grid de summary cards |

**Componentes**:
- **Sidebar** con navegación: Dashboard, Usuarios, Cursos, Alumnos, Asignaciones, Vínculos, Licencias, Notificaciones, Configuración
- **Header**: Avatar + nombre del usuario + botón cerrar sesión
- **Summary Cards** en grid 2x2:
  - Usuarios activos totales (icono FiUsers + número + color)
  - Cursos activos (icono FiBookOpen + número)
  - Alumnos registrados (icono FiUserCheck + número)
  - Licencias pendientes (icono FiCalendar + número, link directo a /admin/leaves)
  - Notificaciones enviadas hoy (icono FiBell + número)

**Datos**: `GET /api/v1/users?is_active=true`, `GET /api/v1/courses`, `GET /api/v1/students`, `GET /api/v1/teacher-leaves?status=pending`

**Estados**:
- **Loading**: Skeleton cards animados (Chakra Skeleton)
- **Empty**: Cards con valor 0, mensaje "Aún no hay datos cargados"
- **Error**: Toast de error + cards con "—" en lugar del número

---

### 2.2 AdminUsersPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/users` |
| **Propósito** | CRUD completo de usuarios del sistema |
| **Layout** | Página completa con tabla + botón crear + modales |

**Componentes**:
- Header "Usuarios" + botón "Crear Usuario"
- **DataTable** reutilizable con columnas:
  - Estado (Badge: Activo/Inactivo con color)
  - Nombre completo
  - Email
  - Rol (Badge con color: Admin=red, Preceptor=orange, Docente=blue, Padre=green)
  - Teléfono
  - Acciones: Editar, Desactivar/Activar (toggle), Eliminar definitivo (solo inactivos)
- Filtros: búsqueda por email/nombre (input), filtro por rol (Select)
- Modal "Crear Usuario": Email, Contraseña, Nombre, Apellido, Rol (Select), Teléfono (opcional)
- Modal "Editar Usuario": mismos campos sin contraseña (opcional para cambiar)
- AlertDialog de confirmación para desactivar/eliminar

**Datos**: `GET/POST /api/v1/users`, `PUT/DELETE /api/v1/users/:id`

**Estados**:
- **Loading**: Skeleton rows en la tabla
- **Empty**: "No hay usuarios registrados. Cree el primer usuario."
- **Error crear**: Toast error con mensaje del backend
- **Duplicado email**: Error "El email ya está registrado"
- **Success**: Toast "Usuario creado/actualizado correctamente"
- **Edge case**: No se puede desactivar el propio admin logueado

---

### 2.3 AdminCoursesPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/courses` |
| **Propósito** | Gestión de cursos y sus materias asociadas |
| **Layout** | Tabla + botón crear + modal de materias expandible |

**Componentes**:
- Header "Cursos" + botón "Crear Curso"
- **DataTable**: Nombre, Año, División, Nivel, Acciones
- Modal "Crear/Editar Curso": Nombre, Año, División, Nivel (Select: Primaria/Secundaria/Terciario)
- Acción "Ver Materias" que abre modal secundario
- Modal "Materias del Curso":
  - Input para nombre de nueva materia + botón "Agregar"
  - Lista de materias existentes
- Confirmación para eliminar curso

**Datos**: `GET/POST/PUT/DELETE /api/v1/courses`, `GET/POST /api/v1/courses/:id/subjects`

**Estados**:
- **Loading**: Skeleton
- **Empty**: "No hay cursos registrados. Cree el primer curso."
- **Empty materias**: "Este curso no tiene materias aún. Agregue una usando el campo."
- **Error**: Toast error

---

### 2.4 AdminStudentsPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/students` |
| **Propósito** | CRUD de alumnos con ciclo de vida completo |
| **Layout** | Tabla + formularios modales |

**Componentes**:
- **DataTable**: Estado, Nombre, DNI, Curso, Acciones
- Filtros: por curso (Select), por estado (Select: Todos/Activos/Inactivos)
- Modal "Crear/Editar Alumno": Nombre, Apellido, DNI, Fecha de nacimiento, Curso (Select)
- Acción "Ver Padres" → modal con:
  - Lista de padres vinculados actualmente
  - Selector de padre disponible + botón "Vincular"
- Ciclo de acciones por estado:
  - **Activo**: Editar, Desactivar
  - **Inactivo**: Editar, Activar, Eliminar definitivo
- AlertDialog confirmación para eliminación permanente

**Datos**: `GET/POST /api/v1/students`, `PUT/DELETE /api/v1/students/:id`, `GET/POST /api/v1/students/:id/parents`

**Estados**:
- **Loading**: Skeleton
- **Empty**: "No hay alumnos registrados"
- **Empty padres**: "Este alumno no tiene padres vinculados. Seleccione un padre de la lista."
- **Error**: Toast error

---

### 2.5 AdminTeacherAssignmentsPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/assignments` |
| **Propósito** | Asignar docentes a materias (tabla teacher_subject) |
| **Layout** | Lista de docentes + modal de asignación |

**Componentes**:
- **DataTable** de docentes: Nombre, Email, Teléfono, Acción "Ver Materias"
- Modal "Materias de [Docente]" con dos secciones:
  - **Materias actuales**: lista con badge materia + curso + botón "Remover"
  - **Asignar nueva**: Select de curso → Select de materia → Botón "Asignar"

**Datos**: `GET /api/v1/users?role=docente`, `GET/DELETE /api/v1/subjects/:id/teachers`, `POST /api/v1/subjects/:id/teachers`

**Estados**:
- **Loading**: Skeleton doble
- **Empty asignaciones**: "Este docente no tiene materias asignadas. Use el formulario de abajo."
- **Error**: Toast error
- **Edge case**: Asignar docente ya asignado a esa materia → error de duplicado

---

### 2.6 AdminParentLinksPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/links` |
| **Propósito** | Vincular padres a alumnos (tabla parent_student) |
| **Layout** | Lista de alumnos + modal de vinculación |

**Componentes**:
- **DataTable** de alumnos: Nombre, DNI, Curso, Acción "Ver Padres"
- Modal "Padres de [Alumno]":
  - Lista de padres actuales con relación (Madre/Padre/Tutor)
  - Selector de padre (solo usuarios con rol=padre) + botón "Vincular"
  - Botón "Desvincular" por cada padre listado

**Datos**: `GET /api/v1/students`, `GET/POST /api/v1/students/:id/parents`

**Estados**:
- **Loading**: Skeleton
- **Empty**: "Este alumno no tiene padres vinculados"
- **Edge case**: Selector muestra solo usuarios con rol=padre

---

### 2.7 AdminLeavesPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/leaves` |
| **Propósito** | Aprobación/rechazo de licencias docentes |
| **Layout** | Tabs: Pendientes | Historial |

**Componentes**:
- **Tab Pendientes**: Cards o tabla con licencias en estado 'pendiente'
  - Cada card: Docente, Tipo (Enfermedad/Personal/Gremial), Fechas inicio-fin, Días solicitados
  - Botones "Aprobar" (verde) y "Rechazar" (rojo) con modal de confirmación
- **Tab Historial**: DataTable con filtros por estado, fechas, docente

**Datos**: `GET /api/v1/teacher-leaves`, `PUT /api/v1/teacher-leaves/:id/status`

**Estados**:
- **Loading**: Skeleton cards
- **Empty pendientes**: "No hay licencias pendientes de revisión"
- **Empty historial**: "No hay licencias registradas"
- **Success**: Toast "Licencia aprobada/rechazada correctamente"
- **Edge case**: Licencia ya procesada → error 409

---

### 2.8 AdminNotificationLogsPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/notifications` |
| **Propósito** | Auditoría de notificaciones enviadas por el agente Python |
| **Layout** | Tabla con filtros |

**Componentes**:
- **DataTable**: Fecha, Destinatario, Alumno relacionado, Tipo de alerta, Canal, Estado (Badge: enviado/fallido)
- Filtros: Tipo de alerta (Select), Estado (Select), Rango de fechas, Búsqueda por destinatario
- Modal de detalle: mensaje completo, código de error, timestamp exacto

**Datos**: `GET /api/v1/notifications/logs`

**Estados**:
- **Loading**: Skeleton
- **Empty**: "No hay notificaciones registradas"
- **Error**: Toast error
- **Paginación**: Si hay muchas notificaciones

---

### 2.9 AdminConfigurationPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/admin/config` |
| **Propósito** | Configuración global del sistema |
| **Layout** | Cards de configuración, una por sección |

**Componentes**:
- Card "Umbral de Ausencias Críticas": Input numérico (default: 10) + botón Guardar
- Card "Horario de Notificaciones": Input de hora (default: 18:00) + días (lunes a viernes)
- Card "Alertas habilitadas": Toggles por tipo de alerta

**Estados**:
- **Loading**: Skeleton
- **Success**: Toast "Configuración guardada"
- **Error**: Toast error

---

## 3. VISTAS DEL PRECEPTOR

---

### 3.1 PreceptorDashboard (Layout)

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/preceptor` |
| **Propósito** | Layout base con sidebar del preceptor |
| **Sidebar**: Registrar Asistencia, Historial de Asistencias, Justificaciones Pendientes |

---

### 3.2 AttendanceRegisterPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/preceptor/attendance/register` |
| **Propósito** | Registro diario de asistencia por curso |
| **Layout** | Formulario arriba + grilla de alumnos abajo |

**Componentes**:
- Selector de curso (dropdown, carga `GET /api/v1/courses`)
- Selector de fecha (date input, default: hoy)
- **AttendanceGrid**: Tabla con:
  - Alumno (Nombre y Apellido)
  - Estado actual (3 botones toggle: Presente/Ausente/Tarde)
  - Color coding: verde=presente, rojo=ausente, amarillo=tarde, gris=sin registro
  - Indicador de registrado por (nombre del preceptor)
- Resumen: Total alumnos | Presentes | Ausentes | Tardes
- Botón "Guardar" grande (solo envía cambios no guardados)
- Indicador visual de filas guardadas vs pendientes

**Datos**: `GET /api/v1/students?course_id=X`, `POST /api/v1/attendances`, `GET /api/v1/attendances?course_id=X&date=YYYY-MM-DD`

**Estados**:
- **Loading curso**: Selector deshabilitado + spinner
- **Loading alumnos**: Skeleton rows en grilla
- **Empty**: "Este curso no tiene alumnos registrados"
- **Error guardar**: Toast error + fila marcada como no guardada
- **Success**: Toast "Asistencia registrada" + resumen actualizado
- **Edge case**: Registro ya existe para alumno+fecha → se edita en vez de crear

---

### 3.3 AttendanceHistoryPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/preceptor/attendance/history` |
| **Propósito** | Historial de asistencias con resumen |
| **Layout** | Selector arriba + resumen + tabla abajo |

**Componentes**:
- Buscador: Select de alumno (con filtro por curso) O Select de curso
- **Summary Cards**: Total días, Presentes, Ausentes, Tardes, Justificadas, % asistencia
- **Tabla**: Fecha, Estado (Badge), ¿Justificada? (check/cruz), Certificado (link si existe), Registrado por
- Filtros: Rango de fechas, Estado (Select)

**Datos**: `GET /api/v1/students/:id/attendances`

**Estados**:
- **Loading**: Skeleton en resumen + tabla
- **Empty**: "No hay registros de asistencia para este alumno"
- **No selection**: "Seleccione un alumno para ver su historial"

---

### 3.4 PendingCertificatesPage (JustifyAttendancePage)

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/preceptor/justify` |
| **Propósito** | Revisión y justificación de certificados subidos por padres |
| **Layout** | Tabs: Pendientes | Historial de Justificadas |

**Componentes**:
- **Tab Pendientes**:
  - Lista de inasistencias no justificadas con certificado
  - Item: Alumno, Fecha, Enlace al certificado (abre en nueva pestaña), Botón "Justificar"
  - Modal de confirmación: "¿Está seguro de justificar esta inasistencia? **Esta acción es irreversible.**" (RN-07)
- **Tab Historial**: DataTable con justificadas

**Datos**: `GET /api/v1/attendances?certificate_exists=true`, `PUT /api/v1/attendances/:id/justify`

**Estados**:
- **Empty pendientes**: "No hay certificados pendientes de revisión"
- **Empty historial**: "No hay inasistencias justificadas aún"
- **Loading**: Skeleton
- **Success**: Toast "Inasistencia justificada correctamente"
- **Edge case**: Inasistencia ya justificada → error 409 "Ya fue justificada"

---

## 4. VISTAS DEL DOCENTE

---

### 4.1 DocenteDashboard (Layout)

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/docente` |
| **Propósito** | Layout base con sidebar del docente |
| **Sidebar**: Mis Cursos / Calificaciones, Tareas, Mis Licencias, Mi Perfil |

---

### 4.2 GradesPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/docente/grades` |
| **Propósito** | Carga de calificaciones por materia y período |
| **Layout** | Selectores arriba + tabla de alumnos con inputs |

**Componentes**:
- Selector de materia (dropdown, carga materias asignadas vía teacher_subject)
- Selector de período (1er/2do/3er Trimestre, Recuperatorio)
- Selector de tipo de calificación (Examen/Trabajo/Tarea/Oral/Otro)
- **GradesTable**:
  - Alumno (Nombre)
  - Input numérico (0-10, step 0.01, validación en tiempo real)
  - Botón guardar por fila (icono)
  - Indicador visual: guardado (check verde), pendiente (reloj), error (alerta roja)
- Botón "Guardar todas" (batch save)
- Validación: input se pone rojo si fuera de rango

**Datos**: `GET /api/v1/teacher-subjects`, `GET /api/v1/subjects/:id/students`, `POST/PUT /api/v1/grades`

**Estados**:
- **Loading**: Skeleton en tabla
- **Empty**: "No hay alumnos en esta materia" o "Seleccione una materia"
- **Error guardar**: Toast error por fila
- **Success**: Toast "Calificación guardada"
- **Edge case**: Docente sin materias → "No tiene materias asignadas. Contacte al administrador"

---

### 4.3 TasksPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/docente/tasks` |
| **Propósito** | Creación y gestión de tareas |
| **Layout** | Lista de tareas + botón crear + modal |

**Componentes**:
- Header "Tareas" + botón "Nueva Tarea"
- Selector de materia (filtra tareas)
- **TaskList** (cards o tabla):
  - Título, Materia (Badge), Fecha vencimiento (color coding: verde=+7d, amarillo=≤7d, rojo=vencida)
  - Contador: "X de Y entregadas (+ Z tarde)"
  - Acciones: Ver entregas, Editar, Eliminar
- Modal "Crear Tarea": Título, Descripción (textarea), Materia (Select), Fecha vencimiento (≥ hoy)
- Modal "Editar Tarea": mismos campos
- Confirmación para eliminar

**Datos**: `GET /api/v1/subjects/:id/tasks`, `POST/PUT/DELETE /api/v1/tasks`

**Estados**:
- **Loading**: Skeleton cards
- **Empty**: "No hay tareas creadas. Cree la primera tarea."
- **Empty por filtro**: "No hay tareas para esta materia"
- **Error crear**: Toast error
- **Edge case**: due_date < hoy → error de validación

---

### 4.4 TaskSubmissionsPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/docente/tasks/:taskId/submissions` |
| **Propósito** | Registro de estado de entregas para una tarea |
| **Layout** | Header de tarea + tabla de alumnos |

**Componentes**:
- **Task Header**: Título, Materia, Fecha vencimiento, Curso
- **SubmissionTable**:
  - Alumno (Nombre)
  - Estado actual (Badge: Pendiente/rojo, Entregada/verde, Tarde/naranja)
  - Selector de estado unidireccional (Pendiente → Entregada/Tarde, no reversible RN-15)
  - Color coding
- Botón "Guardar cambios"
- Filtro por estado

**Datos**: `GET /api/v1/tasks/:id/submissions`, `PUT /api/v1/tasks/:taskId/submissions/:studentId`

**Estados**:
- **Loading**: Skeleton
- **Empty**: "Esta tarea no tiene alumnos asignados"
- **Error**: Toast error
- **Edge case**: Revertir estado → error 400 + toast "No se puede revertir el estado de entrega"

---

### 4.5 MyLeavesPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/docente/leaves` |
| **Propósito** | Solicitud y consulta de licencias |
| **Layout** | Formulario solicitud arriba + historial abajo |

**Componentes**:
- **Solicitar Licencia** (Card):
  - Tipo (Select: Enfermedad, Personal, Gremial)
  - Fecha inicio (date), Fecha fin (date, validación ≥ inicio)
  - Notas (textarea opcional)
  - Cálculo automático de días solicitados
  - Botón "Solicitar" con confirmación
- **Historial** (DataTable): Fechas, Tipo, Días, Estado (Badge), Fecha solicitud
- **Resumen**: "Días solicitados este año: X"

**Datos**: `POST /api/v1/teacher-leaves`, `GET /api/v1/teacher-leaves/me`

**Estados**:
- **Loading**: Skeleton
- **Empty**: "No has solicitado licencias aún"
- **Success**: Toast "Licencia solicitada correctamente"
- **Edge case**: end_date < start_date → error "La fecha de fin debe ser posterior a la de inicio"

---

### 4.6 ProfileSection

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/docente/profile` |
| **Propósito** | Datos personales del docente autenticado |
| **Layout** | Cards de datos |

**Componentes**:
- Card con: Nombre, Apellido, Email, Rol, Teléfono

**Datos**: `GET /api/v1/auth/me`

**Estados**:
- **Loading**: Spinner + "Cargando perfil..."

---

## 5. VISTAS DEL PADRE / TUTOR

---

### 5.1 PadreDashboard (Layout)

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/padre` |
| **Propósito** | Layout base con sidebar del padre |
| **Sidebar**: Mis Hijos, Calificaciones, Asistencias, Tareas, Subir Certificado |

---

### 5.2 ChildSelector (Componente Compartido)

| Atributo | Detalle |
|----------|---------|
| **Propósito** | Seleccionar cuál hijo ver cuando el padre tiene múltiples hijos |
| **Variantes**: Tabs horizontales (≤3 hijos) o Dropdown (>3 hijos) |

**Datos**: `GET /api/v1/students/me/children`

**Estados**:
- **Single child**: No se muestra, usa directamente
- **No children**: "No tienes hijos vinculados. Contacta al administrador."

---

### 5.3 ChildGradesPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/padre/grades` |
| **Propósito** | Ver calificaciones del hijo organizadas por materia y período |
| **Layout** | ChildSelector + tabla de notas (read-only) |

**Componentes**:
- ChildSelector (si tiene múltiples hijos)
- Selector de período (1er/2do/3er Trimestre, Recuperatorio)
- **GradesTable** (read-only):
  - Materia, Nota (color: ≥7 verde, 4-6 amarillo, <4 rojo), Tipo, Descripción, Fecha
- Promedio general por materia
- Indicador visual de alerta si hay notas < 4

**Datos**: `GET /api/v1/students/:id/grades`

**Estados**:
- **Loading**: Skeleton
- **Empty**: "No hay calificaciones registradas para este período"
- **Edge case**: Sin permisos → 403

---

### 5.4 ChildAttendancesPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/padre/attendances` |
| **Propósito** | Historial de asistencias del hijo con resumen |
| **Layout** | ChildSelector + resumen + tabla |

**Componentes**:
- ChildSelector
- **Summary Cards**: Total días, Presentes, Ausentes, Tardes, Justificadas, % asistencia
- **Alerta visual**: Banner rojo si % asistencia < umbral crítico
- **AttendanceTable** (read-only): Fecha, Estado (Badge), ¿Justificada?, Certificado (link)

**Datos**: `GET /api/v1/students/:id/attendances`

**Estados**:
- **Loading**: Skeleton
- **Empty**: "No hay registros de asistencia para este período"
- **Alerta**: Banner si asistencia baja
- **Edge case**: Sin permisos → 403

---

### 5.5 ChildTasksPage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/padre/tasks` |
| **Propósito** | Tareas del hijo con estado de entrega |
| **Layout** | ChildSelector + filtros + lista |

**Componentes**:
- ChildSelector
- Filtro de estado (Select: Todas/Pendientes/Entregadas/Tarde)
- **TaskList** (read-only):
  - Materia (Badge)
  - Título de la tarea
  - Fecha de vencimiento (color coding)
  - Estado (Badge)
  - Indicador de urgencia si vence ≤ 2 días

**Datos**: `GET /api/v1/students/:id/tasks`

**Estados**:
- **Loading**: Skeleton
- **Empty**: "No hay tareas registradas"
- **Empty con filtro**: "No hay tareas pendientes"
- **Edge case**: Sin permisos → 403

---

### 5.6 UploadCertificatePage

| Atributo | Detalle |
|----------|---------|
| **Ruta** | `/padre/upload-certificate` |
| **Propósito** | Subir certificado para justificar inasistencia |
| **Layout** | ChildSelector + formulario de subida |

**Componentes**:
- ChildSelector
- Selector de inasistencia: Dropdown con ausencias NO justificadas del hijo
- **Dropzone**: Área drag & drop (JPG/PNG/PDF, ≤ 5MB)
  - Vista previa (thumbnail para imágenes, icono para PDF)
  - Validación de tipo y tamaño
- Botón "Subir Certificado" con barra de progreso
- Mensaje éxito: "Certificado subido correctamente. El preceptor lo revisará."

**Datos**: `GET /api/v1/students/:id/attendances?status=ausente&justified=false`, `POST /api/v1/certificates/upload`

**Estados**:
- **Loading**: Spinner en selector de inasistencias
- **Empty**: "No hay inasistencias no justificadas para este alumno"
- **Error archivo**: "Formato no válido. Solo JPG, PNG o PDF." / "El archivo excede el tamaño máximo de 5MB"
- **Success**: Toast verde + mensaje confirmación
- **Progress**: Barra de progreso durante subida
- **Edge case**: Inasistencia ya justificada → error

---

## 6. COMPONENTES COMPARTIDOS (Sistema)

---

### 6.1 DashboardLayout

| Atributo | Detalle |
|----------|---------|
| **Propósito** | Layout base para todos los dashboards por rol |
| **Props** | `sections` (array de `{ id, label, icon, component }`) |

**Componentes**:
- Sidebar colapsable (icono + texto, estado activo resaltado)
- Header: breadcrumb/título, avatar + nombre, botón cerrar sesión
- Área de contenido principal
- **Responsive**: sidebar se colapsa a hamburguer en mobile

---

### 6.2 ProtectedRoute

| Atributo | Detalle |
|----------|---------|
| **Propósito** | Wrapper de rutas que verifica auth + rol |

**Comportamiento**:
- Sin token → Navigate a `/login`
- Token expirado → logout + Navigate a `/login`
- Rol no autorizado → Navigate a `/unauthorized`
- Válido → renderiza Outlet/children

---

### 6.3 DataTable

| Atributo | Detalle |
|----------|---------|
| **Propósito** | Tabla reutilizable para listar datos con acciones |
| **Props** | `columns`, `data`, `loading`, `actions`, `onSearch`, `onFilter`, `emptyMessage`, `sortable` |

**Componentes internos**:
- Búsqueda (input)
- Filtros (custom slots)
- Tabla con header sticky
- Acciones por fila (botones con iconos)
- Paginación (opcional)
- Estados: loading (skeleton), empty (mensaje + icono)

---

### 6.4 AttendanceGrid

| Atributo | Detalle |
|----------|---------|
| **Propósito** | Grilla de asistencias reutilizable (preceptor y padre) |
| **Props** | `students`, `onStatusChange`, `readOnly`, `summary` |

**Componentes**:
- Tabla con toggle de estados (3 botones)
- Color coding por estado
- Resumen de totales

---

### 6.5 LoadingSkeleton

| Atributo | Detalle |
|----------|---------|
| **Propósito** | Placeholder animado para carga de datos |
| **Variantes**: `SkeletonTable` (filas + columnas), `SkeletonCard` (altura variable), `SkeletonText` (párrafos) |

---

### 6.6 EmptyState

| Atributo | Detalle |
|----------|---------|
| **Propósito** | Mensaje cuando no hay datos |
| **Props** | `icon`, `title`, `description`, `action` (botón opcional) |

**Ejemplos**: "No hay alumnos registrados", "No hay tareas pendientes", "Seleccione un curso para comenzar"

---

### 6.7 ErrorBoundary

| Atributo | Detalle |
|----------|---------|
| **Propósito** | Captura errores de renderizado en cada dashboard |
| **Comportamiento**: Muestra "Algo salió mal" + botón "Reintentar" + botón "Volver al inicio" |

---

### 6.8 ErrorAlert (Toast)

| Atributo | Detalle |
|----------|---------|
| **Propósito** | Notificaciones para errores de API |
| **Casos**: 401 (sesión expirada), 403 (sin permisos), 429 (rate limit), 500 (error servidor) |

**Mensajes**: "Su sesión ha expirado. Inicie sesión nuevamente.", "Demasiadas solicitudes. Espere un momento."

---

### 6.9 GradeForm

| Atributo | Detalle |
|----------|---------|
| **Propósito** | Input de calificación (docente y padre en read-only) |
| **Props** | `value`, `onChange`, `readOnly`, `subject`, `period` |
| **Validación**: Rango 0-10, step 0.01 |

---

### 6.10 ChildSelector

| Atributo | Detalle |
|----------|---------|
| **Propósito** | Selector de hijos para vistas del padre |
| **Props** | `children`, `selectedChild`, `onChange` |
| **Variantes**: Tabs (≤3 hijos), Dropdown (>3 hijos) |

---

## 7. RESUMEN COMPLETO DE VISTAS

| # | Vista | Ruta | Rol | Prioridad |
|:-:|-------|------|:---:|:---------:|
| 1 | LoginPage | `/login` | público | ✅ MVP |
| 2 | UnauthorizedPage | `/unauthorized` | todos | ✅ MVP |
| 3 | NotFoundPage | `*` | todos | ✅ MVP |
| 4 | AdminDashboard (Overview) | `/admin` | admin | ✅ MVP |
| 5 | AdminUsersPage | `/admin/users` | admin | ✅ MVP |
| 6 | AdminCoursesPage | `/admin/courses` | admin | ✅ MVP |
| 7 | AdminStudentsPage | `/admin/students` | admin | ✅ MVP |
| 8 | AdminTeacherAssignmentsPage | `/admin/assignments` | admin | ✅ MVP |
| 9 | AdminParentLinksPage | `/admin/links` | admin | ✅ MVP |
| 10 | AdminLeavesPage | `/admin/leaves` | admin | ✅ MVP |
| 11 | AdminNotificationLogsPage | `/admin/notifications` | admin | ✅ MVP |
| 12 | AdminConfigurationPage | `/admin/config` | admin | ✅ MVP |
| 13 | PreceptorDashboard (Layout) | `/preceptor` | preceptor | ✅ MVP |
| 14 | AttendanceRegisterPage | `/preceptor/attendance/register` | preceptor | ✅ MVP |
| 15 | AttendanceHistoryPage | `/preceptor/attendance/history` | preceptor | ✅ MVP |
| 16 | PendingCertificatesPage | `/preceptor/justify` | preceptor | ✅ MVP |
| 17 | DocenteDashboard (Layout) | `/docente` | docente | ✅ MVP |
| 18 | GradesPage | `/docente/grades` | docente | ✅ MVP |
| 19 | TasksPage | `/docente/tasks` | docente | ✅ MVP |
| 20 | TaskSubmissionsPage | `/docente/tasks/:taskId/submissions` | docente | ✅ MVP |
| 21 | MyLeavesPage | `/docente/leaves` | docente | ✅ MVP |
| 22 | ProfileSection | `/docente/profile` | docente | ✅ MVP |
| 23 | PadreDashboard (Layout) | `/padre` | padre | ✅ MVP |
| 24 | ChildGradesPage | `/padre/grades` | padre | ✅ MVP |
| 25 | ChildAttendancesPage | `/padre/attendances` | padre | ✅ MVP |
| 26 | ChildTasksPage | `/padre/tasks` | padre | ✅ MVP |
| 27 | UploadCertificatePage | `/padre/upload-certificate` | padre | ✅ MVP |
| 28 | StudentAnalyticsPage | `/admin/analytics` | admin | 🚀 Post-MVP |
| 29 | InternalChatPage | `/chat` | múltiples | 🚀 Post-MVP |
| 30 | AttendanceQRPage | `/preceptor/attendance/qr` | preceptor | 🚀 Post-MVP |
| 31 | ExportReportPage | `/admin/reports` | admin | 🚀 Post-MVP |
| 32 | NotificationPreferencesPage | `/padre/notifications` | padre | 🚀 Post-MVP |

### Tabla de componentes compartidos

| Componente | Uso |
|------------|-----|
| DashboardLayout | Layout base de todos los dashboards |
| DataTable | Tablas reutilizables en todo el sistema |
| AttendanceGrid | Grilla de asistencias (preceptor + padre) |
| AttendanceSummary | Cards de resumen de asistencias |
| GradeForm | Input de calificaciones |
| ChildSelector | Selector de hijos (padre) |
| ProtectedRoute | Wrapper de rutas protegidas |
| AuthContext | Estado global de autenticación |
| LoadingSkeleton | Esqueleto de carga |
| EmptyState | Estado sin datos |
| ErrorBoundary | Captura errores de render |
| ErrorAlert | Toast para errores de API |
| DashboardHeader | Header con avatar y navegación |

---

> **Leyenda**: ✅ MVP = incluido en el alcance mínimo viable. 🚀 Post-MVP = planificado para futuras iteraciones.
> **Total vistas MVP**: 27 (3 públicas + 9 admin + 4 preceptor + 5 docente + 5 padre + 1 perfil)
> **Total componentes compartidos**: 13
