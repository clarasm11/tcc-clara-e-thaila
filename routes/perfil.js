const express = require('express');
const router = express.Router();
const { Aluno, Endereco, Genero } = require('../models');
const { podeEditarCadastro } = require('../middlewares/auth');

// 🔹 Obter dados de um aluno (API – preencher formulário de edição)
router.get('/:cod', async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.cod, {
      include: [
        { model: Endereco, as: 'Endereco', required: false },
        { model: Genero, as: 'Genero', required: false }
      ]
    });
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });

    let alunoObj = aluno.toJSON();
    if (alunoObj.Endereco) {
      alunoObj = {
        ...alunoObj,
        rua: alunoObj.Endereco.rua,
        numero: alunoObj.Endereco.numero,
        bairro: alunoObj.Endereco.bairro,
        cidade: alunoObj.Endereco.cidade,
        uf: alunoObj.Endereco.uf,
        cep: alunoObj.Endereco.cep,
        obsEndereco: alunoObj.Endereco.obs
      };
    }

    res.json(alunoObj);
  } catch (erro) {
    console.error("Erro ao buscar aluno:", erro);
    res.status(500).json({ erro: 'Erro ao buscar aluno' });
  }
});

// 🔹 Atualizar dados de um aluno (API)
router.put('/:cod', podeEditarCadastro, async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.cod, { 
      include: [
        { model: Endereco, as: 'Endereco' },
        { model: Genero, as: 'Genero' }
      ] 
    });
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });

    // Atualiza endereço
    if (aluno.Endereco && req.body.Endereco) {
      await aluno.Endereco.update(req.body.Endereco);
    }

    // Corrige genero
    let payload = { ...req.body };
    if (typeof payload.genero === 'string') {
      const g = payload.genero.trim().toLowerCase();
      if (g === 'feminino') payload.genero = 2;
      else if (g === 'masculino') payload.genero = 1;
      else payload.genero = null;
    }

    // Corrige data inválida
    if (!payload.dataNasc || payload.dataNasc === "Invalid date") {
      payload.dataNasc = null;
    }

    await aluno.update({
      ...payload,
      validado: true
    });

    res.json({ mensagem: 'Aluno atualizado com sucesso', aluno });
  } catch (erro) {
    console.error("Erro ao atualizar aluno:", erro);
    res.status(500).json({ erro: 'Erro ao atualizar aluno' });
  }
});

// 🔹 Rotas de edição via formulário
router.get('/editar/:cod', podeEditarCadastro, async (req, res) => {
  const aluno = await Aluno.findByPk(req.params.cod, {
    include: [
      { model: Endereco, as: 'Endereco' },
      { model: Genero, as: 'Genero' }
    ]
  });
  if (!aluno) return res.status(404).send('Aluno não encontrado');
  res.render('editarCadastro', { usuario: aluno });
});

router.post('/editar/:cod', podeEditarCadastro, async (req, res) => {
  await Aluno.update(req.body, { where: { cod: req.params.cod } });
  res.redirect('/perfil/' + req.params.cod);
});

module.exports = router;
