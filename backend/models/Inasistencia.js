import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Inasistencia extends Model {
  static associate(models) {
    Inasistencia.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id' });
  }
}

Inasistencia.init({
  estudiante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  registrado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  modificado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  justificada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  certificado_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Inasistencia',
  tableName: 'inasistencias',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['estudiante_id', 'fecha'],
    },
  ],
});

export default Inasistencia;
