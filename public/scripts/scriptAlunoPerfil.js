// =============== Helpers robustos ===============
function setVal(id, v) {
  const el = document.getElementById(id);
  if (el) el.value = v ?? "";
}

function normalizeDateISO(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

function normalizeGenero(input) {
  if (!input) return null;
  const g = String(input).trim().toLowerCase();
  if (g === "1" || g === "masculino" || g.startsWith("m")) return "masculino";
  if (g === "2" || g === "feminino" || g.startsWith("f")) return "feminino";
  return null;
}

function normalizeAutImagem(input) {
  if (input === true || input === "s" || input === "sim") return true;
  return false;
}

// =============== Carregar ===============
async function carregarEdicaoAluno() {
  const cod = document.getElementById("usuarioCod")?.value;
  if (!cod) return alert("ID do aluno não informado!");

  try {
    const res = await fetch(`/api/perfil/${cod}`);
    const aluno = await res.json();
    if (!res.ok) throw new Error(aluno.erro || "Erro ao carregar aluno");

    setVal("nomeAluno", aluno.nome);
    setVal("dataNascAluno", normalizeDateISO(aluno.dataNasc));
    setVal("rgAluno", aluno.rg);
    setVal("cpfAluno", aluno.cpf);
    setVal("foneAluno", aluno.fone);
    setVal("emailAluno", aluno.email);

    if (aluno.Endereco) {
      setVal("ruaAluno", aluno.Endereco.rua);
      setVal("nResidenciaAluno", aluno.Endereco.numero);
      setVal("bairroAluno", aluno.Endereco.bairro);
      setVal("cidadeAluno", aluno.Endereco.cidade);
      setVal("ufAluno", aluno.Endereco.uf);
      setVal("cepAluno", aluno.Endereco.cep);
      setVal("obsEnderecoAluno", aluno.Endereco.obs);
    }

    setVal("alergia", aluno.alergias ?? "");
    setVal("laudo", aluno.aspectoPsi ?? "");
    setVal("restricaoA", aluno.restricaoA ?? "");
    setVal("medicamento", aluno.medicamentos ?? "");

    setVal("nacionalidade", aluno.nacionalidade);
    setVal("linguaNativa", aluno.linguaNativa);
    setVal("linguaEstrangeira", aluno.linguaEstrangeira);
    setVal("escolaAtual", aluno.escolaAtual);
    setVal("projetoAluno", aluno.projetoIgreja);
    setVal("obsAluno", aluno.obs ?? aluno.obsAluno);

    setVal("nomeResponsavel1", aluno.nomeResponsavel ?? "");
    setVal("parentescoResponsavel1", aluno.grauParentesco ?? "");
    setVal("foneResponsavel1", aluno.foneResponsavel ?? "");
    setVal("cpfResponsavel1", aluno.cpfResponsavel ?? "");
    setVal("nomeResponsavel2", aluno.nomeResponsavel2 ?? "");
    setVal("parentescoResponsavel2", aluno.grauParentesco2 ?? "");
    setVal("foneResponsavel2", aluno.foneResponsavel2 ?? "");
    setVal("cpfResponsavel2", aluno.cpfResponsavel2 ?? "");

    // 🔹 Corrige gênero
    let generoNormalizado = null;
    if (typeof aluno.genero === "number") {
      generoNormalizado = aluno.genero === 1 ? "masculino" : "feminino";
    } else if (aluno.Genero?.nome) {
      generoNormalizado = normalizeGenero(aluno.Genero.nome);
    } else {
      generoNormalizado = normalizeGenero(aluno.genero);
    }

    if (generoNormalizado === "masculino") {
      document.getElementById("masculino")?.setAttribute("checked", true);
    } else if (generoNormalizado === "feminino") {
      document.getElementById("feminino")?.setAttribute("checked", true);
    }

    // 🔹 Corrige autorização de imagem
    const aut = normalizeAutImagem(aluno.autImagem);
    if (aut) {
      document.getElementById("autorizacaoS")?.setAttribute("checked", true);
    } else {
      document.getElementById("autorizacaoN")?.setAttribute("checked", true);
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar aluno para edição.");
  }
}

// =============== Salvar ===============
async function editarAluno(event) {
  event.preventDefault();
  const cod = document.getElementById("usuarioCod")?.value;

  const dados = {
    nome: document.getElementById("nomeAluno")?.value,
    dataNasc: normalizeDateISO(document.getElementById("dataNascAluno")?.value),
    rg: document.getElementById("rgAluno")?.value,
    cpf: document.getElementById("cpfAluno")?.value,
    fone: document.getElementById("foneAluno")?.value,
    email: document.getElementById("emailAluno")?.value,
    Endereco: {
      rua: document.getElementById("ruaAluno")?.value,
      numero: document.getElementById("nResidenciaAluno")?.value,
      bairro: document.getElementById("bairroAluno")?.value,
      cidade: document.getElementById("cidadeAluno")?.value,
      uf: document.getElementById("ufAluno")?.value,
      cep: document.getElementById("cepAluno")?.value,
      obs: document.getElementById("obsEnderecoAluno")?.value
    },
    alergias: document.getElementById("alergia")?.value,
    aspectoPsi: document.getElementById("laudo")?.value,
    restricaoA: document.getElementById("restricaoA")?.value,
    medicamentos: document.getElementById("medicamento")?.value,
    nacionalidade: document.getElementById("nacionalidade")?.value,
    linguaNativa: document.getElementById("linguaNativa")?.value,
    linguaEstrangeira: document.getElementById("linguaEstrangeira")?.value,
    escolaAtual: document.getElementById("escolaAtual")?.value,
    projetoIgreja: document.getElementById("projetoAluno")?.value,
    obs: document.getElementById("obsAluno")?.value,
    nomeResponsavel: document.getElementById("nomeResponsavel1")?.value,
    grauParentesco: document.getElementById("parentescoResponsavel1")?.value,
    foneResponsavel: document.getElementById("foneResponsavel1")?.value,
    cpfResponsavel: document.getElementById("cpfResponsavel1")?.value,
    nomeResponsavel2: document.getElementById("nomeResponsavel2")?.value,
    grauParentesco2: document.getElementById("parentescoResponsavel2")?.value,
    foneResponsavel2: document.getElementById("foneResponsavel2")?.value,
    cpfResponsavel2: document.getElementById("cpfResponsavel2")?.value,
    genero: document.querySelector('input[name="genero"]:checked')?.value,
    autImagem: document.querySelector('input[name="autorizacao"]:checked')?.value === "s"
  };

  try {
    const res = await fetch(`/api/perfil/${cod}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
    const resultado = await res.json();
    if (res.ok) {
      alert("Aluno atualizado com sucesso!");
      window.location.href = "/indexCrianca.handlebars";
    } else {
      alert("Erro: " + (resultado.erro || "Erro desconhecido"));
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao atualizar aluno.");
  }
}

// =============== Bind ===============
window.onload = () => {
  carregarEdicaoAluno();
  const form = document.querySelector("form");
  if (form) {
    form.onsubmit = editarAluno;
  }
};
