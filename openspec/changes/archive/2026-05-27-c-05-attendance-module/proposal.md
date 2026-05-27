## Why

El sistema necesita un módulo de asistencias para registrar, consultar y justificar la asistencia diaria de los alumnos. Este es el primer módulo operativo de la Fase 2 (Gestión Académica) y es requisito directo del preceptor, quien necesita una herramienta digital para reemplazar el registro en papel. Sin este módulo, el sistema solo tiene gestión de usuarios y estructura académica, pero no datos de cursada real.

## What Changes

- Nuevo modelo `Attendance` con UNIQUE(student_id, date) y soporte para justificaciones
- Módulo backend `modules/attendances/` con CRUD completo + justificación + subida de certificados
- Migración 003: tabla `attendances`
- Endpoints REST para asistencia diaria, historial por alumno, justificación y subida de archivos
- Frontend `PreceptorDashboard.jsx` con grilla de alumnos, selector de curso+fecha y resumen de totales
- Subida de certificados (JPG/PNG/PDF ≤ 5MB) con almacenamiento local en desarrollo
- Tests de integración: registro, duplicado, justificación irreversible, permisos por rol

## Capabilities

### New Capabilities
- `attendance-registration`: Registro de asistencia diaria por alumno (presente/ausente/tarde) con protección contra duplicados (HTTP 409)
- `attendance-justification`: Justificación de inasistencias con certificado adjunto, irreversible una vez aplicada (RN-07)
- `attendance-history`: Consulta de historial de asistencias por alumno con resumen de totales (RN-09)
- `certificate-upload`: Subida de archivos JPG/PNG/PDF ≤ 5MB para justificación de inasistencias

### Modified Capabilities
- _(ninguna — no hay specs existentes que modificar)_

## Impact

- **Backend**: Nuevo módulo `modules/attendances/` (controller, service, routes), nuevo modelo `Attendance`, migración 003, nuevo repositorio `attendanceRepository`
- **Frontend**: Nuevo `PreceptorDashboard.jsx` con `AttendanceGrid.jsx`, nueva ruta `/preceptor`, nuevo servicio `attendanceService.js`
- **Config**: Posible variable de entorno `UPLOAD_DIR` para directorio de certificados
- **Tests**: Nuevo archivo `tests/attendance.test.js`
- **Reglas de negocio cubiertas**: RN-05, RN-06, RN-07, RN-08, RN-09
