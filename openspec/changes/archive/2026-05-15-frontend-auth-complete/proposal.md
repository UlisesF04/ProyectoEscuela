## Why

El frontend tiene Login.jsx estático (sin conexión a backend) y App.jsx sin routing. No hay gestión de sesión, rutas protegidas ni comunicación con la API. Sin este change los usuarios no pueden autenticarse desde el frontend.

## What Changes

- Instalar axios como cliente HTTP
- Crear AuthContext con login/logout, persistencia JWT en localStorage, estado global de sesión
- Crear api.js con interceptors que adjuntan token automáticamente
- Crear ProtectedRoute para rutas según rol
- Crear Layout con navegación básica por rol
- Conectar Login.jsx a POST /api/auth/login con manejo de errores
- Configurar React Router v7 con rutas: /login, /dashboard (placeholder), y redirect por rol
- Actualizar main.jsx con AuthProvider

## Capabilities

### New Capabilities
- `frontend-auth`: Autenticación frontend con AuthContext, Axios interceptor, rutas protegidas por rol, y Login conectado a API

### Modified Capabilities
- *(ninguna)*

## Impact

- **Frontend**: `src/services/api.js`, `src/context/AuthContext.jsx`, `src/components/ProtectedRoute.jsx`, `src/components/Layout.jsx` (nuevos)
- **Frontend**: `src/pages/Login.jsx`, `src/App.jsx`, `src/main.jsx` (modificados)
- **Dependencia**: axios agregada a package.json
