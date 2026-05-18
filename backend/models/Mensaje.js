import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Mensaje extends Model {
  static associate(models) {
    Mensaje.belongsTo(models.Usuario, { foreignKey: 'emisor_id', as: 'Emisor' });
    Mensaje.belongsTo(models.Usuario, { foreignKey: 'receptor_id', as: 'Receptor' });
  }
}

Mensaje.init({
  emisor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receptor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  asunto: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  cuerpo: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  leido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  leido_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Mensaje',
  tableName: 'mensajes',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['emisor_id'] },
    { fields: ['receptor_id'] },
    { fields: ['emisor_id', 'receptor_id'] },
  ],
});

export default Mensaje;
