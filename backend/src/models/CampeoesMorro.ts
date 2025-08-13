// src/models/CampeaoBarranco.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { ICampeaoBarranco, CategoriaMoto } from "../types/models";

// Campos opcionais na criação
interface CampeaoBarrancoCreationAttributes
  extends Optional<ICampeaoBarranco, "id"> {}

class CampeaoBarranco
  extends Model<ICampeaoBarranco, CampeaoBarrancoCreationAttributes>
  implements ICampeaoBarranco
{
  public id!: number;
  public nome!: string;
  public edicao!: string;
  public ano!: number;
  public resultadoAltura!: number;
  public modeloMoto!: string;
  public categoriaMoto!: CategoriaMoto;
  public cidade!: string;
  public estado!: string;

  // Timestamps automáticos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Método para formatar resultado
  public get resultadoFormatado(): string {
    return `${this.resultadoAltura}m`;
  }

  // Método estático para buscar campeão atual (maior altura)
  public static async getCampeaoAtual(): Promise<CampeaoBarranco | null> {
    return await CampeaoBarranco.findOne({
      order: [["resultadoAltura", "DESC"]],
      limit: 1,
    });
  }

  // Método estático para buscar por categoria
  public static async getCampeoesPorCategoria(
    categoria: CategoriaMoto
  ): Promise<CampeaoBarranco[]> {
    return await CampeaoBarranco.findAll({
      where: { categoriaMoto: categoria },
      order: [["resultadoAltura", "DESC"]],
    });
  }
}

// Definição da tabela
CampeaoBarranco.init(
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

    edicao: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Edição é obrigatória" },
      },
    },

    ano: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [2020], msg: "Ano deve ser a partir de 2020" },
        max: {
          args: [new Date().getFullYear() + 1],
          msg: "Ano não pode ser futuro",
        },
      },
    },

    resultadoAltura: {
      type: DataTypes.DECIMAL(5, 2), // 999.99 metros (máximo)
      allowNull: false,
      validate: {
        min: { args: [0], msg: "Altura deve ser positiva" },
        max: { args: [999.99], msg: "Altura máxima é 999.99m" },
      },
    },

    modeloMoto: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Modelo da moto é obrigatório" },
      },
    },

    categoriaMoto: {
      type: DataTypes.ENUM(...Object.values(CategoriaMoto)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(CategoriaMoto)],
          msg: "Categoria deve ser nacional ou importada",
        },
      },
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Cidade é obrigatória" },
      },
    },
    estado: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Estado é obrigatório" },
      },
    },
  },
  {
    sequelize,
    tableName: "campeoes_barranco",
    modelName: "CampeaoBarranco",

    // Índices para performance
    indexes: [
      {
        fields: ["ano"],
      },
      {
        fields: ["resultado_altura"],
      },
      {
        fields: ["categoria_moto"],
      },
      {
        unique: true,
        fields: ["nome", "edicao"], // Evitar campeão duplicado na mesma edição
      },
    ],
  }
);

export default CampeaoBarranco;
