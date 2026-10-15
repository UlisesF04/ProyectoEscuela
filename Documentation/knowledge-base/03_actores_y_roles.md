# Actores y Roles

## Actores del sistema

| Actor | Descripción | Cómo interactúa | Prioridad |
|-------|-------------|-----------------|-----------|
| Administrador | Personal directivo o técnico-administrativo. Control total del sistema. | Web app (dashboard admin) | Crítico |
| Preceptor | Personal no académico encargado de la regularidad y asistencia. | Web app (panel de asistencias) | Crítico |
| Docente | Personal académico responsable de materias y cursos asignados. | Web app (panel docente) | Crítico |
| Padre / Tutor | Responsable legal del alumno. Monitoreo de desempeño. | Web app + WhatsApp (notificaciones) | Crítico |
| Bot Automatizado | Proceso automático que evalúa condiciones y notifica. | Sin interfaz — ejecución CRON + Resend API | Alta |

## Matriz RBAC — Permisos por rol

| Recurso | Administrador | Preceptor | Docente | Padre |
|---------|:------------:|:---------:|:-------:|:-----:|
| **Usuarios** | CRUD | — | — | — |
| **Cursos y materias** | CRUD | Lectura | Lectura | — |
| **Estudiantes** | CRUD | Lectura | Lectura (solo sus cursos) | — |
| **Vinculación padre-alumno** | CRUD | — | — | — |
| **Asistencias** | CRUD | CRUD | Lectura | Lectura (solo sus hijos) |
| **Justificación de asistencias** | CRUD | CRUD | — | Subir certificado |
| **Calificaciones** | Lectura | Lectura | CRUD (solo sus materias) | Lectura (solo sus hijos) |
| **Tareas** | Lectura | Lectura | CRUD (solo sus materias) | Lectura (solo sus hijos) |
| **Entregas de tareas** | Lectura | Lectura | CRUD (solo sus materias) | Lectura (solo sus hijos) |
| **Licencias docentes** | Aprobar/rechazar | — | Solicitar + consultar | — |
| **Logs de notificaciones** | Lectura | — | — | — |
| **Configuración del sistema** | CRUD | — | — | — |
| **Logs de actividad** | Lectura | — | — | — |

### Resumen de permisos por verbo

| | Admin | Preceptor | Docente | Padre |
|---|:----:|:---------:|:-------:|:-----:|
| **Crear** | Todos los recursos | Asistencias | Calificaciones, Tareas | Certificados (subida) |
| **Leer** | Todo | Todo excepto configuración | Sus materias/alumnos | Sus hijos |
| **Actualizar** | Todo | Asistencias | Calificaciones y tareas propias | — |
| **Eliminar** | Soft-delete usuarios | — | Calificaciones y tareas propias | — |

## Restricciones por actor

| Actor | Restricciones clave |
|-------|-------------------|
| Administrador | Ninguna dentro del sistema |
| Preceptor | No puede cargar/modificar calificaciones ni tareas. No gestiona cuentas. |
| Docente | Solo ve y opera sobre sus cursos/materias asignados. No justifica inasistencias. |
| Padre | Solo ve datos de sus hijos vinculados. No modifica ningún dato. |
| Bot | Sin interfaz visual. Acceso a BD vía consultas directas + endpoint interno con API Key. |

## Rutas públicas

- `POST /api/v1/auth/login` — Inicio de sesión
- Cualquier ruta no autenticada devuelve `HTTP 401 Unauthorized`
- Las rutas protegidas redirigen al login si no hay token, o a `/unauthorized` si el rol no tiene permiso
