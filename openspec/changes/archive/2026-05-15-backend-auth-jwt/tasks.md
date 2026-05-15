# Tasks: backend-auth-jwt

## 1. Modulo Auth

- [ ] 1.1 Crear `backend/modules/auth/auth.controller.js` — login (buscar usuario por email, comparar bcrypt, generar JWT con payload {id, email, rol}, exp 8h) y logout (verificar token presente)
- [ ] 1.2 Crear `backend/modules/auth/auth.middleware.js` — authenticate (extraer Bearer token, verificar con jwt.verify, adjuntar req.user) y authorize(...roles) (check req.user.rol in roles, 403 si no)
- [ ] 1.3 Crear `backend/modules/auth/auth.routes.js` — POST /login, POST /logout (con authenticate)

## 2. Integracion

- [ ] 2.1 Modificar `backend/app.js` — importar authRoutes, montar en /api/auth

## 3. Verificacion

- [ ] 3.1 Probar login con credenciales del seed (admin@escuela.com / admin123)
- [ ] 3.2 Probar login con credenciales invalidas (debe dar 401)
- [ ] 3.3 Probar logout con token valido
- [ ] 3.4 Probar ruta protegida sin token (debe dar 401)
- [ ] 3.5 Verificar que npm start funciona sin errores
- [ ] 3.6 Marcar CHANGE-002 como COMPLETADO en docs/CHANGES.md
