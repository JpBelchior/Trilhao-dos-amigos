import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { testConnection, syncDatabase } from "./config/db";
import apiRoutes from "./routes";
import edicaoRoutes from "./routes/Edicao/edicao";
import { apiLimiter } from "./middleware/rateLimiter";

// Importar modelos para garantir que sejam carregados
import "./models";

// Capturar erros não tratados
process.on("uncaughtException", (err) => {
  console.error("[FATAL] uncaughtException:", err.message, err.stack);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] unhandledRejection:", reason);
  process.exit(1);
});

// Carregar variáveis de ambiente
dotenv.config();

console.log("[BOOT] Variáveis carregadas. DB_HOST:", process.env.DB_HOST, "DB_NAME:", process.env.DB_NAME, "NODE_ENV:", process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 8000;

const uploadsDir = path.join(process.cwd(), "uploads");
const fotosDir = path.join(uploadsDir, "fotos");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Diretório uploads criado:", uploadsDir);
}

if (!fs.existsSync(fotosDir)) {
  fs.mkdirSync(fotosDir, { recursive: true });
  console.log("📸 Diretório fotos criado:", fotosDir);
}

// Middlewares
// ========================================
// CONFIGURAÇÃO DE SEGURANÇA COM HELMET
// ========================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

app.use("/api", edicaoRoutes);

const corsOptions = {
  // Origens permitidas (frontend)
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3001',
      'https://trilhaodosamigos.com',
      'https://www.trilhaodosamigos.com',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Permitir requisições sem origin (ex: Postman, apps mobile)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Verificar se a origin está na lista permitida
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(` [CORS] Origem bloqueada: ${origin}`);
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },

  // Permitir envio de credenciais (cookies, Authorization header)
  credentials: true,

  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  // Headers permitidos nas requisições
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],

  // Headers que o frontend pode acessar na resposta
  exposedHeaders: ['Content-Range', 'X-Content-Range'],

  // Tempo que o browser pode cachear a resposta do preflight (OPTIONS)
  maxAge: 600, // 10 minutos
};

app.use(cors(corsOptions));

app.use("/api", apiLimiter);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use("/api", apiRoutes);

// Servir frontend em produção
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(process.cwd(), "public");
  app.use(express.static(frontendDist));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// Rota de teste (só em desenvolvimento)
app.get("/", (req, res) => {
  res.json({
    message: "Backend Trilhão dos Amigos funcionando!",
    api: "/api",
    uploads: "/uploads", //  Informar endpoint de uploads
    timestamp: new Date().toISOString(),
  });
});


app.get("/reimportar-gpx", async (req, res) => {
  try {
    const { importarGPXdaPasta } = await import("./seeds/importarGPX");
    await importarGPXdaPasta();
    res.json({ sucesso: true, mensagem: "Trajeto GPX reimportado com sucesso!" });
  } catch (error) {
    res.status(500).json({ sucesso: false, erro: "Erro ao reimportar GPX" });
  }
});

app.get("/seed", async (req, res) => {
  try {
    console.log("\n ========================================");
    console.log("   INICIANDO SEEDS DE DESENVOLVIMENTO");
    console.log("========================================\n");

    // Importar seeds
    const { popularEstoque, popularCampeoes } = await import(
      "./seeds/EstoqueSeed"
    );
    const { popularParticipantes } = await import("./seeds/ParticipantesSeed");
    const { importarGPXdaPasta } = await import("./seeds/importarGPX");

    // Executar seeds na ordem correta
    await importarGPXdaPasta();      // 1. GPX
    await popularEstoque();          // 2. Estoque
    await popularCampeoes();         // 3. Campeões
    await popularParticipantes();    // 4. Participantes

    res.json({
      sucesso: true,
      mensagem: "Seeds executadas com sucesso!",
      seeds: {
        gpx: "Trajeto importado",
        estoque: " Estoque populado",
        campeoes: " Campeões criados",
        participantes: " Participantes criados"
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("\n Erro ao executar seeds:", error);
    
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao criar dados de exemplo",
      detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      timestamp: new Date().toISOString(),
    });
  }
});

// Inicializar servidor
const startServer = async () => {
  try {
    console.log("[BOOT] startServer() iniciado");
    console.log("[BOOT] Testando conexão com banco de dados...");
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error("[BOOT] FALHA na conexão com banco. Encerrando.");
      process.exit(1);
    }

    // Sincronizar banco (criar tabelas se não existirem)
    console.log("🔄 Sincronizando banco de dados...");
    await syncDatabase();
    console.log(" Sincronização concluída!");

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(" Servidor rodando na porta", PORT);
      console.log(" Acesse: http://localhost:" + PORT);
      console.log(" Teste do banco: http://localhost:" + PORT + "/test-db");
      console.log(` Uploads: http://localhost:${PORT}/uploads`);
      console.log(" Popule dados: http://localhost:" + PORT + "/seed");

      console.log(
        " Configurando verificação automática de participantes cancelados..."
      );

      setTimeout(async () => {
        console.log(" Executando primeira verificação de cancelados...");
        try {
          const { ParticipanteController } = await import(
            "./controllers/ParticipanteController"
          );
          await ParticipanteController.executarVerificacaoAutomatica();

          const { PedidoCamisetaAvulsaService } = await import(
            "./Service/PedidoCamisetaAvulsaService"
          );
          await PedidoCamisetaAvulsaService.cancelarPedidosExpirados();
        } catch (error) {
          console.error(" Erro na primeira verificação:", error);
        }
      }, 60 * 1000); // 1 minuto

      setInterval(async () => {
        try {
          const { ParticipanteController } = await import(
            "./controllers/ParticipanteController"
          );
          await ParticipanteController.executarVerificacaoAutomatica();

          const { PedidoCamisetaAvulsaService } = await import(
            "./Service/PedidoCamisetaAvulsaService"
          );
          await PedidoCamisetaAvulsaService.cancelarPedidosExpirados();
        } catch (error) {
          console.error(" Erro na verificação automática:", error);
        }
      }, 15 * 60 * 1000);

      console.log(
        " Verificação automática configurada para executar a cada 15 minutos"
      );
    });
  } catch (error) {
    console.error(" Erro ao iniciar servidor:", error);
    process.exit(1);
  }

  app.get("/setup-gerente", async (_req, res) => {
    try {
      console.log(" Verificando se já existe gerente...");

      const { Gerente } = await import("./models");

      // Verificar se já existe algum gerente
      const gerenteExistente = await Gerente.findOne();

      if (gerenteExistente) {
        res.json({
          success: false,
          message: "Já existe um gerente cadastrado no sistema",
          gerente: {
            nome: gerenteExistente.nome,
            email: gerenteExistente.email,
            criadoEm: gerenteExistente.createdAt,
          },
          instrucoes: "Use a rota POST /api/gerente/login para fazer login",
        });
        return;
      }

      // Se não existe, criar gerente padrão
      const gerente = await Gerente.criarGerente({
        nome: "Administrador Trilhão",
        email: "admin@trilhao.com",
        senha: "admin123",
      });

      res.json({
        success: true,
        message: "Gerente padrão criado com sucesso!",
        gerente: {
          id: gerente.id,
          nome: gerente.nome,
          email: gerente.email,
        },
        credenciais: {
          email: "admin@trilhao.com",
          senha: "admin123",
        },
        instrucoes: [
          "1. Use estas credenciais para fazer login em /api/gerente/login",
          "2. ALTERE A SENHA imediatamente após o primeiro login",
          "3. Esta rota será desabilitada após o primeiro gerente ser criado",
        ],
        proximosPasso:
          "Acesse o painel administrativo e altere suas credenciais",
      });

      console.log(" Gerente padrão criado com sucesso!");
    } catch (error) {
      console.error(" Erro ao criar gerente:", error);

      res.status(500).json({
        success: false,
        error: "Erro ao criar gerente padrão",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        solucao: "Verifique a conexão com o banco de dados e tente novamente",
      });
    }
  });
};

startServer();
