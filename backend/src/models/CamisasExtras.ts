// src/models/CamisetaExtra.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { ICamisetaExtra, TamanhoCamiseta, TipoCamiseta } from "../types/models";

// Campos opcionais na criação
interface CamisetaExtraCreationAttributes
  extends Optional<ICamisetaExtra, "id"> {}

class CamisetaExtra
  extends Model<ICamisetaExtra, CamisetaExtraCreationAttributes>
  implements ICamisetaExtra
{
  public id!: number;
  public participanteId!: number;
  public tamanho!: TamanhoCamiseta;
  public tipo!: TipoCamiseta;
  public preco!: number;

  // Timestamps automáticos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Definição da tabela
CamisetaExtra.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    participanteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "participantes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE", // Se deletar participante, deleta suas camisetas extras
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

    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 50.0, // R$ 50,00 por camiseta extra
      validate: {
        min: { args: [0], msg: "Preço não pode ser negativo" },
      },
    },
  },
  {
    sequelize,
    tableName: "camisetas_extras",
    modelName: "CamisetaExtra",

    // Hooks - executam automaticamente
    hooks: {
      afterCreate: async (camisetaExtra: CamisetaExtra) => {
        // Atualizar valor total da inscrição do participante
        const Participante = (await import("./Participante")).default;
        const participante = await Participante.findByPk(
          camisetaExtra.participanteId
        );

        if (participante) {
          participante.valorInscricao += camisetaExtra.preco;
          await participante.save();
        }

        // Atualizar estoque (recalcular quantidade reservada)
        const EstoqueCamiseta = (await import("./EstoqueCamiseta")).default;
        const estoque = await EstoqueCamiseta.findOne({
          where: {
            tamanho: camisetaExtra.tamanho,
            tipo: camisetaExtra.tipo,
          },
        });

        if (estoque) {
          await estoque.atualizarReservadas();
        }
      },

      afterDestroy: async (camisetaExtra: CamisetaExtra) => {
        // Diminuir valor total da inscrição do participante
        const Participante = (await import("./Participante")).default;
        const participante = await Participante.findByPk(
          camisetaExtra.participanteId
        );

        if (participante) {
          participante.valorInscricao -= camisetaExtra.preco;
          await participante.save();
        }

        // Atualizar estoque (recalcular quantidade reservada)
        const EstoqueCamiseta = (await import("./EstoqueCamiseta")).default;
        const estoque = await EstoqueCamiseta.findOne({
          where: {
            tamanho: camisetaExtra.tamanho,
            tipo: camisetaExtra.tipo,
          },
        });

        if (estoque) {
          await estoque.atualizarReservadas();
        }
      },
    },
  }
);

export default CamisetaExtra;
