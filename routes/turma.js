const express = require('express');
const router = express.Router();
const { Turma, Aluno, Possui, DiaTurma, Ministro } = require('../models');
const { Op } = require('sequelize');
const { enviarAvisoTurmaInexistente } = require('../utils/emailService');

// ===================== Rotas =====================

// Criar turma
router.post('/', async (req, res) => {
  try {
    const { nome, idadeMin, idadeMax, dias } = req.body;
    const novaTurma = await Turma.create({ nome, idadeMin, idadeMax });

    if (dias && Array.isArray(dias)) await novaTurma.setDias(dias);
    await reclassificarAlunos();

    res.status(201).json({ message: 'Turma criada com sucesso!', turma: novaTurma });
  } catch (error) {
    console.error('[ERRO AO CRIAR TURMA]:', error);
    res.status(500).json({ message: 'Erro ao criar turma', error: error.message });
  }
});

// Buscar todas as turmas
router.get('/', async (req, res) => {
  try {
    const turmas = await Turma.findAll({ include: [{ model: DiaTurma, as: 'dias' }] });
    res.json(turmas);
  } catch (error) {
    console.error('[ERRO /api/turma GET]:', error);
    res.status(500).json({ message: 'Erro ao buscar turmas', error: error.message });
  }
});

// Buscar alunos da turma
router.get('/:cod/alunos', async (req, res) => {
  try {
    const turma = await Turma.findByPk(req.params.cod, {
      include: [{ model: DiaTurma, as: 'dias' }],
    });
    if (!turma) return res.status(404).json({ message: 'Turma não encontrada' });

    const statusParam = (req.query.status || 'todos').toLowerCase();
    let whereAluno = {};
    if (statusParam === 'pre') whereAluno.status = 'pre';
    else if (statusParam === 'ativo') {
      whereAluno.status = 'ativo';
      whereAluno.ativo = 1;
    } else if (statusParam === 'inativo') whereAluno.status = 'inativo';

    const alunos = await Aluno.findAll({
      where: whereAluno,
      include: [{ model: Possui, as: 'Turmas', required: true, where: { turma: turma.cod } }],
      order: [['nome', 'ASC']],
    });

    // Retornar todos os alunos vinculados à turma, mas sinalizar quem está fora da faixa
    const alunosComFlag = alunos.map((a) => {
      const plain = a.toJSON ? a.toJSON() : a;
      const idade = calcularIdade(plain.dataNasc);
      const estaNaFaixa = idade >= turma.idadeMin && idade <= turma.idadeMax;
      return { ...plain, idade, foraFaixa: !estaNaFaixa };
    });

    res.json(alunosComFlag);
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
    if (!turma) return res.status(404).json({ message: 'Turma não encontrada' });

    await Possui.destroy({ where: { turma: cod } });
    await turma.setDias([]);
    await turma.destroy();
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
  const alunos = await Aluno.findAll({
    where: { status: { [Op.in]: ['ativo', 'pre'] } },
  });
  const turmas = await Turma.findAll({ order: [['idadeMin', 'ASC']] });
  const pastores = await Ministro.findAll({
    where: { pastor: 1, email: { [Op.ne]: null } },
  });
  const emailsPastores = pastores.map((m) => m.email).filter(Boolean);

  console.log('[RECLASSIFICADOR] Total turmas:', turmas.length);
  console.log('[RECLASSIFICADOR] Pastores encontrados:', pastores.length, 'emails:', emailsPastores.join(',') || '(nenhum)');

  let reclassificacoes = 0;

  // Limpeza preventiva: garante que cada aluno tenha no máximo um vínculo na tabela Possui
  try {
    const todosPossui = await Possui.findAll({ attributes: ['cod', 'aluno'] });
    // Agrupa por aluno e identifica o cod máximo (mais recente) para manter
    const maxPorAluno = new Map();
    for (const p of todosPossui) {
      const rec = p.toJSON ? p.toJSON() : p;
      const alunoId = rec.aluno;
      const cod = rec.cod;
      if (!maxPorAluno.has(alunoId) || cod > maxPorAluno.get(alunoId)) {
        maxPorAluno.set(alunoId, cod);
      }
    }
    // Agora remove todos os cod que NÃO são o máximo para cada aluno
    const codsParaRemover = [];
    for (const p of todosPossui) {
      const rec = p.toJSON ? p.toJSON() : p;
      const alunoId = rec.aluno;
      const cod = rec.cod;
      if (maxPorAluno.get(alunoId) !== cod) codsParaRemover.push(cod);
    }
    if (codsParaRemover.length) {
      console.log('[RECLASSIFICADOR] Removendo vínculos duplicados em Possui (mantendo o mais recente):', codsParaRemover.length);
      await Possui.destroy({ where: { cod: codsParaRemover } });
    }
  } catch (err) {
    console.error('[RECLASSIFICADOR] Erro ao limpar vínculos duplicados (Possui):', err && err.message ? err.message : err);
  }

  for (const aluno of alunos) {
    const idade = calcularIdade(aluno.dataNasc);

    // Busca por turma exata primeiro
    const turmaExata = turmas.find((t) => idade >= t.idadeMin && idade <= t.idadeMax) || null;

    if (turmaExata) {
      // Garante que o aluno tenha apenas um vínculo ativo: remove vínculos anteriores e cria o novo
      try {
        await Possui.destroy({ where: { aluno: aluno.cod } });
      } catch (err) {
        console.error('[RECLASSIFICADOR] Erro ao remover vínculos antigos (possui):', err && err.message ? err.message : err);
      }
      await Possui.create({ aluno: aluno.cod, turma: turmaExata.cod });
      reclassificacoes++;
      console.log(`[RECLASSIFICADOR] Aluno ${aluno.cod} (${aluno.nome}) classificado na turma exata ${turmaExata.cod} ${turmaExata.nome} (${turmaExata.idadeMin}-${turmaExata.idadeMax})`);
    } else {
      // Não há turma com a faixa exata — escolher turma mais próxima (fallback)
      const menores = turmas.filter((t) => t.idadeMin <= idade);
      const turmaFallback = menores.length ? menores.sort((a, b) => b.idadeMin - a.idadeMin)[0] : null;
      const turmaMaisAlta = turmas.sort((a, b) => b.idadeMax - a.idadeMax)[0] || null;

      console.log(`[RECLASSIFICADOR] Aluno ${aluno.cod} (${aluno.nome}) com ${idade} anos não encontrou turma com faixa exata.`);

      if (turmaFallback) {
        console.log(`[RECLASSIFICADOR] Atribuindo turma próxima (fallback): ${turmaFallback.cod} ${turmaFallback.nome} (${turmaFallback.idadeMin}-${turmaFallback.idadeMax})`);
        try {
          await Possui.destroy({ where: { aluno: aluno.cod } });
        } catch (err) {
          console.error('[RECLASSIFICADOR] Erro ao remover vínculos antigos (possui):', err && err.message ? err.message : err);
        }
        await Possui.create({ aluno: aluno.cod, turma: turmaFallback.cod });
      } else if (turmaMaisAlta) {
        console.log(`[RECLASSIFICADOR] Não há turma com idadeMin <= idade; usando turma mais alta: ${turmaMaisAlta.cod} ${turmaMaisAlta.nome} (${turmaMaisAlta.idadeMin}-${turmaMaisAlta.idadeMax})`);
        try {
          await Possui.destroy({ where: { aluno: aluno.cod } });
        } catch (err) {
          console.error('[RECLASSIFICADOR] Erro ao remover vínculos antigos (possui):', err && err.message ? err.message : err);
        }
        await Possui.create({ aluno: aluno.cod, turma: turmaMaisAlta.cod });
      } else {
        console.log('[RECLASSIFICADOR] Não há nenhuma turma cadastrada no sistema para atribuir.');
      }

      // Envia aviso aos pastores quando NÃO há turma com faixa exata para este aluno
      if (emailsPastores.length) {
        console.log('[RECLASSIFICADOR] Preparando envio de aviso para pastores:', emailsPastores.join(','));
        try {
          const resp = await enviarAvisoTurmaInexistente(aluno, idade, turmaMaisAlta, emailsPastores);
          console.log('[RECLASSIFICADOR] Resultado envio aviso:', resp && resp.ok ? 'OK' : JSON.stringify(resp));
        } catch (err) {
          console.error('[RECLASSIFICADOR] Erro ao enviar aviso de turma inexistente:', err && err.message ? err.message : err);
        }
      } else {
        console.log('[RECLASSIFICADOR] Nenhum e-mail de pastor disponível para envio de aviso.');
      }
    }
  }

  console.log(`[RECLASSIFICADOR] ${reclassificacoes} alunos reclassificados.`);
  return {
    message: `Reclassificação concluída. ${reclassificacoes} alunos reclassificados.`,
    totalAlunos: alunos.length,
  };
}

function encontrarTurmaPorIdade(idade, turmas) {
  const exata = turmas.find((t) => idade >= t.idadeMin && idade <= t.idadeMax);
  if (exata) return exata;
  const menores = turmas.filter((t) => t.idadeMin <= idade);
  if (menores.length) return menores.sort((a, b) => b.idadeMin - a.idadeMin)[0];
  return null;
}

module.exports = { router, reclassificarAlunos };
