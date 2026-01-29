/**
 * 📊 Utilitários para cálculo de estatísticas de participantes
 * 
 * Centraliza toda lógica de processamento de dados de participantes
 * para evitar duplicação entre hooks.
 */

/**
 * @param {Array} participantes - Array de participantes
 * @returns {Object} Objeto com todas as estatísticas
 */
export const calcularEstatisticasParticipantes = (participantes) => {
  const total = participantes.length;
  
  // Contadores de categoria
  const nacionais = participantes.filter(
    (p) => p.categoriaMoto === "nacional"
  ).length;
  const importadas = total - nacionais;

  // Percentuais
  const percentualNacionais = total > 0 ? ((nacionais / total) * 100).toFixed(1) : 0;
  const percentualImportadas = total > 0 ? ((importadas / total) * 100).toFixed(1) : 0;

  // Agrupar por cidade
  const cidadesMap = {};
  participantes.forEach((p) => {
    const chave = `${p.cidade}/${p.estado}`;
    cidadesMap[chave] = (cidadesMap[chave] || 0) + 1;
  });

  const cidades = Object.entries(cidadesMap)
    .map(([cidade, count]) => ({ cidade, count }))
    .sort((a, b) => b.count - a.count);

  // Agrupar por estado
  const estadosMap = {};
  participantes.forEach((p) => {
    estadosMap[p.estado] = (estadosMap[p.estado] || 0) + 1;
  });

  const estados = Object.entries(estadosMap)
    .map(([estado, count]) => ({ estado, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total,
    nacionais,
    importadas,
    percentualNacionais,
    percentualImportadas,
    cidades,
    estados,
    totalCidades: cidades.length,
    totalEstados: estados.length,
    cidadeMaisParticipantes: cidades[0] || null,
    estadoMaisParticipantes: estados[0] || null,
  };
};

/**
 * Calcula motos mais populares
 * 
 * @param {Array} participantes - Array de participantes
 * @param {number} limite - Quantas motos retornar (padrão: 10)
 * @returns {Array} Array com as motos mais populares
 */
export const calcularMotosPopulares = (participantes, limite = 10) => {
  const motosMap = {};

  participantes.forEach((p) => {
    if (!p.modeloMoto) return;
    
    const modelo = p.modeloMoto.trim();
    motosMap[modelo] = (motosMap[modelo] || 0) + 1;
  });

  return Object.entries(motosMap)
    .map(([modelo, count]) => ({ modelo, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limite);
};

/**
 * Calcula estatísticas simples (para admin)
 * 
 * @param {Array} participantes - Array de participantes
 * @returns {Object} Estatísticas básicas
 */
export const calcularEstatisticasAdmin = (participantes) => {
  const total = participantes.length;
  const confirmados = participantes.filter(
    (p) => p.statusPagamento === "confirmado"
  ).length;
  const pendentes = participantes.filter(
    (p) => p.statusPagamento === "pendente"
  ).length;
  const cancelados = participantes.filter(
    (p) => p.statusPagamento === "cancelado"
  ).length;

  // Calcular receita (apenas confirmados)
  const receita = participantes
    .filter((p) => p.statusPagamento === "confirmado")
    .reduce((acc, p) => acc + (parseFloat(p.valorInscricao) || 0), 0);

  return {
    total,
    confirmados,
    pendentes,
    cancelados,
    receita: Number(receita) || 0, 
  };
};

/**
 * Filtra apenas participantes confirmados
 * 
 * @param {Array} participantes - Array de participantes
 * @returns {Array} Array apenas com confirmados
 */
export const filtrarConfirmados = (participantes) => {
  return participantes.filter((p) => p.statusPagamento === "confirmado");

  
};

/**
 * Calcula estatísticas de campeões
 * 
 * @param {Array} campeoes - Array de campeões
 * @returns {Object} Estatísticas dos campeões
 */
export const calcularEstatisticasCampeoes = (campeoes) => {
  const total = campeoes.length;
  
  const nacionais = campeoes.filter((c) => c.categoriaMoto === "nacional");
  const importadas = campeoes.filter((c) => c.categoriaMoto === "importada");

  const mediaNacional =
    nacionais.length > 0
      ? nacionais.reduce((sum, c) => sum + parseFloat(c.resultadoAltura || 0), 0) / nacionais.length
      : 0;

  const mediaImportada =
    importadas.length > 0
      ? importadas.reduce((sum, c) => sum + parseFloat(c.resultadoAltura || 0), 0) / importadas.length
      : 0;

  const melhorGeral =
    campeoes.length > 0
      ? campeoes.reduce((max, c) =>
          parseFloat(c.resultadoAltura || 0) > parseFloat(max.resultadoAltura || 0) ? c : max
        )
      : null;

  return {
    total,
    nacionais: nacionais.length,
    importadas: importadas.length,
    mediaNacional: Number(mediaNacional).toFixed(2) || 0,
    mediaImportada: Number(mediaImportada).toFixed(2) || 0,
    melhorGeral,
  };
};