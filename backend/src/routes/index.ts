// backend/src/routes/index.ts - VERSÃO ATUALIZADA
import { Router } from "express";
import estoqueRoutes from "./Estoque/estoque";
import participanteRoutes from "./Participante/participantes";
import pagamentoRoutes from "./Pagamento/pagamento";
import localizacaoRoutes from "./Localizacao/localizacao";
import gerenteRoutes from "./Gerente/gerente";
import campeoesRoutes from "./Campeoes/campeoes";
import entregaRoutes from "./Entregas/entregas";
import fotoRoutes from "./Fotos/fotos";
import camisetasExtrasRoutes from "./CamisasExtras/camisetasExtrasRoutes";
import trajetoRoutes from "./Trajeto/trajeto"
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
      campeoes: "/api/campeoes",
      entrega: "/api/entrega",
      fotos: "/api/fotos",
      camisetasExtras: "/api/camisetas-extras",
      trajeto: "/api/trajeto",
    },
    timestamp: new Date().toISOString(),
  });
});

// Rotas de camisetas extras
router.use("/camisetas-extras", camisetasExtrasRoutes);

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

// Rotas dos campeões
router.use("/campeoes", campeoesRoutes);

//  Rotas de entrega
router.use("/entrega", entregaRoutes);

//  Rotas de fotos
router.use("/fotos", fotoRoutes);

// Rotas de trajeto
router.use("/trajeto", trajetoRoutes);


export default router;
