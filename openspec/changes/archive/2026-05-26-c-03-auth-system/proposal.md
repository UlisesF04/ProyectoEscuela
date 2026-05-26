## Why

El sistema necesita un módulo de autenticación y autorización para controlar el acceso según el rol de cada usuario (admin, preceptor, docente, padre). Sin este módulo, ningún endpoint protegido puede funcionar, y el sistema es inseguro. Es el change crítico que desbloquea todo el GATE 2 del roadmap.

## What Changes

- Nuevo módulo backend `modules/auth/` con rutas, controlador y service para login/logout/me
- `POST /api/v1/auth/login` — autenticación con email+password, bcrypt verify, JWT (HS256, 8h exp)
- `POST /api/v1/auth/logout` — invalidación client-side (elimina token del estado)
- `GET /api/v1/auth/me` — devuelve usuario autenticado desde payload del JWT
- Middlewares: `authMiddleware` (JWT validation), `roleMiddleware(roles...)`, `validationMiddleware` (express-validator)
- Rate limiting específico: 10 intentos/15min en `/auth/login`
- Frontend: `AuthContext` (Context API + useReducer), `authService.js` (axios), `AppRoutes.jsx`, `ProtectedRoute.jsx`
- `LoginPage.jsx` — formulario con validación, mensajes de error, redirección por rol
- Tests de integración: login exitoso, credenciales inválidas, cuenta desactivada, rate limit, ruta protegida sin token

## Capabilities

### New Capabilities
- `auth`: Autenticación de usuarios con email+password, emisión y validación de JWT, control de sesión y cierre de sesión

### Modified Capabilities
- *(ninguna — es el primer módulo de seguridad del sistema)*

## Impact

- **Backend**: nuevo directorio `modules/auth/`, nuevos middlewares, registro de rutas en `app.js`
- **Frontend**: nuevo `context/AuthContext.jsx`, `services/authService.js`, `services/api.js`, `routes/AppRoutes.jsx`, `routes/ProtectedRoute.jsx`, modificación de `App.jsx` y `Login.jsx`
- **Dependencias**: ya incluidas en `package.json` (bcrypt, jsonwebtoken, express-validator, express-rate-limit)
- **Base de datos**: utiliza el modelo `User` existente (C-02) con su campo `password_hash`
- **Reglas de negocio cubiertas**: RN-01 (rol único), RN-02 (cuenta desactivada)
