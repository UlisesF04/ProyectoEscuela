# Instrucciones para Ejecutar

> Guía completa para clonar, configurar, ejecutar y deployar el proyecto.
> Proyecto: **Optimización de la Gestión Académica y Comunicación Escolar**

---

## Índice

1. [Requisitos](#1-requisitos)
2. [Clonar e Instalar](#2-clonar-e-instalar)
3. [Base de Datos](#3-base-de-datos)
4. [Variables de Entorno](#4-variables-de-entorno)
5. [Ejecutar en Desarrollo](#5-ejecutar-en-desarrollo)
6. [Credenciales de Prueba](#6-credenciales-de-prueba)
7. [Ejecutar Tests](#7-ejecutar-tests)
8. [Deploy a Producción](#8-deploy-a-producción)
9. [Bot de Notificaciones (Agente Python)](#9-bot-de-notificaciones-agente-python)
10. [Referencia Rápida](#10-referencia-rápida)

---

## 1. Requisitos

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| Node.js | 20.x LTS | Backend + Frontend |
| PostgreSQL | 15.x | Base de datos |
| Python | 3.11.x | Agente de notificaciones |
| Docker (opcional) | Última | Tests de integración |

---

## 2. Clonar e Instalar

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd ProyectoEscuela

# 2. Backend
cd backend
npm install
cd ..

# 3. Frontend
cd frontend
npm install
cd ..

# 4. Agente Python
cd agent
pip install -r requirements.txt
cd ..
```

> ⚠️ En Windows usá `pip install -r requirements.txt` directamente.
> En Linux/macOS usá `pip3 install -r requirements.txt`.

---

## 3. Base de Datos

### Opción A: PostgreSQL local

```bash
# 1. Crear la base de datos
# Abrí psql o pgAdmin y ejecutá:
CREATE DATABASE proyecto_escuela;

# 2. Migraciones
cd backend
npx sequelize-cli db:migrate

# 3. Datos de prueba (seeders)
npx sequelize-cli db:seed:all
cd ..
```

### Opción B: Docker (recomendado para tests)

```bash
docker run -d \
  --name proyectoescuela-db \
  -e POSTGRES_DB=proyecto_escuela \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=root \
  -p 5432:5432 \
  postgres:15
```

---

## 4. Variables de Entorno

Copiá `.env.example` a `.env` en la **raíz del proyecto** y completá los valores:

```bash
cp .env.example .env
```

### Variables obligatorias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_NAME` | Nombre de la base de datos | `proyecto_escuela` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `root` |
| `JWT_SECRET` | Clave secreta para JWT (64+ caracteres) | `cambiar_por_una_clave_segura_64_chars...` |
| `FRONTEND_URL` | URL del frontend (para CORS) | `http://localhost:5173` |

### Variables para funcionalidades completas

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `RESEND_API_KEY` | API Key de Resend para envio de emails | [resend.com](https://resend.com) → API Keys |
| `FROM_EMAIL` | Dirección de email remitente | Dominio verificado en Resend |
| `SERVICE_API_KEY` | API Key para el bot de notificaciones | Generar una manualmente (cualquier string segura) |

### Variables opcionales

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del backend | `5000` |
| `NODE_ENV` | Entorno (`development`, `production`, `test`) | `development` |
| `CLOUDINARY_URL` | Almacenamiento de archivos en la nube | No implementado aún |
| `AUSENCIA_UMBRAL` | Faltas mínimas para alerta en bot | `10` |

### `.env` mínimo para desarrollo local

```env
# Base de Datos
DB_NAME=proyecto_escuela
DB_USER=postgres
DB_PASSWORD=root

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=desarrollo_clave_local_no_usar_en_produccion
```

---

## 5. Ejecutar en Desarrollo

### Backend (Express — puerto 5000)

```bash
cd backend
npm run dev
# → http://localhost:5000
# → Health check: http://localhost:5000/api/v1/health
```

### Frontend (Vite — puerto 5173)

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

El frontend está configurado para usar `VITE_API_URL=http://localhost:5000` por defecto.

---

## 6. Credenciales de Prueba

Luego de ejecutar los seeders, podés iniciar sesión con:

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Admin** | `admin@escuela.edu` | `password123` |
| **Preceptor** | `preceptor@escuela.edu` | `password123` |
| **Docente** | `docente@escuela.edu` | `password123` |
| **Padre** | `padre@escuela.edu` | `password123` |

> ⚠️ En producción, las contraseñas se definen con la variable de entorno `DEMO_PASSWORD`.
> Si no se setea, el seeder falla con un error claro.

---

## 7. Ejecutar Tests

### Backend (272 tests — 6 suites)

```bash
cd backend
npm test
```

Las suites incluyen:
| Suite | Tests | Descripción |
|-------|-------|-------------|
| Modelos | ~22 | Validación de modelos y asociaciones |
| Auth | ~33 | Login, logout, password change, lockout |
| Admin Dashboard | ~47 | Stats, config, page-visit, notificaciones |
| Asistencias | ~43 | CRUD, batch, justificación, autorización |
| Notificaciones | ~12 | Trigger, service auth, listado |
| Grades Evolution | ~28 | Evolución de notas por rol |

### Frontend (build check)

```bash
cd frontend
npm run build
# Debe terminar sin errores (~1142 módulos)
```

---

## 8. Deploy a Producción

El proyecto está diseñado para **Railway** (backend + BD) + **Vercel** (frontend SPA).

### 8.1 Backend → Railway

#### Requisitos en Railway

1. Crear un proyecto en [Railway](https://railway.app/)
2. Conectar el repositorio (o subir manualmente la carpeta `backend/`)
3. Configurar el **Start Command**:
   ```
   node app.js
   ```
4. En **Settings > Healthcheck Path**:
   ```
   /api/v1/health
   ```

#### Variables de entorno en Railway

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | (lo provee Railway automáticamente al agregar PostgreSQL) |
| `JWT_SECRET` | 🔴 **OBLIGATORIO** — Generá un string de 64+ caracteres |
| `FRONTEND_URL` | URL del deploy de Vercel (ej: `https://tu-app.vercel.app`) |
| `RESEND_API_KEY` | (opcional) Para que el bot envíe emails |
| `FROM_EMAIL` | (opcional) Remitente de los emails |
| `SERVICE_API_KEY` | (opcional) Para trigger manual del bot |
| `DEMO_PASSWORD` | (opcional) Contraseña para seeders en preview envs |

#### Provisionar PostgreSQL

- En Railway, agregar un servicio PostgreSQL.
- Se genera automáticamente `DATABASE_URL` y se inyecta en el backend.

#### Migraciones

Railway ejecutará `npx sequelize-cli db:migrate` como Post-Start Command, o podés conectarte vía Railway CLI:

```bash
railway run npx sequelize-cli db:migrate
```

### 8.2 Frontend → Vercel

#### Requisitos en Vercel

1. Importar el repositorio en [Vercel](https://vercel.com/)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

#### Variables de entorno en Vercel

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | URL del backend en Railway (ej: `https://tu-backend.railway.app/api/v1`) |

### 8.3 JWT — Cómo generar el JWT_SECRET

```bash
# En Linux/macOS:
openssl rand -base64 48

# En Windows (PowerShell):
[Convert]::ToBase64String([byte[]]::new(48) | ForEach-Object { $_ = Get-Random -Minimum 0 -Maximum 256 })
```

O usá cualquier generador online de strings aleatorios de 64+ caracteres.

### 8.4 Resend — Configuración de Email

1. Crear cuenta en [resend.com](https://resend.com) (plan free: 100 emails/día)
2. Agregar y verificar un dominio
3. Crear una API Key desde el dashboard
4. Copiar la API Key a `RESEND_API_KEY` en Railway
5. Setear `FROM_EMAIL` con un email del dominio verificado

### 8.5 SERVICE_API_KEY — Cómo generarla

Cualquier string larga y segura sirve:

```bash
# En Linux/macOS:
openssl rand -hex 32

# En PowerShell:
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Luego configurarla en Railway como `SERVICE_API_KEY` y en el `.env` local para desarrollo.

### 8.6 DEMO_PASSWORD

En entornos de preview o staging donde quieras cargar datos de prueba, definí:

```env
DEMO_PASSWORD=UnaContraseñaSegura2024
NODE_ENV=development
```

Si `NODE_ENV=production`, el seeder aborta automáticamente.

---

## 9. Bot de Notificaciones (Agente Python)

El bot corre en **Python 3.11+** y evalúa condiciones académicas cada **lunes a viernes a las 18:00 hs**.

### Activación manual inmediata

```bash
cd agent
python main.py --now
```

### Trigger via API

```bash
curl -X POST https://tu-backend.railway.app/api/v1/notifications/trigger \
  -H "Authorization: Bearer sk-tu-service-api-key"
```

### Condiciones que evalúa

| Alerta | Condición |
|--------|-----------|
| Ausencias críticas | ≥ X faltas sin justificar (configurable: `AUSENCIA_UMBRAL`) |
| Riesgo de regularidad | ≥ 20% de inasistencias en el trimestre |
| Calificación baja | Nota < 4 registrada |
| Tarea pendiente | Vence en ≤ 2 días sin entregar |
| Vencimiento de licencia | Licencia docente vence en ≤ 3 días |

### Configuración del scheduler

El bot se ejecuta en el agente Worker de Railway. Para que funcione:

1. En Railway, crear un servicio Worker desde la carpeta `agent/`
2. **Start Command**: `python main.py`
3. Variables de entorno requeridas:
   - `DATABASE_URL` (con `sslmode=require`)
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
   - `SERVICE_API_KEY`
   - `AUSENCIA_UMBRAL` (default: 10)

---

## 10. Referencia Rápida

### Rutas de la API

| Método | Ruta | Auth | Rol |
|--------|------|:----:|:---:|
| POST | `/api/v1/auth/login` | — | — |
| POST | `/api/v1/auth/logout` | JWT | — |
| GET | `/api/v1/auth/me` | JWT | — |
| PUT | `/api/v1/auth/password` | JWT | — |
| GET/POST | `/api/v1/users` | JWT | admin |
| GET/POST | `/api/v1/courses` | JWT | admin/preceptor |
| GET/POST | `/api/v1/students` | JWT | admin/preceptor |
| POST | `/api/v1/attendances` | JWT | preceptor |
| POST | `/api/v1/attendances/batch` | JWT | preceptor |
| PUT | `/api/v1/attendances/:id` | JWT | preceptor |
| PUT | `/api/v1/attendances/:id/justify` | JWT | preceptor |
| GET | `/api/v1/students/:id/evolution` | JWT | docente/padre |
| POST | `/api/v1/grades` | JWT | docente |
| GET/POST | `/api/v1/licences` | JWT | docente/preceptor/admin |
| GET | `/api/v1/notifications` | JWT | admin |
| POST | `/api/v1/notifications/trigger` | SERVICE_KEY | — |
| GET | `/api/v1/admin/stats` | JWT | admin |
| POST | `/api/v1/admin/stats/page-visit` | JWT | admin |
| GET/PUT | `/api/v1/config` | JWT | admin |

### Vistas del Frontend

| Ruta | Rol | Descripción |
|------|:---:|-------------|
| `/admin/dashboard` | admin | Dashboard con estadísticas |
| `/admin/users` | admin | Gestión de usuarios |
| `/admin/courses` | admin | Gestión de cursos |
| `/admin/students` | admin/preceptor | Gestión de alumnos |
| `/admin/leaves` | admin | Licencias docentes |
| `/admin/notifications` | admin | Historial de notificaciones |
| `/preceptor/attendance` | preceptor | Registro de asistencias |
| `/docente/grades` | docente | Carga de notas |
| `/docente/evolution` | docente | Evolución de notas |
| `/padre/dashboard` | padre | Dashboard con hijos |
| `/padre/evolution` | padre | Evolución de notas |
| `/padre/justificativos` | padre | Justificación de inasistencias |

### Comandos útiles

```bash
# Re-ejecutar migraciones desde cero
cd backend
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# Ver estado de migraciones
npx sequelize-cli db:migrate:status

# Desarrollo frontend (hot reload)
cd frontend
npm run dev

# Build producción frontend
npm run build

# Tests backend (todas las suites)
npm test

# Bot de notificaciones (ejecución inmediata)
cd agent
python main.py --now
```

### Estructura del proyecto

```
ProyectoEscuela/
├── .env                   ← Configuración (NO versionado)
├── .env.example           ← Template de configuración
├── AGENTS.md              ← Contrato del agente AI
├── CHANGES.md             ← Roadmap de implementación
├── backend/               → API REST (Express + Sequelize + PostgreSQL)
│   ├── app.js             → Punto de entrada
│   ├── config/            → Conexión BD, multer
│   ├── middlewares/       → Auth, roles, validación, errores
│   ├── models/            → Modelos Sequelize
│   ├── modules/           → Módulos por funcionalidad
│   ├── migrations/        → Migraciones de BD
│   ├── seeders/           → Datos de prueba
│   └── uploads/           → Archivos subidos
├── frontend/              → SPA (React + Vite + Chakra UI)
│   ├── src/
│   │   ├── components/    → Componentes reutilizables
│   │   ├── pages/         → Páginas por rol
│   │   ├── context/       → AuthContext
│   │   └── services/      → API client, servicios
│   └── index.html         → Entry point
├── agent/                 → Bot de notificaciones (Python)
│   ├── main.py            → Scheduler + ejecutor
│   └── tasks/             → Evaluadores de condiciones
├── openspec/              → Especificaciones OPSX
└── knowledge-base/        → Documentación del sistema
```
