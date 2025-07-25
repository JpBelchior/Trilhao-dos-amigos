// src/routes/Pagamento/pagamento.ts
import { Router } from "express";
import { PagamentoController } from "../../controllers/PagamentoController";

const router = Router();

// POST /api/pagamento/criar-pix - Criar pagamento PIX
router.post("/criar-pix", PagamentoController.criarPagamentoPix);

// GET /api/pagamento/status/:id - Consultar status do pagamento
router.get("/status/:id", PagamentoController.consultarStatusPagamento);

// POST /api/pagamento/webhook - Receber notificações do Mercado Pago
router.post("/webhook", PagamentoController.receberWebhook);

export default router;
