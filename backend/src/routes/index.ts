// src/routes/index.ts
import { Router } from "express";
import estoqueRoutes from "./Estoque/estoque";
import participanteRoutes from "./Participante/participantes";
import pagamentoRoutes from "./Pagamento/pagamento";

const router = Router();

// Rota de teste da API
router.get("/", (req, res) => {
  res.json({
    message: "API Trilhão dos Amigos",
    version: "1.0.0",
    endpoints: {
      estoque: "/api/estoque",
      participantes: "/api/participantes",
      resumo: "/api/estoque/resumo",
      verificar: "/api/estoque/:tamanho/:tipo",
    },
    timestamp: new Date().toISOString(),
  });
});

// Rotas do estoque
router.use("/estoque", estoqueRoutes);

// Rotas dos participantes
router.use("/participantes", participanteRoutes);

// Rotas de pagamento
router.use("/pagamento", pagamentoRoutes);
export default router;
