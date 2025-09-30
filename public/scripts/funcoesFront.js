//Função do olhinho para o login

document.querySelectorAll('.iconOlho').forEach(icon => {
  icon.addEventListener('click', () => {
    const inputId = icon.getAttribute('data-input');
    const input = document.getElementById(inputId);

    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.add('bi-eye-slash');
      icon.classList.remove('bi-eye');
    } else {
      input.type = 'password';
      icon.classList.remove('bi-eye-slash');
      icon.classList.add('bi-eye');
    }
  });
});

//Função das máscaras

function formatar(mascara, documento) {
let i = documento.value.length;
let saida = '#';
let texto = mascara.substring(i);
while (texto.substring(0, 1) != saida && texto.length ) {
  documento.value += texto.substring(0, 1);
  i++;
  texto = mascara.substring(i);
}
}

//Função do menu

const iconPerfil = document.getElementById('iconPerfil');
if (iconPerfil) {
  const menuPerfil = document.getElementById('menuPerfil');

  iconPerfil.addEventListener('click', () => {
    menuPerfil.style.display = menuPerfil.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', function(event) {
    if (!iconPerfil.contains(event.target) && !menuPerfil.contains(event.target)) {
      menuPerfil.style.display = 'none';
    }
  });
}