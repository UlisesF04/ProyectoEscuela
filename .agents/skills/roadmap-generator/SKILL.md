---
name: roadmap-generator
description: >
  Generates CHANGES.md — an operational index of all OpenSpec changes for a project, with dependency tree, parallelism gates, critical path, multi-agent plan, and per-change scope, governance level, dependencies and "Leer antes" pointers to the knowledge base. Fire-and-forget, no questions asked.
  Trigger: When user asks to create, build, regenerate, or update CHANGES.md, roadmap, change map, implementation plan; or says "armar CHANGES", "armar roadmap", "crear mapa de changes", "generar plan de implementación", "qué changes necesito", "índice de changes".
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "2.0"
---

## When to Use

- Generar el **índice canónico** de changes para implementar un sistema desde cero hasta producción.
- Convertir una base de conocimiento estructurada en un plan operativo con paralelización explícita.
- Identificar **camino crítico**, **niveles de governance** y **contratos con la KB** por change.

**Don't use when:**
- No existe `knowledge-base/` en raíz (corré `kb-creator` primero).
- No existe la carpeta `openspec/` (corré `openspec init` primero).
- Ya existe `CHANGES.md` en raíz completo y el usuario quiere actualizar uno solo (sugerí edición puntual en su lugar).

---

## Critical Patterns

### Pre-checks obligatorios

Antes de generar `CHANGES.md`, **validá** estas tres condiciones. Si alguna falla, **NO generes nada** y devolvé un mensaje claro:

| Check | Si falla |
|-------|----------|
| `knowledge-base/` existe en raíz | "Falta la KB. Corré primero `kb-creator` para generarla." |
| `knowledge-base/` tiene los 10 canónicos | "KB incompleta. Faltan: [lista]. Corré `kb-creator` para completarla." |
| `openspec/` existe en raíz | "OpenSpec no inicializado. Corré `npx @fission-ai/openspec@latest init` primero." |

### Output — ubicación

Generá UN archivo: **`CHANGES.md` en la raíz del proyecto** (no dentro de `openspec/`).

Justificación: CHANGES.md es el **índice maestro** del proyecto, debe ser lo primero que ve cualquier persona o agente al entrar al repo. Su lugar es la raíz.

### Input — qué leer de la KB

Leé **siempre** estos 4 canónicos (los más informativos):
1. `04_modelo_de_datos.md` → entidades y relaciones (revela orden de creación de tablas).
2. `06_funcionalidades.md` → US y épicas (la unidad de cada change).
3. `07_flujos_principales.md` → flujos E2E (revela qué changes son atómicos vs compuestos).
4. `08_arquitectura_propuesta.md` → patrones (revela infraestructura previa necesaria).

Leé **opcionalmente** estos si están:
- `03_actores_y_roles.md` → para changes de auth + RBAC.
- `05_reglas_de_negocio.md` → para detectar reglas que cruzan changes.
- `10_preguntas_abiertas.md` → para flaggear changes con dependencias inciertas.

---

## Formato obligatorio de CHANGES.md

El archivo SIEMPRE tiene esta estructura. **No agregues ni quites secciones de primer nivel** — son contrato.

### Estructura de alto nivel

```markdown
# CHANGES — Secuencia de Implementación

> Índice canónico de todos los changes del proyecto {NombreProyecto}.
> Cada change es atómico: un agente puede implementarlo en una sesión (~4-6 horas).
> **Leer este archivo antes de ejecutar cualquier `/opsx:propose`.**

---

## Cómo usar este documento

(5 pasos numerados: identificar change → leer KB → propose → archive → marcar checkbox)

---

## Árbol de dependencias

(ASCII art jerárquico con └── y │ mostrando la cadena de dependencias)

### Paralelismo por fase

(GATES numerados desde GATE 0. Cada gate dice qué se desbloqueó y qué se puede ejecutar en paralelo, con [Agente A/B/C] marcando asignaciones sugeridas)

### Camino crítico ({N} changes — mínimo irreducible)

(la cadena más corta para llegar a producción, en flecha)

### Plan óptimo con 3 agentes

(tabla 3 columnas: Paso | Agente A | Agente B | Agente C — qué hace cada uno en cada paso)

---

## FASE {N} — {Nombre semántico de la fase}

> Nota opcional sobre paralelismo dentro de la fase

### [C-{NN}] `{kebab-case-name}`
- **Estado**: `[ ]` pendiente
- **Scope**: descripción densa con bullets (modelos, endpoints, eventos, migraciones, tests)
- **Dependencias**: ninguna | `C-NN` | `C-NN, C-MM`
- **Governance**: BAJO | MEDIO | ALTO | CRITICO
- **Leer antes**:
  - `knowledge-base/0X_archivo.md` §{sección}
  - `knowledge-base/0Y_archivo.md`
```

### Reglas para nombrar changes

- Códigos secuenciales `C-01`, `C-02`, ..., `C-NN`. Padding de 2 dígitos siempre.
- Nombre kebab-case, descriptivo, **sin prefijos us-NNN-** (en este formato usamos C-NN como ID).
- Si un change cubre varias US, mencionarlas dentro del **Scope**.
- Si es transversal (infra), igual recibe un C-NN normal.

### Reglas para inferir dependencias

Jerarquía obligatoria:

1. **Infra primero**: C-01 es siempre el foundation-setup (estructura, dependencias, .env, DB inicial). No depende de nada.
2. **Modelos core antes que features**: C-02 suele ser core-models (entidades base, mixins, repositorios genéricos).
3. **Auth antes que recursos protegidos**: si un change requiere usuario logueado o roles, depende del change de auth.
4. **Entidad referenciada antes que la que referencia**: ejemplo, `categorias` antes que `productos`.
5. **Backend antes que frontend acoplado**: si una vista frontend consume un endpoint, su change depende del que creó el endpoint.
6. **Integraciones externas / pagos / webhooks al final**: dependen de las entidades del dominio ya creadas.
7. **Admin / dashboards al final**: dependen de los datos que muestran.
8. **Refactors visuales / UI restyle al final del todo**: requieren producto estable.

### Reglas para GATES de paralelismo

Identificá puntos del grafo donde, completado un change, se desbloquean **múltiples** changes que no dependen entre sí. Cada uno de esos puntos es un `GATE N`.

Formato de cada GATE:

```
GATE {N}: {change(s) que se completaron} ✓     {← anotación opcional: PRIMER FORK, etc.}
  → C-XX nombre-del-change             [Agente A]
  → C-YY nombre-del-change             [Agente B]
  → C-ZZ nombre-del-change             [Agente C — si C-NN ✓]
```

- Asigná `[Agente A]`, `[Agente B]`, `[Agente C]` por dominio (backend core, backend aux, frontend) cuando tenga sentido.
- Si un change dentro de un gate depende además de otro, anotalo: `[Agente C — si C-NN ✓]`.
- Marcá con `← FORK` los gates donde se abren múltiples ramas (más de 2 changes paralelos).

### Reglas para Camino crítico

- La **cadena lineal más corta** desde C-01 hasta el último change indispensable para producción.
- No incluye refactors visuales, dashboards extra, ni features opcionales.
- Si dos changes pueden ser el "último" del camino crítico, anotá ambos con asterisco.

### Reglas para Plan con 3 agentes

Tabla con columnas: `Paso | Agente A (Backend Core) | Agente B (Backend Aux) | Agente C (Frontend)`.

- Asigná cada change a un agente respetando dependencias.
- Si un agente queda libre en un paso, marcá con `—`.
- Apuntá a que los 3 agentes terminen aproximadamente al mismo tiempo.

### Reglas para Governance

| Nivel | Cuándo |
|-------|--------|
| **BAJO** | Scaffolding, CRUDs simples, pages frontend sin lógica crítica, configuración. |
| **MEDIO** | Flujos con estado, sesiones, máquinas de estado, eventos WebSocket no críticos. |
| **ALTO** | Sistemas de notificaciones, gestión de roles, WS gateway, observabilidad. |
| **CRITICO** | Auth, pagos, datos de seguridad (alérgenos en food), audit trail, modelos core que todo lo demás referencia. |

### Reglas para "Leer antes"

Listá **3 a 5 archivos canónicos** de la KB por change, con sección específica cuando aplique (`§2.1`, `§Auth`, `§Round lifecycle`).

Priorizar:
- Para auth: `03_actores_y_roles.md`, `05_reglas_de_negocio.md §Auth`, archivo de seguridad si existe.
- Para entidades: `04_modelo_de_datos.md §entidad`.
- Para endpoints: `07_flujos_principales.md`, archivo de API si existe.
- Para frontend: `08_arquitectura_propuesta.md §frontend`, archivo de convenciones.
- Para pagos / integraciones: `05_reglas_de_negocio.md §Pagos`, archivo de capas de abstracción.

### Reglas para Scope

Bullets **operacionales**, no descriptivos. Cada bullet debe describir algo que el agente va a generar:

- ✅ Bueno: `POST /api/auth/login — JWT access + refresh, rate limiting 5/60s por IP+email`
- ❌ Malo: `Sistema de autenticación completo con tokens`

- ✅ Bueno: `Migración 003: tablas allergen, product_allergen, allergen_cross_reaction`
- ❌ Malo: `Crear las tablas de alérgenos`

Mencioná explícitamente:
- Modelos / entidades nuevas (`Modelos: Category, Subcategory, Product`)
- Endpoints clave (`/api/admin/categories`, `/api/public/menu/{slug}`)
- Migración numerada si la KB define convención (`Migración 002: ...`)
- Eventos WS si existen (`ROUND_PENDING, ROUND_CONFIRMED, ...`)
- Tests esperados (`Tests: CRUD, aislamiento multi-tenant, cache invalidation`)

---

## Workflow

1. Ejecutar pre-checks (KB existe, 10 canónicos, openspec/ existe).
2. Leer los 4 canónicos obligatorios + los 3 opcionales si están.
3. Identificar capacidades atómicas del sistema (cada una será un C-NN).
4. Asignar C-NN secuenciales agrupados por FASES semánticas.
5. Inferir dependencias aplicando las 8 reglas.
6. Calcular GATES de paralelismo.
7. Identificar camino crítico.
8. Diseñar plan con 3 agentes.
9. Para cada change escribir: Estado, Scope, Dependencias, Governance, Leer antes.
10. Escribir `CHANGES.md` en la raíz.
11. Cerrar con tabla resumen + sugerencia del primer change.

### Output al usuario al cerrar

```markdown
## CHANGES.md generado

✅ `CHANGES.md` creado en la raíz con **{N} changes** organizados en **{M} fases**.

**Camino crítico**: {K} changes
**Gates de paralelismo**: {G}
**Primer change recomendado**: `C-01` ({nombre})

Para arrancar: `/opsx:propose C-01-{nombre}`
```

---

## Resources

- **Templates**: ver [assets/changes-template.md](assets/changes-template.md) — plantilla completa de `CHANGES.md` con ejemplos.
