'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. usuarios
    await queryInterface.createTable('usuarios', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      rol: { type: Sequelize.ENUM('admin', 'docente', 'tutor'), allowNull: false },
      whatsapp_number: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    // 2. cursos
    await queryInterface.createTable('cursos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nombre: { type: Sequelize.STRING, allowNull: false },
      anio: { type: Sequelize.INTEGER, allowNull: false },
      division: { type: Sequelize.CHAR(1), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    // 3. docentes
    await queryInterface.createTable('docentes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      usuario_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      nombre: { type: Sequelize.STRING, allowNull: false },
      apellido: { type: Sequelize.STRING, allowNull: false },
      dni: { type: Sequelize.STRING, allowNull: false, unique: true },
      dias_licencia_total: { type: Sequelize.INTEGER, defaultValue: 15 },
      dias_usados: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    // 4. estudiantes
    await queryInterface.createTable('estudiantes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nombre: { type: Sequelize.STRING, allowNull: false },
      apellido: { type: Sequelize.STRING, allowNull: false },
      dni: { type: Sequelize.STRING, allowNull: false, unique: true },
      curso_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'cursos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    // 5. tutores
    await queryInterface.createTable('tutores', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      usuario_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      nombre: { type: Sequelize.STRING, allowNull: false },
      apellido: { type: Sequelize.STRING, allowNull: false },
      whatsapp_number: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    // 6. estudiante_tutor
    await queryInterface.createTable('estudiante_tutor', {
      estudiante_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'estudiantes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      tutor_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tutores', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addConstraint('estudiante_tutor', {
      fields: ['estudiante_id', 'tutor_id'],
      type: 'primary key',
      name: 'pk_estudiante_tutor',
    });

    // 7. materias
    await queryInterface.createTable('materias', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nombre: { type: Sequelize.STRING, allowNull: false },
      curso_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'cursos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    // 8. docente_materia
    await queryInterface.createTable('docente_materia', {
      docente_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'docentes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      materia_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'materias', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addConstraint('docente_materia', {
      fields: ['docente_id', 'materia_id'],
      type: 'primary key',
      name: 'pk_docente_materia',
    });

    // 9. inasistencias
    await queryInterface.createTable('inasistencias', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      estudiante_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'estudiantes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      fecha: { type: Sequelize.DATEONLY, allowNull: false },
      registrado_por: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      modificado_por: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      justificada: { type: Sequelize.BOOLEAN, defaultValue: false },
      certificado_id: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addConstraint('inasistencias', {
      fields: ['estudiante_id', 'fecha'],
      type: 'unique',
      name: 'uq_inasistencias_estudiante_fecha',
    });

    // 10. calificaciones
    await queryInterface.createTable('calificaciones', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      estudiante_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'estudiantes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      materia_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'materias', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      docente_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'docentes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      nota: { type: Sequelize.INTEGER, allowNull: false },
      periodo: { type: Sequelize.STRING, allowNull: false },
      fecha: { type: Sequelize.DATEONLY, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    // 11. tareas
    await queryInterface.createTable('tareas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      docente_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'docentes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      materia_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'materias', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      nombre: { type: Sequelize.STRING, allowNull: false },
      descripcion: { type: Sequelize.TEXT, allowNull: true },
      fecha_asignacion: { type: Sequelize.DATEONLY, allowNull: false },
      fecha_entrega: { type: Sequelize.DATEONLY, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    // 12. entrega_tareas
    await queryInterface.createTable('entrega_tareas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tarea_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tareas', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      estudiante_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'estudiantes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      entregada: { type: Sequelize.BOOLEAN, defaultValue: false },
      fecha_entrega_real: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addConstraint('entrega_tareas', {
      fields: ['tarea_id', 'estudiante_id'],
      type: 'unique',
      name: 'uq_entrega_tareas_tarea_estudiante',
    });

    // 13. notificaciones_log
    await queryInterface.createTable('notificaciones_log', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tipo: { type: Sequelize.STRING, allowNull: false },
      destinatario_tipo: { type: Sequelize.STRING, allowNull: false },
      destinatario_id: { type: Sequelize.INTEGER, allowNull: false },
      evento_id: { type: Sequelize.STRING, allowNull: false },
      mensaje: { type: Sequelize.TEXT, allowNull: true },
      estado: { type: Sequelize.ENUM('enviado', 'fallido'), allowNull: false },
      fecha_envio: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notificaciones_log');
    await queryInterface.dropTable('entrega_tareas');
    await queryInterface.dropTable('tareas');
    await queryInterface.dropTable('calificaciones');
    await queryInterface.dropTable('inasistencias');
    await queryInterface.dropTable('docente_materia');
    await queryInterface.dropTable('materias');
    await queryInterface.dropTable('estudiante_tutor');
    await queryInterface.dropTable('tutores');
    await queryInterface.dropTable('estudiantes');
    await queryInterface.dropTable('docentes');
    await queryInterface.dropTable('cursos');
    await queryInterface.dropTable('usuarios');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_usuarios_rol"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notificaciones_log_estado"');
  },
};
