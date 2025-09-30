const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Endereco = sequelize.define('Endereco', {
    cod: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    rua: { type: DataTypes.STRING(40), allowNull: false },
    numero: { type: DataTypes.INTEGER, allowNull: true },
    bairro: { type: DataTypes.STRING(30), allowNull: false },
    cidade: { type: DataTypes.STRING(30), allowNull: false },
    uf: { type: DataTypes.STRING(2), allowNull: false, defaultValue: 'SC' },
    cep: { type: DataTypes.STRING, allowNull: false },
    obs: { type: DataTypes.STRING(90), allowNull: true }
  }, {
    tableName: 'Endereco',
    timestamps: false
  });

  // 🔹 Associações
  Endereco.associate = (models) => {
    Endereco.hasMany(models.Ministro, {
      foreignKey: 'fK_endereco',
      as: 'ministros'
    });
  };

  return Endereco;
};
