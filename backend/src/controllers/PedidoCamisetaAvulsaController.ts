// backend/src/controllers/PedidoCamisetaAvulsaController.ts
import { Request, Response } from "express";
import { PedidoCamisetaAvulsaService } from "../Service/PedidoCamisetaAvulsaService";
import { PagamentoService } from "../Service/pagamentoService";

export class PedidoCamisetaAvulsaController {
  // POST /api/pedido-camisa/criar
  public static async criarPedido(req: Request, res: Response): Promise<void> {
    try {
      const { nome, cpf, email, telefone, itens } = req.body;

      if (!nome || !cpf || !email || !telefone || !Array.isArray(itens) || itens.length === 0) {
        res.status(400).json({
          sucesso: false,
          erro: "Campos obrigatórios ausentes",
          detalhes: "nome, cpf, email, telefone e itens (array) são obrigatórios",
        });
        return;
      }

      const resultado = await PedidoCamisetaAvulsaService.criarPedido({
        nome,
        cpf,
        email,
        telefone,
        itens,
      });

      if (!resultado.sucesso) {
        res.status(400).json(resultado);
        return;
      }

      res.status(201).json(resultado);
    } catch (error) {
      console.error("❌ [PedidoAvulso] Erro ao criar pedido:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno ao criar pedido",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // POST /api/pedido-camisa/criar-pix
  public static async criarPix(req: Request, res: Response): Promise<void> {
    try {
      const { pedidoId } = req.body;

      if (!pedidoId) {
        res.status(400).json({ sucesso: false, erro: "pedidoId é obrigatório" });
        return;
      }

      const resultado = await PedidoCamisetaAvulsaService.criarPix(Number(pedidoId));

      if (!resultado.sucesso) {
        res.status(400).json(resultado);
        return;
      }

      res.json(resultado);
    } catch (error) {
      console.error("❌ [PedidoAvulso] Erro ao criar PIX:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro interno ao criar PIX",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // GET /api/pedido-camisa/status/:mercadoPagoId
  public static async consultarStatus(req: Request, res: Response): Promise<void> {
    try {
      const { mercadoPagoId } = req.params;

      const resultado = await PagamentoService.consultarStatus(mercadoPagoId);

      res.json(resultado);
    } catch (error) {
      console.error("❌ [PedidoAvulso] Erro ao consultar status:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro ao consultar status",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // GET /api/pedido-camisa/admin/lista (protegida)
  public static async listarParaAdmin(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await PedidoCamisetaAvulsaService.listarParaAdmin();
      res.json(resultado);
    } catch (error) {
      console.error("❌ [PedidoAvulso] Erro ao listar pedidos:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro ao listar pedidos",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // PUT /api/pedido-camisa/admin/item/:itemId/entrega (protegida)
  public static async toggleEntregaItem(req: Request, res: Response): Promise<void> {
    try {
      const itemId = Number(req.params.itemId);

      if (isNaN(itemId)) {
        res.status(400).json({ sucesso: false, erro: "ID inválido" });
        return;
      }

      const resultado = await PedidoCamisetaAvulsaService.toggleEntregaItem(itemId);

      if (!resultado.sucesso) {
        res.status(400).json(resultado);
        return;
      }

      res.json(resultado);
    } catch (error) {
      console.error("❌ [PedidoAvulso] Erro ao atualizar entrega:", error);
      res.status(500).json({
        sucesso: false,
        erro: "Erro ao atualizar entrega",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}
