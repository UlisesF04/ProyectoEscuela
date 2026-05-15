# WORKFLOW.md — Cómo usar CHANGES.md con opencode / claudecode

> **Propósito:** Guía práctica para navegar el roadmap del proyecto,
> arrancar CHANGES, y coordinar con agentes de IA (opencode, claudecode).
>
> **Proyecto:** ProyectoEscuela — Sistema de Gestión Académica
>
> **Documentos relacionados:**
> - `docs/CHANGES.md` — roadmap completo con 18 CHANGES
> - `docs/Integrador.txt` — reglas de negocio (RN-01 a RN-11)
> - `docs/Descripcion.txt` — stack técnico y arquitectura
> - `docs/Historias de usuario.txt` — HU-001 a HU-018
> - `openspec/specs/*/spec.md` — specs de diseño técnico (cuando existan)

---

## Índice

1. [¿Qué es CHANGES.md?](#1-qué-es-changesmd)
2. [Arquitectura del proyecto](#2-arquitectura-del-proyecto)
3. [Ciclo de desarrollo por CHANGE](#3-ciclo-de-desarrollo-por-change)
4. [Prompt templates para agentes IA](#4-prompt-templates-para-agentes-ia)
5. [Uso de openspec: specs y tasks](#5-uso-de-openspec-specs-y-tasks)
6. [Convenciones del proyecto](#6-convenciones-del-proyecto)
7. [Checklist de completitud](#7-checklist-de-completitud)
8. [Glosario rápido](#8-glosario-rápido)

---

## 1. ¿Qué es CHANGES.md?

`docs/CHANGES.md` es el **roadmap oficial del proyecto**. Contiene:

- **18 CHANGES** organizados en 4 fases: Fundaciones, Backend, Frontend, Agente, Cierre
- Cada CHANGE tiene: nombre, descripción, HU asociadas, archivos a crear/modificar, dependencias, estado
- **Diagrama de dependencias**: qué CHANGE necesita qué otro para funcionar
- **Mapeo de reglas de negocio (RN-01 a RN-11)** a cada CHANGE
- **Stack tecnológico definitivo**

Los CHANGES son la unidad de trabajo atómica. No se saltean dependencias.
Cada CHANGE se implementa de a uno.

### Las fases

```
FASE 0 — Fundaciones     → CHANGE-001 a 003  (DB schema, auth backend, auth frontend)
FASE 1 — Backend API     → CHANGE-004 a 008  (absences, grades, tasks, teachers, tutors)
FASE 2 — Frontend        → CHANGE-009 a 013  (páginas de gestión + portal padres)
FASE 3 — Agente + WsApp  → CHANGE-014 a 016  (db_reader, notifier, scheduler + openspec)
FASE 4 — Cierre          → CHANGE-017 a 018  (tests, deploy)
```

---

## 2. Arquitectura del proyecto

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (React 19 + Vite 8 + Chakra UI v3)       │
│  Atomic Design components                           │
│          │                                          │
│          ▼                                          │
│  BACKEND (Node.js + Express + Sequelize + ESM)     │
│  Módulos: auth/ absences/ grades/ tasks/ teachers/ │
│          │                                          │
│          ▼                                          │
│  PostgreSQL 15+ (única fuente de verdad)            │
│          │                                          │
│          ▼                                          │
│  AGENTE PYTHON (psycopg2 + schedule)                │
│  Evalúa RN-01 a RN-07 cada 1h (lun-vie 07-20hs)    │
│          │                                          │
│          ▼                                          │
│  WhatsApp API (provider TBD — Twilio o Meta)        │
└─────────────────────────────────────────────────────┘
```

### Stack key

| Capa | Tecnología | Convención |
|---|---|---|
| Backend | Node.js + Express + Sequelize | **ESM** (`type: module`), modular por dominio |
| Frontend | React 19 + Vite 8 + Chakra UI v3 | **Atomic Design** (átomos → moléculas → organismos → páginas) |
| DB | PostgreSQL 15+ | Migraciones Sequelize, seed con datos de prueba |
| Agente | Python 3.10+ | **venv en raíz** (`./venv/`), schedule para scheduler |
| WhatsApp | Provider TBD | Decidir antes de CHANGE-015 |
| IA Agent | OpenSpec (wrapper manual) | Spec YAML en `openspec/specs/`, mapeo a funciones Python |

---

## 3. Ciclo de desarrollo por CHANGE

```
   ┌──────────────────────────────────────────────────┐
   │  PASO 1: LEER docs/CHANGES.md                    │
   │  Identificar el CHANGE, sus HU y dependencias    │
   └──────────┬───────────────────────────────────────┘
              ▼
   ┌──────────────────────────────────────────────────┐
   │  PASO 2 (opcional): CREAR SPEC                   │
   │  openspec spec create --change "<nombre>"        │
   │  Diseño técnico detallado en openspec/specs/     │
   └──────────┬───────────────────────────────────────┘
              ▼
   ┌──────────────────────────────────────────────────┐
   │  PASO 3 (opcional): CREAR TASKS                  │
   │  openspec tasks create --change "<nombre>"       │
   │  Desglose del CHANGE en checklist de tareas      │
   └──────────┬───────────────────────────────────────┘
              ▼
   ┌──────────────────────────────────────────────────┐
   │  PASO 4: IMPLEMENTAR                            │
   │  Delegar al agente IA con el prompt template     │
   │  Escribir código, migraciones, tests             │
   └──────────┬───────────────────────────────────────┘
              ▼
   ┌──────────────────────────────────────────────────┐
   │  PASO 5: VERIFICAR                              │
   │  Checklist de completitud (sección 7)            │
   │  openspec verify --change "<nombre>" (si hay spec)│
   └──────────┬───────────────────────────────────────┘
              ▼
   ┌──────────────────────────────────────────────────┐
   │  PASO 6: ACTUALIZAR CHANGES.md                  │
   │  Marcar tareas individuales como [x] si las hay  │
   │  Cambiar estado a COMPLETADO + fecha             │
   └──────────────────────────────────────────────────┘
```

### Flujo normal (sin openspec tasks/specs)

Si no usás openspec specs ni tasks, el ciclo se simplifica a:

```
1. Elegí un CHANGE de CHANGES.md
2. Verificá que sus dependencias estén COMPLETADAS
3. Copiá el prompt template de la sección 4
4. Pegalo al agente IA
5. Revisá el código generado
6. Marcá el CHANGE como COMPLETADO en CHANGES.md
```

---

## 4. Prompt templates para agentes IA

### Template básico — arrancar un CHANGE

Copiar y pegar esto al agente (opencode / claudecode):

```text
Implementá el CHANGE del roadmap.

Leé estos archivos primero:
- docs/CHANGES.md
- docs/Integrador.txt
- docs/Descripcion.txt
- docs/Historias de usuario.txt
- openspec/specs/*/spec.md (si existe)

Seguí estas convenciones del proyecto:
- Backend: ESM (type: module), Sequelize, modular por dominio en backend/modules/
  - Archivo principal: backend/app.js (ya existe con Express + DB connect)
  - Config DB: backend/config/database.js
- Frontend: React 19 + Chakra UI v3 con createSystem + Atomic Design
  - Entry point: frontend/src/main.jsx
- Python: venv en raíz, psycopg2 para DB
- WhatsApp provider: TBD — no hardcodear Twilio
- No modificar código existente a menos que sea necesario para integrar

Cuando termines, listame: qué archivos creaste/modificaste y qué reglas de negocio cubre.
```

### Template específico por tipo de CHANGE

**Para BACKEND (CHANGE-002 a 008):**

```text
Implementá el módulo backend para {CHANGE-nombre} de docs/CHANGES.md.

Creá el módulo en backend/modules/{nombre}/ siguiendo esta estructura:
- {nombre}.model.js — modelo Sequelize
- {nombre}.controller.js — lógica de negocio
- {nombre}.routes.js — endpoints REST
- Importá y montá las rutas en backend/app.js

Recordá:
- Usar ESM (import/export)
- Middleware auth en rutas protegidas
- Validar inputs
- Seguir el modelo de la regla de negocio correspondiente
```

**Para FRONTEND (CHANGE-009 a 013):**

```text
Implementá las páginas frontend para {CHANGE-nombre} de docs/CHANGES.md.

Creá los componentes siguiendo Atomic Design:
- Átomos: componentes base (botones, inputs, badges)
- Moléculas: combinaciones simples (GradeTable, StudentTaskStatus)
- Organismos: secciones complejas (AbsencePanel, AcademicSummary)
- Páginas: vistas completas (GradeEntry, ParentDashboard)

Recordá:
- Usar Chakra UI v3 con createSystem
- Consumir API desde frontend/src/services/api.js (Axios interceptor con JWT)
- React Router v7 para navegación
- AuthContext para sesión
```

**Para AGENTE PYTHON (CHANGE-014 a 016):**

```text
Implementá el módulo del agente Python para {CHANGE-nombre} de docs/CHANGES.md.

Recordá:
- venv en raíz del proyecto (./venv/)
- Conexión PostgreSQL con psycopg2
- WhatsApp provider: TBD — dejar hook para implementar después
- No hardcodear credenciales (usar python-dotenv + .env)
- Las reglas de negocio están en docs/Integrador.txt
```

---

## 5. Uso de openspec: specs y tasks

OpenSpec es un framework CLI que ayuda a definir especificaciones técnicas
y desglosar trabajo. En este proyecto se usa de forma **opcional**.

### ¿Qué es un spec?

Un spec es un documento de diseño técnico detallado para un CHANGE.
Se crea con:

```bash
openspec spec create --change "<CHANGE-nombre>"
```

Esto genera `openspec/specs/<CHANGE-nombre>/spec.md` con:
- Diseño de API (endpoints, request/response)
- Modelos de datos
- Reglas de negocio a implementar
- Consideraciones técnicas

Sirve como guía para el agente IA antes de codear.

### ¿Qué son las tasks?

Tasks son el desglose del CHANGE en pasos concretos tipo checklist.
Se crean con:

```bash
openspec tasks create --change "<CHANGE-nombre>"
```

Ejemplo de tasks para CHANGE-004 (backend-absences):

```
☐ Crear modelo Absence con Sequelize
☐ Implementar POST /api/absences (registro con RN-03)
☐ Implementar GET /api/absences/student/:id (historial + %)
☐ Implementar PATCH /api/absences/:id (edición con auditoría)
☐ Endpoint GET /api/absences/risk (alumnos >20%)
☐ Tests del módulo
☐ Marcar dependencias como satisfechas
```

Cada task se marca como completada con `[x]` al implementarla.

### ¿Cuándo usarlos?

| Situación | ¿Spec? | ¿Tasks? |
|---|---|---|
| CHANGE simple (1-2 archivos) | No | No |
| CHANGE mediano (3-5 archivos, lógica nueva) | Opcional | Recomendado |
| CHANGE grande (5+ archivos, varias HU) | Recomendado | Recomendado |
| CHANGE crítico (auth, DB schema) | Recomendado | Recomendado |

### Cómo integrarlo con el agente

Si usás specs y tasks, el prompt al agente sería:

```text
Leé el spec en openspec/specs/{CHANGE-nombre}/spec.md
y las tasks en openspec/changes/{CHANGE-nombre}/tasks.md.
Implementá todo lo que está en las tasks.
```

---

## 6. Convenciones del proyecto

### Backend (Node.js + Express + Sequelize)

```
backend/
├── app.js                    # Entry point (ya existe)
├── config/database.js        # Conexión Sequelize (ya existe)
├── modules/
│   ├── auth/
│   │   ├── auth.model.js     # Modelo Sequelize
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   └── auth.middleware.js
│   ├── absences/
│   └── ...
├── models/                   # Modelos globales (para DB schema)
├── migrations/
├── seeders/
└── .env.example
```

- **ESM**: Siempre usar `import`/`export`, no `require`
- **Modular**: Cada dominio en `modules/{nombre}/` con model + controller + routes
- **Errores**: Middleware global de error en app.js (ya existe)
- **Auth**: Middleware JWT en rutas protegidas, rol en payload

### Frontend (React 19 + Chakra UI v3)

```
frontend/src/
├── main.jsx                  # Entry point (ya existe)
├── App.jsx                   # Router + Layout (ya existe, parcial)
├── pages/                    # Páginas (vistas completas)
├── components/               # Componentes reutilizables
│   ├── atoms/                # Componentes base (Button, Input, Badge)
│   ├── molecules/            # Combinaciones (GradeTable, StudentCard)
│   └── organisms/            # Secciones complejas (AbsencePanel)
├── context/
│   └── AuthContext.jsx       # Estado global de sesión
├── hooks/                    # Custom hooks
└── services/
    └── api.js                # Axios instance con interceptor JWT
```

- **Atomic Design**: Separar componentes en atoms / molecules / organisms
- **Chakra UI v3**: Usar `createSystem` + `ChakraProvider` (ya configurado en main.jsx)
- **Rutas protegidas**: Usar ProtectedRoute component con verificación de rol

### Agente Python

```
agent/
├── main.py                   # Entry point + scheduler
├── scheduler/
│   └── scheduler.py          # Lógica de ventana horaria (RN-10)
├── tasks/
│   ├── db_reader.py          # Consultas PostgreSQL
│   └── notifier.py           # Envío WhatsApp (provider TBD)
├── whatsapp_client.py        # Cliente WhatsApp (provider TBD)
├── db.py                     # Pool de conexiones PostgreSQL
└── openspec_wrapper.py       # Parser de spec YAML + ejecutor de tools
```

- **venv en raíz**: `./venv/` (no dentro de agent/)
- **No hardcodear credenciales**: Usar `python-dotenv` + `.env`
- **WhatsApp provider**: TBD — dejar hook sin implementar

### Commits

```
{tipo}: {mensaje corto en español}

Tipos: feat, fix, refactor, test, docs, chore

Ejemplos:
  feat: implementar módulo auth JWT con roles
  fix: validar RN-03 en registro de inasistencias
  docs: actualizar CHANGES.md con estado CHANGE-004
```

---

## 7. Checklist de completitud

Antes de marcar un CHANGE como COMPLETADO, verificar:

- [ ] **Código implementado**: todos los archivos del CHANGE existen y funcionan
- [ ] **Reglas de negocio cubiertas**: las RN asociadas están implementadas
- [ ] **HU satisfechas**: las HU del CHANGE funcionan end-to-end
- [ ] **Sin código roto**: el proyecto existente sigue funcionando
- [ ] **Sin secrets**: no hay credenciales hardcodeadas
- [ ] **ESM/Atomic Design**: se siguen las convenciones del proyecto
- [ ] **WhatsApp provider**: sin referencias a Twilio si no está decidido
- [ ] **Dependencias satisfechas**: todos los CHANGES de los que depende están COMPLETADOS
- [ ] **CHANGES.md actualizado**: estado cambiado a COMPLETADO + fecha

Para marcar un CHANGE como completado en `docs/CHANGES.md`:

```markdown
**Estado:** COMPLETADO — 2026-05-15
```

---

## 8. Glosario rápido

| Término | Significado |
|---|---|
| **CHANGE** | Unidad de trabajo atómica en el roadmap |
| **HU** | Historia de Usuario (requisito funcional) |
| **RN** | Regla de Negocio (restricción del dominio) |
| **Spec** | Documento de diseño técnico detallado (openspec) |
| **Tasks** | Checklist granular de implementación (openspec) |
| **ESM** | ES Modules (`import`/`export` en Node.js) |
| **Atomic Design** | Metodología de diseño de componentes (átomo → molécula → organismo → página) |
| **Provider TBD** | Decisión técnica pendiente de definir |
| **venv raíz** | Entorno virtual Python en `./venv/` |
| **OpenSpec wrapper** | Código Python que lee spec YAML y mapea tools a funciones |

---

## Apéndice: Prompt rápido para empezar

Si querés arrancar el primer CHANGE ahora mismo, copiá esto:

```text
Arrancá con el desarrollo del proyecto según docs/CHANGES.md.
Buscá el primer CHANGE en estado PROPUESTO cuyas dependencias
estén todas COMPLETADAS. Leé todos los archivos de documentación
y comenzá la implementación. Seguí las convenciones del proyecto.
```

---

*Última actualización: 2026-05-15*
*Mantené este documento actualizado a medida que el proyecto evoluciona.*
