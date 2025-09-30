// Carrega os dados do ministro no formulário
async function carregarEdicaoMinistro() {
  const cod = window.usuarioCod;
  if (!cod) return alert("ID do ministro não informado!");

  try {
    const res = await fetch(`/api/ministro/perfil`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cod })
    });

    if (!res.ok) throw new Error(`Erro ao buscar ministro: ${res.statusText}`);

    const ministro = await res.json();
    console.log("Resposta recebida da API:", ministro);

    // Preenche campos básicos
    document.getElementById("nomeMinistro").value = ministro.nome || "";
    document.getElementById("dataNascMinistro").value = ministro.dataNasc || "";
    document.getElementById("rgMinistro").value = ministro.rg || "";
    document.getElementById("cpfMinistro").value = ministro.cpf || "";
    document.getElementById("foneMinistro").value = ministro.fone || "";
    document.getElementById("emailMinistro").value = ministro.email || "";
    document.getElementById("dataEntMinistro").value = ministro.dataIng || "";
    document.getElementById("habilidadeMinistro").value = ministro.habilidades || "";
    document.getElementById("dificuldadeMinistro").value = ministro.restricoes || "";
    document.getElementById("formacaoMinistro").value = ministro.escolaridade || "";
    document.getElementById("profissaoMinistro").value = ministro.profissao || "";
    document.getElementById("projetoMinistro").value = ministro.projetoIgreja || "";
    document.getElementById("obsMinistro").value = ministro.obs || "";
    document.getElementById("validadoMinistro").value = ministro.validado ? "true" : "false";

    // Endereço
    if (ministro.Endereco) {
      document.getElementById("ruaMinistro").value = ministro.Endereco.rua || "";
      document.getElementById("nResidenciaMinistro").value = ministro.Endereco.numero || "";
      document.getElementById("bairroMinistro").value = ministro.Endereco.bairro || "";
      document.getElementById("cidadeMinistro").value = ministro.Endereco.cidade || "";
      document.getElementById("ufMinistro").value = ministro.Endereco.uf || "";
      document.getElementById("cepMinistro").value = ministro.Endereco.cep || "";
      document.getElementById("obsEnderecoMinistro").value = ministro.Endereco.obs || "";
    }

    // Gênero
    if (ministro.fK_genero === 1) document.getElementById("masculino").checked = true;
    if (ministro.fK_genero === 2) document.getElementById("feminino").checked = true;

    // Pastor
    if (ministro.pastor) document.getElementById("simPastor").checked = true;
    else document.getElementById("nPastor").checked = true;

  } catch (err) {
    console.error(err);
    alert("Erro ao carregar ministro para edição.");
  }
}

// Edita o ministro enviando PUT para /api/ministro/perfil
async function editarMinistro(event) {
  event.preventDefault();

  const cod = window.usuarioCod;
  if (!cod) return alert("ID do ministro não informado!");

  const dados = {
    cod,
    nome: document.getElementById("nomeMinistro").value,
    dataNasc: document.getElementById("dataNascMinistro").value,
    rg: document.getElementById("rgMinistro").value,
    cpf: document.getElementById("cpfMinistro").value,
    fone: document.getElementById("foneMinistro").value,
    email: document.getElementById("emailMinistro").value,
    dataIng: document.getElementById("dataEntMinistro").value,
    habilidades: document.getElementById("habilidadeMinistro").value,
    restricoes: document.getElementById("dificuldadeMinistro").value,
    escolaridade: document.getElementById("formacaoMinistro").value,
    profissao: document.getElementById("profissaoMinistro").value,
    projetoIgreja: document.getElementById("projetoMinistro").value,
    obs: document.getElementById("obsMinistro").value,
    fk_genero: document.querySelector('input[name="genero"]:checked')?.value === "masculino" ? 1 : 2,
    pastor: document.querySelector('input[name="pastor"]:checked')?.id === "simPastor",
    validado: document.getElementById("validadoMinistro").value === "true",
    Endereco: {
      rua: document.getElementById("ruaMinistro").value,
      numero: document.getElementById("nResidenciaMinistro").value,
      bairro: document.getElementById("bairroMinistro").value,
      cidade: document.getElementById("cidadeMinistro").value,
      uf: document.getElementById("ufMinistro").value,
      cep: document.getElementById("cepMinistro").value,
      obs: document.getElementById("obsEnderecoMinistro").value,
    }
  };

  try {
    const res = await fetch("/api/ministro/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const resultado = await res.json();

    if (res.ok) {
      alert("Ministro atualizado com sucesso!");
    
    } else {
      alert("Erro: " + (resultado.erro || "Erro desconhecido"));
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao atualizar ministro.");
  }
}

// Inicializa ao carregar a página
window.onload = () => {
  carregarEdicaoMinistro();
  const form = document.querySelector("form");
  if (form) form.onsubmit = editarMinistro;
};
