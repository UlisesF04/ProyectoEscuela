## Why

Establecer la estructura base del monorepo para que los 3 componentes del sistema (frontend React, backend Node.js/Express, agente Python) tengan su scaffolding inicial, dependencias, configuración de base de datos y tooling compartido. Sin esta fundación ningún cambio posterior puede comenzar.

## What Changes

- Creación de estructura de directorios del monorepo: `frontend/`, `backend/`, `agent/`, `openspec/`, `docs/`
- `backend/package.json` con Express 4, Sequelize 6, jsonwebtoken, bcrypt, express-validator, express-rate-limit, cors, morgan
- `frontend/package.json` con React 18, Vite, Chakra UI 2.x, React Router v6, axios
- `agent/requirements.txt` con APScheduler, psycopg2-binary, twilio, pandas
- `backend/config/database.js` — conexión PostgreSQL con Sequelize usando variables de entorno
- `backend/app.js` — esqueleto Express con middlewares base (CORS, JSON parser, morgan, error handler)
- `frontend/src/main.jsx` — esqueleto Vite + Chakra Provider + React Router
- `agent/main.py` — esqueleto APScheduler con tarea placeholder
- `.env.example` con todas las variables del proyecto (DB, JWT, Twilio, etc.)
- `vercel.json` para frontend SPA routing con rewrites
- Archivos `.gitignore` para cada componente (node_modules, .env, dist, etc.)

## Capabilities

### New Capabilities
- `project-foundation`: Base del monorepo — estructura de directorios, archivos de configuración raíz, tooling compartido (gitignore, env example, vercel config)
- `database-config`: Configuración de conexión a PostgreSQL mediante Sequelize con variables de entorno (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DATABASE_URL)

### Modified Capabilities
<!-- Sin modificaciones — es el primer change del proyecto -->

## Impact

- Crea la estructura completa del monorepo que todos los changes posteriores utilizarán
- Define las versiones exactas de dependencias para backend y frontend
- Establece la configuración de conexión a BD que usarán C-02 (core-models) en adelante
- El `.env.example` sienta el contrato de variables de entorno para todos los componentes
