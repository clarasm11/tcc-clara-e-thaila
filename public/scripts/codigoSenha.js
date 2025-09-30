// Script para código de verificação: envia código via AJAX e redireciona para /senha.handlebars

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const codigo = document.getElementById('codigo').value;
        const email = localStorage.getItem('redefinirEmail');
        try {
            const res = await fetch('/api/redefinir/codigo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, codigo })
            });
            let data = {};
            try {
                data = await res.json();
            } catch (err) {
                alert('Erro de conexão ou resposta inválida do servidor.');
                return;
            }
            if (res.ok) {
                window.location.href = '/senha.handlebars';
            } else {
                alert(data.error || 'Código inválido ou expirado.');
            }
        } catch (err) {
            alert('Erro de conexão.');
        }
    });
});
