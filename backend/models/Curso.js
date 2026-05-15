import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Curso extends Model {
  static associate(models) {
    Curso.hasMany(models.Estudiante, { foreignKey: 'curso_id' });
    Curso.hasMany(models.Materia, { foreignKey: 'curso_id' });
  }
}

Curso.init({
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  division: {
    type: DataTypes.CHAR(1),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Curso',
  tableName: 'cursos',
  timestamps: true,
  underscored: true,
});

export default Curso;
