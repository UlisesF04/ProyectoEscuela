# Spec: database-schema

## Overview

Schema completo de base de datos PostgreSQL con tablas, relaciones, migraciones y seed data para el sistema de gestión académica. Define la estructura de datos compartida entre backend Node.js y agente Python.

## Requirements

### Requirement: Schema contiene tabla usuarios

The system SHALL have a `usuarios` table with columns: id (PK, serial), email (UNIQUE, NOT NULL), password_hash (NOT NULL), rol (ENUM: admin, docente, tutor, NOT NULL), whatsapp_number (nullable), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ).

#### Scenario: Crear tabla usuarios
- **WHEN** migration 001 se ejecuta
- **THEN** tabla `usuarios` existe con todas las columnas y constraints definidos

### Requirement: Schema contiene tabla docentes

The system SHALL have a `docentes` table with columns: id (PK, serial), usuario_id (FK → usuarios.id, UNIQUE, NOT NULL), nombre (NOT NULL), apellido (NOT NULL), dni (UNIQUE, NOT NULL), dias_licencia_total (INTEGER, DEFAULT 15), dias_usados (INTEGER, DEFAULT 0), created_at, updated_at.

#### Scenario: Crear tabla docentes
- **WHEN** migration 001 se ejecuta
- **THEN** tabla `docentes` existe con FK a `usuarios`

### Requirement: Schema contiene tabla estudiantes

The system SHALL have an `estudiantes` table with columns: id (PK, serial), nombre (NOT NULL), apellido (NOT NULL), dni (UNIQUE, NOT NULL), curso_id (FK → cursos.id, NOT NULL), created_at, updated_at.

#### Scenario: Crear tabla estudiantes
- **WHEN** migration 001 se ejecuta
- **THEN** tabla `estudiantes` existe con FK a `cursos`

### Requirement: Schema contiene tabla cursos

The system SHALL have a `cursos` table with columns: id (PK, serial), nombre (NOT NULL), anio (INTEGER, NOT NULL), division (CHAR, NOT NULL), created_at, updated_at.

#### Scenario: Crear tabla cursos
- **WHEN** migration 001 se ejecuta
- **THEN** tabla `cursos` existe

### Requirement: Schema contiene tabla tutores

The system SHALL have a `tutores` table with columns: id (PK, serial), usuario_id (FK → usuarios.id, UNIQUE, NOT NULL), nombre (NOT NULL), apellido (NOT NULL), whatsapp_number (NOT NULL), created_at, updated_at.

#### Scenario: Crear tabla tutores
- **WHEN** migration 001 se ejecuta
- **THEN** tabla `tutores` existe con FK a `usuarios`

### Requirement: Schema contiene relacion N:N estudiante-tutor

The system SHALL have an `estudiante_tutor` junction table with columns: estudiante_id (FK → estudiantes.id), tutor_id (FK → tutores.id), PRIMARY KEY (estudiante_id, tutor_id).

#### Scenario: Crear tabla estudiante_tutor
- **WHEN** migration 001 se ejecuta
- **THEN** tabla `estudiante_tutor` existe con composite PK y FKs

### Requirement: Schema contiene tabla inasistencias

The system SHALL have an `inasistencias` table with columns: id (PK, serial), estudiante_id (FK → estudiantes.id, NOT NULL), fecha (DATE, NOT NULL), registrado_por (FK → usuarios.id, NOT NULL), modificado_por (FK → usuarios.id, nullable), justificada (BOOLEAN, DEFAULT false), created_at, updated_at. UNIQUE constraint on (estudiante_id, fecha).

#### Scenario: Crear tabla inasistencias
- **WHEN** migration 001 se ejecuta
- **THEN** tabla `inasistencias` existe con unique compuesto (estudiante_id, fecha)

### Requirement: Schema contiene tabla materias

The system SHALL have a `materias` table with columns: id (PK, serial), nombre (NOT NULL), curso_id (FK → cursos.id, NOT NULL), created_at, updated_at.

#### Scenario: Crear tabla materias
- **WHEN** migration 001 se ejecuta
- **THEN** tabla `materias` existe con FK a `cursos`

### Requirement: Schema contiene relacion N:N docente-materia

The system SHALL have a `docente_materia` junction table with columns: docente_id (FK → docentes.id), materia_id (FK → materias.id), PRIMARY KEY (docente_id, materia_id).

#### Scenario: Crear tabla docente_materia
- **WHEN** migration 001 se ejecuta
- **THEN** tabla `docente_materia` existe con composite PK y FKs

### Requirement: Schema contiene tabla calificaciones

The system SHALL have a `calificaciones` table with columns: id (PK, serial), estudiante_id (FK → estudiantes.id, NOT NULL), materia_id (FK → materias.id, NOT NULL), docente_id (FK → docentes.id, NOT NULL), nota (INTEGER, CHECK 1-10, NOT NULL), periodo (VARCHAR, NOT NULL), fecha (DATE, NOT NULL), created_at, updated_at.

#### Scenario: Crear tabla calificaciones
- **WHEN** migration 001 se ejecuta
- **THEN** tabla `calificaciones` existe con check constraint nota entre 1 y 10

### Requirement: Schema contiene tabla tareas

The system SHALL have a `tareas` table with columns: id (PK, serial), docente_id (FK → docentes.id, NOT NULL), materia_id (FK → materias.id, NOT NULL), nombre (NOT NULL), descripcion (TEXT), fecha_asignacion (DATE, NOT NULL), fecha_entrega (DATE, NOT NULL), created_at, updated_at.

#### Scenario: Crear tabla tareas
- **WHEN** migration 001 se ejecuta
- **THEN** tabla `tareas` existe con FKs a docentes y materias

### Requirement: Schema contiene tabla entrega_tareas

The system SHALL have an `entrega_tareas` table with columns: id (PK, serial), tarea_id (FK → tareas.id, NOT NULL), estudiante_id (FK → estudiantes.id, NOT NULL), entregada (BOOLEAN, DEFAULT false), fecha_entrega_real (TIMESTAMPTZ, nullable), created_at, updated_at. UNIQUE constraint on (tarea_id, estudiante_id).

#### Scenario: Crear tabla entrega_tareas
- **WHEN** migration 001 se ejecuta
- **THEN** tabla `entrega_tareas` existe con unique compuesto (tarea_id, estudiante_id)

### Requirement: Schema contiene tabla notificaciones_log

The system SHALL have a `notificaciones_log` table with columns: id (PK, serial), tipo (VARCHAR, NOT NULL), destinatario_tipo (VARCHAR: tutor/docente, NOT NULL), destinatario_id (INTEGER, NOT NULL), evento_id (VARCHAR, NOT NULL), mensaje (TEXT), estado (VARCHAR: enviado/fallido, NOT NULL), fecha_envio (TIMESTAMPTZ, NOT NULL), created_at.

#### Scenario: Crear tabla notificaciones_log
- **WHEN** migration 001 se ejecuta
- **THEN** tabla `notificaciones_log` existe

### Requirement: Seed data incluye datos de prueba representativos

The system SHALL include seed data with: 3 cursos, 5 docentes, 30 estudiantes, 5 tutores, 6 materias, asignaciones docente-materia, y relaciones estudiante-tutor.

#### Scenario: Seed carga datos basicos
- **WHEN** seeders se ejecutan
- **THEN** existen registros en usuarios, docentes, estudiantes, cursos, tutores, materias

### Requirement: Modelos Sequelize definen asociaciones

The system SHALL define Sequelize models with associations: Usuario ↔ Docente (1:1), Usuario ↔ Tutor (1:1), Estudiante ↔ Curso (N:1), Estudiante ↔ Tutor (N:N via estudiante_tutor), Docente ↔ Materia (N:N via docente_materia), Estudiante ↔ Inasistencia (1:N), Estudiante ↔ Calificacion (1:N), Estudiante ↔ EntregaTarea (1:N), Docente ↔ Tarea (1:N), Materia ↔ Calificacion (1:N), Materia ↔ Tarea (1:N).

#### Scenario: Modelos tienen asociaciones correctas
- **WHEN** modelos se importan en app.js
- **THEN** todas las asociaciones estan definidas y sequelize.sync() funciona sin errores
