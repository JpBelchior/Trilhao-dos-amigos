// frontend/src/hooks/useEstoque.js
import { useState, useEffect, useMemo } from "react";
import { useAuthApi } from "./useAuthApi";

/**
 * 📦 Hook customizado para gerenciar estoque de camisetas
 * 
 * Responsabilidades:
 * - Carregar estoque detalhado e resumo
 * - Sincronizar estoque
 * - Editar quantidades
 * - Calcular estatísticas
 * 
 * @returns {Object} Estados e funções necessários para o componente
 */
export const useEstoque = () => {
  const authApi = useAuthApi();

  // ========================================
  // ESTADOS PRINCIPAIS
  // ========================================
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [estoque, setEstoque] = useState({});
  const [resumoEstoque, setResumoEstoque] = useState({});
  const [sincronizandoEstoque, setSincronizandoEstoque] = useState(false);

  // ========================================
  // ESTADOS DE EDIÇÃO
  // ========================================
  const [editando, setEditando] = useState(null);
  const [novaQuantidade, setNovaQuantidade] = useState("");

  // ========================================
  // ESTADOS DE UI
  // ========================================
  const [estoqueExpandido, setEstoqueExpandido] = useState(false);

  // ========================================
  // CONSTANTES
  // ========================================
  const TamanhoCamiseta = ["PP", "P", "M", "G", "GG"];
  const TipoCamiseta = {
    manga_curta: "Manga Curta",
    manga_longa: "Manga Longa",
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

  /**
   * 📥 Carregar dados do estoque
   * Requisições em paralelo para performance
   */
  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log("📦 [useEstoque] Carregando dados...");

      const [estoqueData, resumoData] = await Promise.all([
        authApi.get("/estoque"),
        authApi.get("/estoque/resumo"),
      ]);

      if (estoqueData.sucesso && resumoData.sucesso) {
        setEstoque(estoqueData.dados || {});
        setResumoEstoque(resumoData.dados || {});

        console.log("✅ [useEstoque] Dados carregados com sucesso");
      } else {
        throw new Error("Erro ao carregar dados do servidor");
      }
    } catch (error) {
      console.error("❌ [useEstoque] Erro ao carregar dados:", error);
      setErro(error.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const sincronizarEstoque = async () => {
    if (sincronizandoEstoque) return;

    try {
      setSincronizandoEstoque(true);
      console.log("🔄 [useEstoque] Iniciando sincronização...");

      const data = await authApi.post("/estoque/sincronizar", {});

      if (data.sucesso) {
        console.log("✅ [useEstoque] Sincronização concluída:", data.dados);
        
        // Recarregar dados
        await carregarDados();
      } else {
        throw new Error(data.erro || "Erro na sincronização");
      }
    } catch (error) {
      console.error("❌ [useEstoque] Erro na sincronização:", error);
      alert(`❌ Erro na sincronização: ${error.message}`);
    } finally {
      setSincronizandoEstoque(false);
    }
  };

  const salvarAlteracaoEstoque = async () => {
    if (!editando) return;

    try {
      const { tamanho, tipo } = editando;
      const quantidade = parseInt(novaQuantidade);

      if (isNaN(quantidade) || quantidade < 0) {
        alert("Quantidade inválida");
        return;
      }

      console.log(`✏️ [useEstoque] Atualizando ${tipo} ${tamanho} para ${quantidade}`);

      const data = await authApi.put(`/estoque/${tamanho}/${tipo}`, {
        quantidadeTotal: quantidade,
      });

      if (data.sucesso) {
        console.log("✅ [useEstoque] Estoque atualizado");
        
        // Recarregar dados
        await carregarDados();
        
        // Limpar edição
        setEditando(null);
        setNovaQuantidade("");
      } else {
        throw new Error(data.erro || "Erro ao atualizar estoque");
      }
    } catch (error) {
      console.error("❌ [useEstoque] Erro ao atualizar:", error);
      alert(`Erro ao atualizar estoque: ${error.message}`);
    }
  };

  // ========================================
  // FUNÇÕES - EDIÇÃO
  // ========================================

  /**
   * 📝 Iniciar edição de item
   */
  const iniciarEdicao = (tamanho, tipo, quantidadeAtual) => {
    setEditando({ tamanho, tipo });
    setNovaQuantidade(quantidadeAtual.toString());
  };

 
  const cancelarEdicao = () => {
    setEditando(null);
    setNovaQuantidade("");
  };

  // ========================================
  // FUNÇÕES - PROCESSAMENTO DE DADOS
  // ========================================

  /**
   * 📊 Filtrar e ordenar estoque para exibição
   * Usa useMemo para performance
   */
  const estoqueOrdenado = useMemo(() => {
    const result = [];

    Object.entries(estoque).forEach(([tipo, tamanhos]) => {
      Object.entries(tamanhos).forEach(([tamanho, dados]) => {
        result.push({
          tipo,
          tamanho,
          ...dados,
        });
      });
    });

    // Ordenar por tipo e depois por tamanho
    return result.sort((a, b) => {
      if (a.tipo !== b.tipo) {
        return a.tipo.localeCompare(b.tipo);
      }
      return (
        TamanhoCamiseta.indexOf(a.tamanho) -
        TamanhoCamiseta.indexOf(b.tamanho)
      );
    });
  }, [estoque]);

  // ========================================
  // RETORNO DO HOOK
  // ========================================
  return {
    // Dados
    estoque,
    resumoEstoque,
    estoqueOrdenado,

    // Estados
    loading,
    erro,
    sincronizandoEstoque,
    estoqueExpandido,

    // Estados de edição
    editando,
    novaQuantidade,

    // Funções de UI
    setEstoqueExpandido,
    setNovaQuantidade,

    // Funções de edição
    iniciarEdicao,
    cancelarEdicao,
    salvarAlteracaoEstoque,

    // Funções de API
    carregarDados,
    sincronizarEstoque,

    // Constantes
    TamanhoCamiseta,
    TipoCamiseta,
  };
};

export default useEstoque;