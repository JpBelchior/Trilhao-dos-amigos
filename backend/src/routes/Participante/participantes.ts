// src/routes/participantes.ts
import { Router } from "express";
import { ParticipanteController } from "../../controllers/ParticipanteController";

const router = Router();

// POST /api/participantes - Criar novo participante
router.post("/", ParticipanteController.criarParticipante);

// GET /api/participantes - Listar participantes com filtros
router.get("/", ParticipanteController.listarParticipantes);

// GET /api/participantes/:id - Buscar participante específico
router.get("/:id", ParticipanteController.buscarParticipante);

// PUT /api/participantes/:id/pagamento - Confirmar pagamento
router.put("/:id/pagamento", ParticipanteController.confirmarPagamento);

export default router;
