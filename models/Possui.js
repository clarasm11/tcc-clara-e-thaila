module.exports = (sequelize, DataTypes) => {
  const Possui = sequelize.define('Possui', {
    cod: { type: DataTypes.INTEGER, primaryKey: true },
    aluno: {
      type: DataTypes.INTEGER,
      references: { model: 'Aluno', key: 'cod' }
    },
    turma: {
      type: DataTypes.INTEGER,
      references: { model: 'Turma', key: 'cod' }
    }
  }, {
    tableName: 'Possui',
    timestamps: false
  });

  return Possui;
};
