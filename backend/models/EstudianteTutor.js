import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class EstudianteTutor extends Model {
  static associate(models) {
    EstudianteTutor.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id' });
    EstudianteTutor.belongsTo(models.Tutor, { foreignKey: 'tutor_id' });
  }
}

EstudianteTutor.init({
  estudiante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  tutor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
}, {
  sequelize,
  modelName: 'EstudianteTutor',
  tableName: 'estudiante_tutor',
  timestamps: true,
  underscored: true,
});

export default EstudianteTutor;
