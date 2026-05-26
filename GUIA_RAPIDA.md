# Guía Rápida — Clonar y Ejecutar el Proyecto

> Instrucciones concisas para levantar el proyecto desde cero.

---

## 1. Requisitos

| Herramienta | Versión |
|-------------|---------|
| Node.js | 20.x LTS |
| PostgreSQL | 15.x |
| Python | 3.11.x |

---

## 2. Clonar e Instalar

```bash
# 1. Clonar
git clone <repo-url>
cd ProyectoEscuela

# 2. Backend — instalar dependencias
cd backend
npm install
cd ..

# 3. Frontend — instalar dependencias
cd frontend
npm install
cd ..
```

---

## 3. Base de Datos

```bash
# 4. Crear la base de datos en PostgreSQL
#    (abrí psql o pgAdmin y ejecutá:)
#    CREATE DATABASE proyecto_escuela;

# 5. Configurar backend/.env (ya viene con defaults locales)
#    DB_NAME=proyecto_escuela
#    DB_USER=postgres
#    DB_PASSWORD=root

# 6. Ejecutar migraciones (crea las tablas)
cd backend
npx sequelize-cli db:migrate

# 7. Cargar datos de prueba (seeders)
npx sequelize-cli db:seed:all
cd ..
```

---

## 4. Verificar

```bash
# 8. Probar backend — inicia el servidor
node backend/app.js
#    Abrí http://localhost:5000/api/v1/health
#    Debería responder: {"status":"ok","timestamp":"..."}

# 9. Probar frontend — build de producción
cd frontend
npm run build
#    Debería terminar sin errores

# 10. Ejecutar tests de modelos (22 tests)
cd backend
npm test
#    Output: 22 passed, 0 failed
```

---

## 5. Usuarios de Prueba (Seed Data)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@escuela.edu | password123 |
| Preceptor | preceptor@escuela.edu | password123 |
| Docente | docente@escuela.edu | password123 |
| Padre | padre@escuela.edu | password123 |

---

## 6. Comandos Útiles

```bash
# Revertir todas las migraciones
npx sequelize-cli db:migrate:undo:all

# Re-ejecutar todo (migraciones + seeders)
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# Ver estado de migraciones
npx sequelize-cli db:migrate:status
```

---

## 7. Estructura del Proyecto

```
ProyectoEscuela/
├── backend/       → API REST (Express + Sequelize + PostgreSQL)
├── frontend/      → SPA (React + Vite + Chakra UI)
├── agent/         → Bot de notificaciones (Python + APScheduler + Twilio)
├── openspec/      → Especificaciones OPSX
├── knowledge-base/ → Documentación del proyecto
└── docs/          → Documentos fuente originales
```

---

## 8. Notas

- El `.env` del backend **no se versiona**. Usá `.env.example` como template.
- El login JWT se implementará en C-03. Por ahora los endpoints son internos.
- PostgreSQL debe estar corriendo en `localhost:5432` antes de migrar.
- Para desarrollo frontend: `cd frontend && npm run dev` (hot reload en puerto 5173).
