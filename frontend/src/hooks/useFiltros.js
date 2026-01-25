import { useState, useEffect, useMemo } from "react";

/**
 * @param {Array} dados - Array de dados a serem filtrados
 * @param {Object} configFiltros - Configuração dos filtros
 * @param {Object} opcoes - Opções adicionais
 */
export const useFiltros = (
  dados = [], 
  configFiltros = {}, 
  opcoes = {}
) => {

  const {
    itensPorPaginaPadrao = 20,
    habilitarPaginacao = true,
  } = opcoes;

  
  // 1. Criar estado inicial dos filtros baseado na config
  const valoresIniciaisFiltros = useMemo(() => {
    const inicial = {};
    
    Object.entries(configFiltros).forEach(([chave, config]) => {
      inicial[chave] = config.padrao !== undefined ? config.padrao : "";
    });
    
    return inicial;
  }, [configFiltros]);

  const [filtros, setFiltros] = useState(valoresIniciaisFiltros);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(itensPorPaginaPadrao);

  /**
   * Aplica todos os filtros configurados nos dados
   */
  const dadosFiltrados = useMemo(() => {
    let resultado = [...dados];

    Object.entries(configFiltros).forEach(([chaveFiltro, config]) => {
      const valorFiltro = filtros[chaveFiltro];

      // Pular se o filtro estiver vazio ou no valor padrão
      if (!valorFiltro || valorFiltro === config.padrao || valorFiltro === "todos" || valorFiltro === "") {
        return;
      }

      // Aplicar filtro baseado no tipo
      switch (config.tipo) {
        case "texto":
          // Busca case-insensitive em texto
          resultado = resultado.filter((item) => {
            const valorItem = String(item[config.campo] || "").toLowerCase();
            const valorBusca = String(valorFiltro).toLowerCase().trim();
            
            // Se tem campos adicionais para buscar (ex: nome + numeroInscricao)
            if (config.camposAdicionais) {
              return config.camposAdicionais.some(campo => 
                String(item[campo] || "").toLowerCase().includes(valorBusca)
              ) || valorItem.includes(valorBusca);
            }
            
            return valorItem.includes(valorBusca);
          });
          break;

        case "select":
          // Comparação exata
          resultado = resultado.filter((item) => 
            item[config.campo] === valorFiltro
          );
          break;

        case "numero":
          // Comparação numérica exata
          resultado = resultado.filter((item) => 
            String(item[config.campo]) === String(valorFiltro)
          );
          break;

        case "custom":
          // Função customizada de filtro
          if (config.funcaoFiltro) {
            resultado = resultado.filter((item) => 
              config.funcaoFiltro(item, valorFiltro)
            );
          }
          break;

        default:
          console.warn(`Tipo de filtro desconhecido: ${config.tipo}`);
      }
    });

    return resultado;
  }, [dados, filtros, configFiltros]);

  /**
   * Ordena os dados filtrados por nome em ordem alfabética
   */
  const dadosOrdenados = useMemo(() => {
    return [...dadosFiltrados].sort((a, b) => {
      const nomeA = String(a.nome || "").toLowerCase();
      const nomeB = String(b.nome || "").toLowerCase();
      return nomeA.localeCompare(nomeB, 'pt-BR');
    });
  }, [dadosFiltrados]);

  const totalPaginas = Math.ceil(dadosOrdenados.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const dadosPagina = habilitarPaginacao 
    ? dadosOrdenados.slice(indiceInicio, indiceInicio + itensPorPagina)
    : dadosOrdenados;

  const irParaPagina = (pagina) => {
    setPaginaAtual(Math.max(1, Math.min(pagina, totalPaginas)));
  };

  const alterarItensPorPagina = (novoValor) => {
    setItensPorPagina(novoValor);
    setPaginaAtual(1);
  };

  /**
   * Atualiza um filtro específico
   */
  const atualizarFiltro = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
    setPaginaAtual(1); 
  };

  /**
   * Limpa todos os filtros
   */
  const limparFiltros = () => {
    setFiltros(valoresIniciaisFiltros);
    setPaginaAtual(1);
  };

  /**
   * Verifica se há algum filtro ativo
   */
  const temFiltrosAtivos = useMemo(() => {
    return Object.entries(filtros).some(([chave, valor]) => {
      const config = configFiltros[chave];
      const padrao = config?.padrao !== undefined ? config.padrao : "";
      return valor !== padrao && valor !== "" && valor !== "todos";
    });
  }, [filtros, configFiltros]);


  useEffect(() => {
    setPaginaAtual(1);
  }, [dados.length]);

 
  return {
    // Dados
    dadosOriginais: dados,
    dadosFiltrados: dadosOrdenados,
    dadosPagina,
    
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
    totalItens: dados.length,
    totalFiltrados: dadosOrdenados.length,
  };
};

export default useFiltros;