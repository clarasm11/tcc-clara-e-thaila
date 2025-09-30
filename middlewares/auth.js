// middlewares/auth.js

// 🔹 Middleware principal de autenticação
function authMiddleware(req, res, next) {
  const rotasLivres = [
    '/login.handlebars',
    '/cadastroMinistro.handlebars',
    '/cadastroAluno.handlebars',
    '/escolha.handlebars',
    '/login',   // rota POST de login
    '/logout',  // rota GET de logout

    // 🔓 Rotas de API públicas
    '/api/ministro/cadastro',  // cadastro inicial de ministro
    '/api/aluno/cadastro'      // cadastro FINAL da criança (público)
  ];

  // Se a rota for livre → segue sem verificar login
  if (rotasLivres.includes(req.path)) {
    return next();
  }

  // Se não tiver sessão → decide se responde JSON (API) ou redireciona (página)
  if (!req.session.usuario) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    return res.redirect('/login.handlebars');
  }

  const { tipo, ativo, validado } = req.session.usuario;

  // 🔹 Pré-cadastro da criança só pode ser feito por ministro validado
  if (req.path === '/api/aluno/pre-cadastro') {
    if (tipo !== 'ministro' || !ativo || !validado) {
      return res.status(403).json({ error: 'Apenas ministros validados podem realizar o pré-cadastro da criança' });
    }
  }

  // 🔹 Ministro precisa estar ativo E validado para acessar outras rotas
  if (tipo === 'ministro' && (!ativo || !validado)) {
    req.session.destroy(() => {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(403).json({ error: 'Ministro não autorizado' });
      }
      return res.redirect('/login.handlebars');
    });
    return;
  }

  // 🔹 Aluno precisa estar ativo
  if (tipo === 'aluno' && !ativo) {
    req.session.destroy(() => {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(403).json({ error: 'Aluno não autorizado' });
      }
      return res.redirect('/login.handlebars');
    });
    return;
  }

  next();
}

// 🔹 Middleware para verificar se o usuário pode editar um cadastro
function podeEditarCadastro(req, res, next) {
  const usuarioLogado = req.session.usuario; 
  const idQueVaiEditar = req.params.cod; // todas as rotas usam ":cod"

  if (!usuarioLogado) {
    return res.redirect('/login.handlebars'); // se não estiver logado
  }

  // 🔹 Regra 1: se for pastor (admin), pode editar qualquer um
  if (usuarioLogado.tipo === 'pastor') {
    return next();
  }

  // 🔹 Regra 2: se for o próprio usuário, pode editar
  if (usuarioLogado.cod == idQueVaiEditar) {
    return next();
  }

  // 🔹 Se não for nem pastor nem o próprio → bloqueia
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(403).json({ error: 'Você não tem permissão para editar este cadastro.' });
  }
  return res.status(403).send('Você não tem permissão para editar este cadastro.');
}

module.exports = { authMiddleware, podeEditarCadastro };
