# Preguntas Abiertas

## Inconsistencias detectadas

### IN-01 — Almacenamiento de certificados: Cloudinary vs Railway Volumes

| Aspecto | Detalle |
|---------|---------|
| **Documentación dice** | `Integrador.txt` menciona "Cloudinary o Railway Volume" como opciones |
| **Impacto** | La elección afecta la arquitectura de subida de archivos, las variables de entorno necesarias, el presupuesto (Cloudinary tiene tier gratuito, Railway Volumes están incluidos en el plan), y la velocidad de acceso. |
| **Resolución propuesta** | Usar Railway Volumes por simplicidad (mismo proveedor que el hosting) y migrar a Cloudinary solo si se necesitan features adicionales (transformación de imágenes, CDN). |

### IN-02 — Versión de React: 18.x vs 19.x

| Aspecto | Detalle |
|---------|---------|
| **Documentación dice** | `Descripcion.txt` menciona React 18.x, pero `CHANGES.md` menciona React 19 |
| **Impacto** | La versión de React afecta la compatibilidad con Chakra UI (v3 requiere React 18+, v2 funciona con ambas). Si se usa 19, algunas librerías pueden no ser compatibles. |
| **Resolución propuesta** | Verificar qué versión de Chakra UI está instalada en `frontend/package.json` y elegir la versión de React que sea compatible. Si Chakra v3, React 18 es más seguro. |

### IN-03 — Versión de Chakra UI: 2.x vs v3

| Aspecto | Detalle |
|---------|---------|
| **Documentación dice** | `Descripcion.txt` menciona Chakra UI 2.x, `CHANGES.md` menciona v3 |
| **Impacto** | Chakra v3 es un rewrite significativo con breaking changes (migración deStyled System a Panda CSS). El código escrito para v2 no es directamente portable a v3. |
| **Resolución propuesta** | Verificar `package.json` del frontend. Si ya se instaló v3, mantenerlo. Si está en etapa de decisión, priorizar v2 por estabilidad y documentación más extensa. |

### IN-04 — El docente puede registrar entregas tardías

| Aspecto | Detalle |
|---------|---------|
| **Documentación dice** | `Integrador.txt` (máquina de estados) muestra que el `preceptor` también puede registrar entregas (PUT /tasks/:taskId/submissions/:studentId tiene roles: docente, preceptor) |
| **Regla de negocio** | RN-13 dice "Una tarea solo puede ser creada por el docente". Las entregas también deberían ser solo del docente. |
| **Impacto** | Si el preceptor también registra entregas, se duplica la responsabilidad y puede generar conflictos. |
| **Resolución propuesta** | Revisar el endpoint. Probablemente el preceptor solo debería tener acceso de lectura a las entregas. Limpiar la especificación. |

---

## Preguntas abiertas priorizadas

| Prioridad | Pregunta | Bloquea | Decisor sugerido |
|:---------:|----------|:-------:|------------------|
| **Alta** | ¿La institución requiere registro de asistencia por materia (cada hora) o un único registro diario por alumno? | Sprint 3 — Diseño de `attendances` | Preceptor + Equipo técnico |
| **Alta** | ¿La escala de calificación es numérica 1-10 o conceptual? | Sprint 4 — Diseño de `grades` | Docente + Administrador |
| **Alta** | ¿Hay padres sin acceso a email? ¿Se necesita un canal alternativo? | Sprint 5 — Diseño de notificaciones | Administrador |
| **Alta** | ¿Chakra UI v2 o v3? Depende de lo ya instalado en `package.json` y la decisión del equipo | Sprint 1 — Setup frontend | Equipo técnico |
| **Media** | ¿Se necesita multi-tenancy (varias escuelas) en el futuro? Si sí, hay que agregar entidad `schools` ahora para evitar migración dolorosa | Post-MVP — Arquitectura | Product Owner |
| **Media** | ¿El umbral de ausencias críticas (RN-18) es por ciclo lectivo completo o por trimestre? | Sprint 5 — Agente notificaciones | Administrador |
| **Media** | ¿Cuántos días de licencia tienen los docentes por año? Sin este dato, `days_used` no se puede contrastar con un límite. | Sprint 6 — Licencias | Administrador |
| **Baja** | ¿La contraseña debe tener requisitos de complejidad (mayúsculas, números, símbolos)? | Sprint 1 — Auth | Equipo técnico + Administrador |
| **Baja** | ¿Se necesita exportar datos a PDF/Excel (reportes de asistencias, notas)? | Post-MVP | Preceptor + Docente |
| **Baja** | ¿Qué pasa con los alumnos que se cambian de curso en medio del ciclo lectivo? ¿Se migran las notas y asistencias? | Post-MVP | Administrador + Equipo técnico |

---

## Riesgos identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|:-----------:|:-------:|------------|
| Los emails de Resend caen en spam | Baja | Medio | Configurar SPF/DKIM en el dominio. Usar la API de Resend que optimiza deliverability. Incluir nota en onboarding para revisar carpeta de spam |
| Breaking changes de Chakra UI v3 si se migra desde v2 | Alta | Medio | Definir la versión temprano. Si ya se usó v3, no mezclar APIs de v2 |
| El equipo (4 personas) no tiene experiencia con Python + Resend | Baja | Bajo | SDK simple, API REST documentada |
