// Script para redefinir senha: envia email via AJAX e redireciona para /codigo.handlebars

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        try {
            const res = await fetch('/api/redefinir/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                // Salva email no localStorage para as próximas etapas
                localStorage.setItem('redefinirEmail', email);
                window.location.href = '/codigo.handlebars';
            } else {
                alert(data.error || 'Erro ao enviar email. Tente novamente.');
            }
        } catch (err) {
            alert('Erro de conexão.');
        }
    });
});
