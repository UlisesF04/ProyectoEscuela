# Funcionalidades

Organizadas por **épica** y luego por **historia de usuario**. Total: 8 épicas, 22 historias de usuario.

---

## Épica 1: Autenticación y Gestión de Sesión

Prioridad épica: **Crítica (base del sistema)**

### US-001 — Inicio de sesión

**Como** usuario del sistema (cualquier rol)
**Quiero** iniciar sesión con mi email y contraseña
**Para** acceder a las funcionalidades correspondientes a mi rol

**Criterios de aceptación**:
- [ ] CA-01: Credenciales válidas + cuenta activa → JWT válido + redirección al dashboard del rol
- [ ] CA-02: Credenciales incorrectas → mensaje "Credenciales inválidas" + sin token
- [ ] CA-03: Cuenta desactivada (is_active: false) → error + sin acceso

**Reglas relacionadas**: RN-01, RN-02
**Endpoint**: `POST /api/v1/auth/login`

### US-002 — Cierre de sesión

**Como** usuario autenticado
**Quiero** cerrar mi sesión de forma explícita
**Para** proteger mi información en dispositivos compartidos

**Criterios de aceptación**:
- [ ] CA-01: Clic en "Cerrar sesión" → token eliminado del estado + redirección al login
- [ ] CA-02: Acceso a ruta protegida con token anterior → redirección al login

**Reglas relacionadas**: Ninguna
**Endpoint**: `POST /api/v1/auth/logout`

---

## Épica 2: Gestión de Usuarios y Configuración (Admin)

Prioridad épica: **Crítica (base del sistema)**

### US-003 — Crear usuario

**Como** administrador
**Quiero** crear nuevas cuentas de usuario con su rol correspondiente
**Para** que docentes, preceptores y padres puedan acceder al sistema

**Criterios de aceptación**:
- [ ] CA-01: Formulario con datos válidos + rol → usuario creado con contraseña hasheada + aparece en listado
- [ ] CA-02: Email ya existente → error "El email ya está registrado" + no se crea

**Reglas relacionadas**: RN-01
**Endpoint**: `POST /api/v1/users`

### US-004 — Vincular padre con alumno

**Como** administrador
**Quiero** vincular un padre o tutor a su hijo
**Para** que el padre pueda ver únicamente la información de ese alumno

**Criterios de aceptación**:
- [ ] CA-01: Seleccionar padre + alumno + tipo de relación → vínculo creado + padre puede ver datos
- [ ] CA-02: Vínculo duplicado → error de duplicado + no se crea

**Reglas relacionadas**: RN-03
**Endpoint**: `POST /api/v1/students/:id/parents`

### US-005 — Crear cursos y materias

**Como** administrador
**Quiero** crear cursos y sus materias asociadas
**Para** poder organizar el alumnado y asignar docentes

**Criterios de aceptación**:
- [ ] CA-01: Ingresar nombre, año y división → curso creado y disponible
- [ ] CA-02: Crear materia y asociarla a curso → materia asociada y disponible para asignar docentes

**Reglas relacionadas**: Ninguna directa (sienta base para RN-04)
**Endpoints**: `POST /api/v1/courses`, `POST /api/v1/courses/:id/subjects`

---

## Épica 3: Gestión de Asistencias (Preceptor)

Prioridad épica: **Alta**

### US-006 — Registrar asistencia diaria

**Como** preceptor
**Quiero** registrar el estado de asistencia de cada alumno para una fecha determinada
**Para** mantener un historial preciso de la regularidad del alumnado

**Criterios de aceptación**:
- [ ] CA-01: Seleccionar alumno + fecha + estado (presente/ausente/tarde) → registro guardado
- [ ] CA-02: Ya existe registro para ese alumno en esa fecha → error + opción de editar

**Reglas relacionadas**: RN-05, RN-06
**Endpoint**: `POST /api/v1/attendances`

### US-007 — Justificar inasistencia con certificado

**Como** preceptor
**Quiero** justificar una inasistencia y adjuntar el certificado presentado por la familia
**Para** que quede documentado formalmente en el sistema

**Criterios de aceptación**:
- [ ] CA-01: Ausencia no justificada + certificado válido (JPG/PNG/PDF ≤ 5MB) → estado cambia a justificada + certificado accesible
- [ ] CA-02: Archivo inválido (tipo/tamaño) → error descriptivo + inasistencia no se modifica
- [ ] CA-03: Inasistencia ya justificada → rechazo de la operación

**Reglas relacionadas**: RN-07, RN-08
**Endpoints**: `PUT /api/v1/attendances/:id/justify`, `POST /api/v1/certificates/upload`

### US-008 — Consultar historial de asistencias

**Como** preceptor
**Quiero** consultar el historial completo de asistencias de cualquier alumno con resumen de totales
**Para** hacer un seguimiento de su regularidad

**Criterios de aceptación**:
- [ ] CA-01: Alumno seleccionado → detalle por fecha con estado + resumen (totales)
- [ ] CA-02: Filtros de rango de fechas o estado → listado actualizado

**Reglas relacionadas**: RN-09
**Endpoint**: `GET /api/v1/students/:id/attendances`

---

## Épica 4: Calificaciones (Docente)

Prioridad épica: **Alta**

### US-009 — Cargar calificación

**Como** docente
**Quiero** cargar la calificación de un alumno en mi materia para un período determinado
**Para** mantener el registro académico actualizado

**Criterios de aceptación**:
- [ ] CA-01: Alumno + materia asignada + período + nota entre 1 y 10 → calificación guardada
- [ ] CA-02: Materia no asignada al docente → HTTP 403
- [ ] CA-03: Valor fuera de rango 1-10 → error de validación

**Reglas relacionadas**: RN-04, RN-10, RN-11
**Endpoint**: `POST /api/v1/grades`

### US-010 — Editar o eliminar calificación

**Como** docente
**Quiero** poder corregir o eliminar una calificación que cargué previamente
**Para** rectificar errores de carga

**Criterios de aceptación**:
- [ ] CA-01: Calificación propia → modificación o eliminación inmediata
- [ ] CA-02: Calificación de otro docente → HTTP 403

**Reglas relacionadas**: RN-12
**Endpoints**: `PUT /api/v1/grades/:id`, `DELETE /api/v1/grades/:id`

---

## Épica 5: Tareas y Entregas (Docente)

Prioridad épica: **Alta**

### US-011 — Crear tarea para un curso

**Como** docente
**Quiero** crear una tarea para mi materia con fecha de vencimiento
**Para** que quede registrada y los padres puedan hacer seguimiento

**Criterios de aceptación**:
- [ ] CA-01: Título + descripción + materia + due_date → tarea creada + submissions generadas atómicamente para todos los alumnos
- [ ] CA-02: due_date anterior a la fecha actual → error de validación

**Reglas relacionadas**: RN-13, RN-14
**Endpoint**: `POST /api/v1/tasks` (transacción Sequelize)

### US-012 — Registrar entrega de tarea

**Como** docente
**Quiero** registrar si un alumno entregó una tarea a tiempo o tarde
**Para** tener un seguimiento de las entregas

**Criterios de aceptación**:
- [ ] CA-01: Submission marcada como 'entregada' o 'tarde' → estado actualizado + visible para el padre
- [ ] CA-02: Revertir 'entregada' a 'pendiente' → rechazo de la operación

**Reglas relacionadas**: RN-15
**Endpoint**: `PUT /api/v1/tasks/:taskId/submissions/:studentId`

---

## Épica 6: Consulta Parental (Padre / Tutor)

Prioridad épica: **Alta**

### US-013 — Ver calificaciones de mi hijo

**Como** padre
**Quiero** ver todas las calificaciones de mi hijo organizadas por materia y período
**Para** hacer seguimiento de su rendimiento académico

**Criterios de aceptación**:
- [ ] CA-01: Hijo vinculado → notas ordenadas por materia y período + promedio
- [ ] CA-02: Acceso a alumno no vinculado → HTTP 403

**Reglas relacionadas**: RN-03
**Endpoint**: `GET /api/v1/students/:id/grades`

### US-014 — Ver asistencias de mi hijo

**Como** padre
**Quiero** ver el historial de asistencias de mi hijo con resumen de faltas
**Para** saber si está en riesgo de perder la regularidad

**Criterios de aceptación**:
- [ ] CA-01: Acceso a sección de asistencias → listado por fecha + estado + resumen de totales

**Reglas relacionadas**: RN-03, RN-09
**Endpoint**: `GET /api/v1/students/:id/attendances`

### US-015 — Ver tareas pendientes de mi hijo

**Como** padre
**Quiero** ver las tareas asignadas a mi hijo y su estado de entrega
**Para** acompañar el cumplimiento de sus compromisos académicos

**Criterios de aceptación**:
- [ ] CA-01: Acceso a sección de tareas → cada tarea con materia, vencimiento y estado
- [ ] CA-02: Filtro por estado 'pendiente' → solo tareas no entregadas

**Reglas relacionadas**: RN-03
**Endpoint**: `GET /api/v1/students/:id/tasks`

### US-016 — Subir certificado de inasistencia

**Como** padre
**Quiero** subir un certificado que justifique la inasistencia de mi hijo
**Para** iniciar el proceso de justificación ante la institución

**Criterios de aceptación**:
- [ ] CA-01: Ausencia no justificada + archivo válido → certificado disponible para revisión del preceptor
- [ ] CA-02: Archivo inválido → error descriptivo + operación no completada

**Reglas relacionadas**: RN-08
**Endpoint**: `POST /api/v1/certificates/upload`

---

## Épica 7: Notificaciones Automáticas (Bot)

Prioridad épica: **Alta**

### US-017 — Recibir alerta de inasistencias críticas

**Como** padre
**Quiero** recibir una notificación por email cuando mi hijo acumule faltas críticas
**Para** poder intervenir a tiempo

**Criterios de aceptación**:
- [ ] CA-01: Alumno alcanza umbral configurado → padre recibe email con conteo de faltas
- [ ] CA-02: Misma condición sin cambios al día siguiente → no se reenvía (anti-spam RN-16)
- [ ] CA-03: Error de envío de email → registro en notification_logs con estado 'fallido' (RN-17)

**Reglas relacionadas**: RN-16, RN-17, RN-18
**Responsable**: Agente Python + Resend (email)

### US-018 — Recibir alerta de calificación baja

**Como** padre
**Quiero** recibir una notificación por email cuando mi hijo obtenga una calificación reprobatoria
**Para** estar informado sin necesidad de entrar al sistema

**Criterios de aceptación**:
- [ ] CA-01: Calificación < 4 registrada → padre recibe notificación con materia y nota

**Reglas relacionadas**: RN-16, RN-17
**Responsable**: Agente Python

### US-019 — Recibir alerta de tarea próxima a vencer

**Como** padre
**Quiero** recibir una notificación cuando una tarea de mi hijo esté próxima a vencer y no haya sido entregada
**Para** recordárselo con anticipación

**Criterios de aceptación**:
- [ ] CA-01: Tarea vence en ≤ 2 días + alumno no entregó → padre recibe notificación con título y fecha límite

**Reglas relacionadas**: RN-16, RN-17
**Responsable**: Agente Python

---

## Épica 8: Licencias Docentes

Prioridad épica: **Media**

### US-020 — Solicitar licencia

**Como** docente
**Quiero** registrar una solicitud de licencia con fechas y tipo
**Para** que el administrador pueda revisarla y aprobarla

**Criterios de aceptación**:
- [ ] CA-01: Datos completos → licencia en estado 'pendiente' + visible para admin
- [ ] CA-02: Fecha de fin anterior a inicio → error de validación

**Reglas relacionadas**: RN-20
**Endpoint**: `POST /api/v1/teacher-leaves`

### US-021 — Aprobar o rechazar licencia

**Como** administrador
**Quiero** aprobar o rechazar las solicitudes de licencia de los docentes
**Para** gestionar la disponibilidad del plantel

**Criterios de aceptación**:
- [ ] CA-01: Licencia en 'pendiente' → cambio a 'aprobada' o 'rechazada' + docente puede consultarlo

**Reglas relacionadas**: RN-19
**Endpoint**: `PUT /api/v1/teacher-leaves/:id/status`

### US-022 — Consultar mis licencias

**Como** docente
**Quiero** consultar mis licencias solicitadas y aprobadas con resumen de días utilizados
**Para** saber cuántos días me quedan disponibles

**Criterios de aceptación**:
- [ ] CA-01: Acceso al panel de licencias → historial + resumen de días

**Reglas relacionadas**: Ninguna
**Endpoint**: `GET /api/v1/teacher-leaves/me`

---

## Resumen por épica

| Épica | ID | Nombre | Historias | Prioridad |
|:-----|:--:|--------|:---------:|:---------:|
| 1 | EP-01 | Autenticación y sesión | US-001, US-002 | Crítica |
| 2 | EP-02 | Gestión usuarios/config (Admin) | US-003, US-004, US-005 | Crítica |
| 3 | EP-03 | Gestión asistencias (Preceptor) | US-006, US-007, US-008 | Alta |
| 4 | EP-04 | Calificaciones (Docente) | US-009, US-010 | Alta |
| 5 | EP-05 | Tareas y entregas (Docente) | US-011, US-012 | Alta |
| 6 | EP-06 | Consulta parental (Padre) | US-013, US-014, US-015, US-016 | Alta |
| 7 | EP-07 | Notificaciones automáticas (Bot) | US-017, US-018, US-019 | Alta |
| 8 | EP-08 | Licencias docentes | US-020, US-021, US-022 | Media |

**Total**: 8 épicas · 22 user stories · 20 reglas de negocio relacionadas
