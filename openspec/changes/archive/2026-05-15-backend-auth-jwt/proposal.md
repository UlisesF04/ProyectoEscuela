## Why

El sistema necesita autenticación segura con JWT para proteger rutas según rol (admin, docente, tutor). Sin esto ningún módulo backend puede validar quién hace cada request. CHANGE-002 es el segundo paso después del schema DB.

## What Changes

- Crear módulo `backend/modules/auth/` con modelo, controlador, rutas y middleware
- Endpoint POST `/api/auth/login` — validar email+password, devolver JWT con rol embebido
- Endpoint POST `/api/auth/logout` — invalidar token del lado cliente (borrado local)
- Middleware JWT que verifica token en header Authorization, decodifica payload, adjunta usuario a `req`
- Middleware de roles para restringir acceso según `req.user.rol`
- El modelo Usuario ya existe en `backend/models/Usuario.js` — reutilizar

## Capabilities

### New Capabilities
- `user-auth`: Autenticación JWT con login, logout, middleware de verificación de token y autorización por roles (admin, docente, tutor)

### Modified Capabilities
- *(ninguna — primera implementación de auth)*

## Impact

- **Backend**: `backend/modules/auth/auth.controller.js`, `auth.routes.js`, `auth.middleware.js` (nuevos)
- **Backend**: `backend/app.js` (montar rutas `/api/auth`)
- **No breaking changes**: CHANGE-002 no modifica rutas existentes
