// backend/src/models/Gerente.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { IGerente } from "../types/models";
import bcrypt from "bcrypt";

// Campos opcionais na criação
interface GerenteCreationAttributes extends Optional<IGerente, "id"> {}

class Gerente
  extends Model<IGerente, GerenteCreationAttributes>
  implements IGerente
{
  public id!: number;
  public nome!: string;
  public email!: string;
  public senha!: string;

  // Timestamps automáticos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Método para verificar senha
  public async verificarSenha(senhaInput: string): Promise<boolean> {
    return await bcrypt.compare(senhaInput, this.senha);
  }

  // Método estático para hash da senha
  public static async hashSenha(senha: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(senha, saltRounds);
  }

  // Método estático para buscar por email
  public static async buscarPorEmail(email: string): Promise<Gerente | null> {
    return await Gerente.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  // Método estático para criar gerente com senha hash
  public static async criarGerente(dados: {
    nome: string;
    email: string;
    senha: string;
  }): Promise<Gerente> {
    const senhaHash = await this.hashSenha(dados.senha);

    return await Gerente.create({
      nome: dados.nome,
      email: dados.email.toLowerCase(),
      senha: senhaHash,
    });
  }
}

// Definição da tabela
Gerente.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Nome é obrigatório" },
        len: { args: [2, 100], msg: "Nome deve ter entre 2 e 100 caracteres" },
      },
    },

    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: { name: "email_gerente", msg: "Email já cadastrado" },
      validate: {
        isEmail: { msg: "Email inválido" },
        notEmpty: { msg: "Email é obrigatório" },
      },
      set(value: string) {
        // Sempre armazenar email em minúsculo
        this.setDataValue("email", value.toLowerCase());
      },
    },

    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Senha é obrigatória" },
        len: { args: [6, 255], msg: "Senha deve ter pelo menos 6 caracteres" },
      },
    },
  },
  {
    sequelize,
    tableName: "gerentes",
    modelName: "Gerente",

    // Índices para performance
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
    ],
  }
);

export default Gerente;
