// frontend/src/hooks/UseCadastro.js
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

    // Dados da moto (agora apenas marca)
    modeloMoto: "", // Agora armazena a marca (ex: "Honda")
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

  // ✅ Adicionar camiseta extra (PERMITE DUPLICATAS)
  const adicionarCamisetaExtra = () => {
    const disponivel = verificarDisponibilidade(
      camisetaExtra.tamanho,
      camisetaExtra.tipo
    );

    if (disponivel <= 0) {
      alert("Esta camiseta não está disponível no estoque!");
      return;
    }

    // ✅ REMOVIDO o bloqueio de duplicatas - agora permite adicionar a mesma camiseta várias vezes
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

  // ✅ Validações por step (AJUSTADO PARA 2 STEPS)
  const validarStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        // Step 1: Dados pessoais + Dados da moto
        return (
          formData.nome.trim() &&
          formData.cpf.trim() &&
          formData.email.trim() &&
          formData.telefone.trim() &&
          formData.cidade.trim() &&
          formData.estado.trim() &&
          formData.modeloMoto.trim() && // Marca da moto
          formData.categoriaMoto &&
          Object.values(CategoriaMoto).includes(formData.categoriaMoto)
        );

      case 2:
        // Step 2: Camisetas - Verificar se camiseta grátis está disponível
        const disponivel = verificarDisponibilidade(
          formData.tamanhoCamiseta,
          formData.tipoCamiseta
        );
        return disponivel > 0;

      default:
        return false;
    }
  };

  // ✅ Navegar para próximo step (AJUSTADO PARA 2 STEPS)
  const proximoStep = () => {
    if (validarStep(step) && step < 2) {
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
    setLoading(true);

    try {
      console.log("📤 Submetendo inscrição ao backend...");

      const response = await fetch("http://localhost:8000/api/participantes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          cpf: formData.cpf,
          email: formData.email,
          telefone: formData.telefone,
          cidade: formData.cidade,
          estado: formData.estado,
          modeloMoto: formData.modeloMoto, 
          categoriaMoto: formData.categoriaMoto,
          tamanhoCamiseta: formData.tamanhoCamiseta,
          tipoCamiseta: formData.tipoCamiseta,
          camisetasExtras: formData.camisetasExtras,
          observacoes: formData.observacoes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        return {
          sucesso: false,
          erro: data.erro || "Erro ao criar inscrição",
        };
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