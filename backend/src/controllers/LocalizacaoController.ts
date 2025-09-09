import { Request, Response } from "express";

// Importações SOLID
import { LocalizacaoValidator } from "../validators/LocalizacaoValidator";
import { LocalizacaoService } from "../Service/LocalizacaoService";
import { ResponseUtil } from "../utils/responseUtil";

export class LocalizacaoController {
  /**
   * GET /api/localizacao/estados - Listar estados*/
  public static async listarEstados(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log("📍 [LocalizacaoController] Solicitação de lista de estados");

      // 1. CHAMAR Service (sem validação necessária para GET simples)
      const resultado = await LocalizacaoService.listarEstados();

      if (!resultado.sucesso) {
        return ResponseUtil.erroInterno(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      // 2. RETORNAR sucesso
      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        `${resultado.dados?.total} estados carregados`
      );
    } catch (error) {
      console.error(
        "💥 [LocalizacaoController] Erro ao listar estados:",
        error
      );
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * GET /api/localizacao/cidades/:estado - Listar cidades por estado
   */
  public static async listarCidadesPorEstado(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { estado } = req.params;

      console.log(
        `📍 [LocalizacaoController] Solicitação de cidades para ${estado}`
      );

      // 1. VALIDAR parâmetro usando Validator
      const validacao = LocalizacaoValidator.validarEstado(estado);
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          "Parâmetro inválido",
          validacao.detalhes
        );
      }

      // 2. CHAMAR Service
      const resultado = await LocalizacaoService.listarCidadesPorEstado(estado);

      if (!resultado.sucesso) {
        return ResponseUtil.erroValidacao(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      // 3. RETORNAR sucesso
      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        `${resultado.dados?.total} cidades encontradas para ${estado}`
      );
    } catch (error) {
      console.error(
        "💥 [LocalizacaoController] Erro ao listar cidades:",
        error
      );
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * GET /api/localizacao/buscar-cidades - Buscar cidades por nome
   */
  public static async buscarCidades(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { nome, estado } = req.query;

      console.log(
        `🔍 [LocalizacaoController] Busca de cidades: nome="${nome}", estado="${estado}"`
      );

      // 1. VALIDAR parâmetros usando Validator
      const validacao = LocalizacaoValidator.validarBuscaCidades({
        nome,
        estado,
      });
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          "Parâmetros inválidos",
          validacao.detalhes
        );
      }

      // 2. CHAMAR Service
      const resultado = await LocalizacaoService.buscarCidades(
        nome as string,
        estado as string
      );

      if (!resultado.sucesso) {
        return ResponseUtil.erroInterno(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      // 3. RETORNAR sucesso
      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        `${resultado.dados?.total} cidades encontradas`
      );
    } catch (error) {
      console.error(
        "💥 [LocalizacaoController] Erro ao buscar cidades:",
        error
      );
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * POST /api/localizacao/validar - Validar estado e cidade
   */
  public static async validarLocalizacao(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { estado, cidade } = req.body;

      console.log(
        `✅ [LocalizacaoController] Validação solicitada: ${cidade}/${estado}`
      );

      // 1. VALIDAR dados usando Validator
      const validacao = LocalizacaoValidator.validarDadosLocalizacao({
        estado,
        cidade,
      });
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          "Dados inválidos",
          validacao.detalhes
        );
      }

      // 2. CHAMAR Service
      const resultado = await LocalizacaoService.validarLocalizacao(
        estado,
        cidade
      );

      if (!resultado.sucesso) {
        return ResponseUtil.erroValidacao(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      // 3. RETORNAR sucesso
      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        `${cidade}/${estado} é uma localização válida`
      );
    } catch (error) {
      console.error(
        "💥 [LocalizacaoController] Erro ao validar localização:",
        error
      );
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }
}
