## Context

Backend Node.js con Express + Sequelize, ESM. Ya existe `backend/models/Usuario.js` con tabla `usuarios` que tiene email, password_hash, rol (enum: admin|docente|tutor). Schema DB completo desde CHANGE-001.

## Goals / Non-Goals

**Goals:**
- Login con email+password que devuelve JWT firmado
- Logout del lado cliente (borrar token)
- Middleware `authenticate` que extrae y valida JWT del header `Authorization: Bearer <token>`
- Middleware `authorize(...roles)` que verifica rol del usuario contra lista permitida
- Token expira en 8h (RN-08)
- Error 401 genérico en credenciales inválidas (no revelar si usuario existe)
- Manejo de errores consistente: 400 si falta campo, 401 si token inválido/expirado, 403 si rol no autorizado

**Non-Goals:**
- HU-003 (recuperación de contraseña) — pospuesto
- Refresh tokens — fuera de alcance del MVP
- Rate limiting — se agrega en fase de despliegue

## Decisions

1. **bcryptjs para hash** — ya en `package.json`. Comparar con `bcrypt.compare()`.

2. **Payload JWT mínimo**: `{ id, email, rol, iat, exp }`. Sin datos sensibles.

3. **Middleware pipeline**: `authenticate` primero (valida token → `req.user`), luego `authorize('admin','docente')` si aplica.

4. **Error genérico en login**: Siempre "Credenciales inválidas" sin distinguir email vs password incorrecto (previene enumeración de usuarios).

5. **Logout**: Eliminar token del cliente (localStorage/context). Backend no mantiene sesión (stateless JWT).

## API Contract

### POST /api/auth/login
```
Request:  { email: string, password: string }
Response 200: { token: string, user: { id, email, rol, nombre } }
Response 400: { message: "Email y contraseña son requeridos" }
Response 401: { message: "Credenciales inválidas" }
```

### POST /api/auth/logout
```
Request:  (token en Header)
Response 200: { message: "Sesión cerrada exitosamente" }
Response 401: { message: "Token no proporcionado" }
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Token expuesto en cliente | Usar httpOnly cookies en producción; localStorage para desarrollo |
| Sin refresh token, sesión expira abruptamente | Token 8h es suficiente para MVP. Mejorar después |
| JWT_SECRET hardcodeado | Ya en .env.example. Validar que exista en producción |
