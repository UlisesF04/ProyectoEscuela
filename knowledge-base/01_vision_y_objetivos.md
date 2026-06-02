# Visión y Objetivos

## Propósito del sistema

Transformar la comunicación escolar de un modelo pasivo y reactivo a uno activo, preventivo y en tiempo real, mediante una plataforma web integral que centralice la gestión académica (asistencias, calificaciones, tareas) y un agente automatizado de notificaciones vía WhatsApp que mantenga informadas a las familias sin que deban ingresar al sistema.

## Objetivos del sistema

| ID | Objetivo | Actor beneficiado | Métrica sugerida |
|----|----------|-------------------|------------------|
| OBJ-01 | Centralizar en una única plataforma web toda la información académica y disciplinaria (calificaciones, asistencias, tareas). | Todos | % de datos migrados a la plataforma vs. planillas externas |
| OBJ-02 | Proveer acceso diferenciado y seguro según el rol de cada actor. | Todos | Tiempo de configuración de permisos por nuevo rol; cero incidentes de acceso no autorizado |
| OBJ-03 | Transformar el modelo de comunicación escolar de pasivo a activo mediante notificaciones automáticas ante eventos críticos. | Padres, Docentes, Preceptores | % de eventos críticos notificados dentro de las 24h |
| OBJ-04 | Permitir a padres y tutores el monitoreo en tiempo real del desempeño y la regularidad de sus hijos. | Padre / Tutor | Tiempo entre registro de dato y disponibilidad para consulta |
| OBJ-05 | Facilitar la gestión operativa del preceptor centralizando el registro y justificación de inasistencias con soporte documental. | Preceptor | Reducción de tiempo en registro diario de asistencias |
| OBJ-06 | Proveer al docente herramientas ágiles para carga de calificaciones y seguimiento de entregas. | Docente | Tiempo promedio para carga completa de notas de un curso |
| OBJ-07 | Registrar y hacer consultable el estado de licencias y permisos del personal docente. | Docente, Administrador | Disponibilidad del historial de licencias en < 1 hora desde la solicitud |
| OBJ-08 | Sentar las bases técnicas para la incorporación futura de tablero analítico y comunicación interna entre actores. | Equipo técnico | Estructura de datos extensible sin breaking changes |

## Alcance MVP

- Autenticación y gestión de sesión (login/logout) con JWT
- Gestión de usuarios (CRUD para administrador) con roles: admin, preceptor, docente, padre
- Gestión de cursos y materias
- Vinculación padre ↔ alumno y docente ↔ materia
- Registro, consulta y justificación de asistencias con subida de certificados
- Carga, edición y consulta de calificaciones por período
- Creación de tareas con generación automática de entregas por alumno
- Registro de estado de entregas (pendiente/entregada/tarde)
- Dashboard parental (consulta de notas, asistencias y tareas de los hijos)
- Agente automatizado de notificaciones vía email (Resend) con 5 tipos de alerta
- Solicitud, aprobación/rechazo y consulta de licencias docentes

## Fuera de alcance (MVP)

- Tablero analítico de evolución del estudiante (post-MVP)
- Módulo de comunicación interna entre actores (chat/mensajería) (post-MVP)
- Aplicación móvil nativa (la web app es responsive)
- Integración con sistemas de gestión educativa existentes (SIU, etc.)
- Soporte multi-institución (un despliegue = una escuela)
- Refresco de tokens JWT (refresh token) — sesión de 8h sin renovación

## Métricas de éxito

| Métrica | Cómo se mide | Target MVP |
|---------|-------------|------------|
| Adopción docente | % de docentes que cargan notas en el sistema vs. planilla externa | > 80% en 1 mes |
| Reducción de brecha comunicacional | % de padres que reciben notificaciones vs. citados presencialmente por faltas | > 60% |
| Tiempo de registro de asistencia | Minutos para registrar un curso completo | < 5 minutos |
| Tiempo de actividad (uptime) | Disponibilidad de la plataforma en horario escolar | > 99.5% |
| Satisfacción de usuarios | Encuesta anónima a los 4 roles | > 3.5 / 5.0 en todos los roles |
