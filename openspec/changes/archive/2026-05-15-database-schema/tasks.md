# Tasks: database-schema

## 1. Modelos Sequelize

- [ ] 1.1 Crear `backend/models/Usuario.js` — modelo con email, password_hash, rol (enum), whatsapp_number, timestamps
- [ ] 1.2 Crear `backend/models/Docente.js` — modelo con usuario_id (FK), nombre, apellido, dni, dias_licencia_total, dias_usados
- [ ] 1.3 Crear `backend/models/Estudiante.js` — modelo con nombre, apellido, dni, curso_id (FK)
- [ ] 1.4 Crear `backend/models/Curso.js` — modelo con nombre, anio, division
- [ ] 1.5 Crear `backend/models/Tutor.js` — modelo con usuario_id (FK), nombre, apellido, whatsapp_number
- [ ] 1.6 Crear `backend/models/EstudianteTutor.js` — modelo junction con estudiante_id + tutor_id (composite PK)
- [ ] 1.7 Crear `backend/models/Inasistencia.js` — modelo con estudiante_id, fecha, registrado_por, modificado_por, justificada; unique(estudiante_id, fecha)
- [ ] 1.8 Crear `backend/models/Materia.js` — modelo con nombre, curso_id (FK)
- [ ] 1.9 Crear `backend/models/DocenteMateria.js` — modelo junction con docente_id + materia_id (composite PK)
- [ ] 1.10 Crear `backend/models/Calificacion.js` — modelo con estudiante_id, materia_id, docente_id, nota (1-10), periodo, fecha
- [ ] 1.11 Crear `backend/models/Tarea.js` — modelo con docente_id, materia_id, nombre, descripcion, fecha_asignacion, fecha_entrega
- [ ] 1.12 Crear `backend/models/EntregaTarea.js` — modelo con tarea_id, estudiante_id, entregada, fecha_entrega_real; unique(tarea_id, estudiante_id)
- [ ] 1.13 Crear `backend/models/NotificacionLog.js` — modelo con tipo, destinatario_tipo, destinatario_id, evento_id, mensaje, estado, fecha_envio
- [ ] 1.14 Crear `backend/models/index.js` — centralizar imports y asociaciones entre todos los modelos

## 2. Migracion Unica

- [ ] 2.1 Crear `backend/migrations/001-create-all-tables.js` — migracion con todas las tablas, FKs, indices y constraints
- [ ] 2.2 Verificar que la migracion ejecuta sin errores (`npx sequelize-cli db:migrate`)

## 3. Seed Data

- [ ] 3.1 Crear `backend/seeders/001-usuarios.js` — 5 usuarios (1 admin, 2 docentes, 2 tutores) con bcrypt hash
- [ ] 3.2 Crear `backend/seeders/002-cursos.js` — 3 cursos (1ero A, 2do B, 3ero C)
- [ ] 3.3 Crear `backend/seeders/003-docentes.js` — 2 docentes vinculados a usuarios
- [ ] 3.4 Crear `backend/seeders/004-estudiantes.js` — 9 estudiantes (3 por curso)
- [ ] 3.5 Crear `backend/seeders/005-tutores.js` — 2 tutores vinculados a usuarios
- [ ] 3.6 Crear `backend/seeders/006-estudiante-tutor.js` — relacionar estudiantes con tutores
- [ ] 3.7 Crear `backend/seeders/007-materias.js` — 2 materias por curso (6 total)
- [ ] 3.8 Crear `backend/seeders/008-docente-materia.js` — asignar docentes a materias

## 4. Integracion y Verificacion

- [ ] 4.1 Actualizar `backend/app.js` — importar `backend/models/index.js` y sincronizar modelos al iniciar
- [ ] 4.2 Verificar que `npm start` levanta sin errores y sequelize sincroniza todas las tablas
- [ ] 4.3 Verificar que seed data se carga correctamente consultando tablas
- [ ] 4.4 Marcar CHANGE-001 como COMPLETADO en `docs/CHANGES.md`
