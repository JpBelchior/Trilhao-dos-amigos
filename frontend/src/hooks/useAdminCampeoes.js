// frontend/src/hooks/useAdminCampeoes.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * 🏆 Hook customizado para gerenciamento de campeões
 */
export const useAdminCampeoes = () => {
  const { fetchAuth } = useAuth();

  // ========================================
  // ESTADOS
  // ========================================
  const [campeoes, setCampeoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [operacaoLoading, setOperacaoLoading] = useState(false);

  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [campeaoSelecionado, setCampeaoSelecionado] = useState(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    nome: "",
    categoria: "",
    ano: "",
    edicao: "",
  });

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(20);

  // Estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    nacionais: 0,
    importadas: 0,
    mediaNacional: 0,
    mediaImportada: 0,
    melhorGeral: null,
  });

  // ========================================
  // CARREGAR DADOS INICIAL
  // ========================================
  useEffect(() => {
    carregarCampeoes();
  }, []);

  // ========================================
  // FUNÇÕES - API
  // ========================================

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

  // ========================================
  // FUNÇÕES - ESTATÍSTICAS
  // ========================================

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
  };

  // ========================================
  // FUNÇÕES - FILTROS
  // ========================================

  const campeosFiltrados = campeoes.filter((campeao) => {
    if (filtros.nome && !campeao.nome.toLowerCase().includes(filtros.nome.toLowerCase())) {
      return false;
    }

    if (filtros.categoria && campeao.categoriaMoto !== filtros.categoria) {
      return false;
    }

    if (filtros.ano && campeao.ano.toString() !== filtros.ano) {
      return false;
    }

    if (filtros.edicao && !campeao.edicao.toLowerCase().includes(filtros.edicao.toLowerCase())) {
      return false;
    }

    return true;
  });

  const atualizarFiltro = (filtro, valor) => {
    setFiltros((prev) => ({ ...prev, [filtro]: valor }));
    setPaginaAtual(1);
  };

  const limparFiltros = () => {
    setFiltros({
      nome: "",
      categoria: "",
      ano: "",
      edicao: "",
    });
    setPaginaAtual(1);
  };

  // ========================================
  // FUNÇÕES - PAGINAÇÃO
  // ========================================

  const totalPaginas = Math.ceil(campeosFiltrados.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const campoesPagina = campeosFiltrados.slice(
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

  // ========================================
  // FUNÇÕES - MODAL
  // ========================================

  const selecionarCampeao = (campeao) => {
    setCampeaoSelecionado(campeao);
    setModalAberto(true);
  };

  const abrirModalCriacao = () => {
    setCampeaoSelecionado(null);
    setModalCriarAberto(true);
  };

  const fecharModal = () => {
    setCampeaoSelecionado(null);
    setModalAberto(false);
    setModalCriarAberto(false);
  };

  const recarregarDados = async () => {
    await carregarCampeoes();
  };

  // ========================================
  // RETORNO DO HOOK
  // ========================================
  return {
    campeoes,
    campeosFiltrados,
    campoesPagina,
    loading,
    erro,
    operacaoLoading,
    estatisticas,
    modalAberto,
    modalCriarAberto,
    campeaoSelecionado,
    selecionarCampeao,
    abrirModalCriacao,
    fecharModal,
    filtros,
    atualizarFiltro,
    limparFiltros,
    paginaAtual,
    totalPaginas,
    indiceInicio,
    itensPorPagina,
    irParaPagina,
    alterarItensPorPagina,
    criarCampeao,
    editarCampeao,
    excluirCampeao,
    recarregarDados,
  };
};

export default useAdminCampeoes;