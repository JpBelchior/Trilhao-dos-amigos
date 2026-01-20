import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useFiltros } from "./useFiltros";

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
  const carregarCampeoes = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log("🏆 [AdminCampeoes] Carregando campeões...");

      const response = await fetchAuth("http://localhost:8000/api/campeoes");
      const data = await response.json();

      if (data.sucesso) {
        const listaCampeoes = data.dados.campeoes || [];
        setCampeoes(listaCampeoes);
        calcularEstatisticas(listaCampeoes);

        console.log(`✅ [AdminCampeoes] ${listaCampeoes.length} campeões carregados`);
      } else {
        throw new Error(data.erro || "Erro ao carregar campeões");
      }
    } catch (error) {
      console.error("❌ [AdminCampeoes] Erro ao carregar campeões:", error);
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ➕ Criar novo campeão
   */
  const criarCampeao = async (dadosCampeao) => {
    try {
      setOperacaoLoading(true);

      console.log("➕ [AdminCampeoes] Criando campeão:", dadosCampeao);

      const response = await fetchAuth("http://localhost:8000/api/campeoes", {
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
        `http://localhost:8000/api/campeoes/${campeaoId}`,
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
        `http://localhost:8000/api/campeoes/${campeaoId}`,
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
   * 📊 Calcular estatísticas dos campeões
   */
  const calcularEstatisticas = (listaCampeoes) => {
    const nacionais = listaCampeoes.filter((c) => c.categoriaMoto === "nacional");
    const importadas = listaCampeoes.filter((c) => c.categoriaMoto === "importada");

    const mediaNacional =
      nacionais.length > 0
        ? nacionais.reduce((sum, c) => sum + parseFloat(c.resultadoAltura), 0) / nacionais.length
        : 0;

    const mediaImportada =
      importadas.length > 0
        ? importadas.reduce((sum, c) => sum + parseFloat(c.resultadoAltura), 0) / importadas.length
        : 0;

    const melhorGeral =
      listaCampeoes.length > 0
        ? listaCampeoes.reduce((max, c) =>
            parseFloat(c.resultadoAltura) > parseFloat(max.resultadoAltura) ? c : max
          )
        : null;

    setEstatisticas({
      total: listaCampeoes.length,
      nacionais: nacionais.length,
      importadas: importadas.length,
      mediaNacional: parseFloat(mediaNacional.toFixed(2)),
      mediaImportada: parseFloat(mediaImportada.toFixed(2)),
      melhorGeral,
    });

    console.log("📊 [AdminCampeoes] Estatísticas calculadas:", {
      total: listaCampeoes.length,
      nacionais: nacionais.length,
      importadas: importadas.length,
    });
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