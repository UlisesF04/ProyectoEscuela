## Context

El sistema requiere una base de datos PostgreSQL compartida entre backend Node.js (Express + Sequelize) y agente Python (psycopg2). Es la primera implementación del schema — no hay datos preexistentes.

Actualmente existe `backend/config/database.js` con conexión Sequelize y `backend/.env.example` con vars de entorno. No hay modelos, migraciones ni seed.

## Goals / Non-Goals

**Goals:**
- Definir 13 tablas con relaciones, índices y constraints que cubran todas las HU y RN
- Migraciones Sequelize ejecutables y reversibles
- Seed data representativa para desarrollo (3 cursos, 30 estudiantes, 5 docentes, materias por curso)
- Modelos Sequelize con asociaciones y validaciones
- Soporte para RN-03 (máx 2 días hábiles atrás), RN-09 (confidencialidad por tutor), RN-11 (dedup notificaciones)

**Non-Goals:**
- No incluye datos de producción reales
- No incluye endpoints API (son CHANGES separados)
- No incluye optimización de performance (índices compuestos avanzados)

## Decisions

1. **Single schema compartido**: Backend y agente Python leen de la misma DB. El agente solo LEE datos (excepción: escribe en `notificaciones_log`). Esto evita replicación y asegura consistencia.

2. **Naming: snake_case + inglés**: Tablas y columnas en snake_case (ej. `estudiante_tutor`, `notificaciones_log`). Inglés para consistencia técnica aunque el dominio sea en español. PK siempre `id` (UUID autoincremental).

3. **Soft delete NO**: Los registros de inasistencias, calificaciones y tareas son inmutables. Ediciones se registran con `modificado_por` + `updated_at`. No se requiere borrado lógico.

4. **Timestamp con timezone**: Todos los `created_at`/`updated_at` con `TIMESTAMPTZ` para evitar problemas de zona horaria en el agente Python.

5. **RN-03 validación en backend**: La regla de "máximo 2 días hábiles atrás" se valida en la capa de aplicación (controller), no en la DB. La DB solo almacena la fecha.

6. **Relación N:N estudiante-tutor**: Tabla pivote `estudiante_tutor` para soportar múltiples tutores por estudiante y múltiples estudiantes por tutor (RN-09).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Seed data con IDs fijos puede chocar en diferentes entornos | Usar UUID autoincremental — los seed insertan sin especificar ID |
| Migraciones secuenciales pueden causar conflictos en equipo | Una sola migración inicial (001) con todo el schema. Próximas migraciones incrementales |
| El agente Python escribe en `notificaciones_log` — riesgo de inconsistencia si el backend también escribe allí | Solo el agente escribe en `notificaciones_log`. El backend solo LEE para consultas del admin |
