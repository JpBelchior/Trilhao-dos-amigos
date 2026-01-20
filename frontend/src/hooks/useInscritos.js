import { useState, useEffect } from "react";
import { useFiltros } from "./useFiltros";

/**
 * @returns {Object} Estados e funções necessários para o componente
 */
export const useInscritos = () => {

  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    nacionais: 0,
    importadas: 0,
    cidades: [],
    estados: [],
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
  } = useFiltros(
    participantes,
    {
      // Configuração dos filtros
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

  // ========================================
  // FUNÇÕES - API
  // ========================================

  /**
   * 📥 Carregar participantes confirmados
   */
  const carregarParticipantes = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log("📊 [Inscritos] Carregando participantes confirmados...");

      const response = await fetch(
        "http://localhost:8000/api/participantes?status=confirmado"
      );
      const data = await response.json();

      if (data.sucesso) {
        const participantesData = data.dados.participantes || [];
        const participantesConfirmados = participantesData.filter(
          (p) => p.statusPagamento === "confirmado"
        );

        setParticipantes(participantesConfirmados);
        calcularEstatisticas(participantesConfirmados);

        console.log(
          `✅ [Inscritos] ${participantesConfirmados.length} participantes carregados`
        );
      } else {
        throw new Error(data.erro || "Erro ao carregar participantes");
      }
    } catch (error) {
      console.error("❌ [Inscritos] Erro ao carregar:", error);
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📊 Calcular estatísticas dos participantes
   */
  const calcularEstatisticas = (dados) => {
    const total = dados.length;
    const nacionais = dados.filter((p) => p.categoriaMoto === "nacional").length;
    const importadas = dados.filter((p) => p.categoriaMoto === "importada").length;

    // Extrair cidades e estados únicos
    const cidadesUnicas = [...new Set(dados.map((p) => p.cidade))];
    const estadosUnicos = [...new Set(dados.map((p) => p.estado))];

    setEstatisticas({
      total,
      nacionais,
      importadas,
      cidades: cidadesUnicas.sort(),
      estados: estadosUnicos.sort(),
    });

    console.log("📊 [Inscritos] Estatísticas calculadas:", {
      total,
      nacionais,
      importadas,
      cidades: cidadesUnicas.length,
      estados: estadosUnicos.length,
    });
  };

  // ========================================
  // FUNÇÕES - UI
  // ========================================

  /**
   * 👁️ Toggle de visibilidade dos filtros
   */
  const toggleFiltros = () => {
    setMostrarFiltros((prev) => !prev);
  };

  return {
    // Estados principais
    participantes,
    participantesFiltrados,
    participantesPagina,
    loading,
    erro,

    // Filtros
    filtros,
    mostrarFiltros,
    atualizarFiltro,
    limparFiltros,
    toggleFiltros,
    temFiltrosAtivos, 

    // Paginação
    paginaAtual,
    totalPaginas,
    indiceInicio,
    itensPorPagina,
    irParaPagina,

    // Estatísticas
    estatisticas,

    // Funções de ação
    carregarParticipantes,
  };
};

export default useInscritos;