import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class NotificacionLog extends Model {
  static associate(models) {}
}

NotificacionLog.init({
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  destinatario_tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  destinatario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  evento_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('enviado', 'fallido'),
    allowNull: false,
  },
  fecha_envio: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'NotificacionLog',
  tableName: 'notificaciones_log',
  timestamps: true,
  underscored: true,
});

export default NotificacionLog;
