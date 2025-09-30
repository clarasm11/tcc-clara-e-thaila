module.exports = (sequelize, DataTypes) => {
  const Aluno = sequelize.define('Aluno', {
    cod: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: DataTypes.STRING(50),
    login: { type: DataTypes.STRING(15), allowNull: true },
    senha: { type: DataTypes.STRING(10), allowNull: true },
    dataNasc: DataTypes.DATEONLY,
    rg: DataTypes.STRING(14),
    cpf: DataTypes.STRING(14),
    fone: DataTypes.STRING(15),
    email: DataTypes.STRING(70),

    // Dados escolares e de saúde
    nacionalidade: DataTypes.STRING(30),
    linguaNativa: DataTypes.STRING(15),
    linguaEstrangeira: DataTypes.STRING(30),
    escolaAtual: DataTypes.STRING(50),
    aspectoPsi: DataTypes.STRING(50),   // laudo
    medicamentos: DataTypes.STRING(60),
    alergias: DataTypes.STRING(50),
    restricaoA: DataTypes.STRING(100),
    projetoIgreja: DataTypes.STRING(60),
    imagem: DataTypes.STRING(60),
    obs: DataTypes.STRING(100),         // observações adicionais

    // Responsável 1
    nomeResponsavel: DataTypes.STRING(50),
    grauParentesco: DataTypes.STRING(50),
    cpfResponsavel: DataTypes.STRING(14),
    foneResponsavel: DataTypes.STRING(15),

    // Responsável 2
    nomeResponsavel2: DataTypes.STRING(50),
    grauParentesco2: DataTypes.STRING(50),
    cpfResponsavel2: DataTypes.STRING(14),
    foneResponsavel2: DataTypes.STRING(15),

    // Autorizações e status
    autImagem: DataTypes.BOOLEAN,
    status: { type: DataTypes.STRING(20), defaultValue: 'ativo' },
    ativo: { type: DataTypes.INTEGER, defaultValue: 1 },



    // Relacionamentos
    endereco: DataTypes.INTEGER,
    genero: DataTypes.INTEGER
  }, {
    tableName: 'Aluno',
    timestamps: false
  });

  Aluno.associate = (models) => {
    Aluno.belongsTo(models.Endereco, { foreignKey: 'endereco', as: 'Endereco' });
    Aluno.belongsTo(models.Genero, { foreignKey: 'genero', as: 'Genero' });
  };

  return Aluno;
};
