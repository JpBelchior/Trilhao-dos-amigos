import { useState, useEffect } from "react";

// Enums (devem ser iguais ao backend)
const TamanhoCamiseta = {
  PP: "PP",
  P: "P",
  M: "M",
  G: "G",
  GG: "GG",
};

const TipoCamiseta = {
  MANGA_CURTA: "manga_curta",
  MANGA_LONGA: "manga_longa",
};

const CategoriaMoto = {
  NACIONAL: "nacional",
  IMPORTADA: "importada",
};

const useCadastro = () => {
  // Estados do formulário
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [estoque, setEstoque] = useState({});

  // Dados do formulário
  const [formData, setFormData] = useState({
    // Dados pessoais
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: "",

    // Dados da moto
    modeloMoto: "",
    categoriaMoto: "",

    // Camiseta grátis
    tamanhoCamiseta: TamanhoCamiseta.M,
    tipoCamiseta: TipoCamiseta.MANGA_CURTA,

    // Extras e observações
    camisetasExtras: [],
    observacoes: "",
  });

  // Estado para camiseta extra sendo adicionada
  const [camisetaExtra, setCamisetaExtra] = useState({
    tamanho: TamanhoCamiseta.M,
    tipo: TipoCamiseta.MANGA_CURTA,
  });

  // ✅ Carregar estoque do backend na inicialização
  useEffect(() => {
    carregarEstoque();
  }, []);

  // Carregar estoque da API
  const carregarEstoque = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/estoque");
      const data = await response.json();

      if (data.sucesso) {
        setEstoque(data.dados);
        console.log("📦 Estoque carregado:", data.dados);
      } else {
        console.error("Erro ao carregar estoque:", data.erro);
        alert("Erro ao carregar estoque. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro de conexão ao carregar estoque:", error);
      alert("Erro de conexão. Verifique sua internet.");
    }
  };

  // Atualizar dados do formulário
  const atualizarFormData = (novos) => {
    setFormData((prev) => ({ ...prev, ...novos }));
  };

  // Verificar disponibilidade no estoque
  const verificarDisponibilidade = (tamanho, tipo) => {
    try {
      const item = estoque[tipo]?.[tamanho];
      return item ? item.quantidadeDisponivel : 0;
    } catch (error) {
      console.error("Erro ao verificar disponibilidade:", error);
      return 0;
    }
  };

  // Calcular valor total da inscrição
  const calcularValorTotal = () => {
    const valorBase = 100.0; // Inscrição + camiseta grátis
    const valorExtras = formData.camisetasExtras.length * 50.0;
    return valorBase + valorExtras;
  };

  // Adicionar camiseta extra
  const adicionarCamisetaExtra = () => {
    const disponivel = verificarDisponibilidade(
      camisetaExtra.tamanho,
      camisetaExtra.tipo
    );

    if (disponivel <= 0) {
      alert("Esta camiseta não está disponível no estoque!");
      return;
    }

    // Verificar se já foi adicionada a mesma camiseta
    const jaExiste = formData.camisetasExtras.some(
      (extra) =>
        extra.tamanho === camisetaExtra.tamanho &&
        extra.tipo === camisetaExtra.tipo
    );

    if (jaExiste) {
      alert("Esta camiseta já foi adicionada!");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      camisetasExtras: [...prev.camisetasExtras, { ...camisetaExtra }],
    }));

    console.log("👕 Camiseta extra adicionada:", camisetaExtra);
  };

  // Remover camiseta extra
  const removerCamisetaExtra = (index) => {
    setFormData((prev) => ({
      ...prev,
      camisetasExtras: prev.camisetasExtras.filter((_, i) => i !== index),
    }));
  };

  // Validações por step
  const validarStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return (
          formData.nome.trim() &&
          formData.cpf.trim() &&
          formData.email.trim() &&
          formData.telefone.trim() &&
          formData.cidade.trim() &&
          formData.estado.trim()
        );

      case 2:
        return (
          formData.modeloMoto.trim() &&
          formData.categoriaMoto &&
          Object.values(CategoriaMoto).includes(formData.categoriaMoto)
        );

      case 3:
        // Verificar se camiseta grátis está disponível
        const disponivel = verificarDisponibilidade(
          formData.tamanhoCamiseta,
          formData.tipoCamiseta
        );
        return disponivel > 0;

      default:
        return false;
    }
  };

  // Navegar para próximo step
  const proximoStep = () => {
    if (validarStep(step) && step < 3) {
      setStep(step + 1);
    }
  };

  // Navegar para step anterior
  const stepAnterior = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // ✅ SUBMETER INSCRIÇÃO - Criar participante PENDENTE no backend
  const submeterInscricao = async () => {
    if (!validarStep(3)) {
      return {
        sucesso: false,
        erro: "Dados incompletos ou camiseta indisponível",
      };
    }

    setLoading(true);

    try {
      console.log("📝 Enviando dados para o backend:", formData);

      // Preparar dados no formato que o backend espera
      const dadosEnvio = {
        // Dados pessoais
        nome: formData.nome.trim(),
        cpf: formData.cpf.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim(),
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim(),

        // Dados da moto
        modeloMoto: formData.modeloMoto.trim(),
        categoriaMoto: formData.categoriaMoto,

        // Camiseta grátis
        tamanhoCamiseta: formData.tamanhoCamiseta,
        tipoCamiseta: formData.tipoCamiseta,

        // Camisetas extras (apenas tamanho e tipo)
        camisetasExtras: formData.camisetasExtras.map((extra) => ({
          tamanho: extra.tamanho,
          tipo: extra.tipo,
        })),

        // Observações
        observacoes: formData.observacoes?.trim() || "",
      };

      console.log("📤 Dados preparados para envio:", dadosEnvio);

      // Fazer requisição para o backend
      const response = await fetch("http://localhost:8000/api/participantes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosEnvio),
      });

      const data = await response.json();

      console.log("📡 Resposta do backend:", data);

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || "Erro ao criar inscrição");
      }

      // ✅ Participante criado como PENDENTE com sucesso
      console.log("✅ Participante PENDENTE criado:", data.dados);

      return {
        sucesso: true,
        dados: {
          ...data.dados,
          // Adicionar dados do formulário para usar no pagamento
          nome: formData.nome,
          email: formData.email,
          cidade: formData.cidade,
          estado: formData.estado,
          modeloMoto: formData.modeloMoto,
          categoriaMoto: formData.categoriaMoto,
          camisetasExtras: formData.camisetasExtras,
        },
      };
    } catch (error) {
      console.error("❌ Erro ao submeter inscrição:", error);

      return {
        sucesso: false,
        erro: error.message || "Erro de conexão",
      };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Recarregar estoque (útil após adicionar/remover camisetas)
  const recarregarEstoque = async () => {
    await carregarEstoque();
  };

  return {
    // Estados
    loading,
    step,
    formData,
    camisetaExtra,
    estoque,

    // Setters
    setCamisetaExtra,
    atualizarFormData,

    // Funções de estoque
    verificarDisponibilidade,
    recarregarEstoque,

    // Funções de camisetas extras
    adicionarCamisetaExtra,
    removerCamisetaExtra,

    // Funções de navegação
    validarStep,
    proximoStep,
    stepAnterior,

    // Função principal
    submeterInscricao,
    calcularValorTotal,

    // Enums para usar nos componentes
    TamanhoCamiseta,
    TipoCamiseta,
    CategoriaMoto,
  };
};

export default useCadastro;
