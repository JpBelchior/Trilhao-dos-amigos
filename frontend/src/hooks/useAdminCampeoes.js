import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useFiltros } from "./useFiltros";
import { calcularEstatisticasCampeoes } from "../utils/estatisticas";
import { carregarComLoading } from "../utils/carregarComLoading";

/**
 * 🏆 Hook customizado para gerenciamento de campeões
 * 
 * @returns {Object} Estados e funções necessários para o componente admin
 */
export const useAdminCampeoes = () => {
  const { fetchAuth } = useAuth();

  const [campeoes, setCampeoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [operacaoLoading, setOperacaoLoading] = useState(false);

  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [campeaoSelecionado, setCampeaoSelecionado] = useState(null);

  // Estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    nacionais: 0,
    importadas: 0,
    mediaNacional: 0,
    mediaImportada: 0,
    melhorGeral: null,
  });

  const {
    dadosFiltrados: campeosFiltrados,
    dadosPagina: campoesPagina,
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
    campeoes,
    {
      nome: {
        tipo: "texto",
        campo: "nome",
      },
      categoria: {
        tipo: "select",
        campo: "categoriaMoto",
        padrao: "",
      },
      ano: {
        tipo: "numero",
        campo: "ano",
      },
      edicao: {
        tipo: "texto",
        campo: "edicao",
      },
    },
    {
      itensPorPaginaPadrao: 20,
      habilitarPaginacao: true,
    }
  );

  // Carregar campeões ao montar
  useEffect(() => {
    carregarCampeoes();
  }, []);

  /**
   * 📥 Carregar todos os campeões
   */
  const carregarCampeoes = () =>
    carregarComLoading(setLoading, setErro, async () => {
      const response = await fetchAuth("/api/campeoes");
      const data = await response.json();
      if (data.sucesso) {
        const listaCampeoes = data.dados.campeoes || [];
        setCampeoes(listaCampeoes);
        setEstatisticas(calcularEstatisticasCampeoes(listaCampeoes));
      } else {
        throw new Error(data.erro || "Erro ao carregar campeões");
      }
    });

  /**
   * ➕ Criar novo campeão
   */
  const criarCampeao = async (dadosCampeao) => {
    try {
      setOperacaoLoading(true);

      console.log("➕ [AdminCampeoes] Criando campeão:", dadosCampeao);

      const response = await fetchAuth("/api/campeoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosCampeao),
      });

      const data = await response.json();

      if (data.sucesso) {
        console.log("✅ [AdminCampeoes] Campeão criado com sucesso");
        return { sucesso: true, dados: data.dados };
      } else {
        throw new Error(data.erro || "Erro ao criar campeão");
      }
    } catch (error) {
      console.error("❌ [AdminCampeoes] Erro ao criar campeão:", error);
      return { sucesso: false, erro: error.message };
    } finally {
      setOperacaoLoading(false);
    }
  };

  /**
   * ✏️ Editar campeão existente
   */
  const editarCampeao = async (campeaoId, dadosAtualizacao) => {
    try {
      setOperacaoLoading(true);

      console.log(`✏️ [AdminCampeoes] Editando campeão ${campeaoId}`);

      const response = await fetchAuth(
        `/api/campeoes/${campeaoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosAtualizacao),
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        setCampeoes((prev) =>
          prev.map((c) =>
            c.id === campeaoId ? { ...c, ...dadosAtualizacao } : c
          )
        );

        console.log("✅ [AdminCampeoes] Campeão editado com sucesso");
        return { sucesso: true, dados: data.dados };
      } else {
        throw new Error(data.erro || "Erro ao editar campeão");
      }
    } catch (error) {
      console.error("❌ [AdminCampeoes] Erro ao editar campeão:", error);
      return { sucesso: false, erro: error.message };
    } finally {
      setOperacaoLoading(false);
    }
  };

  /**
   * 🗑️ Excluir campeão
   */
  const excluirCampeao = async (campeaoId) => {
    try {
      setOperacaoLoading(true);

      console.log(`🗑️ [AdminCampeoes] Excluindo campeão ${campeaoId}`);

      const response = await fetchAuth(
        `/api/campeoes/${campeaoId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        setCampeoes((prev) => prev.filter((c) => c.id !== campeaoId));

        console.log("✅ [AdminCampeoes] Campeão excluído com sucesso");
        return { sucesso: true };
      } else {
        throw new Error(data.erro || "Erro ao excluir campeão");
      }
    } catch (error) {
      console.error("❌ [AdminCampeoes] Erro ao excluir campeão:", error);
      return { sucesso: false, erro: error.message };
    } finally {
      setOperacaoLoading(false);
    }
  };





  /**
   * 📋 Selecionar campeão para edição
   */
  const selecionarCampeao = (campeao) => {
    setCampeaoSelecionado(campeao);
    setModalAberto(true);
  };

  /**
   * ➕ Abrir modal de criação
   */
  const abrirModalCriacao = () => {
    setCampeaoSelecionado(null);
    setModalCriarAberto(true);
  };

  /**
   * ❌ Fechar modal
   */
  const fecharModal = () => {
    setCampeaoSelecionado(null);
    setModalAberto(false);
    setModalCriarAberto(false);
  };

  /**
   * 🔄 Recarregar dados
   */
  const recarregarDados = async () => {
    await carregarCampeoes();
  };

  return {
    // Estados principais
    campeoes,
    campeosFiltrados,
    campoesPagina,
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
    modalAberto,
    modalCriarAberto,
    campeaoSelecionado,
    selecionarCampeao,
    abrirModalCriacao,
    fecharModal,

    // Ações administrativas
    criarCampeao,
    editarCampeao,
    excluirCampeao,
    recarregarDados,
  };
};

export default useAdminCampeoes;