import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Calificacion extends Model {
  static associate(models) {
    Calificacion.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id' });
    Calificacion.belongsTo(models.Materia, { foreignKey: 'materia_id' });
    Calificacion.belongsTo(models.Docente, { foreignKey: 'docente_id' });
  }
}

Calificacion.init({
  estudiante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  materia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  docente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  },
  periodo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Calificacion',
  tableName: 'calificaciones',
  timestamps: true,
  underscored: true,
});

export default Calificacion;
