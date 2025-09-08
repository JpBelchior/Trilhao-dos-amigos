// backend/src/routes/camisetasExtrasRoutes.ts
import { Router } from "express";
import { CamisetasExtrasController } from "../../controllers/CamisetasExtrasController";
import { verificarAutenticacao } from "../../middleware/authMiddleware";

const router = Router();

router.post(
  "/participantes/:participanteId/camiseta-extra",
  verificarAutenticacao,
  CamisetasExtrasController.adicionarCamisetaExtra
);

router.delete(
  "/:id",
  verificarAutenticacao,
  CamisetasExtrasController.removerCamisetaExtra
);

export default router;
