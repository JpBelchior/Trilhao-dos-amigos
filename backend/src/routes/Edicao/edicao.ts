import { Router } from "express";
import { obterEdicaoAtual } from "../../utils/CalcularEdição";

const router = Router();

router.get("/edicao-atual", (req, res) => {
  try {
    const edicaoAtual = obterEdicaoAtual();
    res.json({ sucesso: true, dados: edicaoAtual });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      erro: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
