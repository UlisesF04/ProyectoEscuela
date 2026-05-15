# Spec: user-auth

## Overview

Autenticación JWT con login, logout, middleware de verificación de token y autorización por roles (admin, docente, tutor). Cumple RN-08.

## ADDED Requirements

### Requirement: Login valida credenciales y devuelve JWT

The system SHALL provide a POST /api/auth/login endpoint that accepts email and password, validates them against the database, and returns a JWT token with the user's id, email, and rol embedded in the payload.

#### Scenario: Login exitoso con credenciales correctas
- **WHEN** usuario envía POST /api/auth/login con email y password válidos
- **THEN** sistema responde 200 con { token, user: { id, email, rol } }
- **AND** token contiene id, email, rol, iat, exp (8h)

#### Scenario: Login con email inexistente
- **WHEN** usuario envía POST /api/auth/login con email no registrado
- **THEN** sistema responde 401 con { message: "Credenciales inválidas" }

#### Scenario: Login con password incorrecto
- **WHEN** usuario envía POST /api/auth/login con email válido pero password incorrecto
- **THEN** sistema responde 401 con { message: "Credenciales inválidas" }

#### Scenario: Login sin email o password
- **WHEN** usuario envía POST /api/auth/login sin email o sin password
- **THEN** sistema responde 400 con { message: "Email y contraseña son requeridos" }

### Requirement: Logout cierra sesion del cliente

The system SHALL provide a POST /api/auth/logout endpoint. Since JWT is stateless, logout is handled client-side by discarding the token. The endpoint verifies the token is present.

#### Scenario: Logout con token valido
- **WHEN** usuario autenticado envía POST /api/auth/logout con token en Header
- **THEN** sistema responde 200 con { message: "Sesión cerrada exitosamente" }

### Requirement: Middleware authenticate valida JWT

The system SHALL have an authenticate middleware that extracts the JWT from the Authorization header (Bearer scheme), verifies the signature and expiration, and attaches the decoded payload to req.user.

#### Scenario: Request con token valido
- **WHEN** request incluye Header "Authorization: Bearer <token_valido>"
- **THEN** middleware no lanza error y adjunta { id, email, rol } a req.user

#### Scenario: Request sin token
- **WHEN** request no incluye Header Authorization
- **THEN** middleware responde 401 con { message: "Token no proporcionado" }

#### Scenario: Request con token invalido
- **WHEN** request incluye Header con token malformado o firmado incorrectamente
- **THEN** middleware responde 401 con { message: "Token inválido" }

#### Scenario: Request con token expirado
- **WHEN** request incluye Header con token expirado (mas de 8h desde emisión)
- **THEN** middleware responde 401 con { message: "Token expirado" }

### Requirement: Middleware authorize restringe por rol

The system SHALL have an authorize middleware factory that accepts one or more roles and rejects requests where req.user.rol is not in the allowed list.

#### Scenario: Usuario con rol permitido
- **WHEN** request llega a ruta protegida con authorize('admin') y req.user.rol = 'admin'
- **THEN** middleware permite el paso

#### Scenario: Usuario con rol no permitido
- **WHEN** request llega a ruta protegida con authorize('admin') y req.user.rol = 'docente'
- **THEN** middleware responde 403 con { message: "No autorizado para esta acción" }

### Requirement: JWT_SECRET configurado via entorno

The system SHALL load the JWT secret from process.env.JWT_SECRET. If JWT_SECRET is not set, the server SHALL log a warning and use a development-only fallback.

#### Scenario: JWT_SECRET no configurado
- **WHEN** servidor arranca sin JWT_SECRET en .env
- **THEN** sistema muestra warning en consola pero arranca con fallback dev
