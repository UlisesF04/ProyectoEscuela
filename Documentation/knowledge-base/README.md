# Optimización de la Gestión Académica y Comunicación Escolar — Base de Conocimiento

Base de conocimiento generada a partir de los documentos fuente del proyecto (`docs/`).

## Índice de archivos

| # | Archivo | Contenido |
|:-:|---------|-----------|
| 01 | [01_vision_y_objetivos.md](01_vision_y_objetivos.md) | Propósito del sistema, 8 objetivos medibles (OBJ-01 a OBJ-08), alcance MVP, fuera de alcance, métricas de éxito |
| 02 | [02_descripcion_general.md](02_descripcion_general.md) | Stack tecnológico completo, arquitectura general (diagrama ASCII), integraciones externas, resumen de ~40 endpoints REST |
| 03 | [03_actores_y_roles.md](03_actores_y_roles.md) | 5 actores del sistema, matriz RBAC completa (permisos CRUD por rol), restricciones por actor, rutas públicas |
| 04 | [04_modelo_de_datos.md](04_modelo_de_datos.md) | 9 dominios, 11 entidades con atributos/tipos/constraints/índices, ERD con cardinalidades, seed data inicial |
| 05 | [05_reglas_de_negocio.md](05_reglas_de_negocio.md) | 20 reglas de negocio con IDs (RN-AU-01 a RN-LI-20), organizadas por 6 dominios, con justificación cada una |
| 06 | [06_funcionalidades.md](06_funcionalidades.md) | 8 épicas, 22 user stories (US-001 a US-022) con criterios de aceptación Gherkin, reglas relacionadas y endpoints |
| 07 | [07_flujos_principales.md](07_flujos_principales.md) | 7 flujos extremo a extremo con pasos numerados, diagramas, casos de error tabulados (login, asistencias, calificaciones, notificaciones, justificación, tareas, licencias) |
| 08 | [08_arquitectura_propuesta.md](08_arquitectura_propuesta.md) | 7 patrones de diseño aplicados, estructura de directorios completa, seguridad (JWT, CORS, rate limiting), 13 variables de entorno, lógica del agente automatizado |
| 09 | [09_decisiones_y_supuestos.md](09_decisiones_y_supuestos.md) | 7 decisiones documentadas (DD-01 a DD-07) con alternativas descartadas y trade-offs aceptados, 5 supuestos inferidos (SU-01 a SU-05) con riesgo y validación |
| 10 | [10_preguntas_abiertas.md](10_preguntas_abiertas.md) | 4 inconsistencias detectadas entre fuentes, 10 preguntas abiertas priorizadas con decisor sugerido, 4 riesgos con mitigación |
| 11 | [11_despliegue_y_devops.md](11_despliegue_y_devops.md) | Estrategia de 3 componentes (Vercel + Railway + Railway Worker), CI/CD con GitHub Actions, gestión de secretos, ramas, monitoreo |

## Quick Start para desarrolladores

```
1. Entender el dominio            → 01_vision_y_objetivos.md, 03_actores_y_roles.md
2. Entender los datos             → 04_modelo_de_datos.md
3. Entender las reglas            → 05_reglas_de_negocio.md
4. Entender la arquitectura       → 02_descripcion_general.md, 08_arquitectura_propuesta.md
5. Implementar funcionalidades    → 07_flujos_principales.md, 06_funcionalidades.md
6. Antes de codificar             → 10_preguntas_abiertas.md, 09_decisiones_y_supuestos.md
7. Desplegar                      → 11_despliegue_y_devops.md
```

## Resumen ejecutivo

El proyecto **"Optimización de la Gestión Académica y Comunicación Escolar"** es una plataforma web integral para escuelas secundarias que centraliza la gestión de asistencias, calificaciones y tareas, y agrega un agente automatizado que notifica vía email a las familias ante eventos críticos (faltas, notas bajas, tareas próximas a vencer). Está compuesto por un frontend React + Chakra UI (Vercel), un backend Node.js + Express + Sequelize con PostgreSQL (Railway), y un agente Python + Resend (Railway Worker). Cuenta con 5 actores, 22 funcionalidades, 20 reglas de negocio y una arquitectura en 5 capas con patrones Repository, Service Layer y Middleware Chain.
