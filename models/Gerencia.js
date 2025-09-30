module.exports = (sequelize, DataTypes) => {
  const Gerencia = sequelize.define('Gerencia', {
    cod: { type: DataTypes.INTEGER, primaryKey: true },
    ministro: {
      type: DataTypes.INTEGER,
      references: { model: 'Ministro', key: 'cod' }
    },
    turma: {
      type: DataTypes.INTEGER,
      references: { model: 'Turma', key: 'cod' }
    }
  }, {
    tableName: 'Gerencia',
    timestamps: false
  });

  return Gerencia;
};
