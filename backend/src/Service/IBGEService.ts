import fetch from "node-fetch";

interface EstadoIBGE {
  id: number;
  sigla: string;
  nome: string;
}

interface MunicipioIBGE {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
      };
    };
  };
}

export class IBGEService {
  private static baseURL =
    "https://servicodados.ibge.gov.br/api/v1/localidades";
  private static cacheDuration = 24 * 60 * 60 * 1000; // 24 horas
  private static cache: { [key: string]: { data: any; timestamp: number } } =
    {};

  // Buscar todos os estados
  public static async buscarEstados(): Promise<EstadoIBGE[]> {
    const cacheKey = "estados";

    // Verificar cache
    if (
      this.cache[cacheKey] &&
      Date.now() - this.cache[cacheKey].timestamp < this.cacheDuration
    ) {
      console.log(" Estados carregados do cache");
      return this.cache[cacheKey].data;
    }

    try {
      console.log(" Buscando estados na API do IBGE...");

      const response = await fetch(`${this.baseURL}/estados?orderBy=nome`);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const estados: EstadoIBGE[] = await response.json();

      // Salvar no cache
      this.cache[cacheKey] = {
        data: estados,
        timestamp: Date.now(),
      };

      console.log(` ${estados.length} estados carregados da API do IBGE`);
      return estados;
    } catch (error) {
      console.error(" Erro ao buscar estados do IBGE:", error);

      // Fallback com estados estáticos se API falhar
      const estadosEstaticos: EstadoIBGE[] = [
        { id: 12, sigla: "AC", nome: "Acre" },
        { id: 27, sigla: "AL", nome: "Alagoas" },
        { id: 16, sigla: "AP", nome: "Amapá" },
        { id: 13, sigla: "AM", nome: "Amazonas" },
        { id: 29, sigla: "BA", nome: "Bahia" },
        { id: 23, sigla: "CE", nome: "Ceará" },
        { id: 53, sigla: "DF", nome: "Distrito Federal" },
        { id: 32, sigla: "ES", nome: "Espírito Santo" },
        { id: 52, sigla: "GO", nome: "Goiás" },
        { id: 21, sigla: "MA", nome: "Maranhão" },
        { id: 51, sigla: "MT", nome: "Mato Grosso" },
        { id: 50, sigla: "MS", nome: "Mato Grosso do Sul" },
        { id: 31, sigla: "MG", nome: "Minas Gerais" },
        { id: 15, sigla: "PA", nome: "Pará" },
        { id: 25, sigla: "PB", nome: "Paraíba" },
        { id: 41, sigla: "PR", nome: "Paraná" },
        { id: 26, sigla: "PE", nome: "Pernambuco" },
        { id: 22, sigla: "PI", nome: "Piauí" },
        { id: 33, sigla: "RJ", nome: "Rio de Janeiro" },
        { id: 24, sigla: "RN", nome: "Rio Grande do Norte" },
        { id: 43, sigla: "RS", nome: "Rio Grande do Sul" },
        { id: 11, sigla: "RO", nome: "Rondônia" },
        { id: 14, sigla: "RR", nome: "Roraima" },
        { id: 42, sigla: "SC", nome: "Santa Catarina" },
        { id: 35, sigla: "SP", nome: "São Paulo" },
        { id: 28, sigla: "SE", nome: "Sergipe" },
        { id: 17, sigla: "TO", nome: "Tocantins" },
      ];

      console.log("Usando fallback com estados estáticos");
      return estadosEstaticos;
    }
  }

  // Buscar municípios por estado
  public static async buscarMunicipiosPorEstado(
    siglaEstado: string
  ): Promise<MunicipioIBGE[]> {
    const cacheKey = `municipios_${siglaEstado.toUpperCase()}`;

    // Verificar cache
    if (
      this.cache[cacheKey] &&
      Date.now() - this.cache[cacheKey].timestamp < this.cacheDuration
    ) {
      console.log(` Municípios do ${siglaEstado} carregados do cache`);
      return this.cache[cacheKey].data;
    }

    try {
      console.log(`Buscando municípios do ${siglaEstado} na API do IBGE...`);

      const response = await fetch(
        `${
          this.baseURL
        }/estados/${siglaEstado.toUpperCase()}/municipios?orderBy=nome`
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const municipios: MunicipioIBGE[] = await response.json();

      // Salvar no cache
      this.cache[cacheKey] = {
        data: municipios,
        timestamp: Date.now(),
      };

      console.log(
        ` ${municipios.length} municípios do ${siglaEstado} carregados`
      );
      return municipios;
    } catch (error) {
      console.error(` Erro ao buscar municípios do ${siglaEstado}:`, error);
      return [];
    }
  }

  // Validar se estado existe
  public static async validarEstado(sigla: string): Promise<boolean> {
    try {
      const estados = await this.buscarEstados();
      return estados.some(
        (estado) => estado.sigla.toLowerCase() === sigla.toLowerCase()
      );
    } catch (error) {
      console.error(" Erro ao validar estado:", error);
      return false;
    }
  }

  // Validar se cidade existe no estado
  public static async validarCidade(
    nomeCidade: string,
    siglaEstado: string
  ): Promise<boolean> {
    try {
      const municipios = await this.buscarMunicipiosPorEstado(siglaEstado);

      // Normalizar nomes para comparação (remover acentos e converter para minúsculo)
      const cidadeNormalizada = this.normalizarTexto(nomeCidade);

      return municipios.some(
        (municipio) =>
          this.normalizarTexto(municipio.nome) === cidadeNormalizada
      );
    } catch (error) {
      console.error(" Erro ao validar cidade:", error);
      return false;
    }
  }

  // Buscar cidades por nome (busca fuzzy)
  public static async buscarCidadesPorNome(
    nomeCidade: string,
    siglaEstado?: string
  ): Promise<string[]> {
    try {
      let municipios: MunicipioIBGE[] = [];

      if (siglaEstado) {
        // Buscar apenas no estado específico
        municipios = await this.buscarMunicipiosPorEstado(siglaEstado);
      } else {
        // Buscar em todos os estados (mais lento)
        const estados = await this.buscarEstados();
        const promises = estados.map((estado) =>
          this.buscarMunicipiosPorEstado(estado.sigla)
        );
        const resultados = await Promise.all(promises);
        municipios = resultados.flat();
      }

      // Filtrar cidades que contenham o termo buscado
      const cidadeNormalizada = this.normalizarTexto(nomeCidade);

      const cidadesEncontradas = municipios
        .filter((municipio) =>
          this.normalizarTexto(municipio.nome).includes(cidadeNormalizada)
        )
        .map((municipio) => municipio.nome)
        .slice(0, 10); // Limitar a 10 resultados

      return [...new Set(cidadesEncontradas)]; // Remover duplicatas
    } catch (error) {
      console.error("❌ Erro ao buscar cidades por nome:", error);
      return [];
    }
  }

  // Limpar cache (útil para forçar atualização)
  public static limparCache(): void {
    this.cache = {};
    console.log(" Cache do IBGE limpo");
  }

  // Função utilitária para normalizar texto (remover acentos, etc.)
  private static normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .trim();
  }

  // Obter estatísticas do cache
  public static obterEstatisticasCache(): {
    [key: string]: { items: number; idade: string };
  } {
    const estatisticas: { [key: string]: { items: number; idade: string } } =
      {};

    for (const [key, value] of Object.entries(this.cache)) {
      const idadeMs = Date.now() - value.timestamp;
      const idadeHoras = Math.floor(idadeMs / (1000 * 60 * 60));
      const idadeMinutos = Math.floor(
        (idadeMs % (1000 * 60 * 60)) / (1000 * 60)
      );

      estatisticas[key] = {
        items: Array.isArray(value.data) ? value.data.length : 1,
        idade: `${idadeHoras}h${idadeMinutos}m`,
      };
    }

    return estatisticas;
  }
}
