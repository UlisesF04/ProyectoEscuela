## Context

El proyecto cuenta con `C-06 grades-module` (CRUD de calificaciones) y `C-08 parental-dashboard` (consulta de notas del hijo desde el portal parental). Sin embargo, no existe una vista agregada que muestre cómo evolucionan las notas de un estudiante a lo largo del tiempo.

El sistema usa:
- **Backend**: Node 20 + Express 4 + Sequelize 6 + PostgreSQL 15.
- **Frontend**: React 18 + Vite + Chakra UI 2 + React Router 6.
- **Auth**: JWT con role-based access (`admin`, `preceptor`, `docente`, `padre`).
- **Estructura modular por dominio**: cada recurso (auth, students, grades, etc.) tiene su carpeta `modules/<name>/` con `routes`, `controller`, `service`.

El modelo `Grade` real (difiere de la KB) tiene: `grade` (DECIMAL 5,2 entre 0-10), `type` (ENUM examen/trabajo/tarea/oral/otro), `date` (DATEONLY), `created_by` (FK users), `description` (VARCHAR 255). **No existe campo `period`**.

## Goals / Non-Goals

**Goals:**
- Endpoint REST que devuelve la evolución de calificaciones con permisos estrictos por rol.
- Componente React reutilizable para visualizar la evolución (tabla + mini chart animado).
- Integración en los dashboards existentes de Padre y Docente con sub-rutas dedicadas.
- Animaciones funcionales (no decorativas) que respeten `prefers-reduced-motion`.

**Non-Goals:**
- No se crean nuevos modelos ni migraciones.
- No se agregan dependencias (todo se hace con SVG inline y CSS keyframes).
- No se implementan gráficos complejos (solo mini line-chart por materia).
- No se rediseñan los dashboards existentes (solo se agrega una nueva sección).

## Decisions

### 1. Path del endpoint: `/api/v1/students/:id/evolution` (en `modules/students/`)
- **Decisión**: Montar la ruta en el módulo `students` (coincide con el recurso "evolución del estudiante").
- **Alternativas consideradas**:
  - `/api/v1/grades/students/:studentId/evolution` (en `modules/grades/`) → más coherente con `GET /api/v1/grades/students/:id` (C-06), pero el path literal del CHANGES.md dice `/students/:id/evolution`.
  - Nuevo módulo `modules/evolution/` → fragmentación innecesaria.
- **Por qué la elegida**: el path literal del CHANGES.md fue confirmado por el usuario; el handler tiene sentido semánticamente en `students` (es una vista del estudiante).

### 2. Lógica de permisos centralizada en el service
- **Decisión**: La lógica de filtrado por rol vive en `studentsService.getEvolutionForStudent`, no en middlewares separados.
- **Por qué**: el filtro del docente es dinámico (depende de sus asignaciones en `teacher_subject`), no se puede expresar con un middleware estático. Mantenerlo en el service mantiene el middleware chain simple y testeable.

### 3. Sin filtrar por período (campo no existe)
- **Decisión**: Ordenar calificaciones por `date` ASC, no por período académico.
- **Por qué**: el modelo `Grade` real no tiene campo `period` (que sí estaba en la KB 04). La cronología es más útil y refleja la realidad de los datos. Se documenta como desviación del CHANGES.md original.

### 4. Mini line-chart SVG inline (sin librería)
- **Decisión**: Implementar el chart como SVG inline con CSS keyframes para animaciones.
- **Alternativas consideradas**: `recharts`, `chart.js` + `react-chartjs-2`, `victory`.
- **Por qué la inline**:
  - Sin dependencias nuevas (governance BAJO).
  - Solo necesitamos 4-6 puntos por materia (trimestres o notas), un chart library sería overkill.
  - Control total sobre las animaciones (respetar `prefers-reduced-motion`).
  - Bundle size no crece.

### 5. Animaciones con CSS keyframes (no Motion/Framer)
- **Decisión**: Usar `keyframes` de `@emotion/react` (ya instalado vía Chakra) y CSS animations.
- **Por qué**:
  - Framer Motion ya está instalado pero sus shorthands (`x`, `y`, `scale`) no son hardware-accelerated; usar `transform: scale()` directamente sí lo es.
  - Las animaciones son one-time on mount, no necesitan ser interruptibles.
  - `prefers-reduced-motion` se maneja con CSS media queries (declarativo, robusto).

### 6. Componente `GradeEvolutionView` como reusable
- **Decisión**: Un solo componente que sirve para Padre y Docente.
- **Por qué**: la lógica de presentación es idéntica (cards por materia + chart). Las páginas Padre/Docente solo se diferencian en el selector de estudiante.

### 7. Selector de hijo en Padre con `ChildSelector` existente
- **Decisión**: Reutilizar el componente `ChildSelector` de C-13 (tabs ≤3, dropdown >3).
- **Por qué**: ya existe, ya está animado, ya está probado.

### 8. Filtros client-side en `ChildGradesPage` (enhancement)
- **Decisión**: Los filtros (materia, tipo, periodo) se aplican en el frontend sobre la lista ya cargada por `getStudentGrades`, sin agregar query params al endpoint ni modificar el backend.
- **Por qué**:
  - El set de notas por hijo es chico (decenas, no miles), el filtrado client-side es instantáneo.
  - Evita round-trips extra al backend al cambiar un filtro (mejor UX).
  - Mantiene el contrato del endpoint estable.
- **Periodo**: derivado de `date` por mes (1er: Mar-May, 2do: Jun-Ago, 3ro: Sep-Dic). La BD no tiene campo `period` (desviación documentada en R3); agregar ese campo sería un cambio de modelo fuera del scope de este enhancement.
- **Materias**: el set se deriva dinámicamente de las notas que ya están en memoria (`Set(grades.map(g => g.Subject?.name))`), ordenadas alfabéticamente. "Todas" es el default.

### 9. Gráfico general prominente en `GradeEvolutionView` (enhancement)
- **Decisión**: Agregar un chart de 160px en la cabecera del summary, encima de las cards por materia. Una sola línea que representa el promedio diario de todas las notas a lo largo del tiempo.
- **Por qué**:
  - El feedback del usuario es que el chart anterior (per-subject de 100px) no se percibía como "el gráfico", quedaba como un detalle.
  - Una sola línea en la cabecera da la lectura inmediata de tendencia que el usuario pide ("como va subiendo o bajando").
  - El chart per-subject sigue existiendo debajo con más detalle (aumentado a 160px para mejor legibilidad).
- **Por qué no multilínea**: ya hay un chart por materia más abajo; multilínea en la cabecera duplica info y mete leyenda, colores y hover que compiten con el summary numérico.
- **Animación**: el mismo patrón de `draw-in` con `stroke-dashoffset` y `prefers-reduced-motion` (de la decisión 5) se reusa sin cambios.

### 10. Curva Catmull-Rom + área con gradiente (chart quality fix)
- **Decisión**: Reemplazar la polilínea recta (`M x0 y0 L x1 y1 L x2 y2 ...`) por una curva Catmull-Rom con tensión 0.5 que pasa por todos los puntos con tangentes suaves. Agregar un área de relleno bajo la curva con `<linearGradient>` vertical (accent al 22% arriba → 0% abajo). Data points: par halo+solid (`r=11` halo + `r=6.5` solid) con hover scale 1.18.
- **Por qué**:
  - El feedback del usuario fue explícito: "no veo una curva, no veo puntos unidos por una linea curveada". Una polilínea recta con 2-3 puntos no genera una "curva" perceptible. Catmull-Rom es el estándar (D3 lo usa) y pasa por todos los puntos sin inventar datos intermedios.
  - El área con gradiente da peso visual y hace que el chart "lea" como un chart real, no como un adorno.
  - El par halo+solid + hover scale da affordance de interactividad sin necesidad de librería.
- **viewBox**: `400×160` para per-subject (2.5:1, encaja en una card de ~400px) y `600×160` para general (3.75:1, encaja en el summary header más ancho). Se usa el default `xMidYMid meet` (NO `preserveAspectRatio="none"`, que distorsiona los `<circle>` a óvalos).
- **Animación con paths curvos**: el atributo `pathLength="100"` en el `<path>` normaliza la longitud real del path a 100 unidades, así `stroke-dasharray: 100; stroke-dashoffset: 100→0` funciona idéntico para polilíneas rectas o curvas Catmull-Rom.

## Risks / Trade-offs

- **R1**: Si un estudiante tiene 50+ calificaciones en una materia, el chart sigue siendo legible (4-6 puntos visibles, los demás en tooltip). → Mitigación: el chart no muestra todos los puntos si hay más de 10, muestra un agregado. (Implementación actual muestra todos; si se vuelve problema en el futuro, agregar agregación.)

- **R2**: El path `/:id/evolution` en el router del módulo students podría colisionar con futuras rutas como `/:id/something`. → Mitigación: la ruta es lo suficientemente específica y Express resuelve correctamente.

- **R3**: El campo `period` no existe en el modelo, así que no podemos agrupar por trimestre como decía CHANGES.md. → Mitigación: documentado en el proposal y en engram. CHANGES.md se actualiza con la realidad del modelo.

- **R4**: 6 tests pre-existentes en `admin.test.js` fallan (asumen que preceptor no tiene acceso a ciertos endpoints, pero las rutas sí lo permiten). → Mitigación: fuera del scope de C-07. Se documenta en engram como candidato para fix en C-12 (devops/hardening) o en pasada dedicada.

- **R5**: El chunk de JS del frontend supera los 500 kB (warning de Vite, no error). → Mitigación: fuera del scope de C-07. Mejora futura con `manualChunks` en C-12.

## Migration Plan

No requiere migración. Es un cambio aditivo:
- Backend: 1 nueva ruta + 1 nuevo método en service. No toca modelos ni tablas.
- Frontend: 1 nuevo componente + 2 nuevas páginas + 2 nuevos items de sidebar + 2 nuevas rutas en el router. No modifica páginas existentes.

### Rollback
Borrar los archivos nuevos y revertir los diffs de los archivos modificados. Sin datos que migrar, sin migraciones que revertir.

## Open Questions

Ninguna. Todas las decisiones técnicas se tomaron en el plan mode antes de implementar y fueron validadas con el usuario.
