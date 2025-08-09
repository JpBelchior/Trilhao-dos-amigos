// backend/src/routes/index.ts - VERSÃO ATUALIZADA
import { Router } from "express";
import estoqueRoutes from "./Estoque/estoque";
import participanteRoutes from "./Participante/participantes";
import pagamentoRoutes from "./Pagamento/pagamento";
import localizacaoRoutes from "./Localizacao/localizacao";
import gerenteRoutes from "./Gerente/gerente";

const router = Router();

// Rota de teste da API
router.get("/", (req, res) => {
  res.json({
    message: "API Trilhão dos Amigos",
    version: "1.0.0",
    endpoints: {
      estoque: "/api/estoque",
      participantes: "/api/participantes",
      pagamento: "/api/pagamento",
      localizacao: "/api/localizacao",
      gerente: "/api/gerente",
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

// Rotas de localização
router.use("/localizacao", localizacaoRoutes);

// Rotas do gerente
router.use("/gerente", gerenteRoutes);

export default router;
