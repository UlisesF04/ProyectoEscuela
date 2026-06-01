## Why

Los docentes y preceptores necesitan un canal formal para presentar documentación de licencias a la administración. Sin este módulo, el proceso se manejaba fuera del sistema (papel, email), sin trazabilidad ni historial centralizado.

## What Changes

- Nuevo módulo backend `modules/licences/` con endpoints para crear y consultar presentaciones de licencia
- Nuevo modelo Sequelize `Licence` para almacenar título, archivo adjunto y vínculo al usuario
- Configuración Multer para aceptar archivos JPG/PNG/PDF hasta 10 MB (almacenamiento en BLOB)
- Nuevas páginas frontend `MyLeavesPage.jsx` (docente y preceptor) y `LeavesPage.jsx` (admin)
- Nuevo service `licencesService.js` que conecta el frontend con los endpoints reales

## Capabilities

### New Capabilities

- `teacher-leaves`: Módulo de presentación de documentación de licencias. Permite a docentes y preceptores registrar una licencia con título y archivo adjunto opcional, y a los administradores ver todas las presentaciones del sistema.

### Modified Capabilities

## Impact

- **Backend**: `backend/modules/licences/` (controller, service, routes), `backend/models/Licence.js`, `backend/config/multerLicences.js`, registro en `backend/app.js`
- **Frontend**: `frontend/src/pages/docente/MyLeavesPage.jsx`, `frontend/src/pages/preceptor/MyLeavesPage.jsx`, `frontend/src/pages/admin/LeavesPage.jsx`, `frontend/src/services/licencesService.js`
- **BD**: tabla `licences` (auto-sync Sequelize — sin migración formal)
- **Sin cambios**: modelos core, auth, módulos de asistencias y calificaciones
