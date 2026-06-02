# Decisiones y Supuestos

## Decisiones documentadas

### DD-01 — Node.js + Express como backend en lugar de Python/FastAPI o Java/Spring

| Aspecto | Detalle |
|---------|---------|
| **Decisión** | Usar Node.js 20.x LTS + Express.js 4.x para el backend de la API REST |
| **Contexto** | El equipo tiene experiencia en JavaScript. El frontend ya usa React. Se evaluó si homogeneizar con Python (mismo lenguaje que el agente) o usar un stack más enterprise. |
| **Alternativas consideradas** | **A)** Python + FastAPI — unificaría el lenguaje con el agente, mejor performance para cómputo. **B)** Java + Spring Boot — más robusto para sistemas críticos, pero mayor overhead. **C)** Node.js + Express — mismo lenguaje que frontend, equipo lo conoce. |
| **Justificación** | Express es la opción de menor fricción: el equipo ya trabaja con JS, la comunidad es amplia, y la arquitectura en capas compensa la falta de estructura impuesta por el framework. Para la escala de una escuela secundaria, Express es más que suficiente. |
| **Trade-offs aceptados** | Se sacrifica la unificación de lenguaje con el agente Python y el tipado fuerte de Java. El equipo deberá mantener dos runtimes distintos (Node y Python). |

---

### DD-02 — Chakra UI como librería de componentes en lugar de Material UI o Tailwind

| Aspecto | Detalle |
|---------|---------|
| **Decisión** | Usar Chakra UI 2.x / v3 como sistema de diseño del frontend |
| **Contexto** | Se necesita una UI accesible, responsiva y de desarrollo rápido. |
| **Alternativas** | **A)** Material UI — más componentes, pero CSS-in-JS más pesado y personalización más compleja. **B)** Tailwind CSS — máxima flexibilidad, pero requiere construir todo desde cero. **C)** Chakra UI — accesible por defecto, tema configurable, buena DX. |
| **Justificación** | Chakra UI ofrece el mejor balance entre velocidad de desarrollo y personalización. Su sistema de tema por props permite adaptar colores y espacios institucionales sin escribir CSS custom. |
| **Trade-offs aceptados** | Menos variedad de componentes que MUI. Dependencia de una librería con cambios de breaking en v3 (migración de v2 a v3 puede requerir refactor). |

---

### DD-03 — Monorepo en lugar de repositorios separados por componente

| Aspecto | Detalle |
|---------|---------|
| **Decisión** | Mantener frontend, backend y agente en un mismo repositorio GitHub (monorepo) |
| **Contexto** | El proyecto tiene 3 artefactos desplegables que evolucionan juntos. |
| **Alternativas** | **A)** Repos separados (frontend/, backend/, agent/) — equipos pueden trabajar independientemente, pero más overhead de gestión. **B)** Monorepo simple con subcarpetas — todo en un repo, deploys independientes por CI/CD. |
| **Justificación** | El equipo es chico (4 personas). Un monorepo reduce la fricción de coordinación entre repos, simplifica las code reviews (un solo PR por cambio full-stack) y evita la duplicación de configuración CI/CD. |
| **Trade-offs aceptados** | El historial de git crece más rápido. No se puede clonar solo un componente. Las dependencias cruzadas requieren commits coordinados. |

---

### DD-04 — JWT stateless sin refresh token en MVP

| Aspecto | Detalle |
|---------|---------|
| **Decisión** | No implementar refresh token. Sesión JWT con expiración de 8 horas |
| **Contexto** | La sesión está pensada para la jornada escolar (ingreso, recreos, salida). No se espera que un usuario mantenga sesión activa más de un día. |
| **Alternativas** | **A)** JWT + refresh token — más seguro, permite rotación de tokens. **B)** Solo JWT — más simple, si el token expira el usuario vuelve a login. **C)** Sesiones server-side con express-session — estado en servidor, más overhead. |
| **Justificación** | Para un MVP escolar, la expiración de 8h es aceptable. Si un usuario necesita seguir trabajando, vuelve a login (una vez al día). Se simplifica la implementación y se evita la complejidad de rotación de refresh tokens. |
| **Trade-offs aceptados** | Si el token es robado, es válido por hasta 8h. No hay invalidación server-side (no hay blacklist de tokens). Se mitiga con HTTPS obligatorio y corta duración. |

---

### DD-05 — Context API en lugar de Redux/Zustand para estado global

| Aspecto | Detalle |
|---------|---------|
| **Decisión** | Usar Context API + useReducer para el estado global del frontend |
| **Contexto** | El estado global se limita principalmente a autenticación (usuario activo, token, rol). |
| **Alternativas** | **A)** Redux — estándar de la industria, pero mucho boilerplate para este alcance. **B)** Zustand — más liviano que Redux, buena DX. **C)** Context API + useReducer — nativo de React, sin dependencias externas. |
| **Justificación** | El estado compartido es mínimo: solo el contexto de autenticación. No hay carritos de compra ni flujos multi-paso complejos. Context API es suficiente y evita agregar una dependencia que el 90% del código no usará. |
| **Trade-offs aceptados** | Si el frontend crece en complejidad (ej: dashboard analítico con filtros globales), puede requerir migrar a Zustand o Redux. La decisión es reevaluable en fase 2. |

---

### DD-06 — Agente Python separado en lugar de tareas CRON dentro del backend Node.js

| Aspecto | Detalle |
|---------|---------|
| **Decisión** | El agente de notificaciones corre como un proceso Python independiente, no como una tarea dentro del backend Node.js |
| **Contexto** | Las notificaciones requieren evaluar condiciones contra la BD, procesar datos y enviar emails. |
| **Alternativas** | **A)** node-cron dentro del backend Express — mismo lenguaje, mismo código base. **B)** Worker Node.js separado — mismo lenguaje que el backend, proceso independiente. **C)** Worker Python separado — requiere mantener dos runtimes. |
| **Justificación** | Python tiene mejor ecosistema para procesamiento de datos (Pandas, SQL directo) y la integración con Resend vía SDK Python es simple y no requiere aprobación externa. Separar el agente evita que tareas pesadas (consultas complejas, loops de alumnos) bloqueen el event loop de Node.js. |
| **Trade-offs aceptados** | Mantener dos runtimes (Node + Python). El agente consulta la BD directamente vía SQL en lugar de usar la API REST, lo que duplica la lógica de acceso a datos. |

> **Decisión reevaluada:** originalmente Twilio WhatsApp, reemplazado por Resend email por simplicidad (Jun 2026)

---

### DD-07 — PostgreSQL como motor de base de datos en lugar de MySQL o SQLite

| Aspecto | Detalle |
|---------|---------|
| **Decisión** | Usar PostgreSQL 15.x |
| **Contexto** | Se necesita una base relacional con soporte ACID, tipos ENUM, transacciones, y buena integración con Sequelize. |
| **Alternativas** | **A)** MySQL — similar, pero menos soporte nativo para ENUM y arrays. **B)** SQLite — no escala, no soporta concurrencia. **C)** PostgreSQL — relacional robusto, soporte completo de ACID, buen ecosistema. |
| **Justificación** | PostgreSQL es el estándar de facto para aplicaciones web modernas. Su soporte de transacciones ACID es crítico para la creación atómica de task_submissions (RN-14) y la consistencia de datos académicos. Railway ofrece PostgreSQL administrado sin costo inicial. |
| **Trade-offs aceptados** | Mayor consumo de recursos que SQLite. Configuración más compleja que MySQL para features avanzadas (particionamiento, replicación) que no se usarán en MVP. |

---

## Supuestos inferidos

### SU-01 — Una sola institución por despliegue

| Aspecto | Detalle |
|---------|---------|
| **Supuesto** | El sistema se despliega para una sola escuela secundaria. No hay multi-tenancy |
| **Origen** | Los documentos fuente hablan de "la institución" en singular. No hay mención de aislar datos entre escuelas. El modelo de datos no incluye un campo `school_id` ni entidad `schools`. |
| **Riesgo si es falso** | Si se necesita soportar múltiples escuelas en el futuro, habrá que agregar una entidad `schools`, migrar todos los datos existentes con una escuela por defecto, y agregar filtros en todas las consultas. Es un cambio estructural grande. |
| **Cómo validar** | Preguntar al equipo si el alcance incluye o excluye explícitamente el multi-tenancy. |

### SU-02 — Jornada escolar como unidad de tiempo de sesión

| Aspecto | Detalle |
|---------|---------|
| **Supuesto** | Los usuarios usan el sistema durante la jornada escolar (turno mañana/tarde) y cierran sesión al finalizar |
| **Origen** | La expiración del JWT está fijada en 8h, y no hay refresh token. |
| **Riesgo si es falso** | Si los docentes/preceptores necesitan mantener sesión abierta por más de un día (ej: trabajan desde casa después del horario escolar), la expiración de 8h será frustrante y requerirá re-logueo constante. |
| **Cómo validar** | Encuestar a usuarios reales sobre su patrón de uso esperado. |

### SU-03 — Los padres tienen acceso a internet y email

| Aspecto | Detalle |
|---------|---------|
| **Supuesto** | Todos los padres/tutores tienen acceso a internet y una dirección de email activa |
| **Origen** | El canal de notificaciones es email vía Resend. La web app requiere internet. |
| **Riesgo si es falso** | Padres sin acceso a email quedarían excluidos de las notificaciones y del acceso al sistema. |
| **Cómo validar** | Relevar el porcentaje de familias con acceso a email en la institución objetivo. Considerar un canal alternativo (SMS o llamada telefónica) para casos sin datos. |

### SU-04 — El preceptor registra asistencias una vez por día

| Aspecto | Detalle |
|---------|---------|
| **Supuesto** | El preceptor registra la asistencia de cada alumno en un único momento del día (ej: a primera hora) |
| **Origen** | El modelo de datos tiene un solo registro de asistencia por alumno por fecha (UNIQUE student_id + date). No hay soporte para registro por materia o por hora. |
| **Riesgo si es falso** | Si la institución requiere registrar asistencia por materia (ej: alumno presente en Matemática pero ausente en Lengua), el modelo actual no lo soporta y requeriría un rediseño de la entidad `attendances`. |
| **Cómo validar** | Consultar al preceptor de la institución objetivo cómo es el proceso actual de registro de asistencia. |

### SU-05 — Las calificaciones son numéricas en escala 1-10

| Aspecto | Detalle |
|---------|---------|
| **Supuesto** | El sistema educativo argentino de nivel secundario usa escala numérica 1-10 |
| **Origen** | La regla RN-10 fija el rango 1.00-10.00 para todas las calificaciones. |
| **Riesgo si es falso** | Si la institución usa escala conceptual (Insuficiente/Suficiente/Bueno/Muy bueno/Sobresaliente) o letras, el sistema no aplica. |
| **Cómo validar** | Confirmar con la institución objetivo la escala de calificación vigente. Si es conceptual, agregar soporte para configuración de escala por institución. |
