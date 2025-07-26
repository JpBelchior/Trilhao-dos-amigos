// src/models/Participante.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import {
  IParticipante,
  CategoriaMoto,
  TamanhoCamiseta,
  TipoCamiseta,
  StatusPagamento,
} from "../types/models";

// Campos opcionais na criação (são gerados automaticamente)
interface ParticipanteCreationAttributes
  extends Optional<IParticipante, "id" | "numeroInscricao" | "dataInscricao"> {}

// Classe do modelo Participante
class Participante
  extends Model<IParticipante, ParticipanteCreationAttributes>
  implements IParticipante
{
  public id!: number;
  public numeroInscricao!: string;
  public nome!: string;
  public cpf!: string;
  public email!: string;
  public telefone!: string;
  public cidade!: string;
  public estado!: string;
  public modeloMoto!: string;
  public categoriaMoto!: CategoriaMoto;
  public tamanhoCamiseta!: TamanhoCamiseta;
  public tipoCamiseta!: TipoCamiseta;
  public valorInscricao!: number;
  public statusPagamento!: StatusPagamento;
  public dataInscricao!: Date;
  public observacoes?: string;

  // Timestamps automáticos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Definição da tabela e colunas
Participante.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    numeroInscricao: {
      type: DataTypes.STRING(20),
      allowNull: true, // Temporariamente permitir null para o hook funcionar
      unique: true,
    },

    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Nome é obrigatório" },
        len: { args: [2, 100], msg: "Nome deve ter entre 2 e 100 caracteres" },
      },
    },

    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: { name: "cpf", msg: "CPF já cadastrado" },
      validate: {
        notEmpty: { msg: "CPF é obrigatório" },
      },
    },

    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: { name: "email", msg: "Email já cadastrado" },
      validate: {
        isEmail: { msg: "Email inválido" },
      },
    },

    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Telefone é obrigatório" },
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

    tamanhoCamiseta: {
      type: DataTypes.ENUM(...Object.values(TamanhoCamiseta)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TamanhoCamiseta)],
          msg: "Tamanho deve ser PP, P, M, G ou GG",
        },
      },
    },

    tipoCamiseta: {
      type: DataTypes.ENUM(...Object.values(TipoCamiseta)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TipoCamiseta)],
          msg: "Tipo deve ser manga_curta ou manga_longa",
        },
      },
    },

    valorInscricao: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      // Não tem defaultValue - será calculado dinamicamente
    },

    statusPagamento: {
      type: DataTypes.ENUM(...Object.values(StatusPagamento)),
      allowNull: false,
      defaultValue: StatusPagamento.PENDENTE,
    },

    dataInscricao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "participantes",
    modelName: "Participante",

    // Hooks - executam automaticamente
    hooks: {
      beforeCreate: async (participante: Participante) => {
        // Gerar número de inscrição automático
        const count = await Participante.count();
        const ano = new Date().getFullYear();
        participante.numeroInscricao = `TRI${ano}${String(count + 1).padStart(
          3,
          "0"
        )}`;

        console.log(
          "🎫 Número de inscrição gerado:",
          participante.numeroInscricao
        );

        // Calcular valor da inscrição dinamicamente
        // Valor base: R$ 100 (inscrição + 1 camiseta grátis)
        // Camisetas extras: R$ 50 cada (será adicionado quando criar as extras)
        if (!participante.valorInscricao) {
          participante.valorInscricao = 100.0;
        }
      },
    },
  }
);

export default Participante;
