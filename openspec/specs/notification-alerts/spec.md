# Notification Alerts

> Evaluación de condiciones y generación de alertas automáticas: ausencias críticas, riesgo de regularidad, calificación baja, tarea próxima a vencer, vencimiento de licencia. Creado por C-10 notification-agent.

## ADDED Requirements

### Requirement: Ausencias críticas
El agente SHALL detectar alumnos con ≥ X inasistencias no justificadas, donde X es configurable vía variable de entorno `AUSENCIA_UMBRAL` (defecto: 10).

#### Scenario: Alumno supera umbral de ausencias
- **WHEN** un alumno tiene más ausencias no justificadas que el umbral configurado
- **THEN** el agente SHALL generar una alerta AUSENCIAS_CRITICAS para sus padres/tutores

#### Scenario: Alumno no supera umbral
- **WHEN** un alumno tiene menos ausencias no justificadas que el umbral
- **THEN** el agente SHALL NOT generar alerta

### Requirement: Riesgo de regularidad
El agente SHALL detectar alumnos con ≥ 20% de inasistencias sobre el total de días registrados en el trimestre actual.

#### Scenario: Alumno en riesgo de regularidad
- **WHEN** un alumno tiene ≥ 20% de ausencias (justificadas o no) sobre el total de días
- **THEN** el agente SHALL generar una alerta RIESGO_REGULARIDAD para sus padres/tutores

### Requirement: Calificación baja
El agente SHALL detectar calificaciones < 4 registradas en el día actual.

#### Scenario: Calificación reprobatoria registrada hoy
- **WHEN** se registra una calificación con valor < 4 en la fecha actual
- **THEN** el agente SHALL generar una alerta CALIFICACION_BAJA para el padre del alumno

#### Scenario: Calificación aprobatoria
- **WHEN** se registra una calificación con valor ≥ 4
- **THEN** el agente SHALL NOT generar alerta

### Requirement: Tarea próxima a vencer
El agente SHALL detectar tareas con fecha de vencimiento ≤ 2 días desde la fecha actual que aún no hayan sido entregadas por el alumno.

#### Scenario: Tarea sin entregar próxima a vencer
- **WHEN** una tarea vence en 2 días o menos y el alumno tiene estado 'pendiente'
- **THEN** el agente SHALL generar una alerta TAREA_PENDIENTE para el padre del alumno

### Requirement: Vencimiento de licencia docente
El agente SHALL detectar licencias docentes aprobadas cuya fecha de fin esté a ≤ 3 días.

#### Scenario: Licencia próxima a vencer
- **WHEN** una licencia tiene end_date entre hoy y hoy+3
- **THEN** el agente SHALL generar una alerta LICENCIA_DOCENTE_VENCIMIENTO para el docente y el administrador

### Requirement: Anti-spam
El agente SHALL NOT enviar una alerta del mismo tipo para el mismo alumno más de una vez en 24 horas.

#### Scenario: Alerta ya enviada en las últimas 24h
- **WHEN** existe un registro en notification_logs del mismo tipo y student_id con sent_at < 24h
- **THEN** el agente SHALL omitir el envío y continuar con la siguiente alerta

#### Scenario: Primera alerta del día
- **WHEN** no existe registro del mismo tipo y student_id en las últimas 24h
- **THEN** el agente SHALL proceder con el envío

### Requirement: Umbral configurable
El umbral de ausencias críticas SHALL ser configurable vía la variable de entorno `AUSENCIA_UMBRAL`.

#### Scenario: Umbral personalizado
- **WHEN** la variable `AUSENCIA_UMBRAL` está configurada en `15`
- **THEN** el agente SHALL usar 15 como umbral en lugar del valor por defecto (10)

### Requirement: Ejecución programada
El agente SHALL ejecutarse una vez al día, de lunes a viernes, después de la jornada escolar (18:00 hs).

#### Scenario: Ejecución del scheduler
- **WHEN** son las 18:00 hs en un día hábil (lunes a viernes)
- **THEN** el agente SHALL ejecutar todas las evaluaciones de alertas
