## Why

Sin los modelos de datos no puede existir ninguna funcionalidad del sistema. Este change crea las 6 entidades fundacionales (User, Student, Course, Subject, TeacherSubject, ParentStudent) con sus migraciones, asociaciones, repositorios y seed data, estableciendo la base sobre la que se construirán auth, admin, asistencias, calificaciones y tareas.

## What Changes

- Modelos Sequelize: `User`, `Student`, `Course`, `Subject`, `TeacherSubject`, `ParentStudent` con todas las columnas, tipos, constraints e índices del modelo de datos
- Asociaciones entre modelos: belongsTo, hasMany, belongsToMany según el ERD
- Migración 001: tabla `users` con todos los atributos (email UNIQUE, role ENUM, password_hash, etc.)
- Migración 002: tablas `courses`, `subjects`, `teacher_subject`, `students`, `parent_student` con FK y constraints
- Repositorios: `userRepository`, `studentRepository`, `courseRepository`, `subjectRepository` con métodos CRUD base
- Seed data: 1 admin, 1 preceptor, 1 docente, 1 padre, 1 alumno, 1 curso, 2 materias, 1 asignación docente, 1 vínculo padre-alumno
- Tests: conexión a DB, creación de modelos, seed data, validaciones de constraints

## Capabilities

### New Capabilities
- `core-models`: Definición de modelos Sequelize para las entidades fundacionales del sistema, con migraciones, asociaciones, repositorios y seed data

### Modified Capabilities
<!-- Sin modificaciones — primer change de datos -->

## Impact

- Crea la estructura de datos que todos los módulos posteriores (auth, admin, asistencias, calificaciones, tareas, licencias, notificaciones) utilizarán
- Define las migraciones iniciales que deben correr antes que cualquier otra
- Establece el patrón Repository que será replicado en todos los módulos futuros
- La seed data permite tener datos de prueba funcionales desde el inicio
