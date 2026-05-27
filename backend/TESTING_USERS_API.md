# Backend User Management - Testing Guide

## Prerequisites

1. **Backend running** on `http://localhost:5000`
2. **Database seeded** with demo data (admin user exists)
3. **Get Admin Token** first by logging in

---

## Step 1: Get Admin Token (Login)

### Endpoint
```
POST http://localhost:5050/api/v1/auth/login
```

### Request
```bash
curl -X POST http://localhost:5050/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@escuela.edu",
    "password": "password123"
  }'
```

### Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "role": "admin",
    "first_name": "Admin",
    "last_name": "Sistema"
  }
}
```

**⚠️ Important:** Copy the `token` value — you'll need it for all user management requests!

---

## Test 1: Create a User (Teacher)

### Endpoint
```
POST http://localhost:5050/api/v1/users
```

### Request
```bash
curl -X POST http://localhost:5050/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "email": "nuevo.docente@escuela.edu",
    "password": "StrongPassword123",
    "first_name": "Carlos",
    "last_name": "García",
    "role": "docente",
    "phone_whatsapp": "+541234567890"
  }'
```

### Response (201 Created)
```json
{
  "status": "success",
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 5,
    "email": "nuevo.docente@escuela.edu",
    "first_name": "Carlos",
    "last_name": "García",
    "role": "docente",
    "phone_whatsapp": "+541234567890",
    "is_active": true,
    "created_at": "2026-05-27T10:30:45.000Z",
    "updated_at": "2026-05-27T10:30:45.000Z"
  }
}
```

**⚠️ Note the `id` (5 in this example) — you'll use it for update and deactivation tests!**

---

## Test 2: Create a Parent

### Endpoint
```
POST http://localhost:5050/api/v1/users
```

### Request
```bash
curl -X POST http://localhost:5050/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "email": "juan.padre@escuela.edu",
    "password": "SecurePass456",
    "first_name": "Juan",
    "last_name": "Rodríguez",
    "role": "padre",
    "phone_whatsapp": "+549876543210"
  }'
```

### Response (201 Created)
```json
{
  "status": "success",
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 6,
    "email": "juan.padre@escuela.edu",
    "first_name": "Juan",
    "last_name": "Rodríguez",
    "role": "padre",
    "phone_whatsapp": "+549876543210",
    "is_active": true,
    "created_at": "2026-05-27T10:35:20.000Z",
    "updated_at": "2026-05-27T10:35:20.000Z"
  }
}
```

---

## Test 3: Create a Preceptor

### Endpoint
```
POST http://localhost:5050/api/v1/users
```

### Request
```bash
curl -X POST http://localhost:5050/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "email": "sofia.preceptor@escuela.edu",
    "password": "PreceptorPass789",
    "first_name": "Sofía",
    "last_name": "López",
    "role": "preceptor",
    "phone_whatsapp": "+541111111111"
  }'
```

### Response (201 Created)
```json
{
  "status": "success",
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 7,
    "email": "sofia.preceptor@escuela.edu",
    "first_name": "Sofía",
    "last_name": "López",
    "role": "preceptor",
    "phone_whatsapp": "+541111111111",
    "is_active": true,
    "created_at": "2026-05-27T10:40:15.000Z",
    "updated_at": "2026-05-27T10:40:15.000Z"
  }
}
```

---

## Test 4: Get All Users

### Endpoint
```
GET http://localhost:5050/api/v1/users
```

### Request
```bash
curl -X GET http://localhost:5050/api/v1/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### Response (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "id": 2,
      "email": "preceptor@escuela.edu",
      "first_name": "Carlos",
      "last_name": "Preceptor",
      "role": "preceptor",
      "phone_whatsapp": "+54111234567",
      "is_active": true,
      "created_at": "2026-05-26T08:00:00.000Z",
      "updated_at": "2026-05-26T08:00:00.000Z"
    },
    {
      "id": 3,
      "email": "docente@escuela.edu",
      "first_name": "Maria",
      "last_name": "Docente",
      "role": "docente",
      "phone_whatsapp": "+54117654321",
      "is_active": true,
      "created_at": "2026-05-26T08:00:00.000Z",
      "updated_at": "2026-05-26T08:00:00.000Z"
    },
    {
      "id": 4,
      "email": "padre@escuela.edu",
      "first_name": "Juan",
      "last_name": "Padre",
      "role": "padre",
      "phone_whatsapp": "+54119876543",
      "is_active": true,
      "created_at": "2026-05-26T08:00:00.000Z",
      "updated_at": "2026-05-26T08:00:00.000Z"
    },
    {
      "id": 5,
      "email": "nuevo.docente@escuela.edu",
      "first_name": "Carlos",
      "last_name": "García",
      "role": "docente",
      "phone_whatsapp": "+541234567890",
      "is_active": true,
      "created_at": "2026-05-27T10:30:45.000Z",
      "updated_at": "2026-05-27T10:30:45.000Z"
    }
  ]
}
```

---

## Test 5: Get User by ID

### Endpoint
```
GET http://localhost:5050/api/v1/users/:id
```

### Request (Get user with ID 5)
```bash
curl -X GET http://localhost:5050/api/v1/users/5 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "id": 5,
    "email": "nuevo.docente@escuela.edu",
    "first_name": "Carlos",
    "last_name": "García",
    "role": "docente",
    "phone_whatsapp": "+541234567890",
    "is_active": true,
    "created_at": "2026-05-27T10:30:45.000Z",
    "updated_at": "2026-05-27T10:30:45.000Z"
  }
}
```

---

## Test 6: Get Users by Role

### Endpoint
```
GET http://localhost:5050/api/v1/users/role/:role
```

### Request (Get all teachers)
```bash
curl -X GET http://localhost:5050/api/v1/users/role/docente \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### Response (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "id": 3,
      "email": "docente@escuela.edu",
      "first_name": "Maria",
      "last_name": "Docente",
      "role": "docente",
      "phone_whatsapp": "+54117654321",
      "is_active": true,
      "created_at": "2026-05-26T08:00:00.000Z",
      "updated_at": "2026-05-26T08:00:00.000Z"
    },
    {
      "id": 5,
      "email": "nuevo.docente@escuela.edu",
      "first_name": "Carlos",
      "last_name": "García",
      "role": "docente",
      "phone_whatsapp": "+541234567890",
      "is_active": true,
      "created_at": "2026-05-27T10:30:45.000Z",
      "updated_at": "2026-05-27T10:30:45.000Z"
    }
  ]
}
```

---

## Test 7: Update User (Edit)

### Endpoint
```
PUT http://localhost:5050/api/v1/users/:id
```

### Request (Update user with ID 5)
```bash
curl -X PUT http://localhost:5050/api/v1/users/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "first_name": "Carlos Eduardo",
    "last_name": "García Rodríguez",
    "phone_whatsapp": "+549999999999",
    "email": "carlos.nuevo@escuela.edu"
  }'
```

### Response (200 OK)
```json
{
  "status": "success",
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id": 5,
    "email": "carlos.nuevo@escuela.edu",
    "first_name": "Carlos Eduardo",
    "last_name": "García Rodríguez",
    "role": "docente",
    "phone_whatsapp": "+549999999999",
    "is_active": true,
    "created_at": "2026-05-27T10:30:45.000Z",
    "updated_at": "2026-05-27T10:45:30.000Z"
  }
}
```

### Partial Update (Update only phone)
```bash
curl -X PUT http://localhost:5050/api/v1/users/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "phone_whatsapp": "+541234567890"
  }'
```

### Deactivate User
```bash
curl -X PUT http://localhost:5050/api/v1/users/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "is_active": false
  }'
```

---

## Test 8: Deactivate User (Soft Delete)

### Endpoint
```
DELETE http://localhost:5050/api/v1/users/:id
```

### Request (Deactivate user with ID 5)
```bash
curl -X DELETE http://localhost:5050/api/v1/users/5 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### Response (200 OK)
```json
{
  "status": "success",
  "message": "Usuario desactivado exitosamente"
}
```

### Verify Deactivation
Try to get the deactivated user — it still exists but won't appear in active user lists:
```bash
curl -X GET http://localhost:5050/api/v1/users/5 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

Response (200 OK — user exists but `is_active` is `false`):
```json
{
  "status": "success",
  "data": {
    "id": 5,
    "email": "carlos.nuevo@escuela.edu",
    "first_name": "Carlos Eduardo",
    "last_name": "García Rodríguez",
    "role": "docente",
    "is_active": false,
    ...
  }
}
```

### Reactivate the User
```bash
curl -X PUT http://localhost:5050/api/v1/users/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "is_active": true
  }'
```

---

## Error Scenarios

### 1. Missing Authentication Token
```bash
curl -X GET http://localhost:5050/api/v1/users
```

Response (401):
```json
{
  "status": "error",
  "message": "Token no proporcionado"
}
```

---

### 2. Non-Admin User Trying to Create User
Login as non-admin (e.g., teacher):
```bash
POST http://localhost:5050/api/v1/auth/login
{
  "email": "docente@escuela.edu",
  "password": "password123"
}
```

Then try to create a user:
```bash
curl -X POST http://localhost:5050/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEACHER_TOKEN_HERE" \
  -d '{
    "email": "test@escuela.edu",
    "password": "TestPass123",
    "first_name": "Test",
    "last_name": "User",
    "role": "docente"
  }'
```

Response (403 Forbidden):
```json
{
  "status": "error",
  "message": "No tienes permisos para acceder a este recurso"
}
```

---

### 3. Invalid Email
```bash
curl -X POST http://localhost:5050/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "email": "not-an-email",
    "password": "StrongPassword123",
    "first_name": "Test",
    "last_name": "User",
    "role": "docente"
  }'
```

Response (400):
```json
{
  "status": "error",
  "message": "El email no es válido"
}
```

---

### 4. Duplicate Email
```bash
curl -X POST http://localhost:5050/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "email": "docente@escuela.edu",
    "password": "StrongPassword123",
    "first_name": "Test",
    "last_name": "User",
    "role": "docente"
  }'
```

Response (409 Conflict):
```json
{
  "status": "error",
  "message": "El correo electrónico ya está registrado"
}
```

---

### 5. Password Too Short
```bash
curl -X POST http://localhost:5050/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "email": "test@escuela.edu",
    "password": "Short1",
    "first_name": "Test",
    "last_name": "User",
    "role": "docente"
  }'
```

Response (400):
```json
{
  "status": "error",
  "message": "La contraseña debe tener al menos 8 caracteres"
}
```

---

### 6. Invalid Role
```bash
curl -X POST http://localhost:5050/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "email": "test@escuela.edu",
    "password": "StrongPassword123",
    "first_name": "Test",
    "last_name": "User",
    "role": "invalid_role"
  }'
```

Response (400):
```json
{
  "status": "error",
  "message": "El rol debe ser: docente, preceptor o padre"
}
```

---

### 7. Trying to Deactivate Admin User
```bash
curl -X DELETE http://localhost:5050/api/v1/users/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

Response (400):
```json
{
  "status": "error",
  "message": "No se pueden desactivar usuarios con rol de administrador"
}
```

---

### 8. User Not Found
```bash
curl -X GET http://localhost:5050/api/v1/users/9999 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

Response (404):
```json
{
  "status": "error",
  "message": "Usuario no encontrado"
}
```

---

## Testing Order (Recommended)

Follow this sequence to test the complete flow:

1. ✅ **Login (Get Admin Token)**
2. ✅ **Create Teacher** → Note the ID
3. ✅ **Create Parent** → Note the ID
4. ✅ **Create Preceptor** → Note the ID
5. ✅ **Get All Users** → Verify all 3 are listed
6. ✅ **Get User by ID** → Verify teacher details
7. ✅ **Get Teachers Only** → Filter by role
8. ✅ **Update Teacher** → Change name/phone
9. ✅ **Deactivate Teacher** → Soft delete (is_active = false)
10. ✅ **Verify Deactivation** → Confirm is_active is false

---

## Using Postman (Alternative)

Import these endpoints into Postman:

### Collection
```json
{
  "info": {
    "name": "ProyectoEscuela - Users API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login Admin",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/v1/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@escuela.edu\",\n  \"password\": \"password123\"\n}"
            }
          }
        }
      ]
    },
    {
      "name": "Users",
      "item": [
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/v1/users",
            "header": {"Authorization": "Bearer {{token}}"},
            "body": {"mode": "raw"}
          }
        },
        {
          "name": "Get All Users",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/v1/users",
            "header": {"Authorization": "Bearer {{token}}"}
          }
        },
        {
          "name": "Get User by ID",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/v1/users/{{user_id}}",
            "header": {"Authorization": "Bearer {{token}}"}
          }
        },
        {
          "name": "Update User",
          "request": {
            "method": "PUT",
            "url": "{{base_url}}/api/v1/users/{{user_id}}",
            "header": {"Authorization": "Bearer {{token}}"}
          }
        },
        {
          "name": "Deactivate User",
          "request": {
            "method": "DELETE",
            "url": "{{base_url}}/api/v1/users/{{user_id}}",
            "header": {"Authorization": "Bearer {{token}}"}
          }
        }
      ]
    }
  ]
}
```

---

## Environment Variables (For Testing)

Create a `.env.test` or use Postman variables:

```
base_url=http://localhost:5050
admin_email=admin@escuela.edu
admin_password=password123
token=<paste_token_here>
user_id=5
```

---

## Quick Reference

| Operation | Method | Endpoint | Requires Token |
|-----------|--------|----------|---|
| Login | POST | `/api/v1/auth/login` | ❌ |
| Create User | POST | `/api/v1/users` | ✅ |
| Get All Users | GET | `/api/v1/users` | ✅ |
| Get User by ID | GET | `/api/v1/users/:id` | ✅ |
| Get by Role | GET | `/api/v1/users/role/:role` | ✅ |
| Update User | PUT | `/api/v1/users/:id` | ✅ |
| Deactivate User | DELETE | `/api/v1/users/:id` | ✅ |

---

## Notes

- Base URL: `http://localhost:5050`
- All user endpoints require admin token
- Passwords are never returned in responses
- Always include `Content-Type: application/json` header
- IDs are integers (1, 2, 3, etc.)
- All timestamps are ISO 8601 UTC format
