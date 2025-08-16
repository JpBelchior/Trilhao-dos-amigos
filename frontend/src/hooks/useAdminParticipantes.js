// frontend/src/hooks/useAdminParticipantes.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const useAdminParticipantes = () => {
  const { fetchAuth } = useAuth();

  // Estados principais
  const [participantes, setParticipantes] = useState([]);
  const [participantesFiltrados, setParticipantesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Estados dos filtros (REUTILIZANDO A LÓGICA QUE JÁ EXISTE DE /inscritos)
  const [filtros, setFiltros] = useState({
    nome: "",
    cidade: "",
    categoriaMoto: "todos",
    statusPagamento: "todos",
  });

  // Estados para ações administrativas
  const [participanteSelecionado, setParticipanteSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [operacaoLoading, setOperacaoLoading] = useState(false);

  // Estados para paginação (MELHORADA)
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(20);

  // Estados para estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    confirmados: 0,
    pendentes: 0,
    cancelados: 0,
    receita: 0,
  });

  // 🔄 CARREGAR PARTICIPANTES (FUNÇÃO PRINCIPAL)
  const carregarParticipantes = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log(
        "📊 [AdminParticipantes] Carregando todos os participantes..."
      );

      // Usar fetchAuth para requisição autenticada
      const response = await fetchAuth(
        "http://localhost:8000/api/participantes"
      );
      const data = await response.json();

      if (data.sucesso) {
        const participantesData = data.dados.participantes || [];

        setParticipantes(participantesData);
        calcularEstatisticas(participantesData);

        console.log("✅ [AdminParticipantes] Participantes carregados:", {
          total: participantesData.length,
          confirmados: participantesData.filter(
            (p) => p.statusPagamento === "confirmado"
          ).length,
          pendentes: participantesData.filter(
            (p) => p.statusPagamento === "pendente"
          ).length,
        });
      } else {
        throw new Error(data.erro || "Erro ao carregar participantes");
      }
    } catch (error) {
      console.error("❌ [AdminParticipantes] Erro ao carregar:", error);
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 📊 CALCULAR ESTATÍSTICAS
  const calcularEstatisticas = (dados) => {
    const total = dados.length;
    const confirmados = dados.filter(
      (p) => p.statusPagamento === "confirmado"
    ).length;
    const pendentes = dados.filter(
      (p) => p.statusPagamento === "pendente"
    ).length;
    const cancelados = dados.filter(
      (p) => p.statusPagamento === "cancelado"
    ).length;

    // Calcular receita apenas dos confirmados
    const receita = dados
      .filter((p) => p.statusPagamento === "confirmado")
      .reduce((total, p) => total + parseFloat(p.valorInscricao || 0), 0);

    setEstatisticas({
      total,
      confirmados,
      pendentes,
      cancelados,
      receita,
    });
  };

  // 🔍 APLICAR FILTROS (EXATAMENTE COMO EM /inscritos + STATUS)
  const aplicarFiltros = () => {
    let resultado = [...participantes];

    // Filtro por nome (igual ao /inscritos)
    if (filtros.nome.trim()) {
      resultado = resultado.filter((p) =>
        p.nome.toLowerCase().includes(filtros.nome.toLowerCase())
      );
    }

    // Filtro por cidade (igual ao /inscritos)
    if (filtros.cidade.trim()) {
      resultado = resultado.filter((p) =>
        p.cidade.toLowerCase().includes(filtros.cidade.toLowerCase())
      );
    }

    // Filtro por categoria de moto (igual ao /inscritos)
    if (filtros.categoriaMoto !== "todos") {
      resultado = resultado.filter(
        (p) => p.categoriaMoto === filtros.categoriaMoto
      );
    }

    // 🆕 ÚNICO FILTRO NOVO: status de pagamento (admin)
    if (filtros.statusPagamento !== "todos") {
      resultado = resultado.filter(
        (p) => p.statusPagamento === filtros.statusPagamento
      );
    }

    setParticipantesFiltrados(resultado);
    setPaginaAtual(1); // Resetar paginação ao filtrar
  };

  // 🔧 ATUALIZAR FILTRO
  const atualizarFiltro = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // 🗑️ LIMPAR FILTROS
  const limparFiltros = () => {
    setFiltros({
      nome: "",
      cidade: "",
      categoriaMoto: "todos",
      statusPagamento: "todos",
    });
  };

  // ✅ CONFIRMAR PAGAMENTO MANUALMENTE
  const confirmarPagamento = async (participanteId, observacoes = "") => {
    try {
      setOperacaoLoading(true);

      console.log(
        "💳 [AdminParticipantes] Confirmando pagamento:",
        participanteId
      );

      const response = await fetchAuth(
        `http://localhost:8000/api/participantes/${participanteId}/pagamento`,
        {
          method: "PUT",
          body: JSON.stringify({
            status: "confirmado",
            comprovante: `Confirmado manualmente pelo admin: ${observacoes}`,
          }),
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        // Atualizar participante na lista local
        setParticipantes((prev) =>
          prev.map((p) =>
            p.id === participanteId
              ? { ...p, statusPagamento: "confirmado" }
              : p
          )
        );

        console.log("✅ [AdminParticipantes] Pagamento confirmado com sucesso");
        return { sucesso: true };
      } else {
        throw new Error(data.erro || "Erro ao confirmar pagamento");
      }
    } catch (error) {
      console.error("❌ [AdminParticipantes] Erro ao confirmar:", error);
      return { sucesso: false, erro: error.message };
    } finally {
      setOperacaoLoading(false);
    }
  };

  // ❌ CANCELAR PARTICIPANTE
  const cancelarParticipante = async (participanteId, motivo = "") => {
    try {
      setOperacaoLoading(true);

      console.log(
        "🗑️ [AdminParticipantes] Cancelando participante:",
        participanteId
      );

      const response = await fetchAuth(
        `http://localhost:8000/api/participantes/${participanteId}/pagamento`,
        {
          method: "PUT",
          body: JSON.stringify({
            status: "cancelado",
            comprovante: `Cancelado pelo admin: ${motivo}`,
          }),
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        // Atualizar participante na lista local
        setParticipantes((prev) =>
          prev.map((p) =>
            p.id === participanteId ? { ...p, statusPagamento: "cancelado" } : p
          )
        );

        console.log(
          "✅ [AdminParticipantes] Participante cancelado com sucesso"
        );
        return { sucesso: true };
      } else {
        throw new Error(data.erro || "Erro ao cancelar participante");
      }
    } catch (error) {
      console.error("❌ [AdminParticipantes] Erro ao cancelar:", error);
      return { sucesso: false, erro: error.message };
    } finally {
      setOperacaoLoading(false);
    }
  };

  const criarUsuario = async (dadosUsuario) => {
    try {
      setOperacaoLoading(true);

      console.log(
        "➕ [AdminParticipantes] Criando novo participante:",
        dadosUsuario.nome
      );

      const response = await fetchAuth(
        "http://localhost:8000/api/participantes",
        {
          method: "POST",
          body: JSON.stringify(dadosUsuario),
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        // Recarregar dados para incluir o novo participante
        await carregarParticipantes();

        console.log("✅ [AdminParticipantes] Participante criado com sucesso");
        return {
          sucesso: true,
          dados: data.dados,
          mensagem: "Participante criado com sucesso!",
        };
      } else {
        throw new Error(data.erro || "Erro ao criar participante");
      }
    } catch (error) {
      console.error(
        "❌ [AdminParticipantes] Erro ao criar participante:",
        error
      );
      return { sucesso: false, erro: error.message };
    } finally {
      setOperacaoLoading(false);
    }
  };

  const excluirParticipante = async (participanteId) => {
    try {
      setOperacaoLoading(true);

      console.log(
        "🗑️ [AdminParticipantes] Excluindo participante:",
        participanteId
      );

      const response = await fetchAuth(
        `http://localhost:8000/api/participantes/${participanteId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        // Remover participante da lista local
        setParticipantes((prev) => prev.filter((p) => p.id !== participanteId));

        console.log(
          "✅ [AdminParticipantes] Participante excluído com sucesso"
        );
        return { sucesso: true };
      } else {
        throw new Error(data.erro || "Erro ao excluir participante");
      }
    } catch (error) {
      console.error("❌ [AdminParticipantes] Erro ao excluir:", error);
      return { sucesso: false, erro: error.message };
    } finally {
      setOperacaoLoading(false);
    }
  };
  // 🔄 RECARREGAR DADOS
  const recarregarDados = async () => {
    await carregarParticipantes();
  };

  // 📋 SELECIONAR PARTICIPANTE PARA EDIÇÃO
  const selecionarParticipante = (participante) => {
    setParticipanteSelecionado(participante);
    setModalAberto(true);
  };

  // ❌ FECHAR MODAL
  const fecharModal = () => {
    setParticipanteSelecionado(null);
    setModalAberto(false);
  };

  // 📄 PAGINAÇÃO
  const totalPaginas = Math.ceil(
    participantesFiltrados.length / itensPorPagina
  );
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const participantesPagina = participantesFiltrados.slice(
    indiceInicio,
    indiceInicio + itensPorPagina
  );

  const irParaPagina = (pagina) => {
    setPaginaAtual(Math.max(1, Math.min(pagina, totalPaginas)));
  };

  const alterarItensPorPagina = (novoValor) => {
    setItensPorPagina(novoValor);
    setPaginaAtual(1);
  };

  // 🚀 CARREGAR DADOS AO INICIALIZAR
  useEffect(() => {
    carregarParticipantes();
  }, []);

  // 🔍 APLICAR FILTROS QUANDO MUDAREM
  useEffect(() => {
    aplicarFiltros();
  }, [participantes, filtros]);

  //  RECALCULAR ESTATÍSTICAS QUANDO DADOS MUDAREM
  useEffect(() => {
    calcularEstatisticas(participantes);
  }, [participantes]);
  // 🗑️ EXCLUIR PARTICIPANTE - NOVA FUNÇÃO
  // Adicione esta função APÓS a função "cancelarParticipante" e ANTES de "recarregarDados"

  return {
    // Estados principais
    participantes,
    participantesFiltrados,
    participantesPagina,
    loading,
    erro,
    operacaoLoading,

    // Filtros
    filtros,
    atualizarFiltro,
    limparFiltros,

    // Paginação
    paginaAtual,
    totalPaginas,
    itensPorPagina,
    irParaPagina,
    alterarItensPorPagina,

    // Estatísticas
    estatisticas,

    // Modal
    participanteSelecionado,
    modalAberto,
    selecionarParticipante,
    fecharModal,

    // Ações administrativas
    confirmarPagamento,
    cancelarParticipante,
    recarregarDados,
    excluirParticipante,
    criarUsuario,
  };
};

export default useAdminParticipantes;
