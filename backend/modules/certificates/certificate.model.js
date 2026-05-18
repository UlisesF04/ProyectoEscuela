import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

class Certificado extends Model {
  static associate(models) {
    Certificado.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id' });
    Certificado.belongsTo(models.Inasistencia, { foreignKey: 'inasistencia_id', as: 'inasistencia' });
    Certificado.belongsTo(models.Usuario, { foreignKey: 'uploaded_by', as: 'subidoPor' });
  }
}

Certificado.init({
  estudiante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  inasistencia_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
    defaultValue: 'pendiente',
  },
  comentario_rechazo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Certificado',
  tableName: 'certificados',
  timestamps: true,
  underscored: true,
});

export default Certificado;
