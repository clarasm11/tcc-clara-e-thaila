const express = require('express');
const router = express.Router();
const { Possui } = require('../models');

router.post('/possui', async (req, res) => {
  try {
    const { aluno, turma } = req.body;
    const relacao = await Possui.create({ aluno, turma });
    res.status(201).json(relacao);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
