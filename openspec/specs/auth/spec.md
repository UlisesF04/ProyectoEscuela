# Auth — Especificación

> Sistema de autenticación y autorización basado en JWT.
> Reglas de negocio: RN-01, RN-02

## ADDED Requirements

### Requirement: Login con email y password
El sistema SHALL autenticar usuarios mediante email y password, verificando el hash con bcrypt y emitiendo un JWT con expiración de 8 horas.

#### Scenario: Login exitoso
- **WHEN** un usuario envía `POST /api/v1/auth/login` con email y password correctos
- **THEN** el sistema responde con HTTP 200 y un objeto `{ token, user }` donde `token` es un JWT válido y `user` contiene `id`, `role`, `first_name`, `last_name`

#### Scenario: Credenciales inválidas
- **WHEN** un usuario envía `POST /api/v1/auth/login` con un email que no existe en la base de datos
- **THEN** el sistema responde con HTTP 401 y el mensaje "Credenciales inválidas"

#### Scenario: Password incorrecto
- **WHEN** un usuario envía `POST /api/v1/auth/login` con un email existente pero password incorrecto
- **THEN** el sistema responde con HTTP 401 y el mensaje "Credenciales inválidas" (mismo mensaje que email inexistente por seguridad)

#### Scenario: Cuenta desactivada
- **WHEN** un usuario con `is_active = false` intenta autenticarse con credenciales correctas
- **THEN** el sistema responde con HTTP 401 y el mensaje "Tu cuenta ha sido desactivada"

#### Scenario: Campos vacíos
- **WHEN** un usuario envía `POST /api/v1/auth/login` con email o password vacíos
- **THEN** el sistema responde con HTTP 400 y un array de errores de validación

#### Scenario: Rate limit excedido
- **WHEN** un usuario envía más de 10 intentos de login en 15 minutos desde la misma IP
- **THEN** el sistema responde con HTTP 429 y el mensaje "Demasiados intentos. Intente más tarde."

### Requirement: Obtener usuario autenticado
El sistema SHALL permitir a un usuario autenticado obtener sus datos a partir del JWT.

#### Scenario: Token válido
- **WHEN** un usuario envía `GET /api/v1/auth/me` con un header `Authorization: Bearer <token>` válido
- **THEN** el sistema responde con HTTP 200 y los datos del usuario (sin `password_hash`)

#### Scenario: Token inválido
- **WHEN** un usuario envía `GET /api/v1/auth/me` con un token inválido o expirado
- **THEN** el sistema responde con HTTP 401 y el mensaje "Token inválido o expirado"

#### Scenario: Sin token
- **WHEN** un usuario envía `GET /api/v1/auth/me` sin header Authorization
- **THEN** el sistema responde con HTTP 401 y el mensaje "Token no proporcionado"

### Requirement: Cierre de sesión
El sistema SHALL permitir al usuario cerrar su sesión actual.

#### Scenario: Logout exitoso
- **WHEN** un usuario autenticado envía `POST /api/v1/auth/logout`
- **THEN** el sistema responde con HTTP 200 y el mensaje "Sesión cerrada exitosamente"

### Requirement: Middleware de autorización por rol
El sistema SHALL verificar que el usuario autenticado tenga el rol requerido para acceder a recursos protegidos.

#### Scenario: Rol permitido
- **WHEN** un usuario con rol `admin` accede a un endpoint protegido con `roleMiddleware('admin')`
- **THEN** el middleware permite el paso al controlador

#### Scenario: Rol no permitido
- **WHEN** un usuario con rol `padre` intenta acceder a un endpoint protegido con `roleMiddleware('admin')`
- **THEN** el middleware responde con HTTP 403 y el mensaje "No tienes permisos para acceder a este recurso"

#### Scenario: Usuario no autenticado
- **WHEN** un request sin token válido intenta acceder a un endpoint protegido con `authMiddleware`
- **THEN** el middleware responde con HTTP 401

### Requirement: Redirección por rol post-login
El frontend SHALL redirigir al usuario al dashboard correspondiente según su rol después de un login exitoso.

#### Scenario: Admin redirige a /admin
- **WHEN** un usuario con rol `admin` inicia sesión exitosamente
- **THEN** el frontend redirige a la ruta `/admin`

#### Scenario: Preceptor redirige a /preceptor
- **WHEN** un usuario con rol `preceptor` inicia sesión exitosamente
- **THEN** el frontend redirige a la ruta `/preceptor`

#### Scenario: Docente redirige a /docente
- **WHEN** un usuario con rol `docente` inicia sesión exitosamente
- **THEN** el frontend redirige a la ruta `/docente`

#### Scenario: Padre redirige a /padre
- **WHEN** un usuario con rol `padre` inicia sesión exitosamente
- **THEN** el frontend redirige a la ruta `/padre`

### Requirement: Ruta protegida en frontend
El frontend SHALL proteger rutas que requieren autenticación y roles específicos, redirigiendo al login si no hay sesión activa.

#### Scenario: Acceso sin autenticación
- **WHEN** un usuario no autenticado intenta acceder a `/admin`, `/preceptor`, `/docente` o `/padre`
- **THEN** el frontend redirige a `/login`

#### Scenario: Acceso con rol incorrecto
- **WHEN** un usuario con rol `docente` intenta acceder a `/admin`
- **THEN** el frontend redirige a `/unauthorized`

### Requirement: Validación de entrada
El sistema SHALL validar los campos de entrada en el endpoint de login usando express-validator.

#### Scenario: Email inválido
- **WHEN** un usuario envía `POST /api/v1/auth/login` con un email sin formato válido
- **THEN** el sistema responde con HTTP 400 y un error de validación indicando que el email no es válido

#### Scenario: Password muy corto
- **WHEN** un usuario envía `POST /api/v1/auth/login` con un password de menos de 6 caracteres
- **THEN** el sistema responde con HTTP 400 y un error de validación
