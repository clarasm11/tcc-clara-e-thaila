const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Genero = sequelize.define('Genero', {
    cod: { type: DataTypes.INTEGER, primaryKey: true },        // ← sem autoIncrement
    descricao: { type: DataTypes.STRING(9), allowNull: false }
  }, {
    tableName: 'Genero',
    timestamps: false
  });

  return Genero;
};
