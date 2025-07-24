// src/models/EstoqueCamiseta.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import {
  IEstoqueCamiseta,
  TamanhoCamiseta,
  TipoCamiseta,
} from "../types/models";

// Campos opcionais na criação
interface EstoqueCamisetaCreationAttributes
  extends Optional<IEstoqueCamiseta, "id"> {}

class EstoqueCamiseta
  extends Model<IEstoqueCamiseta, EstoqueCamisetaCreationAttributes>
  implements IEstoqueCamiseta
{
  public id!: number;
  public tamanho!: TamanhoCamiseta;
  public tipo!: TipoCamiseta;
  public quantidadeTotal!: number;
  public quantidadeReservada!: number;

  // Campo virtual - calculado automaticamente
  public get quantidadeDisponivel(): number {
    return this.quantidadeTotal - this.quantidadeReservada;
  }

  // Timestamps automáticos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Método para calcular quantas camisetas estão reservadas
  public static async calcularReservadas(
    tamanho: TamanhoCamiseta,
    tipo: TipoCamiseta
  ): Promise<number> {
    const Participante = (await import("./Participante")).default;
    const CamisetaExtra = (await import("./CamisasExtras")).default;

    // Contar camisetas grátis (1 por participante)
    const camisetasGratis = await Participante.count({
      where: {
        tamanhoCamiseta: tamanho,
        tipoCamiseta: tipo,
      },
    });

    // Contar camisetas extras
    const camisetasExtras = await CamisetaExtra.count({
      where: {
        tamanho: tamanho,
        tipo: tipo,
      },
    });

    return camisetasGratis + camisetasExtras;
  }

  // Método para atualizar quantidade reservada
  public async atualizarReservadas(): Promise<void> {
    const totalReservadas = await EstoqueCamiseta.calcularReservadas(
      this.tamanho,
      this.tipo
    );
    this.quantidadeReservada = totalReservadas;
    await this.save();
  }
}

// Definição da tabela
EstoqueCamiseta.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    tamanho: {
      type: DataTypes.ENUM(...Object.values(TamanhoCamiseta)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TamanhoCamiseta)],
          msg: "Tamanho deve ser PP, P, M, G ou GG",
        },
      },
    },

    tipo: {
      type: DataTypes.ENUM(...Object.values(TipoCamiseta)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TipoCamiseta)],
          msg: "Tipo deve ser manga_curta ou manga_longa",
        },
      },
    },

    quantidadeTotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: "Quantidade total não pode ser negativa" },
      },
    },

    quantidadeReservada: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: "Quantidade reservada não pode ser negativa" },
        // Validação customizada: reservada não pode ser maior que total
        isValidReserva(this: EstoqueCamiseta, value: number) {
          if (value > this.quantidadeDisponivel) {
            throw new Error(
              "Quantidade reservada não pode ser maior que a disponível"
            );
          }
        },
      },
    },
  },
  {
    sequelize,
    tableName: "estoque_camisetas",
    modelName: "EstoqueCamiseta",

    // Índices para performance e unicidade
    indexes: [
      {
        unique: true,
        fields: ["tamanho", "tipo"], // Cada combinação tamanho+tipo é única
      },
    ],
  }
);

export default EstoqueCamiseta;
