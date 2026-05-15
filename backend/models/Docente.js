import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Docente extends Model {
  static associate(models) {
    Docente.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
    Docente.belongsToMany(models.Materia, { through: models.DocenteMateria, foreignKey: 'docente_id', otherKey: 'materia_id' });
  }
}

Docente.init({
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
  dni: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  dias_licencia_total: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
  },
  dias_usados: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  sequelize,
  modelName: 'Docente',
  tableName: 'docentes',
  timestamps: true,
  underscored: true,
});

export default Docente;
