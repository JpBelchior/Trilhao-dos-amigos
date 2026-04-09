// backend/src/routes/PedidoCamisetaAvulsa/pedidoCamisetaAvulsaRoutes.ts
import { Router } from "express";
import { PedidoCamisetaAvulsaController } from "../../controllers/PedidoCamisetaAvulsaController";
import { verificarAutenticacao } from "../../middleware/authMiddleware";
import { paymentLimiter } from "../../middleware/rateLimiter";

const router = Router();

// Rotas públicas
router.post("/criar", PedidoCamisetaAvulsaController.criarPedido);
router.post("/criar-pix", paymentLimiter, PedidoCamisetaAvulsaController.criarPix);
router.get("/status/:mercadoPagoId", PedidoCamisetaAvulsaController.consultarStatus);

// Rotas protegidas (admin)
router.get("/admin/lista", verificarAutenticacao, PedidoCamisetaAvulsaController.listarParaAdmin);
router.put("/admin/item/:itemId/entrega", verificarAutenticacao, PedidoCamisetaAvulsaController.toggleEntregaItem);

export default router;
