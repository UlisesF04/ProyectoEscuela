# Project Foundation

> Base del monorepo: estructura de directorios, configuración de tooling compartido y convenciones del proyecto.

## ADDED Requirements

### Requirement: Structure
The monorepo SHALL have the following top-level directories: `frontend/`, `backend/`, `agent/`, `openspec/`, `docs/`, `knowledge-base/`.

#### Scenario: Top-level directories exist
- **WHEN** inspecting the project root
- **THEN** it SHALL contain `frontend/`, `backend/`, `agent/`, `openspec/`, `docs/`, and `knowledge-base/` directories

### Requirement: Backend package.json
The backend SHALL have a `package.json` with Express 4.x, Sequelize 6.x, jsonwebtoken, bcrypt, express-validator, express-rate-limit, cors, and morgan as dependencies.

#### Scenario: Backend dependencies are installable
- **WHEN** running `npm install` in `backend/`
- **THEN** all dependencies SHALL install without errors

### Requirement: Frontend package.json
The frontend SHALL have a `package.json` with React 18.x, Vite, Chakra UI 2.x, React Router v6, and axios as dependencies.

#### Scenario: Frontend dependencies are installable
- **WHEN** running `npm install` in `frontend/`
- **THEN** all dependencies SHALL install without errors

### Requirement: Agent requirements.txt
The agent SHALL have a `requirements.txt` with APScheduler, psycopg2-binary, twilio, and pandas.

#### Scenario: Agent dependencies are installable
- **WHEN** running `pip install -r agent/requirements.txt`
- **THEN** all Python packages SHALL install without errors

### Requirement: Backend app skeleton
The backend SHALL have an `app.js` entry point that configures Express with CORS, JSON body parser, morgan logger, and a global error handler middleware.

#### Scenario: Backend starts without errors
- **WHEN** running `node backend/app.js`
- **THEN** the server SHALL start and listen on the configured port

### Requirement: Frontend main skeleton
The frontend SHALL have a `src/main.jsx` entry point that renders the app with Chakra Provider and React Router.

#### Scenario: Frontend builds without errors
- **WHEN** running `npm run build` in `frontend/`
- **THEN** Vite SHALL produce a production build without errors

### Requirement: Agent main skeleton
The agent SHALL have a `main.py` entry point with an APScheduler that runs a placeholder task.

#### Scenario: Agent starts without errors
- **WHEN** running `python agent/main.py`
- **THEN** the scheduler SHALL start without import errors

### Requirement: .env.example
The project SHALL have a `.env.example` file at the root with all environment variables documented: database connection vars, JWT_SECRET, Twilio credentials, SERVICE_API_KEY, FRONTEND_URL, PORT, NODE_ENV, and CLOUDINARY_URL.

#### Scenario: env.example contains all variables
- **WHEN** reading `.env.example`
- **THEN** it SHALL contain `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `SERVICE_API_KEY`, `FRONTEND_URL`, `PORT`, `NODE_ENV`, and `CLOUDINARY_URL`

### Requirement: Vercel configuration
The project SHALL have a `vercel.json` in the root that rewrites all routes to `index.html` for SPA client-side routing.

#### Scenario: Vercel config is valid JSON
- **WHEN** parsing `vercel.json`
- **THEN** it SHALL be valid JSON with a `rewrites` array

### Requirement: Gitignore per component
Each component (`frontend/`, `backend/`, `agent/`) SHALL have a `.gitignore` that excludes `node_modules/`, `.env`, `dist/`, `__pycache__/`, and OS files.

#### Scenario: Gitignore excludes node_modules
- **WHEN** checking `backend/.gitignore` and `frontend/.gitignore`
- **THEN** `node_modules/` SHALL be listed in both files
