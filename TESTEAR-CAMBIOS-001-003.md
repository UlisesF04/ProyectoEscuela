# Testing: CHANGE-001 a 003
## ProyectoEscuela — Verificacion Manual de los Primeros 3 Changes

Este documento describe paso a paso como verificar que los primeros 3 changes
del proyecto estan correctamente implementados:

- **CHANGE-001**: database-schema (DB, modelos, seeders)
- **CHANGE-002**: backend-auth-jwt (login/logout con JWT)
- **CHANGE-003**: frontend-auth-complete (Login UI, AuthContext, rutas)

---

## Requisitos Previos

| Herramienta | Version Minima | Verificar con |
|---|---|---|
| PostgreSQL | 15+ | `psql --version` |
| Node.js | 18+ LTS | `node --version` |
| npm | 9+ | `npm --version` |

---

## 1. Preparar la Base de Datos

```powershell
# 1a. Crear la base de datos (si no existe)
psql -U postgres -c "CREATE DATABASE proyecto_escuela;"

# 1b. Configurar credenciales
#     Editar backend/.env si es necesario:
#     DB_USER=postgres
#     DB_PASSWORD=tu_password
#     DB_NAME=proyecto_escuela

# 1c. Ejecutar migraciones y seeders
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

**Esperar**: "migrated" en cada seeder (8 seeders).

---

## 2. Iniciar el Backend (API)

```powershell
cd backend
npm install        # Solo la primera vez (o si cambian las deps)
npm start
```

**Esperar**:
```
Database connected successfully
Server running on port 5000
```

> Deja esta terminal abierta. El backend debe seguir corriendo.

---

## 3. Iniciar el Frontend (UI)

Abre una **segunda terminal**:

```powershell
cd frontend
npm install        # Solo la primera vez
npm run dev
```

**Esperar**:
```
Local:   http://localhost:5173/
```

---

## 4. Probar en el Navegador

Abre **http://localhost:5173** en Chrome/Edge/Firefox.

### 4.1. Login exitoso

| Campo | Valor |
|---|---|
| Email | `admin@escuela.com` |
| Contraseña | `admin123` |

**Resultado esperado:**
- Redirige a `/dashboard`
- Ves: "Bienvenido, admin@escuela.com"
- Badge con rol: "admin"
- Header con boton "Cerrar sesion"

### 4.2. Login fallido

| Campo | Valor |
|---|---|
| Email | `admin@escuela.com` |
| Contraseña | `cualquier_cosa` |

**Resultado esperado:**
- Aparece mensaje de error en rojo: "Credenciales invalidas"
- Permaneces en `/login`

### 4.3. Acceso directo sin autenticacion

1. Escribi en la barra: `http://localhost:5173/dashboard`
2. **Resultado esperado:** Redirige automaticamente a `/login`

### 4.4. Cerrar sesion

1. Logueate con admin@escuela.com / admin123
2. Click en "Cerrar sesion" (header)
3. **Resultado esperado:** Vuelve a `/login`

### 4.5. Probar otros roles

| Rol | Email | Password |
|---|---|---|
| Docente | `docente1@escuela.com` | `docente123` |
| Docente | `docente2@escuela.com` | `docente123` |

---

## 5. Probar la API Directamente (con curl)

Sin cerrar el backend, proba estos endpoints:

```powershell
# Health check
curl http://localhost:5000/health
# -> {"status":"ok","database":"connected"}

# Login correcto
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d '{"email":"admin@escuela.com","password":"admin123"}'
# -> {"token":"eyJ...","user":{"id":1,"email":"admin@escuela.com","rol":"admin"}}

# Login incorrecto
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d '{"email":"admin@escuela.com","password":"wrong"}'
# -> 401 {"message":"Credenciales invalidas"}

# Listar modelos registrados
curl http://localhost:5000/api/models
# -> {"models":["Usuario","Docente","Estudiante",...],"count":13}
```

---

## 6. Script de Verificacion Automatica

```powershell
.\scripts\verify-db.ps1
```

Ejecuta 6 verificaciones automaticas:
1. PostgreSQL conectado
2. 13 tablas existentes
3. Seed data cargada
4. Servidor Node arranca
5. Health endpoint responde
6. Models endpoint responde

---

## 7. Verificar Datos en la Base de Datos

```powershell
# Conectarse a la DB
psql -U postgres -d proyecto_escuela

# Listar tablas
\dt

# Ver usuarios creados
SELECT email, rol FROM usuarios;

# Ver estudiantes por curso
SELECT e.nombre, e.apellido, c.nombre || ' ' || c.division AS curso
FROM estudiantes e JOIN cursos c ON e.curso_id = c.id;

# Contar registros
SELECT 'usuarios' as tabla, COUNT(*) FROM usuarios
UNION ALL
SELECT 'estudiantes', COUNT(*) FROM estudiantes
UNION ALL
SELECT 'docentes', COUNT(*) FROM docentes
UNION ALL
SELECT 'cursos', COUNT(*) FROM cursos
UNION ALL
SELECT 'tutores', COUNT(*) FROM tutores
UNION ALL
SELECT 'materias', COUNT(*) FROM materias;
```

---

## Troubleshooting

| Problema | Solucion |
|---|---|
| **"ECONNREFUSED :::5000"** | PostgreSQL no esta corriendo. Inicia el servicio. |
| **"password authentication failed"** | Revisa DB_PASSWORD en `backend/.env` |
| **"Cannot find module"** | Ejecuta `npm install` en backend/ o frontend/ |
| **"address already in use :::5000"** | `Get-NetTCPConnection -LocalPort 5000 \| Stop-Process` |
| **"Failed to load rolldown binding"** | `Remove-Item -Recurse -Force node_modules; npm install` en frontend/ |
| **"ERR_CONNECTION_REFUSED" en frontend** | El backend no esta corriendo. Verifica terminal 1. |
| **Seed data no cargada** | `cd backend; npx sequelize-cli db:seed:all` |

---

## Datos de Seed (Resumen)

| Tabla | Cantidad | Detalle |
|---|---|---|
| usuarios | 5 | 1 admin, 2 docentes, 2 tutores |
| cursos | 3 | 1ero A, 2do B, 3ero C |
| docentes | 2 | Vinculados a usuarios docentes |
| estudiantes | 9 | 3 por curso |
| tutores | 2 | Vinculados a usuarios tutores |
| materias | 6 | 2 por curso (Matematica, Lengua) |
| estudiante_tutor | 9 | Relaciones N:N |
| docente_materia | 6 | Asignaciones docente-materia |

---

*Ultima actualizacion: 2026-05-15*
*Changes cubiertos: CHANGE-001, CHANGE-002, CHANGE-003*
