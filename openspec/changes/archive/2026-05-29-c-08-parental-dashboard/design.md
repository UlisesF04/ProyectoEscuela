## Context

Los padres necesitan un dashboard simple y claro para consultar la información de sus hijos. El modelo de datos ya soporta la vinculación padre-alumno via `parent_student`. El backend ya tiene endpoints de asistencias (C-05) y calificaciones (C-06) que pueden ser consumidos por el rol `padre`.

## Goals / Non-Goals

**Goals:**
- Endpoint `GET /api/v1/students/me/children` con roleMiddleware('padre')
- Frontend `PadreDashboard.jsx` con cards de hijos y botones de acción
- Modales para notas y asistencias por hijo
- `DashboardLayout.jsx` reutilizable con sidebar colapsable, avatar, logout
- Refactor de dashboards existentes para usar DashboardLayout

**Non-Goals:**
- No se implementa sección de tareas (C-07 soft dependency — se agrega cuando se implemente)
- No se implementa subida de certificados desde el portal parental (post-MVP)
- No se implementa notificación push para padres (eso es C-10)

## Decisions

### D-01: Layout unificado → DashboardLayout reutilizable
- **Decisión**: Se crea un componente `DashboardLayout` que recibe `sections` como prop y renderiza sidebar + contenido. Todos los dashboards (admin, preceptor, docente, padre) lo usan.
- **Motivo**: Elimina código duplicado (sidebar, header, logout). Cada dashboard solo define sus secciones y lógica específica.
- **Alternativa considerada**: Cada dashboard con su propio layout — rechazado por duplicación de código.

### D-02: Consulta de notas y asistencias → modales, no páginas separadas
- **Decisión**: Al hacer clic en "Ver Notas" o "Ver Asistencias" se abre un modal con los datos del hijo seleccionado.
- **Motivo**: Mejor UX — el padre no navega a otra página, ve la información en contexto. Los modales son grandes (size="4xl") para tablas completas.

### D-03: Sidebar colapsable con estado local
- **Decisión**: El sidebar puede colapsarse (72px / 260px) con un botón en la parte inferior. El estado es local al componente DashboardLayout.
- **Motivo**: Da espacio vertical en pantallas chicas sin perder navegación. No requiere estado global.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Padre con múltiples hijos podría confundir datos | Cada card de hijo es independiente con nombre y DNI visibles |
| Modal grande en mobile podría romper layout | Chakra UI responsive: modales se adaptan al viewport |
| Error al cargar notas de un hijo no debería afectar al otro | Cada consulta es independiente con su propio estado de loading/error |
