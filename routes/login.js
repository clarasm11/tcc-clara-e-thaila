const express = require('express');
const bcrypt = require('bcryptjs'); 
const { Ministro, Aluno } = require('../models'); 
const router = express.Router();

// 🔹 Tela de login
router.get('/login', (req, res) => {
  res.render('login');
});

// 🔹 Processar login
router.post('/login', async (req, res) => {
  const { login, senha } = req.body;

  try {
    console.log("Tentando login:", login);

    // procura ministro ativo e validado
    let user = await Ministro.findOne({ where: { login, ativo: 1, validado: 1 } });
    let tipo = 'ministro';

    // se não for ministro, procura aluno ativo
    if (!user) {
      user = await Aluno.findOne({ where: { login, ativo: 1 } });
      tipo = 'aluno';
    }

    if (!user) {
      console.log("Usuário não encontrado ou inativo:", login);
      return res.status(401).render('login', { error: 'Usuário não encontrado ou inativo' });
    }

    console.log(`Usuário encontrado [${tipo}]:`, user.login, "ativo:", user.ativo);

    // valida senha
    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    console.log("Senha informada:", senha, "| Hash no banco:", user.senha, "| Confere:", senhaCorreta);

    if (!senhaCorreta) {
      return res.status(401).render('login', { error: 'Senha incorreta' });
    }

    // salva na sessão
    req.session.usuario = {
      cod: user.cod,
      nome: user.nome,
      tipo,
      ativo: user.ativo,
      validado: tipo === 'ministro' ? user.validado : null,
      pastor: tipo === 'ministro' ? user.pastor : null
    };

    console.log("Sessão criada:", req.session.usuario);

    // redireciona conforme regras
    if (tipo === 'ministro') {
      if (user.pastor == 0) {
        return res.redirect('/indexMinistro.handlebars'); // Ministro que É pastor
      } else {
        return res.redirect('/index.handlebars');         // Ministro que NÃO é pastor
      }
    } else if (tipo === 'aluno') {
      return res.redirect('/indexCrianca.handlebars');    // Criança
    }

    return res.redirect('/login.handlebars'); // fallback

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).render('login', { error: 'Erro interno do servidor' });
  }
});

// 🔹 Logout que inativa usuário
router.get('/logout', async (req, res) => {
  try {
    if (req.session.usuario) {
      if (req.session.usuario.tipo === 'ministro') {
        await Ministro.update({ ativo: 0 }, { where: { cod: req.session.usuario.cod } });
      } else if (req.session.usuario.tipo === 'aluno') {
        await Aluno.update({ ativo: 0 }, { where: { cod: req.session.usuario.cod } });
      }
    }
    req.session.destroy(() => {
      res.redirect('/login.handlebars');
    });
  } catch (err) {
    console.error('Erro ao sair:', err);
    res.redirect('/login.handlebars');
  }
});
// 🔹 Logout sem inativar usuário
router.get('/logout-simples', (req, res) => {
  try {
    req.session.destroy(() => {
      res.redirect('/login.handlebars');
    });
  } catch (err) {
    console.error('Erro ao sair:', err);
    res.redirect('/login.handlebars');
  }
});


module.exports = router;
