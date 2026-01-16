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
// ========================================
// CONFIGURAÇÃO DE SEGURANÇA COM HELMET
// ========================================
app.use(
  helmet({
    // Content Security Policy - Define quais recursos podem ser carregados
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Apenas recursos do próprio domínio por padrão
        scriptSrc: ["'self'"], // Scripts apenas do próprio domínio
        styleSrc: ["'self'", "'unsafe-inline'"], // Estilos (permite inline para Tailwind)
        imgSrc: ["'self'", "data:", "https:", "blob:"], // Imagens de qualquer HTTPS + data URIs
        fontSrc: ["'self'", "data:"], // Fontes
        connectSrc: ["'self'", "https://api.mercadopago.com"], // APIs permitidas
        frameSrc: ["'none'"], // Não permite iframes
        objectSrc: ["'none'"], // Não permite <object>, <embed>, <applet>
        upgradeInsecureRequests: [], // Força HTTPS em produção
      },
    },

    // Cross-Origin Resource Policy - Permite compartilhar recursos entre origens
    crossOriginResourcePolicy: { 
      policy: "cross-origin" 
    },

    // Cross-Origin Embedder Policy - Desabilitado para permitir uploads
    crossOriginEmbedderPolicy: false,

    // Cross-Origin Opener Policy - Isolamento de contexto de navegação
    crossOriginOpenerPolicy: { 
      policy: "same-origin-allow-popups" 
    },

    // DNS Prefetch Control - Controla DNS prefetching
    dnsPrefetchControl: { 
      allow: false 
    },

    // Frame Guard - Previne clickjacking
    frameguard: { 
      action: "deny" // Não permite que o site seja embutido em iframes
    },

    // Hide Powered By - Remove header X-Powered-By
    hidePoweredBy: true,

    // HSTS - Força HTTPS (apenas em produção)
    hsts: process.env.NODE_ENV === 'production' ? {
      maxAge: 31536000, // 1 ano em segundos
      includeSubDomains: true, // Aplica a subdomínios também
      preload: true, // Permite inclusão na lista de pré-carregamento dos browsers
    } : false, // Desabilitado em desenvolvimento

    // IE No Open - Previne IE de executar downloads não confiáveis
    ieNoOpen: true,

    // No Sniff - Previne MIME type sniffing
    noSniff: true,

    // Origin Agent Cluster - Isola documentos de mesma origem
    originAgentCluster: true,

    // Permitted Cross Domain Policies - Restringe Adobe Flash/PDF
    permittedCrossDomainPolicies: { 
      permittedPolicies: "none" 
    },

    // Referrer Policy - Controla informação enviada no header Referer
    referrerPolicy: { 
      policy: "strict-origin-when-cross-origin" 
    },

    // X-XSS-Protection - Proteção contra XSS (legado, mas ainda útil)
    xssFilter: true,
  })
);

app.use("/api", edicaoRoutes);

const corsOptions = {
  // Origens permitidas (frontend)
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:5173',      // Frontend em desenvolvimento (Vite)
      'http://localhost:3000',      // Frontend em desenvolvimento (React padrão)
      'http://127.0.0.1:3001',      // Alternativa localhost
      process.env.FRONTEND_URL,     // URL de produção (configurável no .env)
    ].filter(Boolean); // Remove undefined

    // Permitir requisições sem origin (ex: Postman, apps mobile)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Verificar se a origin está na lista permitida
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ [CORS] Origem bloqueada: ${origin}`);
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
