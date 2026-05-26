## 1. Backend Foundation

- [x] 1.1 Create `backend/` directory structure (config/, modules/, models/, repositories/, middlewares/, utils/, migrations/, seeders/)
- [x] 1.2 Create `backend/package.json` with Express 4, Sequelize 6, jsonwebtoken, bcrypt, express-validator, express-rate-limit, cors, morgan
- [x] 1.3 Create `backend/config/database.js` with Sequelize connection using DATABASE_URL fallback to individual env vars
- [x] 1.4 Create `backend/app.js` with Express skeleton: CORS, JSON parser, morgan, rate limiter, 404 handler, global error handler
- [x] 1.5 Create `backend/.gitignore` (node_modules, .env, dist, logs)
- [x] 1.6 Run `npm install` in backend and verify no errors

## 2. Frontend Foundation

- [x] 2.1 Create `frontend/` directory structure (public/, src/pages/, src/components/, src/context/, src/hooks/, src/services/, src/routes/, src/utils/)
- [x] 2.2 Create `frontend/package.json` with React 18, Vite, Chakra UI 2.x, React Router v6, axios
- [x] 2.3 Create `frontend/vite.config.js` with React plugin and dev server config
- [x] 2.4 Create `frontend/src/main.jsx` with Chakra Provider + React Router + StrictMode
- [x] 2.5 Create `frontend/index.html` entry point
- [x] 2.6 Create `frontend/.gitignore` (node_modules, .env, dist)
- [x] 2.7 Run `npm install` in frontend and verify no errors

## 3. Agent Foundation

- [x] 3.1 Create `agent/` directory structure (tasks/, scheduler/)
- [x] 3.2 Create `agent/requirements.txt` with APScheduler, psycopg2-binary, twilio, pandas
- [x] 3.3 Create `agent/config.py` with environment variables loader for DATABASE_URL, Twilio credentials, AUSENCIA_UMBRAL
- [x] 3.4 Create `agent/main.py` with APScheduler skeleton and placeholder daily task
- [x] 3.5 Create empty task files: `agent/tasks/db_reader.py`, `agent/tasks/notifier.py`, `agent/tasks/alert_engine.py`
- [x] 3.6 Create `agent/.gitignore` (__pycache__, .env, *.pyc)

## 4. Root Configuration

- [x] 4.1 Create root `.env.example` with all project environment variables documented
- [x] 4.2 Create `vercel.json` with SPA rewrites for React Router
- [x] 4.3 Create root `.gitignore` (OS files, IDE files)
- [x] 4.4 Verify backend starts with `node backend/app.js`
- [x] 4.5 Verify frontend builds with `npm run build` in frontend/
- [x] 4.6 Verify agent imports with `python -c "from agent.main import *"`
