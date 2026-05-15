import sequelize from '../config/database.js';
import Usuario from './Usuario.js';
import Docente from './Docente.js';
import Estudiante from './Estudiante.js';
import Curso from './Curso.js';
import Tutor from './Tutor.js';
import EstudianteTutor from './EstudianteTutor.js';
import Inasistencia from './Inasistencia.js';
import Materia from './Materia.js';
import DocenteMateria from './DocenteMateria.js';
import Calificacion from './Calificacion.js';
import Tarea from './Tarea.js';
import EntregaTarea from './EntregaTarea.js';
import NotificacionLog from './NotificacionLog.js';

const models = {
  Usuario,
  Docente,
  Estudiante,
  Curso,
  Tutor,
  EstudianteTutor,
  Inasistencia,
  Materia,
  DocenteMateria,
  Calificacion,
  Tarea,
  EntregaTarea,
  NotificacionLog,
};

Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

export { sequelize };
export default models;
