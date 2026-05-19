/**
 * Seed a preceptor user account.
 * Run: node scripts/seed-preceptor.mjs
 */
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    const passwordHash = await bcrypt.hash('preceptor123', 10);

    await sequelize.query(
      `INSERT INTO usuarios (email, password_hash, rol, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      { bind: ['preceptor@escuela.com', passwordHash, 'preceptor'] }
    );

    console.log('✅ Preceptor seed user created: preceptor@escuela.com / preceptor123');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

main();
