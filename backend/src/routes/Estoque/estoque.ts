// backend/src/routes/Estoque/estoque.ts
import { Router } from "express";
import { EstoqueController } from "../../controllers/EstoqueController";

const router = Router();

// GET /api/estoque - Obter todo o estoque organizado
router.get("/", EstoqueController.obterEstoque);

// GET /api/estoque/resumo - Resumo geral do estoque
router.get("/resumo", EstoqueController.obterResumo);

//  POST /api/estoque/sincronizar - Sincronizar todo estoque com dados reais
router.post("/sincronizar", EstoqueController.sincronizarEstoque);

// GET /api/estoque/:tamanho/:tipo - Verificar disponibilidade específica
router.get("/:tamanho/:tipo", EstoqueController.verificarDisponibilidade);

// PUT /api/estoque/:tamanho/:tipo - Atualizar estoque (admin)
router.put("/:tamanho/:tipo", EstoqueController.atualizarEstoque);

export default router;
