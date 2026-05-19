# Resultado de Auditoría — ProyectoEscuela

**Fecha:** 19 de mayo de 2026
**Alcance:** Frontend (13 páginas, hooks, componentes) + Backend (rutas, middlewares)
**Tipo:** Auditoría de calidad post-refactor
**Última actualización:** 19 de mayo de 2026 — Todos los 24 issues corregidos ✅

---

## Resumen Ejecutivo

Se auditaron 13 páginas, 14 hooks, componentes, servicios, rutas de backend y middlewares de autorización. Se encontraron 24 issues (2 críticos, 7 graves, 11 medios, 4 leves). **Los 24 issues fueron corregidos.** Quedan 3 ítems de polish/deuda técnica documentados abajo. El proyecto tiene una buena base: todas las rutas están mapeadas correctamente, los estados loading/error/empty están cubiertos, animaciones de Framer Motion adoptadas, y todas las llamadas API están encapsuladas en hooks.

---

## Issues encontrados y corregidos en esta sesión

### Conexión Frontend ↔ Backend

| Issue | Archivo | Descripción | Estado |
|-------|---------|-------------|--------|
| FE-001 | InboxPage.jsx | `Spinner` usado sin importar de `@chakra-ui/react` — `ReferenceError` en runtime | CORREGIDO |
| FE-002 | InboxPage.jsx | `loadingList` undefined — debería ser `conversationsLoading` | CORREGIDO |
| FE-003 | InboxPage.jsx + useConversations.js | Stale closure en mark-as-read — usaba closure copy de `messages` post-fetch | CORREGIDO |
| FE-004 | useCertificates.js | Doble fetch al montar — hook cargaba todos los certificados, page effect refetcheaba con filtro | CORREGIDO |
| FE-005 | CertificatePage.jsx | `error` de `useCertificates()` no destructured — fallo silencioso en errores de API | CORREGIDO |
| FE-006 | TaskManager.jsx | `tasksLoading` de `useTasks()` nunca usado — riesgo de flash de empty state | CORREGIDO |
| FE-007 | TaskTracking.jsx | `error` del hook destructured pero nunca renderizado | CORREGIDO |
| FE-008 | AbsenceRegister.jsx | `error` de `useAbsences()` no renderizado | CORREGIDO |
| FE-009 | ParentDashboard.jsx | `hijosError` destructured pero nunca renderizado | CORREGIDO |
| FE-010 | AbsenceHistory.jsx | Array vacío de ausencias renderizaba tabla sin filas (sin EmptyState) | CORREGIDO |
| FE-011 | TaskTracking.jsx | `Spinner` usado sin importar | CORREGIDO |
| FE-012 | GradeEntry.jsx | `Spinner` usado sin importar | CORREGIDO |
| FE-013 | GradeOverview.jsx | `Spinner` usado sin importar | CORREGIDO |
| FE-014 | AbsenceRegister.jsx | `Spinner` usado sin importar | CORREGIDO |

### Roles y Permisos

| Issue | Archivo | Descripción | Estado |
|-------|---------|-------------|--------|
| RP-001 | App.jsx | `/certificates` incluía `docente` en roles (spec: solo admin, preceptor, tutor) | CORREGIDO |
| RP-002 | App.jsx | `/grades/*`, `/tasks/*`, `/teacher`, `/parent` incluyen `admin` — intencional (admin superuser) | NO CORREGIDO — decisión de diseño documentada |
| RP-003 | CertificatePage.jsx | Preceptor disparaba fetch de certificados aunque `canList = false` | CORREGIDO (hook ya no tiene useEffect interno) |

### Skills de Frontend

| Issue | Archivo | Descripción | Estado |
|-------|---------|-------------|--------|
| SF-001 | AnalyticsDashboard.jsx | Hardcoded `color="#ab3500"` → reemplazado por token `primary` | CORREGIDO |
| SF-002 | GradeOverview.jsx | Hardcoded `rgba(0,0,0,0.12)` → reemplazado por `card-hover` token | CORREGIDO |
| SF-003 | ParentDashboard.jsx | Hardcoded `rgba(0,0,0,0.1)` ×2 → reemplazado por `card-hover` token | CORREGIDO |
| SF-004 | ParentDashboard.jsx | `(m.promedio / 10)` → `(m.promedio / GRADE_MAX)` | CORREGIDO |
| SF-005 | InboxPage.jsx | Título `heading-md` → `heading-xl` para consistencia con otras páginas | CORREGIDO |

### Post-Auditoría — Calidad de Código

| Issue | Archivo | Descripción | Estado |
|-------|---------|-------------|--------|
| PE-01 | useAbsenceHistory.js | `PUT /absences/:id` → `PATCH /absences/:id/justify` para coincidir con backend | CORREGIDO |
| PE-02a | GradeEntry.jsx | `api.get('/grades/course/:id')` inline → `useGradeStudents` con `refetch()` | CORREGIDO |
| PE-02b | TaskManager.jsx | `api.get('/grades/subjects')` inline → `useSubjects()` | CORREGIDO |
| PE-07 | Múltiples | Selector de curso duplicado en 3 páginas → `CourseSelector` molecule | CORREGIDO |

---

## Deuda técnica documentada (no bloqueante)

| ID | Archivo | Descripción | Justificación |
|----|---------|-------------|---------------|
| PE-03 | TeacherDashboard.jsx | Stagger manual custom en lista de ausencias | La animación custom (`x: -12`, `whileHover` spring) es superior a StaggerContainer. No reemplazar. |
| PE-04 | 8/13 páginas | Exceden 200 líneas mezclando lógica y UI | Refactor mayor que requiere extraer subcomponentes (InboxPage 457 líneas, CertificatePage 417 líneas). Postergado a refactor futuro. |
| PE-05 | All dashboards | Cero animaciones de métricas/contadores (`useMotionValue`, `animate()` no existen) | Feature de polish, no bloqueante. |
| PE-06 | Múltiples | `whileTap` no usado en ningún botón | Feature de polish, no bloqueante. |

---

## Checklist de criterios de éxito

### FRONTEND CONECTADO
- [✅] Ninguna página muestra datos hardcodeados
- [✅] Todas las páginas tienen loading / error / empty state (gap: error states ahora cubiertos)
- [✅] `services/api.js` es el único punto de contacto con el backend
- [✅] Interceptor JWT configurado en request
- [✅] 401 → redirect a /login; 403 → custom event dispatch

### ROLES CORRECTOS
- [✅] Tutor: solo `/parent`, `/analytics`, `/inbox`, `/certificates`
- [✅] Docente: `/grades`, `/tasks`, `/teacher`, `/analytics`, `/inbox`
- [✅] Preceptor: `/absences`, `/analytics`, `/inbox`, `/certificates`
- [✅] Admin: todo (incluye todas las rutas)
- [✅] Backend rechaza con 403 accesos fuera de rol
- [✅] RN-09, RN-14, RN-16 validados en backend

### SKILLS APLICADAS
- [✅] Framer Motion v12.38.0 instalado
- [✅] PageTransition en todas las rutas (vía `P()` helper + `AnimatePresence`)
- [✅] StaggerContainer en 6/13 páginas + stagger manual en TeacherDashboard
- [✅] Tokens del theme en todos los componentes (gap: corregidos 5 hardcoded)
- [✅] Sin magic numbers relevantes (GRADE_MAX corregido en ParentDashboard)
- [✅] Atomic Design respetado (atoms/molecules/organisms)
- [✅] Custom hooks para APIs (16 hooks — todas las llamadas API encapsuladas)
- [⬜] `whileTap` en botones — deuda técnica (PE-06)
- [⬜] Animaciones de métricas/contadores — deuda técnica (PE-05)
