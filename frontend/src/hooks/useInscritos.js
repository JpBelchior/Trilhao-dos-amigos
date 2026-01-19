import { useState, useEffect } from "react";

/**
 * @returns {Object} Estados e funções necessários para o componente
 */
export const useInscritos = () => {

  const [participantes, setParticipantes] = useState([]);
  const [participantesFiltrados, setParticipantesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);


  const [filtros, setFiltros] = useState({
    nome: "",
    cidade: "",
    categoriaMoto: "todos",
  });

  
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

 
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    nacionais: 0,
    importadas: 0,
    cidades: [],
    estados: [],
  });

 
  useEffect(() => {
    carregarParticipantes();
  }, []);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [participantes, filtros]);

  
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

 
  const aplicarFiltros = () => {
    let resultado = [...participantes];

    // Filtro por nome
    if (filtros.nome.trim()) {
      const nomeBusca = filtros.nome.toLowerCase().trim();
      resultado = resultado.filter(
        (p) =>
          p.nome.toLowerCase().includes(nomeBusca) ||
          p.numeroInscricao.toLowerCase().includes(nomeBusca)
      );
    }

    // Filtro por cidade
    if (filtros.cidade.trim()) {
      const cidadeBusca = filtros.cidade.toLowerCase().trim();
      resultado = resultado.filter((p) =>
        p.cidade.toLowerCase().includes(cidadeBusca)
      );
    }

    // Filtro por categoria de moto
    if (filtros.categoriaMoto !== "todos") {
      resultado = resultado.filter(
        (p) => p.categoriaMoto === filtros.categoriaMoto
      );
    }

    setParticipantesFiltrados(resultado);
    setPaginaAtual(1); // Resetar para primeira página

    console.log(`🔍 [Inscritos] Filtros aplicados: ${resultado.length} resultados`);
  };

 
  const atualizarFiltro = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  
  const limparFiltros = () => {
    setFiltros({
      nome: "",
      cidade: "",
      categoriaMoto: "todos",
    });
  };

 
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


  const totalPaginas = Math.ceil(participantesFiltrados.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const participantesPagina = participantesFiltrados.slice(
    indiceInicio,
    indiceInicio + itensPorPagina
  );

 
  const irParaPagina = (pagina) => {
    setPaginaAtual(Math.max(1, Math.min(pagina, totalPaginas)));
  };



  /**
   * 👁️ Toggle de visibilidade dos filtros
   */
  const toggleFiltros = () => {
    setMostrarFiltros((prev) => !prev);
  };

  // ========================================
  // RETORNO DO HOOK
  // ========================================
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