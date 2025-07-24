// src/config/database.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Carrega as variáveis do arquivo .env
dotenv.config();

// Criação da conexão com o banco
const sequelize = new Sequelize({
  // Dados de conexão
  host: process.env.DB_HOST || "localhost",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "trilhao_db",
  dialect: "mysql",
  port: parseInt(process.env.DB_PORT || "3306"),

  // Configurações de performance
  pool: {
    max: 10, // Máximo 10 conexões simultâneas
    min: 0, // Mínimo 0 conexões
    acquire: 30000, // Tempo limite para pegar uma conexão (30s)
    idle: 10000, // Tempo para fechar conexão inativa (10s)
  },

  // Configurações gerais
  logging: process.env.NODE_ENV === "development" ? console.log : false, // Log apenas em desenvolvimento
  timezone: "-03:00", // Fuso horário do Brasil (Brasília)

  define: {
    charset: "utf8mb4", // Para emojis e caracteres especiais
    collate: "utf8mb4_unicode_ci",
    timestamps: true, // Cria created_at e updated_at automaticamente
    underscored: true, // Nomes de colunas em snake_case (created_at ao invés de createdAt)
    freezeTableName: true, // Não pluraliza nomes das tabelas
  },
});

// Função para testar se a conexão funciona
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexão com banco de dados estabelecida com sucesso.");
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco de dados:", error);
    return false;
  }
};

// Função para sincronizar o banco (criar tabelas)
export const syncDatabase = async (force: boolean = false): Promise<void> => {
  try {
    await sequelize.sync({ force }); // force: true apaga e recria as tabelas
    console.log("✅ Banco de dados sincronizado.");
  } catch (error) {
    console.error("❌ Erro ao sincronizar banco de dados:", error);
    throw error;
  }
};

export default sequelize;
