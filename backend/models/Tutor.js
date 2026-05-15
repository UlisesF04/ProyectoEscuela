import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Tutor extends Model {
  static associate(models) {
    Tutor.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
    Tutor.belongsToMany(models.Estudiante, { through: models.EstudianteTutor, foreignKey: 'tutor_id', otherKey: 'estudiante_id' });
  }
}

Tutor.init({
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  whatsapp_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Tutor',
  tableName: 'tutores',
  timestamps: true,
  underscored: true,
});

export default Tutor;
