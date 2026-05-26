# Modelo de Datos

## Dominios del sistema

| Dominio | Entidades | Descripción |
|---------|-----------|-------------|
| Usuarios y roles | `users`, `students` | Identidad de los actores del sistema |
| Estructura académica | `courses`, `subjects`, `teacher_subject` | Organización de cursos, materias y asignación docente |
| Vínculos familiares | `parent_student` | Relación padre/tutor ↔ alumno |
| Asistencias | `attendances` | Registro diario de asistencia con justificaciones |
| Calificaciones | `grades` | Notas por alumno, materia y período |
| Tareas y entregas | `tasks`, `task_submissions` | Actividades con seguimiento de entrega |
| Licencias | `teacher_leaves` | Solicitudes de licencia docente |
| Notificaciones | `notification_logs` | Auditoría de envíos del agente automatizado |

## ERD — Diagrama de Entidad-Relación

```
users (1) ────< parent_student >──── (1) students
  │                                        │
  │                                        │
  ├──< teacher_subject >──── (1) subjects  │
  │                              │         │
  │                              │         │
  │                              ├──< grades >────┘
  │                              │
  │                              └──< tasks >──── task_submissions >────┘
  │                                                      │
  ├──< teacher_leaves >──── (solicitante)                │
  │                                                      │
  └──< attendances >─────────────────────────────────────┘
         (registered_by)

courses (1) ────< subjects
courses (1) ────< students (course_id)
```

### Relaciones con cardinalidad

| Entidad A | Cardinalidad | Entidad B | Cardinalidad | Descripción |
|-----------|:-----------:|-----------|:-----------:|-------------|
| users | 1 ── N | teacher_subject | N | Un docente puede enseñar varias materias |
| users | 1 ── N | parent_student | N | Un padre puede tener varios hijos vinculados |
| users | 1 ── N | teacher_leaves | N | Un docente puede tener múltiples licencias |
| users | 1 ── N | attendances | N | Un preceptor registra muchas asistencias |
| users | 1 ── N | grades | N | Un docente carga muchas calificaciones |
| users | 1 ── N | tasks | N | Un docente crea muchas tareas |
| students | 1 ── N | parent_student | N | Un alumno puede tener múltiples tutores |
| students | 1 ── N | attendances | N | Un alumno tiene muchos registros de asistencia |
| students | 1 ── N | grades | N | Un alumno tiene muchas calificaciones |
| students | 1 ── N | task_submissions | N | Un alumno tiene muchas entregas |
| students | N ── 1 | courses | 1 | Un alumno pertenece exactamente a un curso |
| courses | 1 ── N | subjects | N | Un curso tiene muchas materias |
| courses | 1 ── N | students | N | Un curso tiene muchos alumnos |
| subjects | 1 ── N | teacher_subject | N | Una materia puede tener varios docentes |
| subjects | 1 ── N | grades | N | Una materia tiene muchas calificaciones |
| subjects | 1 ── N | tasks | N | Una materia tiene muchas tareas |
| tasks | 1 ── N | task_submissions | N | Una tarea tiene muchas entregas (una por alumno) |

## Entidades

### users

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| id | SERIAL | PK | Identificador único |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email de acceso al sistema |
| password_hash | VARCHAR(255) | NOT NULL | Hash bcrypt (12 rounds) |
| role | ENUM | NOT NULL | admin, preceptor, docente, padre |
| first_name | VARCHAR(100) | NOT NULL | Nombre |
| last_name | VARCHAR(100) | NOT NULL | Apellido |
| phone_whatsapp | VARCHAR(20) | NULLABLE | Número para notificaciones Twilio |
| is_active | BOOLEAN | DEFAULT true | Soft-delete / desactivación |
| created_at | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMP | DEFAULT NOW() | Fecha de última modificación |

**Índices**: UNIQUE(email), INDEX(role), INDEX(is_active)

---

### students

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| id | SERIAL | PK | Identificador único |
| first_name | VARCHAR(100) | NOT NULL | Nombre del alumno |
| last_name | VARCHAR(100) | NOT NULL | Apellido del alumno |
| dni | VARCHAR(20) | UNIQUE, NULLABLE | Documento nacional de identidad |
| birth_date | DATE | NULLABLE | Fecha de nacimiento |
| course_id | INTEGER | FK → courses(id), NOT NULL | Curso al que pertenece |
| is_active | BOOLEAN | DEFAULT true | Alumno activo en el sistema |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Índices**: UNIQUE(dni), INDEX(course_id), INDEX(is_active)

---

### parent_student

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| id | SERIAL | PK | |
| user_id | INTEGER | FK → users(id), NOT NULL | Padre/tutor |
| student_id | INTEGER | FK → students(id), NOT NULL | Alumno vinculado |
| relationship | VARCHAR(50) | NULLABLE | madre, padre, tutor, etc. |

**Índices**: UNIQUE(user_id, student_id), INDEX(student_id)

---

### courses

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| id | SERIAL | PK | |
| name | VARCHAR(100) | NOT NULL | Ej: "3° A" |
| year | INTEGER | NOT NULL | Ciclo lectivo |
| division | VARCHAR(10) | NULLABLE | División interna |
| level | VARCHAR(50) | NULLABLE | Ej: "Secundaria" |
| created_at | TIMESTAMP | DEFAULT NOW() | |

---

### subjects

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| id | SERIAL | PK | |
| name | VARCHAR(100) | NOT NULL | Ej: "Matemática" |
| course_id | INTEGER | FK → courses(id), NOT NULL | Curso al que pertenece |
| created_at | TIMESTAMP | DEFAULT NOW() | |

**Índices**: INDEX(course_id)

---

### teacher_subject

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| id | SERIAL | PK | |
| user_id | INTEGER | FK → users(id), NOT NULL | Docente |
| subject_id | INTEGER | FK → subjects(id), NOT NULL | Materia asignada |

**Índices**: UNIQUE(user_id, subject_id), INDEX(subject_id)

---

### grades

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| id | SERIAL | PK | |
| student_id | INTEGER | FK → students(id), NOT NULL | Alumno evaluado |
| subject_id | INTEGER | FK → subjects(id), NOT NULL | Materia |
| teacher_id | INTEGER | FK → users(id), NOT NULL | Docente que cargó la nota |
| value | DECIMAL(4,2) | NOT NULL, CHECK(1.00 ≤ value ≤ 10.00) | Calificación |
| period | ENUM | NOT NULL | 1er_trimestre, 2do_trimestre, 3er_trimestre, recuperatorio |
| grade_date | DATE | NOT NULL | Fecha de registro |
| notes | TEXT | NULLABLE | Observaciones |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Índices**: INDEX(student_id, subject_id), INDEX(teacher_id), INDEX(period)

---

### attendances

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| id | SERIAL | PK | |
| student_id | INTEGER | FK → students(id), NOT NULL | Alumno |
| date | DATE | NOT NULL | Fecha de la clase |
| status | ENUM | NOT NULL | presente, ausente, tarde |
| is_justified | BOOLEAN | DEFAULT false | ¿Está justificada? |
| justification_note | TEXT | NULLABLE | Nota de justificación |
| certificate_url | VARCHAR(500) | NULLABLE | URL del certificado subido |
| registered_by | INTEGER | FK → users(id), NOT NULL | Preceptor que registró |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Índices**: UNIQUE(student_id, date), INDEX(date), INDEX(status), INDEX(is_justified)

---

### tasks

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| id | SERIAL | PK | |
| title | VARCHAR(255) | NOT NULL | Título de la tarea |
| description | TEXT | NULLABLE | Descripción detallada |
| subject_id | INTEGER | FK → subjects(id), NOT NULL | Materia |
| teacher_id | INTEGER | FK → users(id), NOT NULL | Docente que creó |
| due_date | DATE | NOT NULL, CHECK(due_date >= fecha_creación) | Fecha de vencimiento |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Índices**: INDEX(subject_id), INDEX(due_date)

---

### task_submissions

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| id | SERIAL | PK | |
| task_id | INTEGER | FK → tasks(id), NOT NULL | Tarea |
| student_id | INTEGER | FK → students(id), NOT NULL | Alumno |
| status | ENUM | NOT NULL, DEFAULT 'pendiente' | pendiente, entregada, tarde |
| submitted_at | TIMESTAMP | NULLABLE | Fecha de entrega |
| notes | TEXT | NULLABLE | Observaciones del docente |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Índices**: UNIQUE(task_id, student_id), INDEX(status)

---

### teacher_leaves

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| id | SERIAL | PK | |
| user_id | INTEGER | FK → users(id), NOT NULL | Docente solicitante |
| leave_type | VARCHAR(100) | NULLABLE | Enfermedad, Personal, Gremial, etc. |
| start_date | DATE | NOT NULL | Fecha de inicio |
| end_date | DATE | NOT NULL, CHECK(end_date >= start_date) | Fecha de fin |
| days_used | INTEGER | NOT NULL | Calculado automáticamente |
| status | ENUM | DEFAULT 'pendiente' | pendiente, aprobada, rechazada |
| approved_by | INTEGER | FK → users(id), NULLABLE | Admin que aprobó/rechazó |
| notes | TEXT | NULLABLE | Observaciones |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

**Índices**: INDEX(user_id), INDEX(status)

---

### notification_logs

| Atributo | Tipo | Constraints | Descripción |
|----------|------|-------------|-------------|
| id | SERIAL | PK | |
| recipient_id | INTEGER | FK → users(id), NOT NULL | Destinatario |
| student_id | INTEGER | FK → students(id), NULLABLE | Alumno relacionado |
| type | VARCHAR(100) | NOT NULL | AUSENCIAS_CRITICAS, CALIFICACION_BAJA, etc. |
| message | TEXT | NOT NULL | Contenido del mensaje |
| channel | VARCHAR(50) | DEFAULT 'whatsapp' | Canal de envío |
| status | ENUM | NOT NULL | enviado, fallido |
| sent_at | TIMESTAMP | DEFAULT NOW() | Fecha de envío |

**Índices**: INDEX(recipient_id), INDEX(type), INDEX(sent_at), INDEX(student_id, type, sent_at)

## Seed data inicial

Para que el sistema sea funcional desde el primer login, se requiere:

1. **Al menos un usuario administrador** para poder iniciar sesión y configurar la institución
2. **Un curso de ejemplo** (ej: "1° A", year: 2026, level: "Secundaria")
3. **Dos materias de ejemplo** asociadas al curso (ej: "Matemática", "Lengua")
4. **Un docente de prueba** asignado a una materia
5. **Un preceptor de prueba** para registrar asistencias
6. **Un padre de prueba** (opcional, para validar vista parental)
7. **Un alumno de ejemplo** vinculado al curso y al padre
