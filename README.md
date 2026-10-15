# ProyectoEscuela

[Español](#español) · [English](#english)

## Español

### Un entorno virtual para la comunidad escolar

ProyectoEscuela reúne la gestión académica y la comunicación de una escuela en una plataforma web. El personal puede organizar documentación, licencias y justificativos, administrar cursos y alumnos, registrar asistencias y cargar calificaciones. Las familias pueden consultar las notas de sus hijos y acompañar su evolución durante el año lectivo.

Cada usuario accede a las funciones correspondientes a su rol:

| Rol | Funciones principales |
|---|---|
| Administración | Usuarios, cursos, materias, alumnos, asignaciones docentes, documentos y configuración |
| Preceptoría | Asistencias, historial, justificaciones, documentos y comunicación interna |
| Docentes | Calificaciones, evolución académica, licencias y comunicación interna |
| Familias | Calificaciones, evolución y asistencias de sus hijos; presentación de justificativos |

### Stack tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | React 18, Vite 8, Chakra UI 2, React Router 7, Axios |
| Estado y diseño | Context API + useReducer; diseño compartido por rol |
| Backend | Node.js 24 LTS, Express 4, Sequelize 6 |
| Base de datos | PostgreSQL 15 en Docker |
| Autenticación | JWT en cookies httpOnly y contraseñas protegidas con bcrypt 6 |
| Notificaciones opcionales | Python 3.11, APScheduler, psycopg2 y Resend para email |
| Desarrollo local | Docker Compose para backend + PostgreSQL; Vite para el frontend |

### Ejecutar por primera vez

**Requisitos:** Git, [Node.js 24 LTS](https://nodejs.org/), y [Docker Desktop](https://docs.docker.com/get-started/get-docker/) iniciado con contenedores Linux. En Linux también podés usar Docker Engine con el plugin Compose.

Docker administra PostgreSQL: este procedimiento crea una base independiente de cualquier instalación de PostgreSQL que ya tengas en tu PC. El frontend se ejecuta con Node.js en tu equipo.

#### 1. Abrir el proyecto y configurar Docker

Cloná este repositorio o descargalo y abrí una terminal en la carpeta que contiene `compose.yaml`.

Copiá el archivo de ejemplo. **Windows PowerShell:**

```powershell
Copy-Item .env.docker.example .env.docker
```

**Linux / macOS:**

```bash
cp .env.docker.example .env.docker
```

Editá `.env.docker` y elegí `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `DEMO_PASSWORD`. Completá también `JWT_SECRET`. `DEMO_PASSWORD` debe tener al menos 8 caracteres y será la contraseña inicial de las cuentas de prueba.

Para generar `JWT_SECRET`, ejecutá este comando y pegá el resultado en el archivo:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Los archivos `.env` contienen configuración privada y están excluidos de Git. Las credenciales elegidas en `.env.docker` corresponden a la nueva base del contenedor.

#### 2. Iniciar backend y base de datos

Desde la raíz del proyecto:

```bash
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker ps
```

La primera ejecución descarga las imágenes e instala las dependencias. Compose espera a que PostgreSQL esté disponible; luego el backend crea las tablas y carga cuatro cuentas, un curso, materias, un alumno y calificaciones de ejemplo. Si la base ya tiene datos, omite la carga de demostración.

Comprobá el estado en **http://localhost:5000/api/v1/health**. Debe responder con `"status": "ok"`. Si necesitás revisar el arranque:

```bash
docker compose --env-file .env.docker logs -f backend
```

#### 3. Iniciar el frontend

En otra terminal, desde la raíz:

```bash
npm --prefix frontend ci
npm --prefix frontend run dev
```

Abrí **http://localhost:5173**. Vite reenvía las solicitudes de `/api` al backend en el puerto 5000.

#### 4. Iniciar sesión

| Rol | Email |
|---|---|
| Administración | `admin@escuela.edu` |
| Preceptoría | `preceptor@escuela.edu` |
| Docente | `docente@escuela.edu` |
| Familia | `padre@escuela.edu` |

Todas las cuentas usan inicialmente el valor de **`DEMO_PASSWORD`** elegido en `.env.docker`. Reiniciar los contenedores no vuelve a cargar los datos ni restablece las contraseñas de estas cuentas.

### Uso diario y configuración

```bash
# Iniciar servicios ya creados
docker compose --env-file .env.docker up -d

# Detener los servicios; conservar base de datos y archivos
docker compose --env-file .env.docker down

# Reconstruir después de modificar el backend o sus dependencias
docker compose --env-file .env.docker up --build -d
```

Detené Vite con **Ctrl+C**. PostgreSQL y los archivos subidos se guardan en volúmenes persistentes.

| Archivo | Uso |
|---|---|
| `.env.docker` | Configuración de Docker Compose; se crea desde `.env.docker.example` |
| `backend/.env` | Ejecución del backend directamente con Node.js, fuera de Docker |
| `frontend/.env` | Opcional; `VITE_API_URL=/api/v1` y `VITE_PROXY_TARGET=http://localhost:5000` |
| `.env` raíz | Configuración del agente Python ejecutado fuera de Docker |

**Problemas frecuentes:**

- **Docker no responde:** iniciá Docker Desktop y verificá que `docker version` muestre cliente y servidor.
- **Puerto 5000 ocupado:** detené el backend local o cambiá `BACKEND_PORT` en `.env.docker`. En ese caso, ajustá `VITE_PROXY_TARGET` en `frontend/.env` al mismo puerto y reiniciá Vite.
- **Puerto 5173 ocupado:** detené la otra instancia de Vite antes de iniciar el frontend.
- **Cambiaste `DB_PASSWORD` después de crear el volumen:** PostgreSQL conserva la contraseña original. Cambiala también dentro de PostgreSQL o recuperá el valor configurado al crear esa base.
- **No podés iniciar sesión:** usá `DEMO_PASSWORD`, que es independiente de la contraseña de PostgreSQL.

Esta configuración Compose es para **desarrollo y demostración local**. La imagen incluye Python para las ejecuciones manuales del agente desde el backend. El envío de emails requiere configurar Resend; no se inicia un scheduler automáticamente.

### Verificación

```bash
npm --prefix backend audit
npm --prefix frontend audit
npm --prefix frontend run build

# Integración contra PostgreSQL real, aislado y temporal
docker compose -f compose.test.yaml up --build --abort-on-container-exit --exit-code-from backend-test
docker compose -f compose.test.yaml down
```

El entorno de test tiene otro nombre de proyecto y una base temporal. Incluye verificación del primer arranque y de la conservación de datos al reiniciar, además de las suites existentes del backend.

### Documentación

- [Guía de instalación y referencia](Documentation/GUIA-INSTALACION.md)
- [Funcionalidades](Documentation/PRESENTACION-FUNCIONALIDADES.md)
- [Base de conocimiento](Documentation/knowledge-base/README.md)
- [Roadmap](Documentation/CHANGES.md)
- [Diseño y vistas](Documentation/VISTAS.md)

La documentación se centraliza en `Documentation/`. `AGENTS.md`, `.agents/skills/` y `openspec/` conservan sus ubicaciones para que las herramientas puedan encontrarlos.

---

## English

### A virtual environment for the school community

ProyectoEscuela brings school administration and family communication into one web platform. Staff can manage documents, leave records and absence justifications, organize courses and students, record attendance, and enter grades. Parents can view their children's grades and follow their academic progress throughout the school year.

Access is organized by role:

| Role | Main features |
|---|---|
| Administration | Users, courses, subjects, students, teacher assignments, documents and settings |
| School staff / preceptors | Attendance, history, justifications, documents and internal communication |
| Teachers | Grades, academic progress, leave documents and internal communication |
| Parents / guardians | Their children's grades, progress and attendance; absence justification uploads |

### Technology stack

| Component | Technology |
|---|---|
| Frontend | React 18, Vite 8, Chakra UI 2, React Router 7, Axios |
| State and design | Context API + useReducer; shared role-based design |
| Backend | Node.js 24 LTS, Express 4, Sequelize 6 |
| Database | PostgreSQL 15 in Docker |
| Authentication | JWT in httpOnly cookies and bcrypt 6 password hashing |
| Optional notifications | Python 3.11, APScheduler, psycopg2 and Resend email |
| Local development | Docker Compose for backend + PostgreSQL; Vite for the frontend |

### First-time setup

**Requirements:** Git, [Node.js 24 LTS](https://nodejs.org/), and [Docker Desktop](https://docs.docker.com/get-started/get-docker/) running with Linux containers. Docker Engine with the Compose plugin also works on Linux.

Docker manages a separate PostgreSQL database for this project. Your PC's existing PostgreSQL installation is not used by this setup. The frontend runs on your PC using Node.js.

#### 1. Open the project and configure Docker

Clone or download this repository, then open a terminal in the folder containing `compose.yaml`.

Copy the environment template. **Windows PowerShell:**

```powershell
Copy-Item .env.docker.example .env.docker
```

**Linux / macOS:**

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker`. Choose `DB_NAME`, `DB_USER`, `DB_PASSWORD` and `DEMO_PASSWORD`, and fill in `JWT_SECRET`. `DEMO_PASSWORD` must have at least 8 characters and becomes the initial password for the demo accounts.

Generate a JWT secret, then paste the output into `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Environment files contain private settings and are excluded from Git. The database credentials in `.env.docker` configure the new container database.

#### 2. Start the backend and database

From the project root:

```bash
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker ps
```

The first run downloads images and installs dependencies. Compose waits for PostgreSQL, then the backend creates the tables and inserts four accounts, a course, subjects, a student and sample grades. Demo seeding is skipped when the database already contains data.

Check **http://localhost:5000/api/v1/health** for `"status": "ok"`. To inspect startup logs:

```bash
docker compose --env-file .env.docker logs -f backend
```

#### 3. Start the frontend

Open another terminal at the project root:

```bash
npm --prefix frontend ci
npm --prefix frontend run dev
```

Visit **http://localhost:5173**. Vite forwards `/api` requests to the backend on port 5000.

#### 4. Sign in

| Role | Email |
|---|---|
| Administrator | `admin@escuela.edu` |
| School staff | `preceptor@escuela.edu` |
| Teacher | `docente@escuela.edu` |
| Parent | `padre@escuela.edu` |

The initial password for all four accounts is the **`DEMO_PASSWORD`** you chose in `.env.docker`. Restarting the containers preserves existing data and account passwords.

### Everyday commands and configuration

```bash
# Start existing services
docker compose --env-file .env.docker up -d

# Stop services, preserving the database and uploaded files
docker compose --env-file .env.docker down

# Rebuild after changing backend code or dependencies
docker compose --env-file .env.docker up --build -d
```

Stop Vite with **Ctrl+C**. The database and uploaded files use persistent Docker volumes.

| File | Purpose |
|---|---|
| `.env.docker` | Docker Compose settings; copy from `.env.docker.example` |
| `backend/.env` | Running the backend directly with Node.js, outside Docker |
| `frontend/.env` | Optional; `VITE_API_URL=/api/v1` and `VITE_PROXY_TARGET=http://localhost:5000` |
| Root `.env` | Running the Python agent outside Docker |

**Common problems:**

- **Docker is unavailable:** start Docker Desktop and check that `docker version` reports both client and server.
- **Port 5000 is occupied:** stop the local backend or change `BACKEND_PORT` in `.env.docker`. Update `VITE_PROXY_TARGET` in `frontend/.env` to match and restart Vite.
- **Port 5173 is occupied:** stop the other Vite instance first.
- **You changed `DB_PASSWORD` after creating the volume:** PostgreSQL retains the original password. Update the PostgreSQL role password too, or restore the environment value used when that database was created.
- **Login fails:** use `DEMO_PASSWORD`, which is separate from the PostgreSQL password.

This Compose setup targets **local development and demonstrations**. Python is included for manual notification-agent runs from the backend. Email delivery requires Resend configuration; no scheduler is started automatically.

### Verification

```bash
npm --prefix backend audit
npm --prefix frontend audit
npm --prefix frontend run build

# Integration tests with an isolated, temporary real PostgreSQL database
docker compose -f compose.test.yaml up --build --abort-on-container-exit --exit-code-from backend-test
docker compose -f compose.test.yaml down
```

The test environment uses a separate Compose project and temporary database. It checks first-run initialization and restart data preservation, then runs the existing backend integration suites.

### Documentation

- [Installation and reference guide](Documentation/GUIA-INSTALACION.md)
- [Features](Documentation/PRESENTACION-FUNCIONALIDADES.md)
- [Knowledge base](Documentation/knowledge-base/README.md)
- [Roadmap](Documentation/CHANGES.md)
- [Design and views](Documentation/VISTAS.md)

Project documentation lives in `Documentation/`. `AGENTS.md`, `.agents/skills/`, and `openspec/` stay at their tool-discovery locations.
