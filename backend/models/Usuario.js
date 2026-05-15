import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Usuario extends Model {
  static associate(models) {
    Usuario.hasOne(models.Docente, { foreignKey: 'usuario_id' });
    Usuario.hasOne(models.Tutor, { foreignKey: 'usuario_id' });
  }
}

Usuario.init({
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('admin', 'docente', 'tutor'),
    allowNull: false,
  },
  whatsapp_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Usuario',
  tableName: 'usuarios',
  timestamps: true,
  underscored: true,
});

export default Usuario;
