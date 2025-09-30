const express = require('express');
const router = express.Router();
const { Ministro, Aluno } = require('../models');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Configuração do transporte de email (ajuste para seu provedor)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'claradossantos110308@gmail.com',
    pass: 'xvfa lrcf aujg foqp'
  }
});

// Armazena códigos temporários (ideal: usar banco ou cache)
const codigos = {};

// 1. Recebe email e envia código
router.post('/email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email obrigatório' });

  let usuario = await Ministro.findOne({ where: { email } });
  let tipo = 'ministro';
  if (!usuario) {
    usuario = await Aluno.findOne({ where: { email } });
    tipo = 'aluno';
  }
  if (!usuario) return res.status(404).json({ error: 'Email não encontrado' });

  // Gera código de 6 dígitos
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  codigos[email] = { codigo, tipo, expira: Date.now() + 10 * 60 * 1000 };

  // Envia email
  try {
    await transporter.sendMail({
      from: 'seuemail@gmail.com',
      to: email,
      subject: 'Código de redefinição de senha',
      text: `Seu código de redefinição é: ${codigo}`
    });
    res.json({ message: 'Código enviado para o email.' });
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    res.status(500).json({ error: 'Erro ao enviar email: ' + err.message });
  }
});

// 2. Valida código
router.post('/codigo', (req, res) => {
  const { email, codigo } = req.body;
  const registro = codigos[email];
  if (!registro || registro.codigo !== codigo || registro.expira < Date.now()) {
    return res.status(400).json({ error: 'Código inválido ou expirado' });
  }
  res.json({ message: 'Código válido', tipo: registro.tipo });
});

// 3. Redefine senha
router.post('/senha', async (req, res) => {
  const { email, senha } = req.body;
  const registro = codigos[email];
  if (!registro) return res.status(400).json({ error: 'Fluxo inválido' });

  const hash = await bcrypt.hash(senha, 10);
  if (registro.tipo === 'ministro') {
    await Ministro.update({ senha: hash }, { where: { email } });
  } else {
    await Aluno.update({ senha: hash }, { where: { email } });
  }
  delete codigos[email];
  res.json({ message: 'Senha redefinida com sucesso.' });
});

module.exports = router;
