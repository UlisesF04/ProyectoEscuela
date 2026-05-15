import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Materia extends Model {
  static associate(models) {
    Materia.belongsTo(models.Curso, { foreignKey: 'curso_id' });
    Materia.belongsToMany(models.Docente, { through: models.DocenteMateria, foreignKey: 'materia_id', otherKey: 'docente_id' });
    Materia.hasMany(models.Calificacion, { foreignKey: 'materia_id' });
    Materia.hasMany(models.Tarea, { foreignKey: 'materia_id' });
  }
}

Materia.init({
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Materia',
  tableName: 'materias',
  timestamps: true,
  underscored: true,
});

export default Materia;
