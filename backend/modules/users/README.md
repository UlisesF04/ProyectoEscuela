# Users Module

Admin-only management of teachers (docentes), preceptors (preceptores), and parents (padres).

## Overview

This module provides CRUD operations for managing users with roles: `docente`, `preceptor`, and `padre`.
All endpoints require:
1. **Authentication**: Valid JWT token in `Authorization` header
2. **Authorization**: User must have `admin` role

## Endpoints

### Create User
**POST** `/api/v1/users`

Create a new user (docente, preceptor, or padre).

**Request Body:**
```json
{
  "email": "teacher@escuela.edu",
  "password": "SecurePassword123",
  "first_name": "Juan",
  "last_name": "Pérez",
  "role": "docente",
  "phone_whatsapp": "+541234567890"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 5,
    "email": "teacher@escuela.edu",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "docente",
    "phone_whatsapp": "+541234567890",
    "is_active": true,
    "created_at": "2026-05-27T10:00:00.000Z",
    "updated_at": "2026-05-27T10:00:00.000Z"
  }
}
```

**Validation Rules:**
- `email`: Required, must be valid email format, unique
- `password`: Required, minimum 8 characters
- `first_name`: Required, minimum 2 characters
- `last_name`: Required, minimum 2 characters
- `role`: Required, must be one of: `docente`, `preceptor`, `padre`
- `phone_whatsapp`: Optional, valid E.164 phone format

---

### Get All Users
**GET** `/api/v1/users`

Get all non-admin users.

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 5,
      "email": "teacher@escuela.edu",
      "first_name": "Juan",
      "last_name": "Pérez",
      "role": "docente",
      "phone_whatsapp": "+541234567890",
      "is_active": true,
      "created_at": "2026-05-27T10:00:00.000Z",
      "updated_at": "2026-05-27T10:00:00.000Z"
    }
  ]
}
```

---

### Get Users by Role
**GET** `/api/v1/users/role/:role`

Get all users with a specific role.

**Parameters:**
- `role`: One of `docente`, `preceptor`, `padre`

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 5,
      "email": "teacher@escuela.edu",
      "first_name": "Juan",
      "last_name": "Pérez",
      "role": "docente",
      "phone_whatsapp": "+541234567890",
      "is_active": true,
      "created_at": "2026-05-27T10:00:00.000Z",
      "updated_at": "2026-05-27T10:00:00.000Z"
    }
  ]
}
```

---

### Get User by ID
**GET** `/api/v1/users/:id`

Get a specific user by ID.

**Parameters:**
- `id`: User ID (integer)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 5,
    "email": "teacher@escuela.edu",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "docente",
    "phone_whatsapp": "+541234567890",
    "is_active": true,
    "created_at": "2026-05-27T10:00:00.000Z",
    "updated_at": "2026-05-27T10:00:00.000Z"
  }
}
```

---

### Update User
**PUT** `/api/v1/users/:id`

Update user information (partial update allowed).

**Parameters:**
- `id`: User ID (integer)

**Request Body (all optional):**
```json
{
  "email": "newemail@escuela.edu",
  "first_name": "Carlos",
  "last_name": "González",
  "phone_whatsapp": "+549876543210",
  "is_active": false
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id": 5,
    "email": "newemail@escuela.edu",
    "first_name": "Carlos",
    "last_name": "González",
    "role": "docente",
    "phone_whatsapp": "+549876543210",
    "is_active": false,
    "created_at": "2026-05-27T10:00:00.000Z",
    "updated_at": "2026-05-27T10:15:00.000Z"
  }
}
```

**Important Notes:**
- Cannot update `role` (immutable after creation)
- Cannot update `password` through this endpoint (use dedicated password change endpoint)
- Email must be unique if changed

---

### Deactivate User (Soft Delete)
**DELETE** `/api/v1/users/:id`

Deactivate a user (soft delete — sets `is_active = false`). The record is preserved in the database but excluded from all active queries.

**Parameters:**
- `id`: User ID (integer)

**Response (200):**
```json
{
  "status": "success",
  "message": "Usuario desactivado exitosamente"
}
```

**Important Notes:**
- Cannot deactivate users with `admin` role
- Deactivated users can be reactivated via `PUT /api/v1/users/:id` with `{ "is_active": true }`
- Reactivation preserves all original data and associations

---

### Get Multiple Users by IDs
**POST** `/api/v1/users/bulk/get`

Retrieve multiple users by their IDs in one request.

**Request Body:**
```json
{
  "ids": [5, 6, 7]
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 5,
      "email": "teacher@escuela.edu",
      "first_name": "Juan",
      "last_name": "Pérez",
      "role": "docente",
      "phone_whatsapp": "+541234567890",
      "is_active": true,
      "created_at": "2026-05-27T10:00:00.000Z",
      "updated_at": "2026-05-27T10:00:00.000Z"
    }
  ]
}
```

---

## Error Responses

**400 - Bad Request:**
```json
{
  "status": "error",
  "message": "Validation error message"
}
```

**401 - Unauthorized:**
```json
{
  "status": "error",
  "message": "Token no proporcionado"
}
```

**403 - Forbidden:**
```json
{
  "status": "error",
  "message": "No tienes permisos para acceder a este recurso"
}
```

**404 - Not Found:**
```json
{
  "status": "error",
  "message": "Usuario no encontrado"
}
```

**409 - Conflict:**
```json
{
  "status": "error",
  "message": "El correo electrónico ya está registrado"
}
```

---

## Security Considerations

1. **Admin-Only Access**: All endpoints require `admin` role
2. **Password Protection**: Passwords are hashed with bcrypt (12 rounds)
3. **Password Never Returned**: API never returns password hashes
4. **Email Uniqueness**: Emails are unique and validated
5. **Role Immutability**: User roles cannot be changed after creation
6. **Admin Protection**: Admin users cannot be deactivated
7. **Input Validation**: All inputs are validated with express-validator

---

## Implementation Notes

- Password hashing uses bcrypt with 12 rounds
- Passwords must be at least 8 characters
- Phone numbers follow E.164 international format
- All timestamps in ISO 8601 UTC format
- Response never includes password hashes
