// ─── Cargar variables de entorno ANTES que cualquier require ──
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const errorMiddleware = require('./middlewares/errorMiddleware');
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const coursesRoutes = require('./modules/courses/courses.routes');
const studentsRoutes = require('./modules/students/students.routes');
const subjectsRoutes = require('./modules/subjects/subjects.routes');
const attendancesRoutes = require('./modules/attendances/attendances.routes');
const gradesRoutes = require('./modules/grades/grades.routes');
const licencesRoutes = require('./modules/licences/licences.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const configRoutes = require('./modules/config/config.routes');
const adminStatsRoutes = require('./modules/admin-stats/admin-stats.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Validación de variables de entorno al startup ─────────────
if (process.env.NODE_ENV === 'production') {
  const requiredEnv = ['JWT_SECRET', 'DATABASE_URL', 'FRONTEND_URL'];
  const missingEnv = requiredEnv.filter(v => !process.env[v]);
  if (missingEnv.length > 0) {
    console.error(`FATAL: Variables de entorno requeridas faltantes: ${missingEnv.join(', ')}`);
    process.exit(1);
  }
}

// ─── Middlewares globales ───────────────────────────────────────

// Security headers
app.use(helmet());

// Compression
app.use(compression());

// CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : (process.env.NODE_ENV === 'production'
      ? (() => { throw new Error('FRONTEND_URL es requerida en producción'); })()
      : ['http://localhost:5173']);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const error = new Error('Origen no permitido por CORS');
      error.statusCode = 403;
      callback(error, false);
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parser (for httpOnly JWT)
app.use(cookieParser());

// HTTP request logger
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  skip: (req) => req.url === '/api/v1/health',
}));

// Rate limiting global: 500 requests / 15 min (SPA-friendly)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Demasiadas solicitudes. Intente nuevamente en 15 minutos.',
  },
});
app.use(globalLimiter);

// ─── Rutas ──────────────────────────────────────────────────────

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/v1/auth', authRoutes);

// Users routes (admin management)
app.use('/api/v1/users', usersRoutes);

// Courses routes (admin management)
app.use('/api/v1/courses', coursesRoutes);

// Students routes (admin management)
app.use('/api/v1/students', studentsRoutes);

// Subjects routes (admin management)
app.use('/api/v1/subjects', subjectsRoutes);

// Attendances routes (preceptor/admin management)
app.use('/api/v1/attendances', attendancesRoutes);

// Grades routes (teacher/admin management)
app.use('/api/v1/grades', gradesRoutes);

// Licences routes
app.use('/api/v1/licences', licencesRoutes);

// Notifications routes
app.use('/api/v1/notifications', notificationsRoutes);

// Config routes (admin)
app.use('/api/v1/config', configRoutes);

// Admin stats routes (admin)
app.use('/api/v1/admin/stats', adminStatsRoutes);

// Chat routes (admin, preceptor, docente)
app.use('/api/v1/chats', chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta ${req.originalUrl} no encontrada`,
  });
});

// Error handler
app.use(errorMiddleware);

// ─── Inicio del servidor ────────────────────────────────────────

if (require.main === module) {
  (async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
      } else {
        await sequelize.sync();
      }
      console.log('✓ Base de datos sincronizada');
    } catch (err) {
      console.error('✗ Error al sincronizar la base de datos:', err.message);
    }
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en puerto ${PORT}`);
    });
  })();
}

module.exports = app;
