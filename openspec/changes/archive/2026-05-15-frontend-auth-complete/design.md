## Context

Frontend React 19 + Chakra UI v3 + React Router v7. Login.jsx existe como componente estático (formulario sin estado ni API). App.jsx renderiza Login sin routing. Proyecto usa Atomic Design para componentes.

## Goals / Non-Goals

**Goals:**
- AuthContext con login(email, password), logout(), user, token, isAuthenticated, isLoading
- api.js con Axios instance: baseURL a localhost:5000, interceptor request agrega Bearer token, interceptor response redirige a /login si 401
- ProtectedRoute que acepta roles permitidos, redirige a /login si no autenticado, muestra 403 si rol no autorizado
- Layout básico con header responsive (logo + nav + user menu) según rol
- Login.jsx funcional: useState para email/password, onSubmit llama AuthContext.login, loading state, error message
- App.jsx con BrowserRouter, Routes: /login, /dashboard, / (redirige según rol)

**Non-Goals:**
- Páginas de dashboard reales (son CHANGES 009-013)
- Diseño responsive completo (básico sí, pulido después)

## Decisions

1. **Axios sobre fetch**: interceptores más limpios, mejor manejo de errores, ya planeado en roadmap
2. **localStorage para JWT**: simple para desarrollo. HttpOnly cookies en producción después
3. **Context API sobre Redux/Zustand**: alcance acotado, solo auth state
4. **AuthProvider envuelve toda la app**: en main.jsx, antes de Router
5. **Redirect post-login por rol**: admin → /dashboard, docente → /dashboard, tutor → /dashboard (por ahora todos al mismo placeholder)
6. **Estilo existente como base**: mantener paleta #2d3e50 (navy) + #1976d2 (blue) del Login actual. Refinar sin romper identidad visual

## Component Architecture (Atomic Design)

```
Átomos:
  LoadingSpinner — spinner animado para estados de carga

Moléculas:
  LoginForm — formulario con email, password, submit, error display

Organismos:
  AuthProvider — Context provider con lógica de login/logout/token
  ProtectedRoute — wrapper de ruta con verificación de auth + rol

Páginas:
  Login — LoginForm + branding
  Dashboard — placeholder segun rol (admin/docente/tutor)

Layout:
  AppLayout — header + main + children
```

## API Contract (Frontend → Backend)

### POST /api/auth/login
```
Request:  { email: string, password: string }
Response 200: { token: string, user: { id, email, rol } }
Response 400/401: { message: string }
Error handling: mostrar mensaje de error del servidor
```

## Routes

```
/login          → Login page (pública)
/dashboard      → Dashboard (protegida, todos los roles)
/               → redirect a /dashboard si autenticado, /login si no
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Token expuesto en localStorage | Aceptable para MVP. HttpOnly cookies en deploy |
| Sin refresh token | Token 8h. Sesión expira → redirect a login |
| Backend caído al iniciar sesión | Mostrar error claro "Error de conexión con el servidor" |
