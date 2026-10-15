# Despliegue y DevOps

> Archivo extra — el proyecto tiene 3 componentes desplegables independientes con diferentes estrategias de deploy, lo que justifica un documento dedicado.

## Desarrollo local con Docker (C-12)

La guía vigente está en el [README raíz](../../README.md). `compose.yaml` ejecuta backend + PostgreSQL 15 con volúmenes persistentes, inicialización no destructiva y health checks. El frontend usa Vite en el host. La imagen se construye con `backend/Dockerfile`, Node.js 24 y Python 3.11 para el trigger manual de notificaciones.

- Configuración Compose: `.env.docker`, con valores elegidos por quien instala. Nunca se incorpora al repositorio ni a la imagen.
- Base de datos: accesible entre contenedores como `db:5432`; no publica el puerto de PostgreSQL en el host.
- Primer arranque: `sequelize.sync()` crea tablas faltantes y el bootstrap transaccional crea datos de demostración solo en una base vacía. No altera tablas existentes por defecto.
- Backend sin Docker: `backend/.env`; `npm run db:init -- --seed` inicializa una base local antes del primer login. `DB_SYNC_ALTER=true` permite explícitamente adaptar un esquema de desarrollo.
- Tests: `compose.test.yaml` usa un proyecto separado y PostgreSQL real con almacenamiento temporal.
- Los despliegues cloud descritos a continuación siguen perteneciendo al alcance pendiente de C-12. El historial de migraciones heredado no es todavía una ruta completa de instalación desde una base vacía.

## Estrategia de despliegue general

El proyecto sigue una arquitectura de **3 artefactos desplegables de forma independiente**:

```
┌────────────────────────────────────────────────────────────┐
│                    GitHub (monorepo)                        │
│  frontend/  │  backend/  │  agent/  │  docs/  │  openspec/ │
└──────┬──────────────┬──────────────┬───────────────────────┘
       │              │              │
       ▼              ▼              ▼
   Vercel          Railway         Railway
   (SPA)       (Web Service)   (Worker/Scheduler)
                    │
                    ▼
              PostgreSQL 15
              (Railway)
```

## Componente 1: Frontend (Vercel)

| Aspecto | Detalle |
|---------|---------|
| **Plataforma** | Vercel |
| **Framework** | Vite (build output → carpeta `dist/`) |
| **Dominio** | Autoasignado por Vercel (`*.vercel.app`) o dominio personalizado |
| **CI/CD** | Automático desde GitHub — cada push a `main` redeploya |
| **Variables de entorno** | `VITE_API_URL` — URL del backend en Railway |
| **Build command** | `npm run build` |
| **Output directory** | `dist` |
| **Notas** | SPA con client-side routing. Configurar `vercel.json` con rewrites para React Router (todas las rutas → `index.html`). |

### Configuración `vercel.json` recomendada

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "env": {
    "VITE_API_URL": "@api_url"
  }
}
```

## Componente 2: Backend (Railway — Web Service)

| Aspecto | Detalle |
|---------|---------|
| **Plataforma** | Railway (Web Service) |
| **Runtime** | Node.js 24.x LTS |
| **Puerto** | EXPOSE 3000 (configurable vía `PORT`) |
| **Start command** | `node app.js` |
| **CI/CD** | Automático desde GitHub — cada push a `main` redeploya |
| **Base de datos** | Instancia PostgreSQL administrada por Railway (add-on) |

### Variables de entorno en Railway

| Variable | Fuente |
|----------|--------|
| `DATABASE_URL` | Generada por Railway PostgreSQL add-on |
| `JWT_SECRET` | Configuración manual (secreta, > 32 caracteres) |
| `RESEND_API_KEY` | Configuración manual |
| `CLOUDINARY_URL` | Configuración manual (opcional) |
| `SERVICE_API_KEY` | Configuración manual |
| `FRONTEND_URL` | URL de Vercel (para CORS) |
| `NODE_ENV` | `production` |

## Componente 3: Agente Python (Railway — Worker/CRON)

| Aspecto | Detalle |
|---------|---------|
| **Plataforma** | Railway (Worker) o GitHub Actions (CRON) |
| **Runtime** | Python 3.11.x |
| **Ejecución** | APScheduler — bucle continuo que ejecuta tareas en horarios programados |
| **Start command** | `python main.py` |
| **CI/CD** | Automático desde GitHub (mismo repo, mismo branch) |

### Variables de entorno del agente

| Variable | Propósito |
|----------|-----------|
| `DATABASE_URL` | Conexión a PostgreSQL (misma BD que el backend) |
| `RESEND_API_KEY` | Autenticación Resend |
| `FROM_EMAIL` | Dirección remitente (ej: noreply@escuela.edu) |
| `AUSENCIA_UMBRAL` | Umbral configurable de inasistencias (defecto: 10) |

### Alternativa: GitHub Actions CRON

Si Railway Worker no es viable, se puede ejecutar el agente como un workflow de GitHub Actions con schedule CRON:

```yaml
# .github/workflows/agent-notifications.yml
name: Agent - Notificaciones
on:
  schedule:
    - cron: '0 21 * * 1-5'  # 18:00 ART (21:00 UTC), lunes a viernes
jobs:
  run-agent:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r agent/requirements.txt
      - run: python agent/main.py
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          FROM_EMAIL: ${{ secrets.FROM_EMAIL }}
```

## CI/CD con GitHub Actions

### Workflow sugerido: Tests + Lint

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm install
        working-directory: ./backend
      - run: npx sequelize-cli db:migrate
        working-directory: ./backend
      - run: npm test
        working-directory: ./backend

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm install
        working-directory: ./frontend
      - run: npm run lint
        working-directory: ./frontend
      - run: npm run build
        working-directory: ./frontend
```

## Gestión de secretos y variables de entorno

| Archivo | Propósito | ¿Versionado? |
|---------|-----------|:-----------:|
| `.env.example` | Template con todas las variables (valores dummy) | ✅ Sí |
| `.env` | Variables locales de desarrollo | ❌ No (`.gitignore`) |
| Railway secrets panel | Variables de producción | No aplica (gestionado por Railway) |
| Vercel env vars | Variables de producción del frontend | No aplica (gestionado por Vercel) |
| GitHub Secrets | Variables para CI/CD y Actions CRON | No aplica (gestionado por GitHub) |

## Estrategia de ramas

| Rama | Propósito | Deploy automático |
|------|-----------|:-----------------:|
| `main` | Producción | ✅ Vercel + Railway |
| `develop` | Integración | ❌ (manual) |
| `feature/*` | Features individuales | ❌ |

**Flujo de trabajo**: `feature/*` → PR a `develop` → code review → merge → PR de `develop` a `main` → deploy automático.

## Monitoreo y logs

| Componente | Logs | Estrategia |
|-----------|------|------------|
| Backend | `console.log` / `morgan` | Logs en Railway dashboard |
| Frontend | `console.*` + Error Boundary | Logs en Vercel dashboard |
| Agente Python | `logging` | Logs en Railway Worker / GitHub Actions |
| Base de datos | Query logs | Logs en Railway PostgreSQL |
| Notificaciones | `notification_logs` (tabla BD) | Auditoría interna del sistema |
