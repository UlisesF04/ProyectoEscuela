import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import models from './models/index.js';
import authRoutes from './modules/auth/auth.routes.js';
import absenceRoutes from './modules/absences/absence.routes.js';
import gradeRoutes from './modules/grades/grade.routes.js';
import taskRoutes from './modules/tasks/task.routes.js';
import teacherRoutes from './modules/teachers/teacher.routes.js';
import tutorRoutes from './modules/tutors/tutor.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import communicationRoutes from './modules/communication/message.routes.js';
import certificateRoutes from './modules/certificates/certificate.routes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

await connectDB();

await sequelize.sync();

app.get('/', (req, res) => {
  res.json({
    message: 'ProyectoEscuela API is running...',
    status: 'active',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: sequelize.authenticate() ? 'connected' : 'disconnected',
  });
});

app.get('/message', (req, res) => {
  res.json({
    message: 'Connected successfully',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/certificates', certificateRoutes);

// Multer error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'El archivo supera el tamaño máximo de 5MB' });
  }
  if (err.message && err.message.startsWith('Formato no permitido')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// GET /api/courses — List all courses (authenticated)
import { authenticate } from './modules/auth/auth.middleware.js';
app.get('/api/courses', authenticate, async (req, res, next) => {
  try {
    const courses = await models.Curso.findAll({ order: [['anio', 'ASC'], ['division', 'ASC']] });
    res.json({ cursos: courses.map(c => ({ id: c.id, name: c.nombre })) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/models', (req, res) => {
  const modelList = Object.keys(models).filter(k => k !== 'sequelize');
  res.json({ models: modelList, count: modelList.length });
});

app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({
    message: 'Internal Server Error',
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', async () => {
  await sequelize.close();
  console.log('Server stopped');
  process.exit(0);
});
