// Exemplo para script do pré-cadastro
document.querySelector('form').addEventListener('submit', async function(e) {
  e.preventDefault();

  // Coleta os dados do formulário
  const dados = {
    nome: document.getElementById('nomeAluno').value,
    genero: document.querySelector('input[name="genero"]:checked')?.value, 
    dataNasc: document.getElementById('dataNascAluno').value,
    rg: document.getElementById('rgAluno').value,
    cpf: document.getElementById('cpfAluno').value,
    fone: document.getElementById('foneAluno').value,
    email: document.getElementById('emailAluno').value
  };

  try {
    const res = await fetch('/api/aluno/pre-cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    const resultado = await res.json();

    if (res.ok) {
      alert('Pré-cadastro realizado com sucesso!');
      // Se quiser limpar o formulário:
      // e.target.reset();
    } else {
      alert('Erro: ' + (resultado.message || 'Erro ao realizar pré-cadastro.'));
    }
  } catch (err) {
    alert('Erro na conexão com o servidor.');
  }
});