import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { ILote } from "../types/models";

// Campos opcionais na criação
interface LoteCreationAttributes extends Optional<ILote, "id"> {}

class Lote
  extends Model<ILote, LoteCreationAttributes>
  implements ILote
{
  public id!: number;
  public numero!: string;
  public dataInicio!: string;
  public dataFim!: string;
  public precoInscricao!: number;
  public precoCamisa!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lote.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    numero: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: "unique_lote_numero",
        msg: "Já existe um lote com este número",
      },
      validate: {
        notEmpty: { msg: "Número do lote não pode ser vazio" },
      },
    },

    dataInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: "Data de início inválida", args: true },
      },
    },

    dataFim: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: "Data de fim inválida", args: true },
        dataFimValida(value: string) {
          if (value < (this as any).dataInicio) {
            throw new Error("Data de fim deve ser igual ou posterior à data de início");
          }
        },
      },
    },

    precoInscricao: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: "Preço de inscrição não pode ser negativo" },
      },
    },

    precoCamisa: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: "Preço da camisa não pode ser negativo" },
      },
    },
  },
  {
    sequelize,
    tableName: "lotes",
    modelName: "Lote",
    timestamps: true,
  }
);

export default Lote;
