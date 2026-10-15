const { sequelize } = require('../models');
const seedDemoData = require('../utils/seedDemoData');

async function initializeDatabase({ seed = process.env.SEED_DEMO_DATA === 'true' } = {}) {
  await sequelize.authenticate();
  // Create missing tables on a fresh local database. Altering existing tables is opt-in.
  const alter = process.env.NODE_ENV === 'development' && process.env.DB_SYNC_ALTER === 'true';
  await sequelize.sync({ alter });
  console.log('✓ Base de datos sincronizada');

  if (seed) {
    const created = await seedDemoData();
    if (!created) console.log('✓ La base ya contiene datos; se omite la carga de demostración');
  }
}

module.exports = initializeDatabase;
