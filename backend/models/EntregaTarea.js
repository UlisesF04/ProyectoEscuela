import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class EntregaTarea extends Model {
  static associate(models) {
    EntregaTarea.belongsTo(models.Tarea, { foreignKey: 'tarea_id' });
    EntregaTarea.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id' });
  }
}

EntregaTarea.init({
  tarea_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estudiante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  entregada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  fecha_entrega_real: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'EntregaTarea',
  tableName: 'entrega_tareas',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['tarea_id', 'estudiante_id'],
    },
  ],
});

export default EntregaTarea;
