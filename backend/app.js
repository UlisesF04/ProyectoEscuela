import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import models from './models/index.js';
import authRoutes from './modules/auth/auth.routes.js';

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
