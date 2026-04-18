import { Router } from "express";
import { LoteController } from "../../controllers/LoteController";
import { verificarAutenticacao } from "../../middleware/authMiddleware";

const router = Router();

// Rotas PÚBLICAS (sem autenticação) — usadas pelo frontend para exibir preços
router.get("/precos", LoteController.getPrecos);
router.get("/ativo", LoteController.getLoteAtivo);

// Rotas PROTEGIDAS — CRUD completo para o gerente
router.get("/", verificarAutenticacao, LoteController.listar);
router.get("/:id", verificarAutenticacao, LoteController.buscar);
router.post("/", verificarAutenticacao, LoteController.criar);
router.put("/:id", verificarAutenticacao, LoteController.atualizar);
router.delete("/:id", verificarAutenticacao, LoteController.deletar);

export default router;
