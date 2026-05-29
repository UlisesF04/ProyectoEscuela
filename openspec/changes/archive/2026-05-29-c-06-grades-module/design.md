## Context

El modelo `Grade` está definido en el modelo de datos (`knowledge-base/04_modelo_de_datos.md`) pero no implementado. Los docentes necesitan cargar notas de exámenes, trabajos prácticos, tareas y orales. El rango de calificación es 0-10 según RN-10. Cada nota está asociada a un alumno y una materia, y solo el docente que carga la nota puede editarla (RN-12).

## Goals / Non-Goals

**Goals:**
- Modelo `Grade` con DECIMAL(5,2), rango 0-10, tipos (examen/trabajo/tarea/oral/otro)
- CRUD completo de calificaciones
- Verificación de que el docente está asignado a la materia (RN-04)
- Consulta de historial por alumno con filtro opcional por materia
- Frontend en `DocenteDashboard.jsx` para carga y consulta

**Non-Goals:**
- No se implementa promedio automático
- No se implementa reporte de calificaciones (boletín)
- No se implementa notificación por nota baja (eso es C-10)

## Decisions

### D-01: Rango de nota → 0 a 10 (no 1 a 10)
- **Decisión**: El rango permitido es 0-10 (inclusive), validado con `isFloat({ min: 0, max: 10 })`.
- **Motivo**: RN-10 define "rango 1-10" pero tener 0 permite representar "no entregó" o "ausente en examen". El modelo de datos usa DECIMAL(5,2) que soporta 0.00.
- **Alternativa considerada**: 1-10 estricto — rechazado por flexibilidad pedagógica.

### D-02: Propietario de la nota → `created_by` en el modelo
- **Decisión**: El campo `created_by` almacena el ID del usuario que creó la nota. Solo ese docente puede editarla (RN-12). Los admin pueden editar cualquier nota.
- **Motivo**: Consistencia con el modelo de datos. RN-12 establece que solo el docente que cargó la nota puede modificarla.

### D-03: Migración como archivo separado
- **Decisión**: La tabla `grades` se crea vía migración (patrón existente), no con `sequelize.sync()`.
- **Motivo**: Consistencia con el resto del proyecto. `sync()` está habilitado en desarrollo (app.js:90) pero migraciones son el mecanismo oficial.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Docente podría cargar nota a alumno de otra materia | Validación RN-04 en service: verifica que el docente tenga TeacherSubject para esa materia |
| Nota fuera de rango por error de tipeo | Validación en ruta (express-validator) + validación en modelo Sequelize |
| Eliminación accidental de nota | Solo admin puede eliminar (roleMiddleware). Docente puede editar pero no eliminar |
