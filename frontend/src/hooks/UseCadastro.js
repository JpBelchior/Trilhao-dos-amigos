import { useState, useEffect } from "react";
import { 
  TamanhoCamiseta, 
  TipoCamiseta, 
  CategoriaMoto 
} from "../constants";

const useCadastro = () => {
  // =======================
  // ESTADOS
  // =======================

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [estoque, setEstoque] = useState({});

  // =======================
  // FORM DATA
  // =======================

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: "",

    modeloMoto: "",
    categoriaMoto: "",

    tamanhoCamiseta: TamanhoCamiseta.M,
    tipoCamiseta: TipoCamiseta.MANGA_CURTA,

    camisetasExtras: [],
    observacoes: "",
  });

  const [camisetaExtra, setCamisetaExtra] = useState({
    tamanho: TamanhoCamiseta.M,
    tipo: TipoCamiseta.MANGA_CURTA,
  });

  // =======================
  // ESTOQUE
  // =======================

  useEffect(() => {
    carregarEstoque();
  }, []);

  const carregarEstoque = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/estoque");
      const data = await response.json();

      if (data.sucesso) {
        setEstoque(data.dados || {});
        console.log("📦 Estoque carregado:", data.dados);
      } else {
        alert("Erro ao carregar estoque");
      }
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      alert("Erro de conexão com o backend");
    }
  };

  const verificarDisponibilidade = (tamanho, tipo) => {
    try {
      const item = estoque[tipo]?.[tamanho];
      return item ? item.quantidadeDisponivel : 0;
    } catch {
      return 0;
    }
  };

  // =======================
  // FORMULÁRIO
  // =======================

  const atualizarFormData = (novos) => {
    setFormData((prev) => ({ ...prev, ...novos }));
  };

  // =======================
  // CAMISETAS EXTRAS
  // =======================

  const adicionarCamisetaExtra = () => {
    const disponivel = verificarDisponibilidade(
      camisetaExtra.tamanho,
      camisetaExtra.tipo
    );

    if (disponivel <= 0) {
      alert("Camiseta indisponível no estoque");
      return;
    }

    const jaExiste = formData.camisetasExtras.some(
      (c) =>
        c.tamanho === camisetaExtra.tamanho &&
        c.tipo === camisetaExtra.tipo
    );

    if (jaExiste) {
      alert("Essa camiseta já foi adicionada");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      camisetasExtras: [...prev.camisetasExtras, { ...camisetaExtra }],
    }));
  };

  const removerCamisetaExtra = (index) => {
    setFormData((prev) => ({
      ...prev,
      camisetasExtras: prev.camisetasExtras.filter((_, i) => i !== index),
    }));
  };

  const calcularValorTotal = () => {
    return 100 + formData.camisetasExtras.length * 50;
  };

  // =======================
  // 🆕 VALIDAÇÃO BACKEND
  // =======================

  const validarDadosNoBackend = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/participantes/validar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        return {
          valido: false,
          erro: data.erro,
          detalhes: data.detalhes,
        };
      }

      return { valido: true };
    } catch (error) {
      return {
        valido: false,
        erro: "Erro de conexão",
        detalhes: error.message,
      };
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // STEPS
  // =======================

  const validarStep = (stepAtual) => {
    if (stepAtual === 1) {
      return (
        formData.nome &&
        formData.cpf &&
        formData.email &&
        formData.telefone &&
        formData.cidade &&
        formData.estado
      );
    }

    if (stepAtual === 2) {
      return (
        formData.modeloMoto &&
        Object.values(CategoriaMoto).includes(formData.categoriaMoto)
      );
    }

    if (stepAtual === 3) {
      return (
        verificarDisponibilidade(
          formData.tamanhoCamiseta,
          formData.tipoCamiseta
        ) > 0
      );
    }

    return false;
  };

  const proximoStep = async () => {
    if (!validarStep(step)) {
      return { erro: "Campos obrigatórios não preenchidos" };
    }

    // 🔒 valida backend antes de sair do step 1
    if (step === 1) {
      const validacao = await validarDadosNoBackend();

      if (!validacao.valido) {
        return validacao;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    }

    return { sucesso: true };
  };

  const stepAnterior = () => {
    if (step > 1) setStep(step - 1);
  };

  // =======================
  // SUBMISSÃO
  // =======================

  const submeterInscricao = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/participantes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            camisetasExtras: formData.camisetasExtras.map((c) => ({
              tamanho: c.tamanho,
              tipo: c.tipo,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro);
      }

      return { sucesso: true, dados: data.dados };
    } catch (error) {
      return { sucesso: false, erro: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    step,
    formData,
    camisetaExtra,
    estoque,

    setCamisetaExtra,
    atualizarFormData,

    verificarDisponibilidade,
    adicionarCamisetaExtra,
    removerCamisetaExtra,
    calcularValorTotal,

    validarStep,
    proximoStep,
    stepAnterior,

    submeterInscricao,

    TamanhoCamiseta,
    TipoCamiseta,
    CategoriaMoto,
  };
};

export default useCadastro;
