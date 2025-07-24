import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { testConnection, syncDatabase } from "./config/db";
import apiRoutes from "./routes";

// Importar modelos para garantir que sejam carregados
import "./models";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use("/api", apiRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.json({
    message: "Backend Trilhão dos Amigos funcionando!",
    api: "/api",
    timestamp: new Date().toISOString(),
  });
});

// Rota para popular dados de exemplo
app.get("/seed", async (req, res) => {
  try {
    const { popularEstoque, popularCampeoes } = await import(
      "./seeds/EstoqueSeed"
    );

    await popularEstoque();
    await popularCampeoes();

    res.json({
      success: true,
      message: "Dados de exemplo criados com sucesso!",
      timestamp: new Date().toISOString(),
    });
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
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
};

startServer();
