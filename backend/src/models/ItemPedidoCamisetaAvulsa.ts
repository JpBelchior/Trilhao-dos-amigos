import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import {
  IItemPedidoCamisetaAvulsa,
  TamanhoCamiseta,
  TipoCamiseta,
  StatusEntrega,
} from "../types/models";

interface ItemCreationAttributes
  extends Optional<IItemPedidoCamisetaAvulsa, "id"> {}

class ItemPedidoCamisetaAvulsa
  extends Model<IItemPedidoCamisetaAvulsa, ItemCreationAttributes>
  implements IItemPedidoCamisetaAvulsa
{
  public id!: number;
  public pedidoId!: number;
  public tamanho!: TamanhoCamiseta;
  public tipo!: TipoCamiseta;
  public quantidade!: number;
  public statusEntrega!: StatusEntrega;
  public dataEntrega?: Date;
  public entreguePor?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ItemPedidoCamisetaAvulsa.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    pedidoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "pedidos_camisetas_avulsas", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    tamanho: {
      type: DataTypes.ENUM(...Object.values(TamanhoCamiseta)),
      allowNull: false,
    },

    tipo: {
      type: DataTypes.ENUM(...Object.values(TipoCamiseta)),
      allowNull: false,
    },

    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: { args: [1], msg: "Quantidade mínima é 1" } },
    },

    statusEntrega: {
      type: DataTypes.ENUM(...Object.values(StatusEntrega)),
      allowNull: false,
      defaultValue: StatusEntrega.NAO_ENTREGUE,
    },

    dataEntrega: { type: DataTypes.DATE, allowNull: true },
    entreguePor: { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    sequelize,
    tableName: "itens_pedidos_camisetas_avulsas",
    modelName: "ItemPedidoCamisetaAvulsa",
  }
);

export default ItemPedidoCamisetaAvulsa;
