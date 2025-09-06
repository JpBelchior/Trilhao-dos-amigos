import { Router } from "express";
import {
  FotoController,
  uploadMiddleware,
} from "../../controllers/FotosControllers";
import { verificarAutenticacao } from "../../middleware/authMiddleware";

const router = Router();

router.get("/galeria/:categoria", FotoController.listarPorCategoria);

router.use(verificarAutenticacao);

// Campos do formulário: titulo, descricao, stats, categoria, edicao, ano
router.post(
  "/upload",
  uploadMiddleware.array("fotos", 10),
  FotoController.uploadFoto
);

router.get("/", FotoController.listarFotos);

router.put("/:id", FotoController.editarFoto);

router.delete("/:id", FotoController.deletarFoto);

router.put("/:id/reordenar", FotoController.reordenarFoto);

export default router;
