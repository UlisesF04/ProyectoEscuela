const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorMiddleware = require('./middlewares/errorMiddleware');
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const coursesRoutes = require('./modules/courses/courses.routes');
const studentsRoutes = require('./modules/students/students.routes');
const subjectsRoutes = require('./modules/subjects/subjects.routes');
const attendancesRoutes = require('./modules/attendances/attendances.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middlewares globales ───────────────────────────────────────

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(morgan('dev'));

// Rate limiting global: 100 requests / 15 min
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
  });
}

module.exports = app;
