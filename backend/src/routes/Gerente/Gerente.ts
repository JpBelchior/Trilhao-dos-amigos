// backend/src/routes/Gerente/gerente.ts
import { Router } from "express";
import { GerenteController } from "../../controllers/GerenteController";
import { verificarAutenticacao } from "../../middleware/authMiddleware";

const router = Router();

// ============ ROTAS PÚBLICAS (sem autenticação) ============

// POST /api/gerente/login - Fazer login
router.post("/login", GerenteController.login);

// POST /api/gerente/logout - Fazer logout (informativo)
router.post("/logout", GerenteController.logout);

// POST /api/gerente/criar - Criar primeiro gerente (apenas para setup)
// NOTA: Em produção, esta rota deveria ser protegida ou removida após setup inicial
router.post("/criar", GerenteController.criarGerente);

// GET /api/gerente/perfil - Obter dados do gerente logado
router.get("/perfil", verificarAutenticacao, GerenteController.obterPerfil);

// GET /api/gerente/verificar-token - Verificar se token ainda é válido
router.get(
  "/verificar-token",
  verificarAutenticacao,
  GerenteController.verificarToken
);

router.put("/perfil", verificarAutenticacao, GerenteController.atualizarPerfil);

export default router;
