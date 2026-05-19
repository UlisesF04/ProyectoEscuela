/**
 * Seed test messages so the inbox shows conversations.
 * Run: node scripts/seed-messages.mjs
 */
import sequelize from '../config/database.js';

const messages = [
  // Admin (1) → Docente1 (2)
  { emisor_id: 1, receptor_id: 2, asunto: 'Bienvenido al sistema', cuerpo: 'Hola Carlos, tu cuenta ya está activa. Podés acceder a Notas y Tareas.' },
  // Docente1 (2) → Admin (1)
  { emisor_id: 2, receptor_id: 1, asunto: 'Re: Bienvenido al sistema', cuerpo: 'Gracias, ya estoy explorando. Las notas de 1ero A ya están cargadas.' },
  // Docente1 (2) → Admin (1) — another message in same thread
  { emisor_id: 2, receptor_id: 1, asunto: 'Re: Bienvenido al sistema', cuerpo: 'Por cierto, ¿hay novedades sobre las licencias docentes?' },
  // Admin (1) → Docente1 (2)
  { emisor_id: 1, receptor_id: 2, asunto: 'Re: Bienvenido al sistema', cuerpo: 'Sí, revise la sección Licencias en el panel docente. Le quedan 15 días.' },
  // Preceptor (6) → Admin (1)
  { emisor_id: 6, receptor_id: 1, asunto: 'Ausencias sin justificar', cuerpo: 'Hay 3 ausencias sin justificar en 1ero A de esta semana. Revisar por favor.' },
  // Admin (1) → Preceptor (6)
  { emisor_id: 1, receptor_id: 6, asunto: 'Re: Ausencias sin justificar', cuerpo: 'Gracias, lo reviso. ¿Los padres ya fueron notificados?' },
  // Tutor1 (4) → Docente1 (2)
  { emisor_id: 4, receptor_id: 2, asunto: 'Consulta sobre Juan Pérez', cuerpo: 'Hola Carlos, quería saber cómo va Juan en matemáticas. Últimamente llega con dudas.' },
  // Docente1 (2) → Tutor1 (4)
  { emisor_id: 2, receptor_id: 4, asunto: 'Re: Consulta sobre Juan Pérez', cuerpo: 'Hola Roberto, Juan viene bien en matemática. Promedio 8.5. La semana que viene hay prueba.' },
  // Docente2 (3) → Admin (1)
  { emisor_id: 3, receptor_id: 1, asunto: 'Problema con carga de notas', cuerpo: 'No puedo cargar notas para 3ero C. Me dice que no tengo materias asignadas.' },
  // Admin (1) → Docente2 (3)
  { emisor_id: 1, receptor_id: 3, asunto: 'Re: Problema con carga de notas', cuerpo: 'Revisá la asignación de materias en tu perfil. Ya debería estar solucionado.' },
];

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    for (const msg of messages) {
      await sequelize.query(
        `INSERT INTO mensajes (emisor_id, receptor_id, asunto, cuerpo, leido, leido_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        { bind: [msg.emisor_id, msg.receptor_id, msg.asunto, msg.cuerpo, false, null] }
      );
    }

    console.log(`✅ ${messages.length} mensajes de prueba creados`);
    console.log('   - Admin ↔ Docente1 (Carlos García) — varios mensajes');
    console.log('   - Admin ↔ Preceptor');
    console.log('   - Docente1 ↔ Tutor1 (Roberto Mendoza)');
    console.log('   - Admin ↔ Docente2 (María López)');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

main();
