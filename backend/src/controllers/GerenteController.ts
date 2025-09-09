import { Request, Response } from "express";
import { ICriarGerenteDTO, ILoginGerenteDTO } from "../types/models";

// Importações SOLID
import { GerenteValidator } from "../validators/GerenteValidator";
import { GerenteService } from "../Service/GerenteService";
import { ResponseUtil } from "../utils/responseUtil";

export interface AuthenticatedRequest extends Request {
  gerente?: {
    id: number;
    nome: string;
    email: string;
  };
}

export class GerenteController {
  /**
   * POST /api/gerente/login - Fazer login
   */
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const dadosLogin: ILoginGerenteDTO = req.body;

      console.log(
        "🔐 [GerenteController] Solicitação de login:",
        dadosLogin.email
      );

      // 1. VALIDAR dados usando Validator
      const validacao = GerenteValidator.validarDadosLogin(dadosLogin);
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          "Dados inválidos",
          validacao.detalhes
        );
      }

      // 2. CHAMAR Service
      const resultado = await GerenteService.fazerLogin(dadosLogin);

      if (!resultado.sucesso) {
        return ResponseUtil.naoAutorizado(res, resultado.erro!);
      }

      // 3. RETORNAR sucesso
      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        "Login realizado com sucesso"
      );
    } catch (error) {
      console.error("💥 [GerenteController] Erro no login:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * POST /api/gerente/criar - Criar novo gerente
   */
  public static async criarGerente(req: Request, res: Response): Promise<void> {
    try {
      const dadosCriacao: ICriarGerenteDTO = req.body;

      console.log(
        "👤 [GerenteController] Solicitação de criação:",
        dadosCriacao.email
      );

      // 1. VALIDAR dados usando Validator
      const validacao = GerenteValidator.validarDadosCriacao(dadosCriacao);
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          "Dados inválidos",
          validacao.detalhes
        );
      }

      // 2. CHAMAR Service
      const resultado = await GerenteService.criarGerente(dadosCriacao);

      if (!resultado.sucesso) {
        return ResponseUtil.erroValidacao(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      // 3. RETORNAR sucesso (status 201 para criação)
      return ResponseUtil.criado(
        res,
        resultado.dados,
        "Gerente criado com sucesso"
      );
    } catch (error) {
      console.error("💥 [GerenteController] Erro ao criar gerente:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * GET /api/gerente/perfil - Obter dados do gerente logado
   */
  public static async obterPerfil(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const gerente = req.gerente;

      if (!gerente) {
        return ResponseUtil.naoAutorizado(res, "Gerente não autenticado");
      }

      console.log("👤 [GerenteController] Solicitação de perfil:", gerente.id);

      // 1. CHAMAR Service (sem validação adicional necessária)
      const resultado = await GerenteService.obterPerfil(gerente.id);

      if (!resultado.sucesso) {
        return ResponseUtil.naoEncontrado(res, resultado.erro!);
      }

      // 2. RETORNAR sucesso
      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        "Perfil carregado com sucesso"
      );
    } catch (error) {
      console.error("💥 [GerenteController] Erro ao obter perfil:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * PUT /api/gerente/perfil - Atualizar dados do gerente logado
   */
  public static async atualizarPerfil(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const gerente = req.gerente;
      const dadosAtualizacao = req.body;

      if (!gerente) {
        return ResponseUtil.naoAutorizado(res, "Gerente não autenticado");
      }

      console.log(
        "🔄 [GerenteController] Solicitação de atualização:",
        gerente.id
      );

      // 1. VALIDAR dados usando Validator
      const validacao =
        GerenteValidator.validarDadosAtualizacao(dadosAtualizacao);
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          "Dados inválidos",
          validacao.detalhes
        );
      }

      // 2. CHAMAR Service
      const resultado = await GerenteService.atualizarPerfil(
        gerente.id,
        dadosAtualizacao
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
        "Perfil atualizado com sucesso"
      );
    } catch (error) {
      console.error("💥 [GerenteController] Erro ao atualizar perfil:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * POST /api/gerente/logout - Fazer logout (informativo)
   */
  public static async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log("👋 [GerenteController] Solicitação de logout");

      // 1. CHAMAR Service (logout é apenas informativo)
      const resultado = GerenteService.logout();

      // 2. RETORNAR sucesso
      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        "Logout realizado com sucesso"
      );
    } catch (error) {
      console.error("💥 [GerenteController] Erro no logout:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * GET /api/gerente/verificar-token - Verificar se token é válido
   */
  public static async verificarToken(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      // O middleware já validou o token
      const gerente = req.gerente;

      console.log("🔍 [GerenteController] Verificação de token:", gerente?.id);

      if (!gerente) {
        return ResponseUtil.naoAutorizado(res, "Token inválido");
      }

      // Token válido - retornar dados do gerente
      return ResponseUtil.sucesso(
        res,
        {
          id: gerente.id,
          nome: gerente.nome,
          email: gerente.email,
        },
        "Token válido"
      );
    } catch (error) {
      console.error("💥 [GerenteController] Erro ao verificar token:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }
}
