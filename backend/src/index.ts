import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { testConnection, syncDatabase } from "./config/db";
import apiRoutes from "./routes";
import edicaoRoutes from "./routes/Edicao/edicao";

// Importar modelos para garantir que sejam carregados
import "./models";

// Carregar variáveis de ambiente
dotenv.config();

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
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // ✅ Permitir recursos cross-origin apenas
  })
);

app.use("/api", edicaoRoutes);

app.use(cors());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use("/api", apiRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.json({
    message: "Backend Trilhão dos Amigos funcionando!",
    api: "/api",
    uploads: "/uploads", //  Informar endpoint de uploads
    timestamp: new Date().toISOString(),
  });
});

// Popula estoque, campeões E participantes
app.get("/seed", async (req, res) => {
  try {
    const { popularEstoque, popularCampeoes } = await import(
      "./seeds/EstoqueSeed"
    );
    const { popularParticipantes } = await import("./seeds/ParticipantesSeed");

    await popularEstoque();
    await popularCampeoes();
    await popularParticipantes();
  } catch (error) {
    res.status(500).json({
      error: "Erro ao criar dados de exemplo",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// Rota para testar banco de dados
app.get("/test-db", async (req, res) => {
  try {
    const connected = await testConnection();
    res.json({
      database: connected ? "Conectado" : "Erro de conexão",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao testar banco",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco
    console.log("🔌 Testando conexão com banco de dados...");
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error(
        "❌ Falha na conexão com banco. Verifique as configurações."
      );
      process.exit(1);
    }

    // Sincronizar banco (criar tabelas) - apenas em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.log("🔄 Sincronizando banco de dados...");
      console.log(
        "📋 Modelos carregados:",
        Object.keys(require("./models/index").default)
      );
      await syncDatabase();
      console.log("✅ Sincronização concluída!");
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log("🚀 Servidor rodando na porta", PORT);
      console.log("📍 Acesse: http://localhost:" + PORT);
      console.log("🧪 Teste do banco: http://localhost:" + PORT + "/test-db");
      console.log(`📸 Uploads: http://localhost:${PORT}/uploads`);
      console.log("🌱 Popule dados: http://localhost:" + PORT + "/seed");

      console.log(
        "🔍 Configurando verificação automática de participantes cancelados..."
      );

      // Executar a primeira verificação após 1 minuto (para dar tempo do sistema inicializar)
      setTimeout(async () => {
        console.log("🔍 Executando primeira verificação de cancelados...");
        try {
          const { ParticipanteController } = await import(
            "./controllers/ParticipanteController"
          );
          await ParticipanteController.executarVerificacaoAutomatica();
        } catch (error) {
          console.error("❌ Erro na primeira verificação:", error);
        }
      }, 60 * 1000); // 1 minuto

      // Executar a cada 15 minutos
      setInterval(async () => {
        try {
          const { ParticipanteController } = await import(
            "./controllers/ParticipanteController"
          );
          await ParticipanteController.executarVerificacaoAutomatica();
        } catch (error) {
          console.error("❌ Erro na verificação automática:", error);
        }
      }, 15 * 60 * 1000); // 15 minutos

      console.log(
        "✅ Verificação automática configurada para executar a cada 15 minutos"
      );
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }

  app.get("/setup-gerente", async (req, res) => {
    try {
      console.log("🔧 [Setup] Verificando se já existe gerente...");

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
      console.log("👤 [Setup] Criando gerente padrão...");

      const gerente = await Gerente.criarGerente({
        nome: "Administrador Trilhão",
        email: "admin@trilhao.com",
        senha: "admin123", //  ALTERAR EM PRODUÇÃO
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

      console.log("✅ [Setup] Gerente padrão criado com sucesso!");
    } catch (error) {
      console.error("❌ [Setup] Erro ao criar gerente:", error);

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
