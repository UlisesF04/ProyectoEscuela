import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Tarea extends Model {
  static associate(models) {
    Tarea.belongsTo(models.Docente, { foreignKey: 'docente_id' });
    Tarea.belongsTo(models.Materia, { foreignKey: 'materia_id' });
    Tarea.hasMany(models.EntregaTarea, { foreignKey: 'tarea_id' });
  }
}

Tarea.init({
  docente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  materia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fecha_asignacion: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  fecha_entrega: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Tarea',
  tableName: 'tareas',
  timestamps: true,
  underscored: true,
});

export default Tarea;
