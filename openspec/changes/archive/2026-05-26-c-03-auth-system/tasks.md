## 1. Backend — Middlewares base

- [x] 1.1 Crear `backend/middlewares/authMiddleware.js` — extrae JWT del header `Authorization: Bearer <token>`, verifica con `jsonwebtoken.verify()`, adjunta `req.user`
- [x] 1.2 Crear `backend/middlewares/roleMiddleware.js` — factory que recibe roles permitidos, retorna middleware que verifica `req.user.role`, responde 403 si no coincide
- [x] 1.3 Crear `backend/middlewares/validationMiddleware.js` — envuelve validaciones de express-validator, devuelve 400 con `{ status: 'error', errors: [{ field, message }] }`

## 2. Backend — Módulo Auth

- [x] 2.1 Crear `backend/modules/auth/auth.service.js` — `login(email, password)` con bcrypt.compare, JWT.sign, manejo de `is_active: false`; `getMe(userId)` que devuelve usuario sin `password_hash`
- [x] 2.2 Crear `backend/modules/auth/auth.controller.js` — `login()`, `logout()`, `me()` que delegan en authService
- [x] 2.3 Crear `backend/modules/auth/auth.routes.js` — `POST /login` con validationMiddleware + rate limiter (10/15min), `POST /logout` con authMiddleware, `GET /me` con authMiddleware
- [x] 2.4 Editar `backend/app.js` — registrar `authRoutes` en `/api/v1/auth`, configurar rate limiter específico para login

## 3. Frontend — Capa de servicios y auth global

- [x] 3.1 Crear `frontend/src/services/api.js` — instancia Axios con `baseURL` desde `import.meta.env.VITE_API_URL` o `http://localhost:5000/api/v1`, interceptor que adjunta token Bearer desde AuthContext
- [x] 3.2 Crear `frontend/src/services/authService.js` — funciones `login(email, password)`, `logout()`, `getMe()` que usan la instancia api
- [x] 3.3 Crear `frontend/src/context/AuthContext.jsx` — Context + Provider con useReducer, estados `{ user, token, loading, error }`, acciones `LOGIN_SUCCESS | LOGIN_FAILURE | LOGOUT | SET_LOADING | CLEAR_ERROR`
- [x] 3.4 Editar `frontend/src/main.jsx` — envolver App con `<AuthProvider>`

## 4. Frontend — Rutas protegidas y login

- [x] 4.1 Crear `frontend/src/routes/ProtectedRoute.jsx` — componente guard que verifica autenticación (redirect `/login` si no hay token) y rol (redirect `/unauthorized` si rol incorrecto)
- [x] 4.2 Crear `frontend/src/routes/AppRoutes.jsx` — definición centralizada de rutas con ProtectedRoute para cada dashboard por rol
- [x] 4.3 Editar `frontend/src/App.jsx` — reemplazar Routes placeholder con `<AppRoutes />`
- [x] 4.4 Editar `frontend/src/pages/Login.jsx` — conectar formulario a authContext: onSubmit llama a authService.login, muestra errores de validación y 401/429, redirige según rol post-login

## 5. Tests

- [x] 5.1 Crear `backend/tests/auth.test.js` — login exitoso, credenciales inválidas (email inexistente y password incorrecto), cuenta desactivada (is_active: false), rate limit (10 intentos), ruta protegida sin token (GET /me sin header)
