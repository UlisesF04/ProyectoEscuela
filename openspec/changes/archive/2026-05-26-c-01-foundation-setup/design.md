# Design: C-01 Foundation Setup

## Architecture Overview

Monorepo con tres componentes independientes (frontend, backend, agente Python) que comparten el mismo repositorio pero se despliegan por separado. Cada componente tiene su propio `package.json` / `requirements.txt` y configuración, lo que permite CI/CD independiente.

```
ProyectoEscuela/
├── frontend/     → React + Vite + Chakra UI (Vercel)
├── backend/      → Node.js + Express + Sequelize (Railway)
├── agent/        → Python + APScheduler + Twilio (Railway Worker)
├── openspec/     → Especificaciones OPSX
├── docs/         → Documentación fuente
└── knowledge-base/ → Base de conocimiento
```

## Components

### Backend — Node.js + Express
- **Responsibility**: API REST ~40 endpoints, autenticación JWT, lógica de negocio
- **Location**: `backend/`
- **Entry point**: `backend/app.js`
- **Dependencies clave**: express@4, sequelize@6, jsonwebtoken, bcrypt, express-validator, express-rate-limit, cors, morgan

### Frontend — React + Vite + Chakra UI
- **Responsibility**: SPA con dashboards por rol (admin, preceptor, docente, padre)
- **Location**: `frontend/`
- **Entry point**: `frontend/src/main.jsx`
- **Dependencies clave**: react@18, react-dom@18, @chakra-ui/react@2, @chakra-ui/icons, react-router-dom@6, axios

### Agent — Python
- **Responsibility**: Evaluación programada de alertas y envío de notificaciones WhatsApp
- **Location**: `agent/`
- **Entry point**: `agent/main.py`
- **Dependencies clave**: APScheduler, psycopg2-binary, twilio, pandas

## Data Model

No hay modelos de dominio en este change. Solo se define la config de conexión:

- `backend/config/database.js` — exporta instancia de Sequelize usando `DATABASE_URL` o variables individuales (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`)
- En desarrollo local: `projecto_escuela` (usuario `postgres`, contraseña `root`)
- El agente Python usará `DATABASE_URL` directa con psycopg2 (sin ORM)

## API Changes

Ninguno aún. Este change solo prepara el esqueleto. Los endpoints comienzan en C-03 (auth-system).

## Implementation Notes

### Decisión: Variables de entorno individuales vs. DATABASE_URL
Se soportan ambos formatos. El backend usará `DATABASE_URL` si existe (para producción en Railway que la genera automáticamente), y fallback a variables individuales para desarrollo local.

### Decisión: Chakra UI v2 como elección inicial
Se usa Chakra UI 2.x por su sistema de diseño accesible y responsivo out-of-the-box. Si se migra a v3 en el futuro, los cambios serán principalmente de imports (paquete `@chakra-ui/react` cambia a `@chakra-ui/react@3`).

### Decisión: express-rate-limit desde el inicio
Se configura rate limiting global (100 req/15min) y específico para login (10 intentos/15min) como protección base de seguridad desde el día 1.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Versiones de dependencias incompatibles entre sí | Usar versiones específicas fijadas en package.json (sin `^` o `~`) para desarrollo inicial; auditar con `npm audit` |
| Chakra UI v2 vs v3 — migración futura podría ser costosa | Documentar en KB la decisión; los cambios son principalmente de imports, no de lógica |
| PostgreSQL no disponible en entorno local | El error de conexión es explícito y guía al usuario a crear la BD. El `.env.example` documenta los valores requeridos |
