import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Trajeto extends Model {
  public id!: number;
  public nome!: string;
  public coordenadas!: string; 
  public totalPontos!: number;
  public distanciaKm!: number;
  public ganhoElevacao?: number;
  public ativo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Trajeto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    coordenadas: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    totalPontos: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    distanciaKm: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    ganhoElevacao: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "trajetos",
    modelName: "Trajeto",
  }
);

export default Trajeto;