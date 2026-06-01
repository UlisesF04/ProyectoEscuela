# Tasks: C-07 Grade Evolution

## 1. Backend implementation

- [x] 1.1 Add `GET /api/v1/students/:id/evolution` route in `backend/modules/students/students.routes.js` (authMiddleware + roleMiddleware padre/docente/admin)
- [x] 1.2 Add `getStudentEvolution` controller in `backend/modules/students/students.controller.js`
- [x] 1.3 Implement `getEvolutionForStudent` in `backend/modules/students/students.service.js` with RN-03 (parent link) and RN-04 (teacher assigned subjects) filters
- [x] 1.4 Update `backend/package.json` test script to include `tests/evolution.test.js`

## 2. Backend tests

- [x] 2.1 Create `backend/tests/evolution.test.js` with service-level tests (parent, teacher, admin, none) and HTTP-level tests (auth, roles, 404, RBAC)
- [x] 2.2 Verify 28/28 evolution tests pass against the real PostgreSQL database

## 3. Frontend service + reusable component

- [x] 3.1 Add `getStudentEvolution(studentId)` to `frontend/src/services/gradesService.js`
- [x] 3.2 Create `frontend/src/components/grade-evolution-view.jsx` with header summary, per-subject cards, mini SVG line-chart (draw-in animation, pop-in points with stagger 70ms), chronological grade badges, and `prefers-reduced-motion` support

## 4. Frontend pages and routing

- [x] 4.1 Create `frontend/src/pages/padre/child-evolution-page.jsx` using the existing `ChildSelector` + `GradeEvolutionView`
- [x] 4.2 Create `frontend/src/pages/docente/student-evolution-page.jsx` with course and student selectors + `GradeEvolutionView`
- [x] 4.3 Register `/padre/evolution` and `/docente/evolution` routes in `frontend/src/routes/AppRoutes.jsx`

## 5. Sidebar integration

- [x] 5.1 Add "Evolución" item with `FiTrendingUp` icon to `frontend/src/pages/padre/PadreLayout.jsx`
- [x] 5.2 Add "Evolución del alumno" item with `FiTrendingUp` icon to `frontend/src/pages/docente/DocenteLayout.jsx`

## 6. Verification

- [x] 6.1 Run `npm run build` in frontend and confirm successful build
- [x] 6.2 Run evolution test suite against real PostgreSQL and confirm all tests pass

## 7. Enhancement: Filter bar in ChildGradesPage

- [x] 7.1 Add three `<Select>` controls (Materia, Tipo, Periodo) to `frontend/src/pages/padre/ChildGradesPage.jsx` with local state for each filter
- [x] 7.2 Derive the Materia option list dynamically from the loaded grades (`Set(grades.map(g => g.Subject?.name))`)
- [x] 7.3 Implement `useMemo` for filtered grades, filtered per-subject averages, and filtered low-grade detection
- [x] 7.4 Compute the period bucket from each grade's `date` field (1er: Mar-May, 2do: Jun-Ago, 3ro: Sep-Dic)
- [x] 7.5 Pass an empty state with message "No hay calificaciones con esos filtros" to `DataTable` when the filtered list is empty
- [x] 7.6 Verify that switching the child resets the filters to "Todos" and that the "Materia" options refresh with the new child's subjects

## 8. Enhancement: Prominent general trend chart in GradeEvolutionView

- [x] 8.1 Add a new sub-component `GeneralTrendChart` to `frontend/src/components/grade-evolution-view.jsx` that aggregates all grades by date and plots a single mean-per-date line in a 160px tall SVG
- [x] 8.2 Render the `GeneralTrendChart` in the summary header, below the HStack with totals and above the per-subject cards
- [x] 8.3 Increase the per-subject `MiniLineChart` height from 100px to 160px and ensure the layout still breathes (card padding, badge grid still 3 cols)
- [x] 8.4 Reuse the same `prefers-reduced-motion` pattern (draw-in animation only when no-preference) and the existing `drawLine`/`popIn` keyframes
- [x] 8.5 Render an inline empty state for the general trend chart when the data has fewer than 2 distinct dates (a single point is not a trend)

## 9. Final verification

- [x] 9.1 Run `npm run build` in frontend and confirm successful build with the new changes
- [x] 9.2 Visual smoke check: padre logs in, opens Calificaciones, applies 3 filters combined, opens Evolución, sees prominent chart in header

## 10. Chart visual quality fix (per-subject curve not visible)

- [x] 10.1 Quitar `preserveAspectRatio="none"` de `MiniLineChart` y `GeneralTrendChart` (era el bug principal: estiraba los círculos a óvalos)
- [x] 10.2 Cambiar viewBox a `400×160` en `MiniLineChart` y `600×160` en `GeneralTrendChart` para mantener aspect ratio sin distorsión
- [x] 10.3 Implementar `buildCatmullRomPath(points)` y `buildAreaPath(...)`; reemplazar la polilínea recta por curva Catmull-Rom (suave, pasa por todos los puntos) en ambos charts
- [x] 10.4 Agregar `<defs><linearGradient>` y área de relleno bajo la curva (`fill="url(#...Fill)"` con gradiente vertical de accent al 22% → 0% de opacidad)
- [x] 10.5 Subir radio de data points a 6.5 (general: 7) y agregar halo concéntrico de 11px (general: 12px) con `fillOpacity={0.18}` y `ACCENT_COLOR`
- [x] 10.6 Renderizar label de fecha corta `dd/mm` en el primer y último punto, debajo del chart (`formatDateShort`)
- [x] 10.7 Reforzar baseline (y=0) con `strokeWidth="1.5"` y color accent al 25% de opacidad (antes era 0.08% con grid, prácticamente invisible)
- [x] 10.8 Usar `pathLength="100"` en el path para que la animación `drawLine` (stroke-dashoffset 100→0) funcione con paths curvos independientemente de la longitud real
- [x] 10.9 Hover state: `transform: scale(1.18)` en el grupo de data point con `transition: transform 180ms` y `cursor: pointer`
- [x] 10.10 Single-point fallback también rediseñado: dot centrado de 7px con halo de 13px, mantiene el nuevo padding y baseline
- [x] 10.11 Verificar `npm run build` (pasa: ✓ 2.61s, +3.7kB del bundle)
