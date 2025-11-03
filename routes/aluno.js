const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { Aluno, Endereco, Genero, Possui } = require('../models');
const { reclassificarAlunos } = require('./turma');

/**
 * Criar pré-cadastro (feito pelo ministro)
 */
router.post('/pre-cadastro', async (req, res) => {
  try {
    if (req.body.cpf) {
      const existeCpf = await Aluno.findOne({ where: { cpf: req.body.cpf } });
      if (existeCpf) {
        return res.status(400).json({ message: 'Já existe um aluno cadastrado com este CPF.' });
      }
    }

    const { Endereco: enderecoPayload, ...dadosAluno } = req.body;

    let novoEndereco = null;
    if (enderecoPayload) {
      novoEndereco = await Endereco.create(enderecoPayload);
    }

    const aluno = await Aluno.create({
      ...dadosAluno,
      endereco: novoEndereco ? novoEndereco.cod : null,
      status: 'pre'
    });

    // Chama reclassificarAlunos para vincular automaticamente o pré-cadastro à turma correta
    // (reclassificarAlunos criará vínculo na tabela Possui conforme faixa etária ou turma mais próxima)
    try {
      if (typeof reclassificarAlunos === 'function') {
        await reclassificarAlunos();
      }
    } catch (e) {
      console.error('Erro ao reclassificar após pré-cadastro:', e);
      // não interrompe a resposta ao cliente
    }

    res.status(201).json({ message: 'Pré-cadastro criado com sucesso!', aluno });
  } catch (error) {
    console.error('Erro ao criar pré-cadastro:', error);
    res.status(500).json({ message: 'Erro ao criar pré-cadastro.' });
  }
});

/**
 * Finalizar cadastro (transforma pré-cadastro em cadastro ativo)
 */
router.post('/finalizar-cadastro', async (req, res) => {
  try {
    const { rg, cpf, dataNasc, login, senha, Endereco: enderecoPayload, ...dadosAluno } = req.body;

    const alunoExistente = await Aluno.findOne({
      where: { rg, cpf, dataNasc, status: 'pre' },
      include: [
        { model: Endereco, as: 'Endereco', required: false },
        { model: Genero, as: 'Genero', required: false }
      ]
    });

    if (!alunoExistente) {
      return res.status(400).json({
        message: 'Pré-cadastro não encontrado. Confira RG, CPF e Data de Nascimento.'
      });
    }

    // 🔹 Checa duplicidade de login
    const loginDuplicado = await Aluno.findOne({ where: { login } });
    if (loginDuplicado && loginDuplicado.cod !== alunoExistente.cod) {
      return res.status(400).json({ message: 'Este login já existe para outro aluno.' });
    }

  
    // Criptografa a senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Salva/atualiza endereço
    let novoEndereco = null;
    if (enderecoPayload) {
      if (typeof enderecoPayload.numero === 'string') {
        enderecoPayload.numero = enderecoPayload.numero.trim() === '' ? null : parseInt(enderecoPayload.numero, 10);
      }
      if (alunoExistente.Endereco) {
        await alunoExistente.Endereco.update(enderecoPayload);
        novoEndereco = alunoExistente.Endereco;
      } else {
        novoEndereco = await Endereco.create(enderecoPayload);
      }
    }

    await alunoExistente.update({
      ...dadosAluno,
      login,
      senha: senhaHash,
      status: 'ativo',
      endereco: novoEndereco ? novoEndereco.cod : alunoExistente.endereco
    });

    await reclassificarAlunos();

    res.status(200).json({ message: 'Cadastro finalizado com sucesso!' });
  } catch (error) {
    console.error('Erro no finalizar cadastro:', error);
    res.status(500).json({ message: 'Erro ao finalizar cadastro.' });
  }
});

/**
 * Buscar aluno por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id, {
      include: [
        { model: Endereco, as: 'Endereco', required: false },
        { model: Genero, as: 'Genero', required: false }
      ]
    });
    if (!aluno) return res.status(404).json({ message: 'Aluno não encontrado.' });
    res.json(aluno);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar aluno', error: error.message });
  }
});

/**
 * Atualizar aluno (edição)
 */
router.put('/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id, {
      include: [
        { model: Endereco, as: 'Endereco', required: false },
        { model: Genero, as: 'Genero', required: false }
      ]
    });
    if (!aluno) return res.status(404).json({ message: 'Aluno não encontrado.' });

    const payload = { ...req.body };
    const enderecoPayload = payload.Endereco || null;
    delete payload.Endereco;

    if (typeof payload.genero === 'string') {
      const g = payload.genero.trim().toLowerCase();
      if (g === 'feminino') payload.genero = 2;
      else if (g === 'masculino') payload.genero = 1;
      else payload.genero = null;
    }

    if (req.body.finalizar === true || req.body.finalizar === 'true') {
      payload.status = 'ativo';
    } else if (aluno.status === 'pre') {
      payload.status = 'pre';
    } else {
      delete payload.status;
    }

    await aluno.update(payload);

    if (enderecoPayload) {
      if (aluno.Endereco) {
        await aluno.Endereco.update(enderecoPayload);
      } else {
        const novoEndereco = await Endereco.create(enderecoPayload);
        await aluno.update({ endereco: novoEndereco.cod });
      }
    }

    if ('dataNasc' in payload || 'status' in payload) {
      await reclassificarAlunos();
    }

    res.json({ message: 'Aluno atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro no atualizar aluno:', error);
    res.status(500).json({ message: 'Erro ao atualizar aluno', error: error.message });
  }
});

/**
 * Inativar
 */
router.put('/inativar/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) return res.status(404).json({ message: 'Aluno não encontrado.' });

    await aluno.update({ ativo: 0 });
    res.json({ message: 'Aluno inativado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao inativar aluno', error: error.message });
  }
});

/**
 * Ativar
 */
router.put('/ativar/:id', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) return res.status(404).json({ message: 'Aluno não encontrado.' });

    await aluno.update({ ativo: 1 });
    await reclassificarAlunos();

    res.json({ message: 'Aluno ativado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao ativar aluno', error: error.message });
  }
});

// Listar alunos por turma com filtros (ativo/pre/todos)
router.get('/turma/:id/alunos', async (req, res) => {
  try {
    const { id } = req.params;
    const status = (req.query.status || '').toString().trim().toLowerCase();

    let whereAluno = {};
    if (status === 'ativo') {
      whereAluno.status = 'ativo';
      whereAluno.ativo = 1;
    } else if (status === 'pre') {
      whereAluno.status = 'pre';
    }

    const alunos = await Aluno.findAll({
      where: whereAluno,
      order: [['nome', 'ASC']],
      include: [
        { model: Endereco, as: 'Endereco', required: false },
        { model: Genero, as: 'Genero', required: false },
        {
          model: Possui,
          as: 'Turmas',
          required: true,
          where: { turma: id }
        }
      ]
    });

    res.json(alunos);
  } catch (error) {
    console.error("Erro ao listar alunos da turma:", error);
    res.status(500).json({ message: "Erro ao listar alunos." });
  }
});

router.get('/', async (req, res) => {
  try {
    const alunos = await Aluno.findAll({
      where: { ativo: 1 },
      order: [['nome', 'ASC']],
      include: [
        { model: Endereco, as: 'Endereco', required: false },
        { model: Genero, as: 'Genero', required: false }
      ]
    });

    res.json(alunos);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ message: 'Erro ao listar alunos', error: error.message });
  }
});

module.exports = router;