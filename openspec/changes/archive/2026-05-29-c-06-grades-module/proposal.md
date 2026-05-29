## Why

El sistema necesita un módulo de calificaciones para registrar, consultar y gestionar las notas de los alumnos. Es el segundo módulo operativo de la Fase 2 (Gestión Académica) y requisito para el portal parental (C-08). Sin este módulo, docentes no pueden cargar notas y padres no pueden consultar el rendimiento académico de sus hijos.

## What Changes

- Nuevo modelo `Grade` con DECIMAL(5,2) y rango 0-10
- Módulo backend `modules/grades/` con CRUD completo + filtros por materia
- Migración 004: tabla `grades`
- Endpoints REST para carga, consulta, edición y eliminación de notas
- Frontend: sección de calificaciones en `DocenteDashboard.jsx`, servicio `gradesService.js`
- Dashboard parental (C-08) consume `GET /api/v1/students/:id/grades`

## Capabilities

### New Capabilities
- `grade-registration`: Carga de calificaciones por docente con verificación de asignación (RN-04)
- `grade-history`: Consulta de historial de notas por alumno con filtro por materia
- `grade-management`: Edición y eliminación de notas (solo docente propietario, RN-12)

### Modified Capabilities
- _(ninguna — primer módulo de calificaciones)_

## Impact

- **Backend**: Nuevo módulo `modules/grades/` (controller, service, routes), nuevo modelo `Grade`, migración 004, nuevo repositorio `gradeRepository`
- **Frontend**: Nueva sección de calificaciones en `DocenteDashboard.jsx`, nuevo `gradesService.js`
- **Tests**: _(pendiente — se agregarán en iteración de QA)_
- **Reglas de negocio cubiertas**: RN-04, RN-10, RN-11, RN-12
