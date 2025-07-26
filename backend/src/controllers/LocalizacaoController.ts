// backend/src/controllers/LocalizacaoController.ts
import { Request, Response } from "express";
import { IApiResponse } from "../types/models";
import { IBGEService } from "../Service/IBGEService";

export class LocalizacaoController {
  // GET /api/localizacao/estados - Listar estados
  public static async listarEstados(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log("📍 [LocalizacaoController] Buscando estados do IBGE");

      const estados = await IBGEService.buscarEstados();

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          estados: estados.map((estado) => ({
            sigla: estado.sigla,
            nome: estado.nome,
          })),
          total: estados.length,
          fonte: "IBGE",
        },
        mensagem: `${estados.length} estados carregados`,
      };

      res.json(response);
    } catch (error) {
      console.error("❌ Erro ao listar estados:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao carregar estados",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // GET /api/localizacao/cidades/:estado - Listar cidades por estado
  public static async listarCidadesPorEstado(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { estado } = req.params;

      console.log(`📍 [LocalizacaoController] Buscando cidades do ${estado}`);

      // Validar estado primeiro
      const estadoValido = await IBGEService.validarEstado(estado);
      if (!estadoValido) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Estado inválido",
          detalhes: `"${estado}" não é um estado brasileiro válido`,
        };
        res.status(400).json(response);
        return;
      }

      const municipios = await IBGEService.buscarMunicipiosPorEstado(estado);

      const cidades = municipios.map((municipio) => municipio.nome).sort();

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          estado: estado.toUpperCase(),
          cidades,
          total: cidades.length,
          fonte: "IBGE",
        },
        mensagem: `${cidades.length} cidades encontradas para ${estado}`,
      };

      res.json(response);
    } catch (error) {
      console.error("❌ Erro ao listar cidades:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao carregar cidades",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // GET /api/localizacao/buscar-cidades?nome=:nome&estado=:estado - Buscar cidades por nome
  public static async buscarCidades(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { nome, estado } = req.query;

      if (!nome || typeof nome !== "string") {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Nome da cidade é obrigatório",
          detalhes: "Parâmetro 'nome' deve ser fornecido",
        };
        res.status(400).json(response);
        return;
      }

      console.log(
        `🔍 [LocalizacaoController] Buscando cidades com nome "${nome}"`
      );

      const cidades = await IBGEService.buscarCidadesPorNome(
        nome,
        estado as string
      );

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          termo_busca: nome,
          estado: estado || "todos",
          cidades,
          total: cidades.length,
          fonte: "IBGE",
        },
        mensagem: `${cidades.length} cidades encontradas`,
      };

      res.json(response);
    } catch (error) {
      console.error("❌ Erro ao buscar cidades:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao buscar cidades",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // POST /api/localizacao/validar - Validar estado e cidade
  public static async validarLocalizacao(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { estado, cidade } = req.body;

      console.log(`✅ [LocalizacaoController] Validando: ${cidade}/${estado}`);

      if (!estado || !cidade) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Estado e cidade são obrigatórios",
          detalhes: "Ambos os campos devem ser fornecidos",
        };
        res.status(400).json(response);
        return;
      }

      // Validar estado
      const estadoValido = await IBGEService.validarEstado(estado);
      if (!estadoValido) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Estado inválido",
          detalhes: `"${estado}" não é um estado brasileiro válido`,
        };
        res.status(400).json(response);
        return;
      }

      // Validar cidade
      const cidadeValida = await IBGEService.validarCidade(cidade, estado);
      if (!cidadeValida) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Cidade inválida",
          detalhes: `"${cidade}" não existe no estado ${estado}`,
        };
        res.status(400).json(response);
        return;
      }

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          estado: estado.toUpperCase(),
          cidade,
          valido: true,
          fonte: "IBGE",
        },
        mensagem: `${cidade}/${estado} é uma localização válida`,
      };

      res.json(response);
    } catch (error) {
      console.error("❌ Erro ao validar localização:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao validar localização",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }
}
