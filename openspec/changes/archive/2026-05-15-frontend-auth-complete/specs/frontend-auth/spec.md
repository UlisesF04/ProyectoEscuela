# Spec: frontend-auth

## Overview

Autenticación frontend: login conectado a backend, AuthContext con estado global, Axios interceptor para JWT, rutas protegidas por rol, y layout base.

## ADDED Requirements

### Requirement: Login form conectado a API

The system SHALL provide a login form that captures email and password, calls POST /api/auth/login, stores the JWT token in localStorage, and redirects to the dashboard on success.

#### Scenario: Login exitoso redirige a dashboard
- **WHEN** usuario completa email y password correctos y hace submit
- **THEN** se llama POST /api/auth/login
- **AND** token se guarda en localStorage
- **AND** usuario redirige a /dashboard

#### Scenario: Login fallido muestra error
- **WHEN** usuario ingresa credenciales invalidas y hace submit
- **THEN** se muestra mensaje de error del servidor
- **AND** usuario permanece en /login

#### Scenario: Login loading state
- **WHEN** usuario hace submit y la peticion esta en curso
- **THEN** boton de submit se deshabilita y muestra spinner

### Requirement: AuthContext maneja estado global de sesion

The system SHALL have an AuthContext that exposes: user (object|null), token (string|null), isAuthenticated (bool), isLoading (bool), login(email, password), logout().

#### Scenario: AuthContext disponible en toda la app
- **WHEN** cualquier componente consume useAuth()
- **THEN** recibe user, token, isAuthenticated, isLoading, login, logout

#### Scenario: Token persistido al recargar
- **WHEN** usuario recarga la pagina
- **THEN** AuthContext lee token de localStorage
- **AND** si token existe, setea isAuthenticated = true y decodifica user

### Requirement: Axios interceptor adjunta JWT automaticamente

The system SHALL have an Axios instance with a request interceptor that attaches the Authorization: Bearer header when a token exists in localStorage, and a response interceptor that redirects to /login on 401 errors.

#### Scenario: Request lleva token
- **WHEN** api.js hace cualquier request
- **THEN** header Authorization: Bearer <token> se adjunta automaticamente

#### Scenario: 401 redirige a login
- **WHEN** API responde 401 Unauthorized
- **THEN** interceptor limpia token de localStorage
- **AND** redirige a /login

### Requirement: Rutas protegidas por rol

The system SHALL have a ProtectedRoute component that checks authentication and role authorization. Unauthenticated users redirect to /login. Users without required role see a 403 page.

#### Scenario: Usuario no autenticado redirige a login
- **WHEN** usuario no autenticado intenta acceder a /dashboard
- **THEN** ProtectedRoute redirige a /login

#### Scenario: Usuario sin rol permitido ve 403
- **WHEN** usuario con rol 'tutor' intenta acceder a ruta protegida con roles=['admin']
- **THEN** ProtectedRoute muestra mensaje "No autorizado"

#### Scenario: Usuario autenticado accede normalmente
- **WHEN** usuario autenticado con rol permitido accede a ruta protegida
- **THEN** ruta se renderiza normalmente

### Requirement: Layout basico con navegacion

The system SHALL have a Layout component with a header showing the app name, navigation links based on role, a user menu (email + logout button), and a main content area.

#### Scenario: Layout muestra nav segun rol
- **WHEN** usuario autenticado como admin ve el layout
- **THEN** header muestra nombre de la app y boton de cerrar sesion
