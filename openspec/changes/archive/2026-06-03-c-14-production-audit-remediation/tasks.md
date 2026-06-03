## 1. Bloqueantes (C-14.0) — blockers

- [x] 1.1 Eliminar JWT fallback hardcodeado en authMiddleware.js y auth.service.js, agregar startup guard en app.js para JWT_SECRET requerido
- [x] 1.2 Agregar verificación de asignación docente (TeacherSubject) en grades.service.js createGrade
- [x] 1.3 Agregar ownership check en grades.service.js updateGrade (docente creador o admin)
- [x] 1.4 Agregar role-based authorization en grades.service.js getStudentGrades (docente→solo materias asignadas, padre→solo hijos vinculados)
- [x] 1.5 Agregar ownership check en licences.service.js getFileData (user_id === req.user.id o admin)
- [x] 1.6 Agregar verificación de asignación docente en attendances.service.js getCourseAttendance
- [x] 1.7 Reemplazar `sync({ alter: true })` con condicional `if (NODE_ENV !== 'production')` en app.js
- [x] 1.8 Implementar whitelist de campos permitidos en users/students/courses/grades/attendances update service methods
- [x] 1.9 Migrar JWT de localStorage a httpOnly cookie: backend setea cookie en login, frontend usa withCredentials, eliminar localStorage token handling
- [x] 1.10 Instalar helmet, configurar CSP + HSTS + X-Frame-Options + X-Content-Type-Options en backend app.js
- [x] 1.11 Setear VITE_API_URL en Vercel env, eliminar fallbacks `http://localhost:5000` en api.js y Justificaciones/Justificativos pages
- [x] 1.12 Crear CI/CD pipeline: `.github/workflows/ci.yml` con tests backend + frontend lint+build
- [x] 1.13 Tests de integración para todos los cambios de autorización (1.1-1.8)

## 2. Preventivos (C-14.1) — altos

- [x] 2.1 Agregar fileFilter con MIME types permitidos (JPG/PNG/PDF) en multerLicences.js
- [x] 2.2 Agregar verificación de permiso por curso en attendances.service.js batchRegister
- [x] 2.3 Sanitizar errorMiddleware.js: mensaje genérico en producción, log completo server-side
- [x] 2.4 Implementar `PUT /api/v1/auth/password` con validación de old password
- [x] 2.5 Configurar morgan condicional por NODE_ENV ('combined' en prod, 'dev' en dev)
- [x] 2.6 Agregar sanitización input (escape/trim/strip HTML) en validaciones de texto express-validator
- [x] 2.7 Agregar `rel="noopener noreferrer"` en JustificacionesPage.jsx y JustificativosPage.jsx
- [x] 2.8 Completar root `.gitignore` con node_modules/, dist/, *.env.*, uploads/, *.log, logs/
- [x] 2.9 Validar origin contra whitelist en CORS, crash si FRONTEND_URL no está seteado en prod
- [x] 2.10 Completar `vercel.json` con headers de seguridad, env, buildCommand, outputDirectory
- [x] 2.11 Mover pg y pg-hstore de devDependencies a dependencies en backend/package.json
- [x] 2.12 Agregar `defaultScope: { attributes: { exclude: ['password_hash'] } }` en User model
- [x] 2.13 Agregar guard `if (NODE_ENV === 'production') return` en seeder demo-users
- [x] 2.14 Upgrade express@4.22.2 en backend/package.json + npm audit fix
- [x] 2.15 Upgrade bcrypt@6.0.0 (verificar compatibilidad con Node.js 20 require)
- [x] 2.16 Agregar overrides para uuid@>=11.1.1 en backend/package.json
- [x] 2.17 Implementar account-level lockout: columna failed_attempts + locked_until en users, verificar en login
- [x] 2.18 Implementar refresh token rotation + token blacklist (tabla token_blacklist o Redis)
- [x] 2.19 Restringir creación de usuarios por rol: preceptor solo crea padre, admin crea docente
- [x] 2.20 Agregar sslmode=require en DATABASE_URL del agente Python o warning al startup
- [x] 2.21 Tests de integración para todos los cambios de preventivos (2.1-2.20)

## 3. Performance e Integridad (C-14.2) — medios/bajos

- [x] 3.1 Crear migración con índices en messages (chat_id, created_at)
- [x] 3.2 Crear migración con índices en courses (name, year, division)
- [x] 3.3 Crear migración con UNIQUE(name, year, division) en courses
- [x] 3.4 Crear migración con UNIQUE(name, course_id) en subjects
- [x] 3.5 Condicionar console.error de ErrorBoundary.jsx a NODE_ENV === 'development'
- [x] 3.6 Agregar `express.json({ limit: '1mb' })` y `urlencoded({ limit: '1mb' })` en app.js
- [x] 3.7 Sanitizar logging de PII en notifier.py: masking de emails en INFO, detalle en DEBUG
- [x] 3.8 Validar consistencia de resend.api_key en notifier.py __init__
- [x] 3.9 Sanitizar mensaje de error de conexión BD en alert_engine.py
- [x] 3.10 Agregar try/except con ValueError en config.py para AUSENCIA_UMBRAL
- [x] 3.11 Limpiar .env.example con placeholders obvios
- [x] 3.12 Agregar meta tag CSP en frontend/index.html
- [x] 3.13 Crear backend/railway.json con startCommand y healthcheckPath
- [x] 3.14 Crear .node-version con 20.18.0 en la raíz
- [x] 3.15 Evaluar y agregar UNIQUE(student_id, subject_id, type) en grades si aplica
- [x] 3.16 Quitar exc_info=True duplicado en alert_engine.py y db_reader.py
- [x] 3.17 Agregar `build.sourcemap: false` explícito en frontend/vite.config.js
- [x] 3.18 Agregar HTTPS redirect middleware condicional en app.js (NODE_ENV === 'production')
- [x] 3.19 Agregar validación de env vars requeridas al startup (JWT_SECRET, DATABASE_URL, FRONTEND_URL)
- [x] 3.20 Instalar compression middleware en backend
- [x] 3.21 Verificar Content-Type antes de crear blob download en LeavesPage/MyLeavesPage
- [x] 3.22 Agregar validación de año (min:1900, max:2100) en Course model
- [x] 3.23 Agregar validate block en Chat model para user1_id !== user2_id
