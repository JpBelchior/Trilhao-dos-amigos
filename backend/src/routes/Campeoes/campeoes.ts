// backend/src/routes/Campeoes/campeoes.ts
import { Router } from "express";
import { CampeoesController } from "../../controllers/CampeoesController";
import { verificarAutenticacao } from "../../middleware/authMiddleware";

const router = Router();

// GET /api/campeoes - Listar todos os campeões
router.get("/", CampeoesController.listarCampeoes);

// GET /api/campeoes/estatisticas - Estatísticas dos campeões
router.get("/estatisticas", CampeoesController.obterEstatisticas);

// GET /api/campeoes/melhor - Melhor resultado geral
router.get("/melhor", CampeoesController.obterMelhorResultado);

// GET /api/campeoes/categoria/:categoria - Listar por categoria (nacional/importada)
router.get("/categoria/:categoria", CampeoesController.listarPorCategoria);

// GET /api/campeoes/ano/:ano - Listar por ano
router.get("/ano/:ano", CampeoesController.listarPorAno);

// GET /api/campeoes/:id - Buscar campeão específico
router.get("/:id", CampeoesController.buscarCampeao);

// GET /api/campeoes/participantes-disponiveis - Listar participantes que podem virar campeões
router.get(
  "/participantes-disponiveis",
  verificarAutenticacao,
  CampeoesController.listarParticipantesDisponiveis
);

// POST /api/campeoes/criar-de-participante - Criar campeão a partir de participante
router.post(
  "/criar-de-participante",
  verificarAutenticacao,
  CampeoesController.criarCampeaoDeParticipante
);

// PUT /api/campeoes/:id/atualizar-resultado - Atualizar resultado do campeão
router.put(
  "/:id/atualizar-resultado",
  verificarAutenticacao,
  CampeoesController.atualizarResultado
);

// DELETE /api/campeoes/:id - Remover campeão
router.delete("/:id", verificarAutenticacao, CampeoesController.removerCampeao);

export default router;
