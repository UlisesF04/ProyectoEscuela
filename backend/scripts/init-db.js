const initializeDatabase = require('../config/initializeDatabase');
const { sequelize } = require('../models');

initializeDatabase({ seed: process.argv.includes('--seed') })
  .catch(error => {
    console.error('No se pudo inicializar la base de datos:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
