module.exports = (sequelize, DataTypes) => {
  const DiaTurma = sequelize.define('DiaTurma', {
    cod: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dia: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'DiaTurma',
    timestamps: false
  });

  DiaTurma.associate = (models) => {
    DiaTurma.belongsToMany(models.Turma, {
      through: models.TurmaDia,
      foreignKey: 'diaTurma',
      otherKey: 'turma',
      as: 'turmas'
    });
  };

  return DiaTurma;
};
