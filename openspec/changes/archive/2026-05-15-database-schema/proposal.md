## Why

El proyecto necesita una base de datos relacional como única fuente de verdad compartida entre backend Node.js y agente Python. Actualmente no existe schema, migraciones ni datos de prueba. Sin esto ningún módulo (auth, inasistencias, calificaciones, notificaciones) puede funcionar.

## What Changes

- Crear migraciones Sequelize para 13 tablas con relaciones, índices y constraints
- Crear seed data con usuarios, cursos, estudiantes, docentes, tutores, materias ficticios
- Definir modelos Sequelize en `backend/models/` para cada tabla
- Actualizar `.gitignore` raíz (agregar `venv/`)

## Capabilities

### New Capabilities
- `database-schema`: Esquema completo de base de datos PostgreSQL con tablas, relaciones, migraciones y seed data para el sistema de gestión académica

### Modified Capabilities
- *(ninguna — es el primer schema del proyecto)*

## Impact

- **Backend**: `backend/models/*.js` (13 modelos Sequelize), `backend/migrations/*.js`, `backend/seeders/*.js`
- **Root**: `.gitignore` (agregar `venv/`)
- **DB**: PostgreSQL con esquema `proyecto_escuela`
- **No breaking changes**: Es el primer schema, no hay datos existentes
