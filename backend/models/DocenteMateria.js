import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class DocenteMateria extends Model {
  static associate(models) {
    DocenteMateria.belongsTo(models.Docente, { foreignKey: 'docente_id' });
    DocenteMateria.belongsTo(models.Materia, { foreignKey: 'materia_id' });
  }
}

DocenteMateria.init({
  docente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  materia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
}, {
  sequelize,
  modelName: 'DocenteMateria',
  tableName: 'docente_materia',
  timestamps: true,
  underscored: true,
});

export default DocenteMateria;
