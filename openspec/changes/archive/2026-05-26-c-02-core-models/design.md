# Design: C-02 Core Models

## Architecture Overview

Los modelos Sequelize se organizan en `backend/models/`, uno por entidad. Cada modelo define su tabla, columnas, validaciones e índices. Las asociaciones se centralizan en `backend/models/index.js` para evitar dependencias circulares. Los repositorios envuelven cada modelo con métodos CRUD específicos.

```
models/
├── User.js
├── Student.js
├── Course.js
├── Subject.js
├── TeacherSubject.js
├── ParentStudent.js
└── index.js  ← asociaciones centralizadas

repositories/
├── userRepository.js
├── studentRepository.js
├── courseRepository.js
└── subjectRepository.js
```

## Components

### Model: User
- **Tabla**: `users`
- **Responsibility**: Representa cualquier actor del sistema (admin, preceptor, docente, padre)
- **Asociaciones**: hasMany(TeacherSubject), hasMany(ParentStudent), hasMany(teacher_leaves), hasMany(attendances, {foreignKey: 'registered_by'}), hasMany(grades, {foreignKey: 'teacher_id'}), hasMany(tasks, {foreignKey: 'teacher_id'})
- **Índices**: UNIQUE(email), INDEX(role), INDEX(is_active)

### Model: Student
- **Tabla**: `students`
- **Responsibility**: Datos del alumno, vinculado a un curso
- **Asociaciones**: belongsTo(Course), hasMany(ParentStudent), hasMany(attendances), hasMany(grades), hasMany(task_submissions)
- **Índices**: UNIQUE(dni), INDEX(course_id), INDEX(is_active)

### Model: Course
- **Tabla**: `courses`
- **Responsibility**: Curso/división escolar (ej: "3° A")
- **Asociaciones**: hasMany(Subject), hasMany(Student)

### Model: Subject
- **Tabla**: `subjects`
- **Responsibility**: Materia perteneciente a un curso (ej: "Matemática" de "3° A")
- **Asociaciones**: belongsTo(Course), hasMany(TeacherSubject), hasMany(grades), hasMany(tasks)

### Model: TeacherSubject
- **Tabla**: `teacher_subject`
- **Responsibility**: Asignación de un docente a una materia (N:N entre users y subjects)
- **Asociaciones**: belongsTo(User), belongsTo(Subject)
- **Índices**: UNIQUE(user_id, subject_id)

### Model: ParentStudent
- **Tabla**: `parent_student`
- **Responsibility**: Vinculación entre un padre (user) y un alumno (student)
- **Asociaciones**: belongsTo(User), belongsTo(Student)
- **Índices**: UNIQUE(user_id, student_id)

## Data Model

Ver `knowledge-base/04_modelo_de_datos.md` §Entidades para especificación completa de columnas, tipos y constraints.

### Resumen de migraciones

| Migración | Tablas | Dependencias |
|-----------|--------|--------------|
| 001 | users | ninguna |
| 002 | courses, subjects, teacher_subject, students, parent_student | migración 001 |

## API Changes

Ninguno. Este change es puramente de datos y modelos. Los endpoints comienzan en C-03 (auth-system) y C-04 (admin-panel).

## Implementation Notes

### Decisión: Asociaciones en index.js
Para evitar dependencias circulares (ej: User ↔ TeacherSubject ↔ Subject), todas las asociaciones se definen en `models/index.js` después de importar todos los modelos, en lugar de dentro de cada archivo de modelo.

### Decisión: ENUM como Sequelize DataType
Los roles (admin, preceptor, docente, padre) se implementan como `DataTypes.ENUM` de Sequelize para validación a nivel BD. Alternativa considerada: integer mapping, descartada por pérdida de legibilidad en la BD.

### Decisión: soft-delete con is_active
Users y Students usan `is_active` (booleano con default true) en lugar de `paranoid: true` de Sequelize, para mantener simplicidad y evitar queries con `WHERE deleted_at IS NULL` implícitas.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Dependencias circulares entre modelos | Centralizar asociaciones en index.js, importar modelos después de definirlos |
| Migraciones fallan en ambiente productivo | Usar `sequelize-cli db:migrate` con transacciones; siempre probar migraciones en dev primero |
| Seed data con contraseñas en texto plano | Usar bcrypt.hashSync() con 12 rounds en el seed para generar password_hash válidos |
