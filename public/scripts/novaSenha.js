// Script para nova senha: envia senha via AJAX e redireciona para login

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const senha = document.getElementById('novaSenha').value;
        const confirmar = document.getElementById('senha').value;
        if (senha !== confirmar) {
            alert('As senhas não coincidem.');
            return;
        }
        const email = localStorage.getItem('redefinirEmail');
        try {
            const res = await fetch('/api/redefinir/senha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });
            let data = {};
            try {
                data = await res.json();
            } catch (err) {
                alert('Erro de conexão ou resposta inválida do servidor.');
                return;
            }
            if (res.ok) {
                localStorage.removeItem('redefinirEmail');
                window.location.href = '/login.handlebars';
            } else {
                alert(data.error || 'Erro ao redefinir senha.');
            }
        } catch (err) {
            alert('Erro de conexão.');
        }
    });
});
