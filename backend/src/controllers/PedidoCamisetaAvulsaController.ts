import { Request, Response } from "express";
import { PedidoCamisetaAvulsaService } from "../Service/PedidoCamisetaAvulsaService";
import { PagamentoService } from "../Service/pagamentoService";
import { ResponseUtil } from "../utils/responseUtil";

export class PedidoCamisetaAvulsaController {
  // POST /api/pedido-camisa/criar
  public static async criarPedido(req: Request, res: Response): Promise<void> {
    try {
      const { nome, cpf, email, telefone, itens } = req.body;

      if (!nome || !cpf || !email || !telefone || !Array.isArray(itens) || itens.length === 0) {
        return ResponseUtil.erroValidacao(
          res,
          "Campos obrigatórios ausentes",
          "nome, cpf, email, telefone e itens (array) são obrigatórios"
        );
      }

      const resultado = await PedidoCamisetaAvulsaService.criarPedido({ nome, cpf, email, telefone, itens });

      if (!resultado.sucesso) {
        return ResponseUtil.erroValidacao(res, resultado.erro!);
      }

      return ResponseUtil.criado(res, resultado.dados);
    } catch (error) {
      console.error("❌ [PedidoAvulso] Erro ao criar pedido:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro interno ao criar pedido",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  // POST /api/pedido-camisa/criar-pix
  public static async criarPix(req: Request, res: Response): Promise<void> {
    try {
      const { pedidoId } = req.body;

      if (!pedidoId) {
        return ResponseUtil.erroValidacao(res, "pedidoId é obrigatório");
      }

      const resultado = await PedidoCamisetaAvulsaService.criarPix(Number(pedidoId));

      if (!resultado.sucesso) {
        return ResponseUtil.erroValidacao(res, resultado.erro!);
      }

      return ResponseUtil.sucesso(res, resultado.dados);
    } catch (error) {
      console.error("❌ [PedidoAvulso] Erro ao criar PIX:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro interno ao criar PIX",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  // GET /api/pedido-camisa/status/:mercadoPagoId
  public static async consultarStatus(req: Request, res: Response): Promise<void> {
    try {
      const { mercadoPagoId } = req.params;

      const resultado = await PagamentoService.consultarStatus(mercadoPagoId);

      return ResponseUtil.sucesso(res, resultado);
    } catch (error) {
      console.error("❌ [PedidoAvulso] Erro ao consultar status:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro ao consultar status",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  // GET /api/pedido-camisa/admin/lista (protegida)
  public static async listarParaAdmin(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await PedidoCamisetaAvulsaService.listarParaAdmin();

      return ResponseUtil.sucesso(res, resultado.dados);
    } catch (error) {
      console.error("❌ [PedidoAvulso] Erro ao listar pedidos:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro ao listar pedidos",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  // PUT /api/pedido-camisa/admin/item/:itemId/entrega (protegida)
  public static async toggleEntregaItem(req: Request, res: Response): Promise<void> {
    try {
      const itemId = Number(req.params.itemId);

      if (isNaN(itemId)) {
        return ResponseUtil.erroValidacao(res, "ID inválido", "ID deve ser um número");
      }

      const resultado = await PedidoCamisetaAvulsaService.toggleEntregaItem(itemId);

      if (!resultado.sucesso) {
        return ResponseUtil.erroValidacao(res, resultado.erro!);
      }

      return ResponseUtil.sucesso(res, resultado.dados);
    } catch (error) {
      console.error("❌ [PedidoAvulso] Erro ao atualizar entrega:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro ao atualizar entrega",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }
}
