const express = require('express');
const router = express.Router();
const { Ministro, Aluno } = require('../models');

// Inativa cadastro de ministro ou aluno
router.put('/:tipo/:cod', async (req, res) => {
  const { tipo, cod } = req.params;
  try {
    if (tipo === 'ministro') {
      const ministro = await Ministro.findByPk(cod);
      if (!ministro) return res.status(404).json({ error: 'Ministro não encontrado.' });
      await ministro.update({ ativo: false });
      return res.json({ success: true });
    } else if (tipo === 'aluno') {
      const aluno = await Aluno.findByPk(cod);
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado.' });
      await aluno.update({ ativo: false, status: 'inativo' });
      return res.json({ success: true });
    } else {
      return res.status(400).json({ error: 'Tipo inválido.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao inativar cadastro.' });
  }
});

module.exports = router;