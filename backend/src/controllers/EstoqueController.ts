// backend/src/controllers/EstoqueController.ts
// ✅ REFATORADO PARA SEGUIR PRINCÍPIOS SOLID (SEM BaseValidator desnecessário)

import { Request, Response } from "express";
import { TamanhoCamiseta, TipoCamiseta } from "../types/models";

// Importações SOLID
import { EstoqueValidator } from "../validators/EstoqueValidator";
import { EstoqueService } from "../Service/EstoqueService";
import { ResponseUtil } from "../utils/responseUtil";

export class EstoqueController {
  /**
   * GET /api/estoque - Obter todo o estoque organizado
   */
  public static async obterEstoque(req: Request, res: Response): Promise<void> {
    try {
      console.log("📦 [EstoqueController] Solicitação de estoque completo");

      // 1. CHAMAR Service (sem validação necessária para GET simples)
      const resultado = await EstoqueService.obterEstoqueCompleto();

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
        "Estoque carregado com sucesso"
      );
    } catch (error) {
      console.error("💥 [EstoqueController] Erro ao obter estoque:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * GET /api/estoque/resumo - Resumo geral do estoque
   */
  public static async obterResumo(req: Request, res: Response): Promise<void> {
    try {
      console.log("📊 [EstoqueController] Solicitação de resumo do estoque");

      // 1. CHAMAR Service
      const resultado = await EstoqueService.obterResumoEstoque();

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
        "Resumo calculado com sucesso"
      );
    } catch (error) {
      console.error("💥 [EstoqueController] Erro ao obter resumo:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * GET /api/estoque/:tamanho/:tipo - Verificar disponibilidade específica
   */
  public static async verificarDisponibilidade(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { tamanho, tipo } = req.params;

      console.log(
        `🔍 [EstoqueController] Verificando disponibilidade: ${tipo} ${tamanho}`
      );

      // 1. VALIDAR parâmetros usando Validator
      const validacao = EstoqueValidator.validarParametrosEstoque({
        tamanho,
        tipo,
      });
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          "Parâmetros inválidos",
          validacao.detalhes
        );
      }

      // 2. CHAMAR Service
      const resultado = await EstoqueService.verificarDisponibilidade(
        tamanho as TamanhoCamiseta,
        tipo as TipoCamiseta
      );

      if (!resultado.sucesso) {
        return ResponseUtil.naoEncontrado(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      // 3. RETORNAR sucesso
      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        "Disponibilidade verificada"
      );
    } catch (error) {
      console.error(
        "💥 [EstoqueController] Erro ao verificar disponibilidade:",
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
   * PUT /api/estoque/:tamanho/:tipo - Atualizar estoque (admin)
   */
  public static async atualizarEstoque(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { tamanho, tipo } = req.params;
      const dadosAtualizacao = req.body;

      console.log(
        `📝 [EstoqueController] Atualizando estoque: ${tipo} ${tamanho}`,
        dadosAtualizacao
      );

      // 1. VALIDAR dados usando Validator
      const validacao = EstoqueValidator.validarAtualizacaoEstoque({
        tamanho,
        tipo,
        ...dadosAtualizacao,
      });
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          "Dados inválidos",
          validacao.detalhes
        );
      }

      // 2. CHAMAR Service
      const resultado = await EstoqueService.atualizarEstoque(
        tamanho as TamanhoCamiseta,
        tipo as TipoCamiseta,
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
        "Estoque atualizado com sucesso"
      );
    } catch (error) {
      console.error("💥 [EstoqueController] Erro ao atualizar estoque:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * POST /api/estoque/sincronizar - Sincronizar todo estoque com dados reais
   */
  public static async sincronizarEstoque(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log("🔄 [EstoqueController] Sincronização solicitada");

      // 1. CHAMAR Service (sem validação necessária)
      const resultado = await EstoqueService.sincronizarEstoque();

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
        "Estoque sincronizado com sucesso"
      );
    } catch (error) {
      console.error(
        "💥 [EstoqueController] Erro ao sincronizar estoque:",
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
