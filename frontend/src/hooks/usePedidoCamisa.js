import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { TamanhoCamiseta, TipoCamiseta, Valores } from "../constants";

const validarCPF = (cpf) => {
  const numeros = cpf.replace(/\D/g, "");
  if (numeros.length !== 11) return false;
  if (/^(\d)\1+$/.test(numeros)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(numeros[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(numeros[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(numeros[10]);
};

const formatarCPF = (valor) => {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  return numeros
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatarTelefone = (valor) => {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return numeros
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
};

export const usePedidoCamisa = () => {
  const navigate = useNavigate();

  const [dadosPessoais, setDadosPessoais] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
  });

  const [camisas, setCamisas] = useState([]);
  const [camisaSelecionada, setCamisaSelecionada] = useState({
    tamanho: "",
    tipo: TipoCamiseta.MANGA_CURTA,
  });
  const [estoque, setEstoque] = useState({});
  const [loading, setLoading] = useState({ estoque: true, submetendo: false });
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarEstoque = async () => {
      try {
        const data = await apiClient.get("/estoque");
        if (data.sucesso) setEstoque(data.dados || {});
      } catch (error) {
        console.error("❌ [usePedidoCamisa] Erro ao carregar estoque:", error);
      } finally {
        setLoading((prev) => ({ ...prev, estoque: false }));
      }
    };
    carregarEstoque();
  }, []);

  const atualizarDadosPessoais = (campo, valor) => {
    setErro(null);
    if (campo === "cpf") valor = formatarCPF(valor);
    if (campo === "telefone") valor = formatarTelefone(valor);
    setDadosPessoais((prev) => ({ ...prev, [campo]: valor }));
  };

  const getDisponibilidade = (tamanho, tipo) => {
    try {
      const item = estoque[tipo]?.[tamanho];
      return item ? item.quantidadeDisponivel : 0;
    } catch {
      return 0;
    }
  };

  const adicionarCamisa = () => {
    setErro(null);
    const { tamanho, tipo } = camisaSelecionada;
    if (!tamanho || !tipo) {
      setErro("Selecione o tamanho e tipo antes de adicionar.");
      return;
    }
    const disponivel = getDisponibilidade(tamanho, tipo);
    if (disponivel <= 0) {
      setErro("Esta combinação está esgotada.");
      return;
    }
    setCamisas((prev) => [...prev, { tamanho, tipo }]);
  };

  const removerCamisa = (index) => {
    setCamisas((prev) => prev.filter((_, i) => i !== index));
  };

  const validar = () => {
    if (!dadosPessoais.nome.trim() || dadosPessoais.nome.trim().length < 2) {
      return "Nome completo é obrigatório";
    }
    if (!validarCPF(dadosPessoais.cpf)) {
      return "CPF inválido";
    }
    if (!dadosPessoais.email.includes("@")) {
      return "Email inválido";
    }
    const telNumeros = dadosPessoais.telefone.replace(/\D/g, "");
    if (telNumeros.length < 10) {
      return "Telefone inválido";
    }
    if (camisas.length === 0) {
      return "Adicione pelo menos uma camisa";
    }
    for (const camisa of camisas) {
      const disponivel = getDisponibilidade(camisa.tamanho, camisa.tipo);
      if (disponivel <= 0) {
        return `Estoque insuficiente para ${camisa.tamanho} - ${camisa.tipo === "manga_curta" ? "Manga Curta" : "Manga Longa"}`;
      }
    }
    return null;
  };

  const submeterPedido = async () => {
    const erroValidacao = validar();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setLoading((prev) => ({ ...prev, submetendo: true }));
    setErro(null);

    try {
      const data = await apiClient.post("/pedido-camisa/criar", {
        nome: dadosPessoais.nome.trim(),
        cpf: dadosPessoais.cpf,
        email: dadosPessoais.email.trim(),
        telefone: dadosPessoais.telefone,
        itens: camisas.map((c) => ({
          tamanho: c.tamanho,
          tipo: c.tipo,
          quantidade: 1,
        })),
      });

      if (!data.sucesso) {
        throw new Error(data.erro || "Erro ao criar pedido");
      }

      navigate("/pagamento-camisa", { state: { pedido: data.dados.pedido } });
    } catch (error) {
      console.error("❌ [usePedidoCamisa] Erro ao submeter:", error);
      setErro(error.message || "Erro ao criar pedido. Tente novamente.");
    } finally {
      setLoading((prev) => ({ ...prev, submetendo: false }));
    }
  };

  const valorTotal = camisas.length * Valores.CAMISETA_EXTRA;

  return {
    dadosPessoais,
    camisas,
    camisaSelecionada,
    setCamisaSelecionada,
    estoque,
    loading,
    erro,
    valorTotal,
    atualizarDadosPessoais,
    adicionarCamisa,
    removerCamisa,
    submeterPedido,
    getDisponibilidade,
    TamanhoCamiseta,
    TipoCamiseta,
  };
};

export default usePedidoCamisa;
