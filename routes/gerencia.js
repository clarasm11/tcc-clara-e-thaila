const express = require('express');
const router = express.Router();
const { Gerencia } = require('../models');

router.post('/gerencia', async (req, res) => {
  try {
    const { ministro, turma } = req.body;
    const relacao = await Gerencia.create({ ministro, turma });
    res.status(201).json(relacao);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
