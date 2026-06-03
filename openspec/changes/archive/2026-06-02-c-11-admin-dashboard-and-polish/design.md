## Context

C-13 (frontend-redesign) creó todas las vistas de admin con la paleta Cozy Chocolate Cream y componentes compartidos. El DashboardOverview actual tiene 3 cards básicas (usuarios, cursos, alumnos) pero el spec define 5 cards con más indicadores. El backend de configuración (`modules/config/`) ya fue creado con modelo `Setting` y endpoints `GET/PUT /api/v1/config`. El agente de notificaciones (C-10) ya genera `notification_logs`.

Lo que falta:
- Endpoint de estadísticas agregadas para el dashboard (`GET /api/v1/admin/stats`)
- Enriquecer el DashboardOverview con más widgets
- ErrorBoundary a nivel de layout (existe como componente pero no está integrado)
- Tests de integración
- Verificación responsive en vistas admin

## Goals / Non-Goals

**Goals:**
- Crear endpoint `GET /api/v1/admin/stats` con datos agregados (usuarios, cursos, alumnos, notificaciones recientes, licencias pendientes)
- Enriquecer DashboardOverview con los 5 cards del spec + sección de actividad reciente
- Integrar ErrorBoundary en `AdminLayout.jsx` para capturar errores de render
- Agregar tests de integración para config CRUD, dashboard stats, y notification logs
- Verificar responsive en vistas admin (mobile < 768px)

**Non-Goals:**
- No crear nuevas vistas ni páginas (todas existen de C-13)
- No modificar el agente Python de notificaciones (C-10 está completo)
- No modificar autenticación, roles, ni permisos existentes
- No agregar gráficos complejos ni charts (fuera de scope para este change)

## Decisions

### D1: Endpoint único de stats vs múltiples llamadas
- **Decisión**: Endpoint único `GET /api/v1/admin/stats`
- **Alternativa**: Hacer 5+ llamadas individuales desde el frontend
- **Por qué**: Reduce latencia (1 round trip vs 5+), simplifica el frontend, y permite agregar lógica de negocio del lado del servidor (cálculo de tendencias, permisos)
- **Implementación**: Nuevo módulo `modules/admin-stats/` con controller + service

### D2: Modelo Setting existente para configuración
- **Decisión**: Usar el modelo `Setting` (key-value con JSONB) que ya existe
- **Alternativa**: Tabla dedicada `config` con columnas fijas
- **Por qué**: Ya está implementado, migrado y funcionando. El modelo key-value es flexible para agregar nuevas configuraciones sin migraciones
- **Riesgo**: Sin validación de tipos a nivel BD, pero el service hace merge con defaults

### D3: ErrorBoundary a nivel de layout
- **Decisión**: Envolver `<Outlet />` en `AdminLayout.jsx` con `<ErrorBoundary>`
- **Alternativa**: Envolver cada página individualmente
- **Por qué**: Menos código duplicado, cobertura completa, y el ErrorBoundary ya existe como componente

### D4: Tests de integración en backend
- **Decisión**: Tests con supertest + base de datos real (patrón existente)
- **Por qué**: Consistente con el resto del proyecto (sin mocks de BD), y los endpoints de config/stats son ideales para tests de integración

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| DashboardOverview se vuelve lento con muchos datos | El endpoint de stats usa consultas agregadas (COUNT) que son eficientes incluso con miles de registros |
| El modelo Setting no valida tipos | El service hace merge con defaults y el controller valía antes de persistir |
| ErrorBoundary captura errores de forma muy amplia | El componente ya implementa fallback UI con "Reintentar" y "Volver al inicio" — no oculta errores, los muestra gracefulmente |
| Las vistas admin responsive no se verifican en dispositivos reales | Usar Chakra UI responsive props (base/md/lg) que ya están partialmente implementadas; verificar en browser DevTools |
