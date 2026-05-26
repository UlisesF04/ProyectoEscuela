# AGENTS.md — Optimización de la Gestión Académica y Comunicación Escolar

> Contrato de comportamiento del agente para este repositorio.
> Toda instrucción aquí tiene prioridad sobre el comportamiento default del agente.
> Última actualización: 2026-05-26

---

## 1. Stack Tecnológico

- **Backend**: Node.js 20.x LTS — Express.js 4.x
- **Frontend**: React 18.x/19.x — Vite — Chakra UI 2.x/v3
- **Estado global**: Context API + useReducer
- **Base de datos**: PostgreSQL 15.x — ORM: Sequelize 6.x
- **Auth**: JWT (HS256) + bcrypt (12 rounds)
- **Infraestructura**: Vercel (frontend SPA) + Railway (backend + BD + agente Worker)
- **CI/CD**: GitHub Actions (tests + lint + build automáticos)
- **Testing**: Backend: `npm test` (integración con PostgreSQL real en contenedor) / Frontend: `npm run lint` + `npm run build`
- **Agente automatizado**: Python 3.11.x — APScheduler + Twilio SDK + psycopg2

---

## 2. Knowledge Base

La fuente de verdad del proyecto está en `knowledge-base/`.
Antes de proponer cualquier change, leé los archivos relevantes para el dominio que vas a tocar.

| Archivo | Cuándo leerlo |
|---|---|
| `01_vision_y_objetivos.md` | Siempre, antes del primer `/opsx:propose` |
| `02_descripcion_general.md` | Al empezar una sesión nueva |
| `03_actores_y_roles.md` | Al implementar auth o permisos |
| `04_modelo_de_datos.md` | Al crear/modificar modelos, migraciones o queries |
| `05_reglas_de_negocio.md` | Al implementar lógica de dominio |
| `06_funcionalidades.md` | Al proponer un change de feature |
| `07_flujos_principales.md` | Al implementar flujos end-to-end |
| `08_arquitectura_propuesta.md` | Al tomar decisiones de estructura o patrones |
| `09_decisiones_y_supuestos.md` | Antes de proponer alternativas de diseño |
| `10_preguntas_abiertas.md` | Cuando encontrés ambigüedad |
| `11_despliegue_y_devops.md` | Al implementar CI/CD, deploy o infraestructura |

---

## 3. Skills Instaladas

### kb-creator
- **Repo**: https://github.com/JuanCruzRobledo/kb-creator
- **Trigger**: cuando necesitás construir o actualizar la base de conocimiento del proyecto.
- **Comando**: "creá / actualizá la base de conocimiento"

### roadmap-generator
- **Repo**: https://github.com/JuanCruzRobledo/roadmap-generator
- **Trigger**: cuando necesitás generar o regenerar el CHANGES.md desde la KB.
- **Comando**: "generá el CHANGES.md del proyecto"

### find-skills
- **Trigger**: cuando el usuario pide buscar skills disponibles o instaladas.
- **Comando**: "buscá skills para [dominio]"

### Skills de Frontend
<!-- SECCIÓN EDITABLE — Agregá aquí las skills de frontend que instales en el proyecto -->
<!-- Ejemplo:
### emil-kowalski / animations
- **Repo**: Ya instalado en el proyecto
- **Trigger**: cuando implementés animaciones o transiciones en el frontend.
- **Regla**: Siempre leé esta skill antes de escribir cualquier código de animación.

### taste-ui
- **Repo**: Ya instalado en el proyecto
- **Trigger**: al construir componentes de UI nuevos.
- **Regla**: Aplicar las guías de taste antes de proponer markup o estilos.

### impeccable
- **Repo**: Ya instalado en el proyecto
- **Trigger**: en cualquier change que toque el frontend.
- **Regla**: Pasá el checklist de impeccable antes de marcar una tarea de UI como done.
-->

---

## 4. Roadmap de Changes

> Estado actualizado del CHANGES.md. Actualizá esta sección cada vez que completes
> un `/opsx:archive`.
> Para el detalle completo (árbol de dependencias, paralelismo, governance) consultá `CHANGES.md`.

### FASE 0 — Cimientos

- [ ] C-01 `foundation-setup` — CRITICO — sin dependencias

### FASE 1 — Núcleo del Sistema

- [ ] C-02 `core-models` — CRITICO — depende de C-01
- [ ] C-03 `auth-system` — CRITICO — depende de C-02
- [ ] C-04 `admin-panel` — CRITICO — depende de C-03

### FASE 2 — Gestión Académica

- [ ] C-05 `attendance-module` — MEDIO — depende de C-04
- [ ] C-06 `grades-module` — MEDIO — depende de C-04
- [ ] C-07 `tasks-module` — MEDIO — depende de C-04

### FASE 3 — Portal Parental

- [ ] C-08 `parental-dashboard` — BAJO — depende de C-05, C-06, C-07

### FASE 4 — Recursos Humanos

- [ ] C-09 `teacher-leaves-module` — BAJO — depende de C-04

### FASE 5 — Automatización Inteligente

- [ ] C-10 `notification-agent` — ALTO — depende de C-04

### FASE 6 — Cierre y Calidad

- [ ] C-11 `admin-dashboard-and-polish` — BAJO — depende de C-10
- [ ] C-12 `devops-deployment` — BAJO — depende de C-01

**Camino crítico**: `C-01 → C-02 → C-03 → C-04 → C-10 → C-11`

---

## 5. Reglas de Trabajo con CHANGES.md y el Roadmap

### Actualización de estado obligatoria
- Cada vez que ejecutes `/opsx:archive [nombre]`, **inmediatamente** actualizá el estado
  del change en CHANGES.md de `[ ] pendiente` a `[x] completado` y registrá la fecha.
- También actualizá el resumen de la Sección 4 de este archivo (AGENTS.md).

### Antes de proponer cualquier change nuevo
1. Leé CHANGES.md para ver qué está pendiente, en progreso y completado.
2. Verificá que las dependencias del change que querés proponer estén todas en `[x] completado`.
3. Si querés agregar un change que no estaba en el mapa original, primero proponé la modificación
   del CHANGES.md y el roadmap al usuario, esperá aprobación explícita, y **solo entonces** lo incorporás.

### Ciclo de cambios al roadmap
Cuando se identifique que el scope cambió (nuevo requerimiento, cambio de prioridad, split de change):
1. Cambiá a **modo plan**: describí el impacto, qué changes se agregan/modifican/eliminan,
   y cómo afecta el camino crítico.
2. Mostrá el diff del CHANGES.md propuesto.
3. **Esperá aprobación explícita** del usuario.
4. Recién después modificá CHANGES.md, actualizá la Sección 4 de AGENTS.md, y si aplica,
   regenerá secciones del roadmap con la skill roadmap-generator.

---

## 6. Reglas Duras del Proyecto

Estas reglas no se negocian. Si algo contradice una de estas reglas, reportalo y esperá instrucción.

### Control de builds y commits
- ❌ **No buildear automáticamente** sin pedido explícito.
- ❌ **No hacer commit** sin pedido explícito.
- ✅ Conventional Commits obligatorios: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- ❌ Sin `Co-Authored-By` en los mensajes de commit.

### Testing
- ✅ Tests de integración usando base de datos real (contenedor de test PostgreSQL).
- ❌ Sin mocks de base de datos en tests. Si una query no se puede testear con la DB real,
  eso es una señal de que el diseño tiene un problema.
- ✅ Cada change debe tener su suite de tests pasando antes de `/opsx:archive`.

### Convenciones de código
- ✅ Schemas con `extra='forbid'` (sin campos no declarados).
- ✅ `snake_case` para todo el código Python (variables, funciones, módulos).
- ✅ `PascalCase` para componentes React.
- ✅ kebab-case para nombres de archivos de componentes (`user-card.tsx`).

### Modo plan
- Ante cualquier decisión arquitectónica no trivial, cambio de dependencias entre changes,
  o requerimiento ambiguo: **activá modo plan primero**.
- Describí el approach en lenguaje natural, listá las alternativas consideradas,
  indicá cuál recomendás y por qué.
- No escribas código hasta que el usuario apruebe el plan.

### Skills de frontend
- Ante cualquier change que toque la UI, **verificá si hay skills de frontend instaladas**
  (ver Sección 3) y leélas antes de escribir markup, estilos o animaciones.
- Las guías de las skills tienen prioridad sobre tu criterio estético default.

---

## 7. Protocolo de Sesión

Al iniciar una sesión nueva:
1. Leé AGENTS.md (este archivo).
2. Leé CHANGES.md y determiná cuál es el próximo change disponible para trabajar
   (dependencias completadas, estado pendiente).
3. Leé los archivos de knowledge-base/ relevantes para ese change.
4. Reportá al usuario: "Próximo change disponible: [C-XX `nombre`]. ¿Arrancamos con `/opsx:propose C-XX-nombre`?"

Al finalizar una sesión:
1. Si completaste un `/opsx:archive`, actualizá el estado en CHANGES.md y en la Sección 4.
2. Listá brevemente qué quedó pendiente o qué preguntas abiertas surgieron.
