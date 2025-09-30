const express = require('express');
const router = express.Router();
const { Turma, Aluno, Possui, DiaTurma } = require('../models');
const { Op } = require('sequelize');

// ===================== Rotas =====================

// Criar turma
router.post('/', async (req, res) => {
  try {
    const { nome, idadeMin, idadeMax, dias } = req.body;

    // Cria a turma
    const novaTurma = await Turma.create({ nome, idadeMin, idadeMax });

    // Associa os dias selecionados
    if (dias && Array.isArray(dias)) {
      await novaTurma.setDias(dias);
    }

    // Após criar, reclassifica os alunos automaticamente
    await reclassificarAlunos();

    res.status(201).json({ message: 'Turma criada com sucesso!', turma: novaTurma });
  } catch (error) {
    console.error('[ERRO AO CRIAR TURMA]:', error);
    res.status(500).json({ message: 'Erro ao criar turma', error: error.message });
  }
});

// Buscar todas as turmas com dias
router.get('/', async (req, res) => {
  try {
    const turmas = await Turma.findAll({
      include: [{ model: DiaTurma, as: 'dias' }]
    });
    res.json(turmas);
  } catch (error) {
    console.error('[ERRO /api/turma GET]:', error);
    res.status(500).json({ message: 'Erro ao buscar turmas', error: error.message });
  }
});

// Buscar alunos da turma com filtro de status
router.get('/:cod/alunos', async (req, res) => {
  try {
    const turma = await Turma.findByPk(req.params.cod, {
      include: [{ model: DiaTurma, as: 'dias' }]
    });
    if (!turma) return res.status(404).json({ message: 'Turma não encontrada' });

    const statusParam = (req.query.status || 'todos').toLowerCase();
    let whereAluno = {};

    if (statusParam === 'pre') {
      whereAluno.status = 'pre';
    } else if (statusParam === 'ativo') {
      whereAluno.status = 'ativo';
      whereAluno.ativo = 1;
    } else if (statusParam === 'inativo') {
      whereAluno.status = 'inativo';
    }

    // 🔹 Busca somente alunos vinculados a esta turma via Possui
    const alunos = await Aluno.findAll({
      where: whereAluno,
      include: [
        {
          model: Possui,
          as: 'Turmas',
          required: true,
          where: { turma: turma.cod }
        }
      ],
      order: [['nome', 'ASC']]
    });

    // 🔹 Filtra também pela faixa etária da turma
    const alunosDaFaixa = alunos.filter(a => {
      const idade = calcularIdade(a.dataNasc);
      return idade >= turma.idadeMin && idade <= turma.idadeMax;
    });

    // Se for acesso de ministro, retorna só dados básicos
    const referer = req.headers.referer || '';
    const isMinistro = referer.includes('listaCriancaMinistro') || referer.includes('turmasMinistro') || req.originalUrl.includes('turmasMinistro');

    if (isMinistro) {
      return res.json(alunosDaFaixa.map(a => ({ nome: a.nome, cod: a.cod, status: a.status })));
    }

    // Para pastor/admin, retorna dados completos
    res.json(alunosDaFaixa);
  } catch (error) {
    console.error('[ERRO /api/turma/:cod/alunos]:', error);
    res.status(500).json({ message: 'Erro ao buscar alunos', error: error.message });
  }
});

// Excluir turma
router.delete('/:cod', async (req, res) => {
  try {
    const { cod } = req.params;
    const turma = await Turma.findByPk(cod);

    if (!turma) {
      return res.status(404).json({ message: 'Turma não encontrada' });
    }

    // Remove vínculos com alunos
    await Possui.destroy({ where: { turma: cod } });

    // Remove vínculos com dias
    await turma.setDias([]);

    // Exclui a turma
    await turma.destroy();

    // Reclassifica todos os alunos após exclusão
    await reclassificarAlunos();

    res.json({ message: 'Turma excluída com sucesso!' });
  } catch (error) {
    console.error('[ERRO AO EXCLUIR TURMA]:', error);
    res.status(500).json({ message: 'Erro ao excluir turma', error: error.message });
  }
});

// ===================== Funções auxiliares =====================

function calcularIdade(dataNasc) {
  if (!dataNasc) return 0;
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

async function reclassificarAlunos() {
  const alunos = await Aluno.findAll({ where: { status: { [Op.in]: ['ativo', 'pre'] } } });
  const turmas = await Turma.findAll({ order: [['idadeMin', 'ASC']] });

  let reclassificacoes = 0;

  for (const aluno of alunos) {
    const idade = calcularIdade(aluno.dataNasc);
    const turmaAlvo = encontrarTurmaPorIdade(idade, turmas);

    if (turmaAlvo) {
      await Possui.upsert({
        aluno: aluno.cod,
        turma: turmaAlvo.cod,
      });
      reclassificacoes++;
    }
  }

  return {
    message: `Reclassificação concluída. ${reclassificacoes} alunos reclassificados.`,
    totalAlunos: alunos.length
  };
}

function encontrarTurmaPorIdade(idade, turmas) {
  // procura turma exata
  const exata = turmas.find(t => idade >= t.idadeMin && idade <= t.idadeMax);
  if (exata) return exata;

  // se não existe turma exata, pega a com menor diferença
  const menores = turmas.filter(t => t.idadeMin <= idade);
  if (menores.length) return menores.sort((a, b) => b.idadeMin - a.idadeMin)[0];

  return turmas.sort((a, b) => a.idadeMin - b.idadeMin)[0] || null;
}

module.exports = { router, reclassificarAlunos };
