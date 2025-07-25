// src/hooks/useCadastro.js
import { useState, useEffect } from "react";

// Constantes dos tipos de dados
export const TamanhoCamiseta = {
  PP: "PP",
  P: "P",
  M: "M",
  G: "G",
  GG: "GG",
};

export const TipoCamiseta = {
  MANGA_CURTA: "manga_curta",
  MANGA_LONGA: "manga_longa",
};

export const CategoriaMoto = {
  NACIONAL: "nacional",
  IMPORTADA: "importada",
};

const useCadastro = () => {
  // Estados do formulário
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [estoque, setEstoque] = useState({});

  // Estados dos dados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    cidade: "",
    modeloMoto: "",
    categoriaMoto: CategoriaMoto.NACIONAL,
    tamanhoCamiseta: TamanhoCamiseta.M,
    tipoCamiseta: TipoCamiseta.MANGA_CURTA,
    observacoes: "",
    camisetasExtras: [],
  });

  const [camisetaExtra, setCamisetaExtra] = useState({
    tamanho: TamanhoCamiseta.M,
    tipo: TipoCamiseta.MANGA_CURTA,
  });

  // Carregar estoque disponível
  useEffect(() => {
    carregarEstoque();
  }, []);

  const carregarEstoque = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/estoque");
      const data = await response.json();

      if (data.sucesso) {
        setEstoque(data.dados);
      }
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
    }
  };

  // Calcular valor total
  const calcularValorTotal = () => {
    const valorBase = 100; // R$ 100 inscrição + 1 camiseta grátis
    const valorExtras = formData.camisetasExtras.length * 50; // R$ 50 por extra
    return valorBase + valorExtras;
  };

  // Verificar disponibilidade de uma camiseta
  const verificarDisponibilidade = (tamanho, tipo) => {
    if (!estoque[tipo] || !estoque[tipo][tamanho]) return 0;
    return estoque[tipo][tamanho].quantidadeDisponivel || 0;
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

    // Verificar se já não foi adicionada
    const jaAdicionada = formData.camisetasExtras.some(
      (extra) =>
        extra.tamanho === camisetaExtra.tamanho &&
        extra.tipo === camisetaExtra.tipo
    );

    if (jaAdicionada) {
      alert("Esta camiseta já foi adicionada!");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      camisetasExtras: [...prev.camisetasExtras, { ...camisetaExtra }],
    }));
  };

  // Remover camiseta extra
  const removerCamisetaExtra = (index) => {
    setFormData((prev) => ({
      ...prev,
      camisetasExtras: prev.camisetasExtras.filter((_, i) => i !== index),
    }));
  };

  // ✅ NOVO: Submeter inscrição (cria participante pendente + reserva camisetas)
  const submeterInscricao = async () => {
    setLoading(true);

    try {
      console.log("🎯 Criando participante pendente + reservando camisetas...");

      const response = await fetch("http://localhost:8000/api/participantes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.sucesso) {
        console.log(
          "✅ Participante criado como PENDENTE:",
          data.dados.numeroInscricao
        );

        return {
          sucesso: true,
          dados: data.dados, // Inclui ID do participante, número de inscrição, etc.
        };
      } else {
        return {
          sucesso: false,
          erro: data.erro || "Erro ao realizar inscrição",
        };
      }
    } catch (error) {
      console.error("Erro ao submeter:", error);
      return {
        sucesso: false,
        erro: "Erro de conexão. Tente novamente.",
      };
    } finally {
      setLoading(false);
    }
  };

  // Validar step atual
  const validarStep = (stepAtual) => {
    switch (stepAtual) {
      case 1:
        return (
          formData.nome &&
          formData.cpf &&
          formData.email &&
          formData.telefone &&
          formData.cidade
        );
      case 2:
        return formData.modeloMoto && formData.categoriaMoto;
      case 3:
        return (
          verificarDisponibilidade(
            formData.tamanhoCamiseta,
            formData.tipoCamiseta
          ) > 0
        );
      default:
        return true;
    }
  };

  // Atualizar dados do formulário
  const atualizarFormData = (novosDados) => {
    setFormData((prev) => ({ ...prev, ...novosDados }));
  };

  // Navegação entre steps
  const proximoStep = () => {
    if (validarStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const stepAnterior = () => {
    setStep((prev) => prev - 1);
  };

  return {
    // Estados
    loading,
    step,
    estoque,
    formData,
    camisetaExtra,

    // Setters
    setStep,
    setCamisetaExtra,
    atualizarFormData,

    // Funções
    calcularValorTotal,
    verificarDisponibilidade,
    adicionarCamisetaExtra,
    removerCamisetaExtra,
    submeterInscricao,
    validarStep,
    proximoStep,
    stepAnterior,

    // Constantes
    TamanhoCamiseta,
    TipoCamiseta,
    CategoriaMoto,
  };
};

export default useCadastro;
