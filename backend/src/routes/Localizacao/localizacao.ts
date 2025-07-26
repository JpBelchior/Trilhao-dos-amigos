import { Router } from "express";
import { LocalizacaoController } from "../../controllers/LocalizacaoController";

const router = Router();

// GET /api/localizacao/estados - Listar todos os estados
router.get("/estados", LocalizacaoController.listarEstados);

// GET /api/localizacao/cidades/:estado - Listar cidades por estado
router.get("/cidades/:estado", LocalizacaoController.listarCidadesPorEstado);

// GET /api/localizacao/buscar-cidades - Buscar cidades por nome
router.get("/buscar-cidades", LocalizacaoController.buscarCidades);

// POST /api/localizacao/validar - Validar estado e cidade
router.post("/validar", LocalizacaoController.validarLocalizacao);

export default router;
