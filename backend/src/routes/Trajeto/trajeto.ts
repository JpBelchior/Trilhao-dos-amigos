
import { Router } from "express";
import multer from "multer";
import { TrajetoController } from "../../controllers/TrajetoController";

const router = Router();

// Configurar multer para aceitar GPX
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/gpx+xml" ||
      file.originalname.toLowerCase().endsWith(".gpx")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos GPX"));
    }
  },
});

// POST /api/trajeto/upload - Upload GPX
router.post("/upload", upload.single("gpx"), TrajetoController.uploadGPX);

// GET /api/trajeto/atual - Buscar trajeto ativo
router.get("/atual", TrajetoController.obterTrajetoAtual);

export default router;