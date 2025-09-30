// ===============================
// scriptEditarCrianca.js
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  // Carrega dados do aluno
  try {
    const res = await fetch(`/api/aluno/${id}`);
    if (!res.ok) throw new Error("Aluno não encontrado");
    const aluno = await res.json();

    // Preenche dados principais
    document.getElementById("nomeAluno").value = aluno.nome || "";
    document.getElementById("cpfAluno").value = aluno.cpf || "";
    document.getElementById("rgAluno").value = aluno.rg || "";
    document.getElementById("dataNascAluno").value = aluno.dataNasc || "";
    document.getElementById("foneAluno").value = aluno.fone || "";
    document.getElementById("emailAluno").value = aluno.email || "";

    // Sexo (marca os rádios ao carregar)
    const generoCod = typeof aluno.genero === "string" ? parseInt(aluno.genero, 10) : aluno.genero;
    const generoDesc = aluno.Genero?.descricao?.toLowerCase();

    if (generoCod === 2 || generoDesc === "feminino") {
      document.getElementById("feminino").checked = true;
    } else if (generoCod === 1 || generoDesc === "masculino") {
      document.getElementById("masculino").checked = true;
    }

  } catch (err) {
    console.error(err);
    alert("Erro ao carregar dados do aluno.");
  }

  // Formulário de edição
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        nome: document.getElementById("nomeAluno").value,
        cpf: document.getElementById("cpfAluno").value,
        rg: document.getElementById("rgAluno").value,
        dataNasc: document.getElementById("dataNascAluno").value,
        fone: document.getElementById("foneAluno").value,
        email: document.getElementById("emailAluno").value,
        genero: document.getElementById("feminino").checked ? 2 : 1
      };

      const res = await fetch(`/api/aluno/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Erro ao salvar aluno.");

      alert("Aluno atualizado com sucesso!");
      window.location.href = "listaCrianca.handlebars?turma=" + params.get("turma");
    });
  }
});
