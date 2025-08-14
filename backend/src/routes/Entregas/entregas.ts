// backend/src/routes/entrega.ts
import { Router } from "express";
import { EntregaController } from "../../controllers/EntregaController";
import authMiddleware from "../../middleware/authMiddleware";

const router = Router();

// Aplicar autenticação de gerente para todas as rotas
router.use(authMiddleware.verificarAutenticacao);

// PUT /api/entrega/participante/:id/camiseta-principal
router.put(
  "/participante/:id/camiseta-principal",
  EntregaController.toggleEntregaCamisetaPrincipal
);

// PUT /api/entrega/camiseta-extra/:id
router.put("/camiseta-extra/:id", EntregaController.toggleEntregaCamisetaExtra);

// GET /api/entrega/resumo
router.get("/resumo", EntregaController.obterResumoEntregas);

export default router;
