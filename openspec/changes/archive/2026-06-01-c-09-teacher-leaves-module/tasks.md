## 1. Modelo y Configuración Backend

- [x] 1.1 Crear modelo Sequelize `Licence` con campos: `id`, `user_id`, `title`, `file_url`, `file_name`, `file_mime`, `file_size`, `file_data`
- [x] 1.2 Registrar asociaciones en `backend/models/index.js`: `User.hasMany(Licence)` y `Licence.belongsTo(User)`
- [x] 1.3 Configurar Multer en `backend/config/multerLicences.js` con `memoryStorage()` y límite de 10 MB
- [x] 1.4 Sincronizar tabla `licences` vía Sequelize `sync({ alter: true })` en `app.js`

## 2. Endpoints Backend

- [x] 2.1 Implementar `POST /api/v1/licences` — crear presentación con título y archivo opcional (solo docente/preceptor/padre)
- [x] 2.2 Implementar `GET /api/v1/licences/me` — listar licencias del usuario autenticado
- [x] 2.3 Implementar `GET /api/v1/licences/admin` — listar todas las licencias (solo admin)
- [x] 2.4 Implementar `GET /api/v1/licences/from-parents` — listar licencias de padres (solo preceptor)
- [x] 2.5 Implementar `GET /api/v1/licences/:id/download` — descargar archivo adjunto con Content-Type y nombre originales
- [x] 2.6 Registrar rutas en `backend/app.js` bajo `/api/v1/licences`

## 3. Service y Controller Backend

- [x] 3.1 Crear `backend/modules/licences/licences.service.js` con lógica de negocio
- [x] 3.2 Crear `backend/modules/licences/licences.controller.js` con handlers Express
- [x] 3.3 Crear `backend/modules/licences/licences.routes.js` con middleware de auth por endpoint

## 4. Frontend — Service

- [x] 4.1 Crear `frontend/src/services/licencesService.js` con métodos: `getMyLicences()`, `getAllForAdmin()`, `getLicencesFromParents()`, `create(formData)`, `download(id)`

## 5. Frontend — Páginas

- [x] 5.1 Crear `frontend/src/pages/docente/MyLeavesPage.jsx` — listado de licencias propias + formulario de nueva presentación con upload de archivo
- [x] 5.2 Crear `frontend/src/pages/preceptor/MyLeavesPage.jsx` — idéntica a la de docente, adaptada para rol preceptor
- [x] 5.3 Crear `frontend/src/pages/admin/LeavesPage.jsx` — tabla con todas las licencias del sistema y botón de descarga de archivo

## 6. Integración y Routing

- [x] 6.1 Conectar `MyLeavesPage` (docente) al routing de `DocenteDashboard` bajo la sección de licencias
- [x] 6.2 Conectar `MyLeavesPage` (preceptor) al routing de `PreceptorDashboard`
- [x] 6.3 Conectar `LeavesPage` al routing de `AdminDashboard` bajo la sección de licencias
- [x] 6.4 Verificar que todas las páginas consumen datos reales del backend (sin mocks)
