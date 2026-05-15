# Tasks: frontend-auth-complete

## 1. Setup

- [ ] 1.1 Instalar axios (`npm install axios` en frontend/)

## 2. AuthContext + api.js

- [ ] 2.1 Crear `frontend/src/services/api.js` — Axios instance con baseURL http://localhost:5000/api, interceptor request (Bearer token), interceptor response (401 → logout + redirect)
- [ ] 2.2 Crear `frontend/src/context/AuthContext.jsx` — AuthContext con login() llama api.post /auth/login, guarda token en localStorage, setea user; logout() limpia token; initState lee token de localStorage

## 3. Componentes

- [ ] 3.1 Crear `frontend/src/components/ProtectedRoute.jsx` — recibe roles[], checkea autenticacion, redirige a /login si no auth, muestra 403 si rol no permitido
- [ ] 3.2 Crear `frontend/src/components/Layout.jsx` — header con nombre app, user email, logout button; main content area con children
- [ ] 3.3 Crear `frontend/src/pages/Dashboard.jsx` — placeholder segun rol, saluda al usuario

## 4. Modificar existentes

- [ ] 4.1 Actualizar `frontend/src/pages/Login.jsx` — useState email/password/error/loading, onSubmit llama AuthContext.login(), muestra error del servidor, loading state en boton, usa api.js
- [ ] 4.2 Reemplazar `frontend/src/App.jsx` — BrowserRouter con Routes: /login, /dashboard (protegida), / redirect segun auth
- [ ] 4.3 Actualizar `frontend/src/main.jsx` — envolver con AuthProvider

## 5. Verificacion

- [ ] 5.1 Probar login en http://localhost:5173 con admin@escuela.com / admin123
- [ ] 5.2 Probar login con credenciales invalidas → muestra error
- [ ] 5.3 Probar logout → redirige a /login
- [ ] 5.4 Probar acceso directo a /dashboard sin auth → redirige a /login
- [ ] 5.5 Verificar que npm run dev no da errores
- [ ] 5.6 Marcar CHANGE-003 como COMPLETADO en docs/CHANGES.md
