const nodemailer = require('nodemailer');

// Monta transporter a partir de variáveis de ambiente.
// VARS esperadas (recomendado): SMTP_SERVICE (opcional, ex: 'gmail'), SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true"/"false"), SMTP_USER, SMTP_PASS, SMTP_FROM
let transporter = null;
function createTransporterFromEnv() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  const service = process.env.SMTP_SERVICE || null;
  if (service) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass }
    });
  }

  // fallback para host/port
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

transporter = createTransporterFromEnv();
if (!transporter) {
  console.warn('[emailService] SMTP não configurado via variáveis de ambiente. O envio real de e-mails ficará desabilitado até configurar SMTP_USER/SMTP_PASS.');
}

async function sendEmail({ to = [], subject = '', text = '', html = '' } = {}) {
  const dest = Array.isArray(to) ? to.join(',') : (to || '');
  if (!transporter) {
    // fallback: apenas loga e retorna falha informativa
    console.log('[emailService] SMTP não configurado — logando mensagem em vez de enviar:', { to: dest, subject, text: text ? text.slice(0, 300) : '' });
    return { ok: false, message: 'SMTP not configured', sentTo: dest };
  }

  try {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com';
    const info = await transporter.sendMail({ from, to: dest, subject, text, html });
    console.log('[emailService] sendEmail success:', info && info.messageId ? info.messageId : info);
    return { ok: true, info };
  } catch (err) {
    console.error('[emailService] sendEmail error:', err && err.message ? err.message : err);
    return { ok: false, error: err && err.message ? err.message : String(err) };
  }
}

async function enviarAvisoTurmaInexistente(aluno, idade, turmaMaisAlta, destinatarios = []) {
  try {
    const nomeAluno = aluno && aluno.nome ? aluno.nome : 'Aluno sem nome';
    const turmaInfo = turmaMaisAlta ? `${turmaMaisAlta.nome} (${turmaMaisAlta.idadeMin}-${turmaMaisAlta.idadeMax})` : 'nenhuma turma cadastrada';
    const subject = `Aviso: ${nomeAluno} ultrapassou a faixa etária da turma`;
    const text = `O aluno ${nomeAluno} possui ${idade} anos e não há uma turma com faixa etária correspondente. ` +
      (turmaMaisAlta ? `Foi mantido temporariamente na turma ${turmaInfo}.` : `Não há turmas cadastradas.`) +
      `\n\nVerifique os cadastros e, se necessário, crie uma turma com a faixa etária adequada.`;

    const resp = await sendEmail({ to: destinatarios, subject, text });
    if (resp && resp.ok) {
      console.log('[emailService] Aviso de turma inexistente enviado para:', Array.isArray(destinatarios) ? destinatarios.join(',') : destinatarios);
    } else {
      console.warn('[emailService] Não foi possível enviar aviso de turma inexistente (ver logs):', resp);
    }
    return resp;
  } catch (error) {
    console.error('[emailService] Erro ao enviar aviso de turma inexistente:', error && error.message ? error.message : error);
    return { ok: false, error: error && error.message ? error.message : String(error) };
  }
}

module.exports = {
  sendEmail,
  enviarAvisoTurmaInexistente
};