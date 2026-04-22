import { useState, useEffect, useMemo } from "react";
import { useAuthApi } from "./useAuthApi";
import { useFiltros } from "./useFiltros";
import { TipoCamisetaLabel as TipoCamiseta } from "../constants";

/**
 * 📦 Hook customizado para gerenciar entregas de camisetas
 * 
 * Responsabilidades:
 * - Carregar participantes com camisetas reservadas
 * - Carregar resumo de entregas
 * - Marcar camisetas como entregues
 * - Desfazer entregas
 * - Filtrar participantes por nome
 * 
 * @returns {Object} Estados e funções necessários para o componente
 */
export const useEntregasCamisas = () => {
  const authApi = useAuthApi();

  // ========================================
  // ESTADOS PRINCIPAIS
  // ========================================
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [participantesReservados, setParticipantesReservados] = useState([]);
  const [resumoEntregas, setResumoEntregas] = useState({});
  const [pedidosAvulsos, setPedidosAvulsos] = useState([]);
  const [loadingButtonsAvulsos, setLoadingButtonsAvulsos] = useState({});

  // ========================================
  // ESTADOS DE UI
  // ========================================
  const [expandido, setExpandido] = useState(false);
  const [loadingButtons, setLoadingButtons] = useState({});


  // ========================================
  // FILTROS
  // ========================================
  const {
    dadosFiltrados: participantesFiltrados,
    filtros: filtrosParticipantes,
    atualizarFiltro: atualizarFiltroParticipantes,
  } = useFiltros(
    participantesReservados,
    { nome: { tipo: "texto", campo: "nome", camposAdicionais: ["numeroInscricao"] } },
    { habilitarPaginacao: false }
  );

  const {
    dadosFiltrados: pedidosAvulsosFiltrados,
    atualizarFiltro: atualizarFiltroAvulsos,
  } = useFiltros(
    pedidosAvulsos,
    { nome: { tipo: "texto", campo: "nome" } },
    { habilitarPaginacao: false }
  );

  const filtroNome = filtrosParticipantes.nome || "";
  const setFiltroNome = (valor) => {
    atualizarFiltroParticipantes("nome", valor);
    atualizarFiltroAvulsos("nome", valor);
  };

  // ========================================
  // CARREGAR DADOS AO MONTAR
  // ========================================
  useEffect(() => {
    carregarDados();
  }, []);

  // ========================================
  // FUNÇÕES - API
  // ========================================

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);

      const [participantesData, resumoData, avulsosData] = await Promise.all([
        authApi.get("/participantes"),
        authApi.get("/entrega/resumo"),
        authApi.get("/pedido-camisa/admin/lista"),
      ]);

      // Processar participantes
      if (participantesData.sucesso) {
        const participantes = participantesData.dados.participantes || [];
        
        // Filtrar apenas participantes confirmados
        const confirmados = participantes.filter(
          (p) => p.statusPagamento === "confirmado"
        );

        // Normalizar camisetas (unificar principal + extras)
        const comCamisetasNormalizadas = confirmados.map(normalizarCamisetas);

        setParticipantesReservados(comCamisetasNormalizadas);
        console.log(
          `✅ [useEntregasCamisas] ${comCamisetasNormalizadas.length} participantes com reservas`
        );
      }

      // Processar resumo de entregas
      if (resumoData.sucesso) {
        setResumoEntregas(resumoData.dados || {});
        console.log("✅ [useEntregasCamisas] Resumo carregado:", resumoData.dados);
      }

      // Processar pedidos avulsos
      if (avulsosData.sucesso) {
        setPedidosAvulsos(avulsosData.dados?.pedidos || []);
        console.log(`✅ [useEntregasCamisas] ${avulsosData.dados?.pedidos?.length || 0} pedidos avulsos`);
      }
    } catch (error) {
      console.error("❌ [useEntregasCamisas] Erro ao carregar dados:", error);
      setErro(error.message || "Erro ao carregar dados de entregas");
    } finally {
      setLoading(false);
    }
  };

  
  const toggleEntrega = async (participanteId, camisetaId) => {
    const buttonKey = `${participanteId}-${camisetaId}`;
    
    try {
      setLoadingButtons((prev) => ({ ...prev, [buttonKey]: true }));

      // Detectar se é principal (ID começa com "principal-") ou extra (ID numérico)
      const isCamisetaExtra = !camisetaId.toString().startsWith("principal-");

      console.log(
        `🔄 [useEntregasCamisas] Toggling entrega - ${
          isCamisetaExtra ? "Extra" : "Principal"
        } - ID: ${camisetaId}`
      );

      let data;

      if (isCamisetaExtra) {
        // Endpoint para camiseta extra (ID real do banco)
        data = await authApi.put(`/entrega/camiseta-extra/${camisetaId}`, {});
      } else {
        // Endpoint para camiseta principal (usar participanteId)
        data = await authApi.put(
          `/entrega/participante/${participanteId}/camiseta-principal`,
          {}
        );
      }

      if (data.sucesso) {
        console.log("✅ [useEntregasCamisas] Entrega atualizada");
        
        // Recarregar dados para atualizar a lista
        await carregarDados();
        
        return { sucesso: true };
      } else {
        throw new Error(data.erro || "Erro ao atualizar entrega");
      }
    } catch (error) {
      console.error("❌ [useEntregasCamisas] Erro ao atualizar entrega:", error);
      alert(error.message || "Erro ao atualizar entrega");
      return { sucesso: false, erro: error.message };
    } finally {
      setLoadingButtons((prev) => {
        const newState = { ...prev };
        delete newState[buttonKey];
        return newState;
      });
    }
  };

  const toggleEntregaAvulso = async (itemId) => {
    const buttonKey = `avulso-item-${itemId}`;
    try {
      setLoadingButtonsAvulsos((prev) => ({ ...prev, [buttonKey]: true }));
      const data = await authApi.put(`/pedido-camisa/admin/item/${itemId}/entrega`, {});
      if (data.sucesso) {
        await carregarDados();
        return { sucesso: true };
      } else {
        throw new Error(data.erro || "Erro ao atualizar entrega");
      }
    } catch (error) {
      console.error("❌ [useEntregasCamisas] Erro ao atualizar entrega avulsa:", error);
      alert(error.message || "Erro ao atualizar entrega");
      return { sucesso: false };
    } finally {
      setLoadingButtonsAvulsos((prev) => {
        const newState = { ...prev };
        delete newState[`avulso-item-${itemId}`];
        return newState;
      });
    }
  };

  // ========================================
  // FUNÇÕES - PROCESSAMENTO DE DADOS
  // ========================================

  /**
   * 🔄 Normalizar camisetas do participante
   * Backend retorna camiseta principal nos campos do participante
   * e extras em array separado. Vamos unificar tudo.
   */
  const normalizarCamisetas = (participante) => {
    const camisetas = [];

    // Camiseta principal (sempre existe para participantes confirmados)
    if (participante.tamanhoCamiseta && participante.tipoCamiseta) {
      camisetas.push({
        id: `principal-${participante.id}`,
        tamanho: participante.tamanhoCamiseta,
        tipo: participante.tipoCamiseta,
        entregue: participante.statusEntregaCamiseta === "entregue",
        dataEntrega: participante.dataEntregaCamiseta,
        camisetaExtraId: null, 
        isPrincipal: true,
      });
    }

    // Camisetas extras
    if (participante.camisetasExtras && participante.camisetasExtras.length > 0) {
      participante.camisetasExtras.forEach((extra) => {
        camisetas.push({
          id: extra.id,
          tamanho: extra.tamanho,
          tipo: extra.tipo,
          entregue: extra.statusEntrega === "entregue",
          dataEntrega: extra.dataEntrega,
          camisetaExtraId: extra.id,
          isPrincipal: false,
        });
      });
    }

    return {
      ...participante,
      camisetas, // Array unificado
    };
  };

  /**
   * 📊 Calcular estatísticas de entregas (participantes + avulsos)
   */
  const estatisticas = useMemo(() => {
    let totalReservadas = 0;
    let totalEntregues = 0;

    // Participantes
    participantesReservados.forEach((participante) => {
      participante.camisetas?.forEach((camiseta) => {
        totalReservadas++;
        if (camiseta.entregue) totalEntregues++;
      });
    });

    // Avulsos confirmados — somar por item
    pedidosAvulsos
      .filter((p) => p.statusPagamento === "confirmado")
      .forEach((p) => {
        (p.itens || []).forEach((item) => {
          totalReservadas += item.quantidade;
          if (item.statusEntrega === "entregue") totalEntregues += item.quantidade;
        });
      });

    const paraEntrega = totalReservadas - totalEntregues;

    return {
      totalReservadas,
      totalEntregues,
      paraEntrega,
      percentualEntregue:
        totalReservadas > 0
          ? ((totalEntregues / totalReservadas) * 100).toFixed(1)
          : 0,
    };
  }, [participantesReservados, pedidosAvulsos]);

  // ========================================
  // RETORNO DO HOOK
  // ========================================
  return {
    // Dados
    participantesReservados,
    participantesFiltrados,
    resumoEntregas,

    // Estados de UI
    loading,
    erro,
    expandido,
    filtroNome,
    loadingButtons,

    // Estatísticas
    estatisticas,

    // Funções de UI
    setExpandido,
    setFiltroNome,

    // Funções de API
    carregarDados,
    toggleEntrega,
    toggleEntregaAvulso,

    // Dados avulsos
    pedidosAvulsos: pedidosAvulsosFiltrados,
    loadingButtonsAvulsos,

    // Constantes
    TipoCamiseta,
  };
};

export default useEntregasCamisas;