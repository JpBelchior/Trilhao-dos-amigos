// backend/src/controllers/CamisetasExtrasController.ts
import { Response } from "express";
import type { AuthenticatedRequest } from "./GerenteController";
import { CamisetasExtrasService } from "../Service/CamisetasExtrasService";
import { ResponseUtil } from "../utils/responseUtil";

export class CamisetasExtrasController {
  /**
   * POST /api/participantes/:participanteId/camiseta-extra
   * Adicionar camiseta extra para participante
   */
  public static async adicionarCamisetaExtra(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { participanteId } = req.params;
      const { tamanho, tipo } = req.body;
      const gerente = req.gerente;

      console.log(
        `➕ [CamisetasExtrasController] Gerente ${gerente?.nome} adicionando camiseta extra para participante ${participanteId}`
      );

      // 1. VALIDAR dados básicos
      if (!tamanho || !tipo) {
        return ResponseUtil.erroValidacao(
          res,
          "Tamanho e tipo são obrigatórios"
        );
      }

      // 2. CHAMAR Service
      const resultado = await CamisetasExtrasService.adicionarCamisetaExtra(
        parseInt(participanteId),
        { tamanho, tipo }
      );

      if (!resultado.sucesso) {
        return ResponseUtil.erroValidacao(res, resultado.erro!);
      }

      // 3. RETORNAR sucesso
      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        "Camiseta extra adicionada com sucesso"
      );
    } catch (error) {
      console.error(
        "💥 [CamisetasExtrasController] Erro ao adicionar camiseta extra:",
        error
      );
      return ResponseUtil.erroInterno(
        res,
        "Erro ao adicionar camiseta extra",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * DELETE /api/camisetas-extras/:id
   * Remover camiseta extra específica
   */
  public static async removerCamisetaExtra(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const gerente = req.gerente;

      console.log(
        `🗑️ [CamisetasExtrasController] Gerente ${gerente?.nome} removendo camiseta extra ${id}`
      );

      // 1. CHAMAR Service
      const resultado = await CamisetasExtrasService.removerCamisetaExtra(
        parseInt(id)
      );

      if (!resultado.sucesso) {
        return ResponseUtil.naoEncontrado(res, resultado.erro!);
      }

      // 2. RETORNAR sucesso
      return ResponseUtil.sucesso(
        res,
        null,
        "Camiseta extra removida com sucesso"
      );
    } catch (error) {
      console.error(
        "💥 [CamisetasExtrasController] Erro ao remover camiseta extra:",
        error
      );
      return ResponseUtil.erroInterno(
        res,
        "Erro ao remover camiseta extra",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }
}
