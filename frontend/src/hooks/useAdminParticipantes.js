import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useFiltros } from "./useFiltros";
import { calcularEstatisticasAdmin } from "../utils/estatisticas";
/**
 * 👥 Hook customizado para gerenciamento administrativo de participantes
 * 
 * @returns {Object} Estados e funções necessários para o componente admin
 */
export const useAdminParticipantes = () => {
  const { fetchAuth } = useAuth();

  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [operacaoLoading, setOperacaoLoading] = useState(false);

  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [participanteSelecionado, setParticipanteSelecionado] = useState(null);

  // Estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    confirmados: 0,
    pendentes: 0,
    cancelados: 0,
    receita: 0,
  });


  const {
    dadosFiltrados: participantesFiltrados,
    dadosPagina: participantesPagina,
    filtros,
    atualizarFiltro,
    limparFiltros,
    temFiltrosAtivos,
    paginaAtual,
    totalPaginas,
    indiceInicio,
    itensPorPagina,
    irParaPagina,
    alterarItensPorPagina,
  } = useFiltros(
    participantes,
    {
      nome: {
        tipo: "texto",
        campo: "nome",
        camposAdicionais: ["numeroInscricao"], 
      },
      cidade: {
        tipo: "texto",
        campo: "cidade",
      },
      categoriaMoto: {
        tipo: "select",
        campo: "categoriaMoto",
        padrao: "todos",
      },
      statusPagamento: {
        tipo: "select",
        campo: "statusPagamento",
        padrao: "todos",
      },
    },
    {
      itensPorPaginaPadrao: 20,
      habilitarPaginacao: true,
    }
  );


  // Carregar participantes ao montar
  useEffect(() => {
    carregarParticipantes();
  }, []);


  /**
   * 📥 Carregar todos os participantes
   */
  const carregarParticipantes = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log("👥 [AdminParticipantes] Carregando participantes...");

      const response = await fetchAuth("http://localhost:8000/api/participantes");
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

  /**
   * ✅ Confirmar pagamento manualmente
   */
  const confirmarPagamento = async (participanteId, observacoes = "") => {
    try {
      setOperacaoLoading(true);

      console.log(
        "💳 [AdminParticipantes] Confirmando pagamento:",
        participanteId
      );

      // Buscar dados do participante para pegar o numeroInscricao
      const participante = participantes.find((p) => p.id === participanteId);

      if (!participante) {
        throw new Error("Participante não encontrado");
      }

      const response = await fetchAuth(
        `http://localhost:8000/api/participantes/${participanteId}/pagamento`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numeroInscricao: participante.numeroInscricao,
            pagamentoId: `admin_confirmation_${Date.now()}`,
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

        console.log("✅ [AdminParticipantes] Pagamento confirmado");
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

  /**
   * ❌ Cancelar participante
   */
  const cancelarParticipante = async (participanteId) => {
    try {
      setOperacaoLoading(true);

      console.log("🚫 [AdminParticipantes] Cancelando participante:", participanteId);

      const response = await fetchAuth(
        `http://localhost:8000/api/participantes/${participanteId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelado" }),
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        setParticipantes((prev) =>
          prev.map((p) =>
            p.id === participanteId
              ? { ...p, statusPagamento: "cancelado" }
              : p
          )
        );

        console.log("✅ [AdminParticipantes] Participante cancelado");
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

  /**
   * 🗑️ Excluir participante
   */
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
        setParticipantes((prev) => prev.filter((p) => p.id !== participanteId));

        console.log("✅ [AdminParticipantes] Participante excluído com sucesso");
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

  /**
   * ➕ Criar novo participante
   */
  const criarUsuario = async (dadosParticipante) => {
    try {
      setOperacaoLoading(true);

      console.log("➕ [AdminParticipantes] Criando participante:", dadosParticipante);

      const response = await fetchAuth(
        "http://localhost:8000/api/participantes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosParticipante),
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        await carregarParticipantes(); // Recarregar lista

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
      console.error("❌ [AdminParticipantes] Erro ao criar participante:", error);
      return { sucesso: false, erro: error.message };
    } finally {
      setOperacaoLoading(false);
    }
  };


  /**
   * 📊 Calcular estatísticas dos participantes
   */
    const calcularEstatisticas = (dados) => {
    setEstatisticas(calcularEstatisticasAdmin(dados));
  };


  /**
   * 📋 Selecionar participante para edição
   */
  const selecionarParticipante = (participante) => {
    setParticipanteSelecionado(participante);
    setModalAberto(true);
  };

  /**
   * ❌ Fechar modal
   */
  const fecharModal = () => {
    setParticipanteSelecionado(null);
    setModalAberto(false);
  };

  /**
   * 🔄 Recarregar dados
   */
  const recarregarDados = async () => {
    await carregarParticipantes();
  };

  const abrirModalCriacao = () => {
    setParticipanteSelecionado(null);
    setModalCriarAberto(true);
  };

  const fecharModalCriacao = () => {
    setModalCriarAberto(false);
  };


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
    temFiltrosAtivos,

    // Paginação
    paginaAtual,
    totalPaginas,
    indiceInicio,
    itensPorPagina,
    irParaPagina,
    alterarItensPorPagina,

    // Estatísticas
    estatisticas,

    // Modal
    participanteSelecionado,
    modalAberto,
    modalCriarAberto,
    selecionarParticipante,
    fecharModal,
    abrirModalCriacao,
    fecharModalCriacao,

    // Ações administrativas
    confirmarPagamento,
    cancelarParticipante,
    excluirParticipante,
    criarUsuario,
    recarregarDados,
  };
};

export default useAdminParticipantes;