import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Estudiante extends Model {
  static associate(models) {
    Estudiante.belongsTo(models.Curso, { foreignKey: 'curso_id' });
    Estudiante.belongsToMany(models.Tutor, { through: models.EstudianteTutor, foreignKey: 'estudiante_id', otherKey: 'tutor_id' });
    Estudiante.hasMany(models.Inasistencia, { foreignKey: 'estudiante_id' });
    Estudiante.hasMany(models.Calificacion, { foreignKey: 'estudiante_id' });
    Estudiante.hasMany(models.EntregaTarea, { foreignKey: 'estudiante_id' });
  }
}

Estudiante.init({
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dni: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Estudiante',
  tableName: 'estudiantes',
  timestamps: true,
  underscored: true,
});

export default Estudiante;
