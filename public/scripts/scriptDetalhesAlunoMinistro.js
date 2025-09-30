document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  try {
    const res = await fetch(`/api/aluno/${id}`);
    if (!res.ok) throw new Error("Aluno não encontrado");
    const aluno = await res.json();

    // =======================
    // Dados principais
    // =======================
    const nomeAluno = document.getElementById("nomeAluno");
    if (nomeAluno) nomeAluno.value = aluno.nome || "";

   

    const dataNascAluno = document.getElementById("dataNascAluno");
    if (dataNascAluno) dataNascAluno.value = aluno.dataNasc || "";

    const foneAluno = document.getElementById("foneAluno");
    if (foneAluno) foneAluno.value = aluno.fone || "";

    const emailAluno = document.getElementById("emailAluno");
    if (emailAluno) emailAluno.value = aluno.email || "";

    // =======================
    // Sexo
    // =======================
    const generoCod = typeof aluno.genero === "string" ? parseInt(aluno.genero, 10) : aluno.genero;
    const generoDesc = aluno.Genero?.descricao?.toLowerCase();
    if (generoCod === 2 || generoDesc === "feminino") {
      const fem = document.getElementById("feminino");
      if (fem) fem.checked = true;
    } else if (generoCod === 1 || generoDesc === "masculino") {
      const masc = document.getElementById("masculino");
      if (masc) masc.checked = true;
    }

    // =======================
    // Endereço
    // =======================
    if (aluno.Endereco) {
      const rua = document.getElementById("ruaAluno");
      if (rua) rua.value = aluno.Endereco.rua || "";

      const numero = document.getElementById("nResidenciaAluno");
      if (numero) numero.value = aluno.Endereco.numero || "";

      const bairro = document.getElementById("bairroAluno");
      if (bairro) bairro.value = aluno.Endereco.bairro || "";

      const cidade = document.getElementById("cidadeAluno");
      if (cidade) cidade.value = aluno.Endereco.cidade || "";

      const uf = document.getElementById("ufAluno");
      if (uf) uf.value = aluno.Endereco.uf || "";

      const cep = document.getElementById("cepAluno");
      if (cep) cep.value = aluno.Endereco.cep || "";

      const obsEndereco = document.getElementById("obsEnderecoAluno");
      if (obsEndereco) obsEndereco.value = aluno.Endereco.obs || "";
    }

    // =======================
    // Saúde
    // =======================
    const alergia = document.getElementById("alergia");
    if (alergia) alergia.value = aluno.alergias || "";

    const laudo = document.getElementById("laudo");
    if (laudo) laudo.value = aluno.aspectoPsi || "";

    const restricaoA = document.getElementById("restricaoA");
    if (restricaoA) restricaoA.value = aluno.restricaoA || "";

    const medicamento = document.getElementById("medicamento");
    if (medicamento) medicamento.value = aluno.medicamentos || "";

    // =======================
    // Nacionalidade / Línguas / Escola
    // =======================
    const nacionalidade = document.getElementById("nacionalidade");
    if (nacionalidade) nacionalidade.value = aluno.nacionalidade || "";

    const linguaNativa = document.getElementById("linguaNativa");
    if (linguaNativa) linguaNativa.value = aluno.linguaNativa || "";

    const linguaEstrangeira = document.getElementById("linguaEstrangeira");
    if (linguaEstrangeira) linguaEstrangeira.value = aluno.linguaEstrangeira || "";

    const escola = document.getElementById("escola");
    if (escola) escola.value = aluno.escolaAtual || "";

    // =======================
    // Projeto e Observações
    // =======================
    const projetoAluno = document.getElementById("projetoAluno");
    if (projetoAluno) projetoAluno.value = aluno.projetoIgreja || "";

    const obs = document.getElementById("obsAluno");
    if (obs) obs.value = aluno.obs || "";

    // =======================
    // Responsáveis
    // =======================
    const Resp1 = document.getElementById("nomeResponsavel1");
    if (Resp1) Resp1.value = aluno.nomeResponsavel || "";

    const parentescoResp1 = document.getElementById("parentescoResponsavel1");
    if (parentescoResp1) parentescoResp1.value = aluno.grauParentesco || "";

   

    const foneResp1 = document.getElementById("foneResponsavel1");
    if (foneResp1) foneResp1.value = aluno.foneResponsavel || "";

    const Resp2 = document.getElementById("nomeResponsavel2");
    if (Resp2) Resp2.value = aluno.nomeResponsavel2 || "";

    const parentescoResp2 = document.getElementById("parentescoResponsavel2");
    if (parentescoResp2) parentescoResp2.value = aluno.grauParentesco2 || "";

   

    const foneResp2 = document.getElementById("foneResponsavel2");
    if (foneResp2) foneResp2.value = aluno.foneResponsavel2 || "";

    // =======================
    // Autorização de imagem
    // =======================
    if (typeof aluno.autImagem === "boolean") {
      const autS = document.getElementById("autorizacaoS");
      const autN = document.getElementById("autorizacaoN");
      if (autS) autS.checked = aluno.autImagem === true;
      if (autN) autN.checked = aluno.autImagem === false;
    }

  } catch (err) {
    console.error("Erro ao carregar aluno:", err);
    alert("Erro ao carregar dados do aluno.");
  }
});
