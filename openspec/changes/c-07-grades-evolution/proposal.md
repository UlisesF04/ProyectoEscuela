## Why

El sistema permite cargar calificaciones (`C-06 grades-module`) y ver el historial plano por materia, pero no existe una vista agregada que muestre la **evolución** de las notas de un estudiante a lo largo del tiempo. Padres y docentes necesitan ver tendencias, promedios por materia y la progresión cronológica para acompañar el rendimiento académico, no solo una lista plana de notas sueltas.

## What Changes

- **Nuevo endpoint backend** `GET /api/v1/students/:id/evolution` que devuelve las calificaciones de un estudiante agrupadas por materia, ordenadas cronológicamente, con promedio calculado por materia y promedio general.
- **Lógica de permisos**:
  - **Padre** (RN-03): solo si está vinculado al estudiante en `parent_student`. Sin vínculo → 403.
  - **Docente** (RN-04): solo ve las materias que tiene asignadas en `teacher_subject`. Sin asignaciones → 403. Filtra automáticamente el query por `subject_id IN (sus asignaciones)`.
  - **Admin**: sin restricciones.
- **Nuevo componente frontend reutilizable** `GradeEvolutionView` que renderiza:
  - Header con info del estudiante y resumen (materias, total de notas, promedio general).
  - Una card por materia con: nombre, promedio, mini line-chart SVG animado, badges cronológicos con tipo + fecha + descripción.
- **Dos páginas nuevas** que usan el componente:
  - `pages/padre/child-evolution-page.jsx`: usa `ChildSelector` (tabs ≤3 hijos / dropdown >3).
  - `pages/docente/student-evolution-page.jsx`: selectores de curso + alumno.
- **Dos items nuevos en sidebar**:
  - Padre: "Evolución" con icono `FiTrendingUp`.
  - Docente: "Evolución del alumno" con icono `FiTrendingUp`.
- **Dos rutas nuevas**:
  - `/padre/evolution` (protegida por rol `padre`).
  - `/docente/evolution` (protegida por rol `docente`).
- **Enhancement en `ChildGradesPage`**: barra de filtros client-side para ayudar a padres a navegar el historial de notas sin perder la lista cargada. Filtros por materia (derivados dinámicamente de las notas existentes), tipo de nota (enum del modelo) y periodo (3 trimestres derivados del campo `date`). Sin cambios en el backend ni en el endpoint.
- **Enhancement en `GradeEvolutionView`**: gráfico general prominente en la cabecera (160px) con una única línea que conecta el promedio diario de TODAS las notas a lo largo del tiempo, y los charts por materia crecen de 100px a 160px para mayor legibilidad. El usuario pedía ver "como va subiendo o bajando" de un vistazo.

## Capabilities

### New Capabilities
- `grade-evolution`: capacidad de consultar y visualizar la evolución de calificaciones de un estudiante agrupada por materia con permisos por rol.

### Modified Capabilities
- `padre-views`: se agrega la sub-ruta `/evolution` con `ChildEvolutionPage`.
- `docente-views`: se agrega la sub-ruta `/evolution` con `StudentEvolutionPage`.
- `routing`: se registran 2 nuevas sub-rutas protegidas por rol en `AppRoutes.jsx`.
- `core-models`: el módulo `students` ahora importa y consulta los modelos `Grade`, `Subject`, `TeacherSubject` (no se modifican los modelos, se amplían los usos desde un nuevo módulo).

## Impact

### Backend
- `backend/modules/students/students.routes.js`: +10 líneas (nueva ruta).
- `backend/modules/students/students.controller.js`: +13 líneas (nuevo handler).
- `backend/modules/students/students.service.js`: +100 líneas (método `getEvolutionForStudent` con permisos RN-03/RN-04). Imports ampliados: `Op`, `Grade`, `Subject`, `TeacherSubject`.
- `backend/tests/evolution.test.js`: archivo nuevo con 28 tests de integración.
- `backend/package.json`: el script `test` ahora incluye `evolution.test.js`.

### Frontend
- `frontend/src/services/gradesService.js`: +6 líneas (método `getStudentEvolution`).
- `frontend/src/components/grade-evolution-view.jsx`: archivo nuevo, componente reutilizable con mini line-chart SVG animado.
- `frontend/src/pages/padre/child-evolution-page.jsx`: archivo nuevo.
- `frontend/src/pages/docente/student-evolution-page.jsx`: archivo nuevo.
- `frontend/src/routes/AppRoutes.jsx`: +4 líneas (2 imports + 2 rutas).
- `frontend/src/pages/padre/PadreLayout.jsx`: +2 líneas (import + item sidebar).
- `frontend/src/pages/docente/DocenteLayout.jsx`: +2 líneas (import + item sidebar).

### Sin migraciones nuevas
- No se modifican modelos ni tablas. Solo se consultan datos existentes.
