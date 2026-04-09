import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { IPedidoCamisetaAvulsa, StatusPagamento } from "../types/models";

interface PedidoCreationAttributes extends Optional<IPedidoCamisetaAvulsa, "id"> {}

class PedidoCamisetaAvulsa
  extends Model<IPedidoCamisetaAvulsa, PedidoCreationAttributes>
  implements IPedidoCamisetaAvulsa
{
  public id!: number;
  public nome!: string;
  public cpf!: string;
  public email!: string;
  public telefone!: string;
  public valorTotal!: number;
  public participanteId?: number;
  public statusPagamento!: StatusPagamento;
  public mercadoPagoId?: string;
  public externalReference?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public get codigoReferencia(): string {
    return `AVU${String(this.id).padStart(3, "0")}`;
  }
}

PedidoCamisetaAvulsa.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: { msg: "Nome é obrigatório" } },
    },

    cpf: { type: DataTypes.STRING(14), allowNull: false },

    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { isEmail: { msg: "Email inválido" } },
    },

    telefone: { type: DataTypes.STRING(20), allowNull: false },

    valorTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: { args: [0], msg: "Valor não pode ser negativo" } },
    },

    participanteId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "participantes", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    statusPagamento: {
      type: DataTypes.ENUM(...Object.values(StatusPagamento)),
      allowNull: false,
      defaultValue: StatusPagamento.PENDENTE,
    },

    mercadoPagoId: { type: DataTypes.STRING(100), allowNull: true },

    externalReference: {
      type: DataTypes.STRING(200),
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "pedidos_camisetas_avulsas",
    modelName: "PedidoCamisetaAvulsa",
  }
);

export default PedidoCamisetaAvulsa;
