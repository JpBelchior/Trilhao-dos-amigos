import { IBGEService } from "./IBGEService";
import { IApiResponse } from "../types/models";

export class LocalizacaoService {
  /**
   * Listar todos os estados
   */
  public static async listarEstados(): Promise<IApiResponse> {
    try {
      console.log("📍 [LocalizacaoService] Buscando estados do IBGE");

      const estados = await IBGEService.buscarEstados();

      return {
        sucesso: true,
        dados: {
          estados: estados.map((estado) => ({
            sigla: estado.sigla,
            nome: estado.nome,
          })),
          total: estados.length,
          fonte: "IBGE",
        },
      };
    } catch (error) {
      console.error("❌ [LocalizacaoService] Erro ao listar estados:", error);
      return {
        sucesso: false,
        erro: "Erro ao carregar estados",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Listar cidades por estado
   */
  public static async listarCidadesPorEstado(
    estado: string
  ): Promise<IApiResponse> {
    try {
      console.log(`📍 [LocalizacaoService] Buscando cidades do ${estado}`);

      // Validar estado primeiro
      const estadoValido = await IBGEService.validarEstado(estado);
      if (!estadoValido) {
        return {
          sucesso: false,
          erro: "Estado inválido",
          detalhes: `"${estado}" não é um estado brasileiro válido`,
        };
      }

      const municipios = await IBGEService.buscarMunicipiosPorEstado(estado);
      const cidades = municipios.map((municipio) => municipio.nome).sort();

      return {
        sucesso: true,
        dados: {
          estado: estado.toUpperCase(),
          cidades,
          total: cidades.length,
          fonte: "IBGE",
        },
      };
    } catch (error) {
      console.error("❌ [LocalizacaoService] Erro ao listar cidades:", error);
      return {
        sucesso: false,
        erro: "Erro ao carregar cidades",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Buscar cidades por nome
   */
  public static async buscarCidades(
    nome: string,
    estado?: string
  ): Promise<IApiResponse> {
    try {
      console.log(
        `🔍 [LocalizacaoService] Buscando cidades com nome "${nome}"`
      );

      const cidades = await IBGEService.buscarCidadesPorNome(nome, estado);

      return {
        sucesso: true,
        dados: {
          termo_busca: nome,
          estado: estado || "todos",
          cidades,
          total: cidades.length,
          fonte: "IBGE",
        },
      };
    } catch (error) {
      console.error("❌ [LocalizacaoService] Erro ao buscar cidades:", error);
      return {
        sucesso: false,
        erro: "Erro ao buscar cidades",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Validar localização (estado + cidade)
   */
  public static async validarLocalizacao(
    estado: string,
    cidade: string
  ): Promise<IApiResponse> {
    try {
      console.log(`✅ [LocalizacaoService] Validando: ${cidade}/${estado}`);

      // Validar estado
      const estadoValido = await IBGEService.validarEstado(estado);
      if (!estadoValido) {
        return {
          sucesso: false,
          erro: "Estado inválido",
          detalhes: `"${estado}" não é um estado brasileiro válido`,
        };
      }

      // Validar cidade
      const cidadeValida = await IBGEService.validarCidade(cidade, estado);
      if (!cidadeValida) {
        return {
          sucesso: false,
          erro: "Cidade inválida",
          detalhes: `"${cidade}" não existe no estado ${estado}`,
        };
      }

      return {
        sucesso: true,
        dados: {
          estado: estado.toUpperCase(),
          cidade,
          valido: true,
          fonte: "IBGE",
        },
      };
    } catch (error) {
      console.error(
        "❌ [LocalizacaoService] Erro ao validar localização:",
        error
      );
      return {
        sucesso: false,
        erro: "Erro ao validar localização",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
}
