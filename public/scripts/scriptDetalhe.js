async function carregarDetalhesMinistro() {
  const urlParams = new URLSearchParams(window.location.search);
  const cod = urlParams.get("cod");

  if (!cod) return alert("ID do ministro não informado!");

  try {
    const res = await fetch(`http://localhost:3000/api/ministro/detalhes/${cod}`);
    const ministro = await res.json();

    if (!res.ok) throw new Error(ministro.error || "Erro ao carregar ministro");

    // Preenche os campos
    document.getElementById("nomeMinistro").value = ministro.nome;
    document.getElementById("dataNascMinistro").value = ministro.dataNasc;
    document.getElementById("rgMinistro").value = ministro.rg;
    document.getElementById("cpfMinistro").value = ministro.cpf;
    document.getElementById("foneMinistro").value = ministro.fone || "";
    document.getElementById("emailMinistro").value = ministro.email || "";

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

    // Dados adicionais
    document.getElementById("habilidadeMinistro").value = ministro.habilidades || "";
    document.getElementById("dificuldadeMinistro").value = ministro.restricoes || "";
    document.getElementById("formacaoMinistro").value = ministro.escolaridade || "";
    document.getElementById("profissaoMinistro").value = ministro.profissao || "";
    document.getElementById("projetoMinistro").value = ministro.projetoIgreja || "";
    document.getElementById("obsMinistro").value = ministro.obs || "";
    document.getElementById("dataEntMinistro").value = ministro.dataIng;

    // Gênero
    if (ministro.fK_genero == 1) document.getElementById("masculino").checked = true;
    if (ministro.fK_genero == 2) document.getElementById("feminino").checked = true;
    if (ministro.Genero && document.getElementById("descricaoGeneroMinistro")) {
      document.getElementById("descricaoGeneroMinistro").value = ministro.Genero.descricao;
    }

    // Pastor
    if (ministro.pastor) document.getElementById("simPastor").checked = true;
    else document.getElementById("nPastor").checked = true;

  } catch (err) {
    console.error(err);
    alert("Erro ao carregar detalhes do ministro.");
  }
}

window.onload = carregarDetalhesMinistro;
