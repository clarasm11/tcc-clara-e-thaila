module.exports = (sequelize, DataTypes) => {
  const TurmaDia = sequelize.define('TurmaDia', {
    cod: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    turma: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Turma', key: 'cod' }   // 🔹 FK para Turma
    },
    diaTurma: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'DiaTurma', key: 'cod' } // 🔹 FK para DiaTurma
    }
  }, {
    tableName: 'TurmaDia',
    timestamps: false
  });

  return TurmaDia;
};
