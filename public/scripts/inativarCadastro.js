// Torna o cadastro inativo ao clicar em "Sair da conta"

function handleSairClick(e) {
  e.preventDefault();
  try {
    const tipo = window.usuarioTipo;
    const cod = window.usuarioCod;
    if (!tipo || !cod) {
      alert('Não foi possível identificar o usuário logado.');
      return;
    }
    fetch(`/api/inativar/${tipo}/${cod}`, { method: 'PUT' })
      .then(async res => {
        let data;
        try {
          data = await res.json();
        } catch (err) {
          data = null;
        }
        if (res.ok) {
          alert('Cadastro inativado com sucesso!');
          window.location.href = '/login.handlebars';
        } else {
          alert((data && data.error) ? data.error : 'Erro ao inativar cadastro.');
        }
      })
      .catch(() => alert('Erro ao inativar cadastro.'));
  } catch (err) {
    alert('Erro ao inativar cadastro.');
  }
}

function bindSairButton() {
  const btnSair = document.getElementById('aSair') || document.getElementById('btnSair');
  if (btnSair) {
    btnSair.removeEventListener('click', handleSairClick);
    btnSair.addEventListener('click', handleSairClick);
  }
}

// Tenta bindar imediatamente e também observa mudanças no DOM
bindSairButton();
const observer = new MutationObserver(bindSairButton);
observer.observe(document.body, { childList: true, subtree: true });
