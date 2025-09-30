module.exports = (sequelize, DataTypes) => {
  const Turma = sequelize.define('Turma', {
    cod: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    idadeMin: { type: DataTypes.INTEGER, allowNull: false },
    idadeMax: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'Turma',
    timestamps: false
  });

  Turma.associate = (models) => {
    // Uma turma pode ter vários dias
    Turma.belongsToMany(models.DiaTurma, {
      through: models.TurmaDia,
      foreignKey: 'turma',
      otherKey: 'diaTurma',
      as: 'dias'
    });

    // Relação com alunos
    Turma.belongsToMany(models.Aluno, {
      through: models.Possui,
      foreignKey: 'turma',
      otherKey: 'aluno'
    });

    // Relação com ministros
    Turma.belongsToMany(models.Ministro, {
      through: models.Gerencia,
      foreignKey: 'turma',
      otherKey: 'ministro'
    });
  };

  return Turma;
};
