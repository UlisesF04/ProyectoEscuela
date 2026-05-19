/**
 * One-time script: Add 'preceptor' to the usuarios.rol ENUM in PostgreSQL.
 * Run: node scripts/alter-enum-preceptor.mjs
 */
import sequelize from '../config/database.js';

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // ALTER TYPE cannot be done inside a transaction in PostgreSQL
    await sequelize.query("ALTER TYPE enum_usuarios_rol ADD VALUE IF NOT EXISTS 'preceptor'");
    console.log("✅ Added 'preceptor' to enum_usuarios_rol");
  } catch (err) {
    if (err.message?.includes('already exists')) {
      console.log("ℹ️  'preceptor' already exists in enum");
    } else {
      console.error('❌ Error:', err.message);
    }
  } finally {
    await sequelize.close();
  }
}

main();
