# Reglas de Negocio

Cada regla posee un código único `RN-XX` para trazabilidad con las historias de usuario y los cambios. Organizadas por dominio de negocio.

---

## Dominio: Autenticación y Acceso (RN-AU)

| ID | Regla | Justificación |
|----|-------|---------------|
| RN-01 | Cada usuario debe tener exactamente un rol: `admin`, `preceptor`, `docente` o `padre`. No se permiten roles múltiples. | Simplifica el modelo de autorización. Un actor = un conjunto de permisos. Evita ambigüedades en las guardas. |
| RN-02 | Un usuario con `is_active = false` no puede autenticarse, aunque proporcione credenciales correctas. | Soporte para desactivación de cuentas sin eliminar datos históricos (soft-delete). |
| RN-03 | Un padre solo puede acceder a los datos de los alumnos que tenga explícitamente vinculados en la tabla `parent_student`. Acceso a otros alumnos debe denegarse con HTTP 403. | Privacidad de datos del alumnado. Un padre no debe ver información de otros menores. |
| RN-04 | Un docente solo puede cargar, editar o eliminar calificaciones y tareas de las materias que tenga asignadas en `teacher_subject`. Operar sobre materias no asignadas devuelve HTTP 403. | Garantiza que cada docente opere exclusivamente dentro de su competencia asignada. |

---

## Dominio: Asistencias (RN-AS)

| ID | Regla | Justificación |
|----|-------|---------------|
| RN-05 | Solo puede existir un registro de asistencia por alumno por fecha (unicidad `student_id + date`). Crear un duplicado devuelve HTTP 409. | Un alumno no puede tener dos estados de asistencia diferentes para el mismo día. |
| RN-06 | Solo un preceptor o administrador puede registrar o modificar el estado de una inasistencia. Docentes y padres tienen acceso de solo lectura. | El registro de asistencia es función del personal no académico (preceptor). |
| RN-07 | Una inasistencia justificada no puede revertirse a no justificada. Operación de solo ida. | Evita manipulación retroactiva de justificaciones. Una vez documentada, la justificación es permanente. |
| RN-08 | La carga de un certificado admite únicamente `image/jpeg`, `image/png` o `application/pdf`, con tamaño máximo de 5 MB. | Restricción técnica estándar para subida de documentos. Previene archivos maliciosos o excesivamente grandes. |
| RN-09 | El sistema debe mantener un resumen de asistencia por alumno con: total de días registrados, total de ausencias, ausencias justificadas y ausencias no justificadas. | Requisito funcional para preceptores y padres. El resumen es la vista más consultada. |

---

## Dominio: Calificaciones (RN-CA)

| ID | Regla | Justificación |
|----|-------|---------------|
| RN-10 | Una calificación debe tener un valor numérico entre 1.00 y 10.00 (inclusive). Valores fuera del rango se rechazan. | Escala de calificación estándar del sistema educativo argentino de nivel secundario. |
| RN-11 | Cada calificación debe estar asociada a un período académico válido: `1er_trimestre`, `2do_trimestre`, `3er_trimestre` o `recuperatorio`. | Los períodos son fijos y definidos por el ciclo lectivo. No se admiten valores libres. |
| RN-12 | El docente que creó una calificación es el único que puede editarla o eliminarla, excepto el administrador que tiene permiso universal. | Trazabilidad académica: evita que un docente modifique notas cargadas por otro colega. |

---

## Dominio: Tareas (RN-TA)

| ID | Regla | Justificación |
|----|-------|---------------|
| RN-13 | Una tarea solo puede ser creada por el docente asignado a la materia correspondiente. La fecha de vencimiento no puede ser anterior a la fecha de creación. | Consistencia lógica: no se pueden crear tareas ya vencidas. |
| RN-14 | El sistema crea automáticamente un registro `task_submission` con estado `pendiente` para cada alumno del curso al momento de crear una tarea. Debe ejecutarse de forma atómica (transacción). | Garantiza que todos los alumnos tengan su registro de entrega desde el inicio, sin acciones manuales del docente. |
| RN-15 | El estado de una entrega solo puede avanzar: `pendiente → entregada` o `pendiente → tarde`. No se permite retroceder de `entregada` a `pendiente`. | Máquina de estados unidireccional para preservar la integridad del registro de entregas. |

---

## Dominio: Notificaciones (RN-NO)

| ID | Regla | Justificación |
|----|-------|---------------|
| RN-16 | El agente no enviará una notificación del mismo tipo para el mismo alumno más de una vez por día. | Prevención de spam. Una condición crítica que persiste no debe generar notificaciones repetitivas cada ciclo. |
| RN-17 | Cada notificación enviada (exitosa o fallida) debe registrarse en `notification_logs` para auditoría. | Trazabilidad obligatoria para un sistema que se comunica con familias. Permite al administrador auditar el comportamiento del bot. |
| RN-18 | El umbral de inasistencias que activa la alerta `AUSENCIAS_CRITICAS` es configurable por el administrador (valor por defecto: 10 ausencias no justificadas). | Cada institución puede tener criterios diferentes. Umbral fijo no escala. |

---

## Dominio: Licencias Docentes (RN-LI)

| ID | Regla | Justificación |
|----|-------|---------------|
| RN-19 | Un docente, preceptor o padre puede crear un registro de licencia con título y archivo adjunto opcional. No requiere aprobación. La licencia queda registrada inmediatamente. | El flujo real de la institución no requiere aprobación — el docente registra su licencia y ya. |

---

## Resumen de reglas por dominio

| Dominio | Prefijo | Cantidad |
|---------|---------|:--------:|
| Autenticación y Acceso | RN-AU | 4 |
| Asistencias | RN-AS | 5 |
| Calificaciones | RN-CA | 3 |
| Tareas | RN-TA | 3 |
| Notificaciones | RN-NO | 3 |
| Licencias Docentes | RN-LI | 1 |
| **Total** | | **19** |
