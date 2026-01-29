import { useState, useEffect } from "react";
import { useFiltros } from "./useFiltros";
import { apiClient } from "../services/api";

/**
 * 📋 Hook customizado para gerenciar lista de inscritos
 * 
 * Responsabilidades:
 * - Buscar participantes confirmados da API
 * - Calcular estatísticas
 * - Gerenciar filtros e paginação
 * 
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


  useEffect(() => {
    carregarParticipantes();
  }, []);

  const carregarParticipantes = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log("📊 [useInscritos] Carregando participantes confirmados...");

      // ✅ USANDO apiClient ao invés de fetch direto
      const data = await apiClient.get("/participantes?status=confirmado");

      if (data.sucesso) {
        const participantesData = data.dados.participantes || [];
        
        // Filtrar apenas confirmados (caso o backend não filtre)
        const participantesConfirmados = participantesData.filter(
          (p) => p.statusPagamento === "confirmado"
        );

        setParticipantes(participantesConfirmados);
        calcularEstatisticas(participantesConfirmados);

        console.log(
          `✅ [useInscritos] ${participantesConfirmados.length} participantes carregados`
        );
      }
    } catch (error) {
      console.error("❌ [useInscritos] Erro ao carregar:", error);
      setErro(error.message || "Erro ao carregar participantes");
    } finally {
      setLoading(false);
    }
  };


  const calcularEstatisticas = (dados) => {
    const total = dados.length;
    const nacionais = dados.filter(
      (p) => p.categoriaMoto === "nacional"
    ).length;
    const importadas = dados.filter(
      (p) => p.categoriaMoto === "importada"
    ).length;

    // Agrupar por cidade
    const cidadesMap = {};
    dados.forEach((p) => {
      const cidadeCompleta = `${p.cidade}/${p.estado}`;
      cidadesMap[cidadeCompleta] = (cidadesMap[cidadeCompleta] || 0) + 1;
    });

    // Agrupar por estado
    const estadosMap = {};
    dados.forEach((p) => {
      estadosMap[p.estado] = (estadosMap[p.estado] || 0) + 1;
    });

    // Converter para arrays ordenados
    const cidades = Object.entries(cidadesMap)
      .map(([cidade, count]) => ({ cidade, count }))
      .sort((a, b) => b.count - a.count);

    const estados = Object.entries(estadosMap)
      .map(([estado, count]) => ({ estado, count }))
      .sort((a, b) => b.count - a.count);

    setEstatisticas({
      total,
      nacionais,
      importadas,
      cidades,
      estados,
    });
  };

  // ========================================
  // RETORNO DO HOOK
  // ========================================
  return {
    // Dados
    participantes,
    participantesFiltrados,
    participantesPagina,

    // Estados
    loading,
    erro,
    mostrarFiltros,

    // Estatísticas
    estatisticas,

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

    // Funções
    carregarParticipantes,
    setMostrarFiltros,
  };
};

export default useInscritos;