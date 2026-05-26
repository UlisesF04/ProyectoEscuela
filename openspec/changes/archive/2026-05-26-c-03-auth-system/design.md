# Design: C-03 Auth System

## Architecture Overview

Sistema de autenticación JWT con arquitectura de middleware chain. El backend emite tokens HS256 con 8h de expiración. El frontend gestiona el estado de autenticación via Context API + useReducer, almacenando el token en memoria (no en localStorage por seguridad). Cada request autenticado incluye el token en el header `Authorization: Bearer <token>`.

```
Login flow:
  LoginPage → authService.login() → POST /api/v1/auth/login
    → validationMiddleware → authController → authService
    → bcrypt.compare → JWT sign → { token, user }
  → AuthContext dispatch LOGIN_SUCCESS → redirect por rol

Protected request:
  Axios interceptor → attach Bearer token
  → authMiddleware (verify JWT) → roleMiddleware (check role) → controller
```

## Components

### Backend

#### `modules/auth/auth.service.js`
- **Responsibility**: Lógica de negocio de autenticación
- **Location**: `backend/modules/auth/auth.service.js`
- **Interface**:
  - `login(email, password)` → `{ token, user }` | throws `AppError(401)`
  - `getMe(userId)` → `user` (without password_hash)

#### `modules/auth/auth.controller.js`
- **Responsibility**: Orquestar request/response, delegar en service
- **Location**: `backend/modules/auth/auth.controller.js`
- **Methods**: `login()`, `logout()`, `me()`

#### `modules/auth/auth.routes.js`
- **Responsibility**: Definir rutas con middlewares
- **Location**: `backend/modules/auth/auth.routes.js`
- **Endpoints**:
  - `POST /login` → validationMiddleware → rateLimiter → controller.login
  - `POST /logout` → authMiddleware → controller.logout
  - `GET /me` → authMiddleware → controller.me

#### `middlewares/authMiddleware.js`
- **Responsibility**: Extraer JWT del header, verificar con `jsonwebtoken.verify()`, adjuntar `req.user`
- **Location**: `backend/middlewares/authMiddleware.js`
- **Comportamiento**: 401 si no hay token, 401 si expiró/inválido

#### `middlewares/roleMiddleware.js`
- **Responsibility**: Factory que recibe roles permitidos, retorna middleware que verifica `req.user.role`
- **Location**: `backend/middlewares/roleMiddleware.js`
- **Comportamiento**: 403 si el rol no está en la lista permitida

#### `middlewares/validationMiddleware.js`
- **Responsibility**: Envuelve validaciones de express-validator, devuelve 400 con array de errores
- **Location**: `backend/middlewares/validationMiddleware.js`
- **Comportamiento**: 400 con `{ status: 'error', errors: [{ field, message }] }`

### Frontend

#### `context/AuthContext.jsx`
- **Responsibility**: Estado global de autenticación via Context API + useReducer
- **Location**: `frontend/src/context/AuthContext.jsx`
- **State**: `{ user, token, loading, error }`
- **Actions**: `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `SET_LOADING`, `CLEAR_ERROR`

#### `services/api.js`
- **Responsibility**: Instancia Axios con `baseURL` desde env, interceptor para token Bearer
- **Location**: `frontend/src/services/api.js`

#### `services/authService.js`
- **Responsibility**: Funciones para login, logout, getMe
- **Location**: `frontend/src/services/authService.js`
- **Interface**: `login(email, password)`, `logout()`, `getMe()`

#### `routes/ProtectedRoute.jsx`
- **Responsibility**: Componente guard que verifica auth + rol antes de renderizar children
- **Location**: `frontend/src/routes/ProtectedRoute.jsx`
- **Props**: `requiredRoles` (array), redirect a `/login` si no auth, a `/unauthorized` si rol incorrecto

#### `routes/AppRoutes.jsx`
- **Responsibility**: Definición centralizada de rutas con role-based rendering
- **Location**: `frontend/src/routes/AppRoutes.jsx`

## Data Model

No se crean nuevos modelos. Se utiliza el modelo `User` existente:

| Campo | Tipo | Uso en auth |
|-------|------|-------------|
| `email` | STRING(255) UNIQUE | Identificador para login |
| `password_hash` | STRING(255) | Hash bcrypt para verificación |
| `role` | ENUM(admin,preceptor,docente,padre) | Autorización RBAC |
| `is_active` | BOOLEAN | Control de cuenta activa (RN-02) |

**JWT Payload**:
```json
{
  "id": 1,
  "role": "admin",
  "email": "admin@escuela.com",
  "iat": 1717000000,
  "exp": 1717028800
}
```

## API Changes

### Nuevos Endpoints

| Método | Ruta | Auth | Rate Limit | Descripción |
|--------|------|------|------------|-------------|
| POST | `/api/v1/auth/login` | No | 10/15min | Autenticar y obtener token |
| POST | `/api/v1/auth/logout` | Sí | — | Invalidar sesión (client-side) |
| GET | `/api/v1/auth/me` | Sí | — | Obtener usuario autenticado |

### Request/Response

**POST /api/v1/auth/login**
```
Request:  { "email": "admin@escuela.com", "password": "123456" }
Success:  { "token": "eyJ...", "user": { "id": 1, "role": "admin", "first_name": "Admin", "last_name": "Sistema" } }
Error 401: { "status": "error", "message": "Credenciales inválidas" }
Error 429: { "status": "error", "message": "Demasiados intentos. Intente más tarde." }
```

**GET /api/v1/auth/me**
```
Headers:  Authorization: Bearer eyJ...
Success:  { "id": 1, "email": "admin@escuela.com", "role": "admin", "first_name": "Admin", "last_name": "Sistema" }
Error 401: { "status": "error", "message": "Token inválido o expirado" }
```

## Implementation Notes

1. **bcrypt compare directo**: No se usa hook de Sequelize para comparar passwords. El service recibe el password plano y lo compara con `password_hash` usando `bcrypt.compare()`. Esto mantiene la separación de responsabilidades.

2. **Token en memoria, no localStorage**: El token se guarda en el estado del AuthContext (memoria). No se persiste en localStorage para evitar vulnerabilidad XSS. Esto implica que al refrescar la página el usuario debe volver a login — trade-off asumido a favor de seguridad.

3. **Rate limit específico**: El global (100/15min) ya existe en `app.js`. Se agrega un rate limit específico de 10 intentos/15min solo para la ruta `/auth/login` para prevenir fuerza bruta.

4. **Redirección por rol post-login**: El AuthContext expone `user.role`. LoginPage usa un mapa `{ admin: '/admin', preceptor: '/preceptor', docente: '/docente', padre: '/padre' }` para redirigir.

5. **Mensajes de error genéricos**: Por seguridad, tanto "email no existe" como "password incorrecto" devuelven el mismo mensaje "Credenciales inválidas" para no filtrar qué usuarios están registrados.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Token expuesto en red | Usar HTTPS en producción. El token solo viaja en header Authorization |
| Fuerza bruta en login | Rate limiter de 10 intentos/15min específico para `/auth/login` |
| Token en memoria se pierde al refrescar | Trade-off consciente. UX se mejora en C-11 con refresh tokens opcionales |
| JWT sin refresh token | Asumido para MVP. El token de 8h es suficiente para una sesión escolar. Refresh tokens se考虑an como mejora futura |
