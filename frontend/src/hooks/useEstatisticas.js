import { useState, useEffect } from "react";
import { apiClient } from "../services/api";

/**
 * 📊 Hook customizado para gerenciar estatísticas do evento
 * 
 * Responsabilidades:
 * - Buscar participantes confirmados da API
 * - Calcular estatísticas detalhadas
 * - Processar dados para gráficos
 * 
 * @returns {Object} Estados e funções necessários para o componente
 */
export const useEstatisticas = () => {
  // ========================================
  // ESTADOS PRINCIPAIS
  // ========================================
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // ========================================
  // ESTATÍSTICAS DETALHADAS
  // ========================================
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    nacionais: 0,
    importadas: 0,
    percentualNacionais: 0,
    percentualImportadas: 0,
    cidades: [],
    estados: [],
    totalCidades: 0,
    totalEstados: 0,
    cidadeMaisParticipantes: null,
    estadoMaisParticipantes: null,
    motosPopulares: [],
  });

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

      console.log("📊 [useEstatisticas] Carregando dados...");

      const data = await apiClient.get("/participantes?status=confirmado");

      if (data.sucesso) {
        const participantesData = data.dados.participantes || [];
        
        const participantesConfirmados = participantesData.filter(
          (p) => p.statusPagamento === "confirmado"
        );

        setParticipantes(participantesConfirmados);
        calcularEstatisticasDetalhadas(participantesConfirmados);

        console.log(
          `✅ [useEstatisticas] ${participantesConfirmados.length} participantes carregados`
        );
      }
    } catch (error) {
      console.error("❌ [useEstatisticas] Erro ao carregar:", error);
      setErro(error.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticasDetalhadas = (dados) => {
    const total = dados.length;
    const nacionais = dados.filter(
      (p) => p.categoriaMoto === "nacional"
    ).length;
    const importadas = dados.filter(
      (p) => p.categoriaMoto === "importada"
    ).length;

    // Percentuais
    const percentualNacionais =
      total > 0 ? ((nacionais / total) * 100).toFixed(1) : 0;
    const percentualImportadas =
      total > 0 ? ((importadas / total) * 100).toFixed(1) : 0;

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

    // Agrupar por modelo de moto
    const motosMap = {};
    dados.forEach((p) => {
      motosMap[p.modeloMoto] = (motosMap[p.modeloMoto] || 0) + 1;
    });

    // Converter para arrays ordenados
    const cidades = Object.entries(cidadesMap)
      .map(([cidade, quantidade]) => ({ nome: cidade, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);

    const estados = Object.entries(estadosMap)
      .map(([estado, quantidade]) => ({ nome: estado, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);

    const motosPopulares = Object.entries(motosMap)
      .map(([modelo, quantidade]) => ({ modelo, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5); 

    // Cidade e estado com mais participantes
    const cidadeMaisParticipantes = cidades[0] || null;
    const estadoMaisParticipantes = estados[0] || null;

    setEstatisticas({
      total,
      nacionais,
      importadas,
      percentualNacionais,
      percentualImportadas,
      cidades,
      estados,
      totalCidades: Object.keys(cidadesMap).length,
      totalEstados: Object.keys(estadosMap).length,
      cidadeMaisParticipantes,
      estadoMaisParticipantes,
      motosPopulares,
    });
  };


  return {
    // Dados
    participantes,

    // Estados
    loading,
    erro,

    // Estatísticas
    estatisticas,

    // Funções
    carregarDados,
  };
};

export default useEstatisticas;