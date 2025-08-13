// src/models/Participante.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import {
  IParticipante,
  CategoriaMoto,
  TamanhoCamiseta,
  TipoCamiseta,
  StatusPagamento,
  StatusEntrega,
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

  // ✅ CAMPOS DE ENTREGA
  public statusEntregaCamiseta!: StatusEntrega;
  public dataEntregaCamiseta?: Date;
  public entreguePor?: string;

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

    // ✅ CAMPO QUE ESTAVA FALTANDO
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

    // ✅ CAMPOS DE ENTREGA
    statusEntregaCamiseta: {
      type: DataTypes.ENUM(...Object.values(StatusEntrega)),
      allowNull: false,
      defaultValue: StatusEntrega.NAO_ENTREGUE,
      comment: "Status de entrega da camiseta grátis",
    },

    dataEntregaCamiseta: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Data/hora da entrega da camiseta grátis",
    },

    entreguePor: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Nome do organizador que entregou a camiseta",
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
        // ✅ CORREÇÃO: Gerar número único baseado no último número + 1
        let numeroTentativas = 0;
        const maxTentativas = 10;
        const ano = new Date().getFullYear();

        while (numeroTentativas < maxTentativas) {
          try {
            // Buscar o último número de inscrição do ano atual
            const ultimoParticipante = await Participante.findOne({
              where: {
                numeroInscricao: {
                  [require("sequelize").Op.like]: `TRI${ano}%`,
                },
              },
              order: [["numeroInscricao", "DESC"]],
              attributes: ["numeroInscricao"],
            });

            let proximoNumero = 1;

            if (ultimoParticipante && ultimoParticipante.numeroInscricao) {
              // Extrair número do último registro (ex: TRI2025050 -> 050)
              const numeroAtual = parseInt(
                ultimoParticipante.numeroInscricao.replace(`TRI${ano}`, "")
              );
              proximoNumero = numeroAtual + 1;
            }

            // Gerar novo número com padding
            const novoNumero = `TRI${ano}${String(proximoNumero).padStart(
              3,
              "0"
            )}`;

            // Verificar se já existe (proteção extra)
            const jaExiste = await Participante.findOne({
              where: { numeroInscricao: novoNumero },
            });

            if (!jaExiste) {
              participante.numeroInscricao = novoNumero;
              console.log(
                "🎫 Número de inscrição gerado:",
                participante.numeroInscricao
              );
              break;
            } else {
              console.log("⚠️ Número já existe, tentando próximo:", novoNumero);
              numeroTentativas++;
            }
          } catch (error) {
            console.error("❌ Erro ao gerar número de inscrição:", error);
            numeroTentativas++;
          }
        }

        // Se falhou em todas as tentativas, usar timestamp como fallback
        if (numeroTentativas >= maxTentativas) {
          const timestamp = Date.now().toString().slice(-6);
          participante.numeroInscricao = `TRI${ano}${timestamp}`;
          console.log(
            "🆘 Usando número de emergência:",
            participante.numeroInscricao
          );
        }

        // Calcular valor da inscrição dinamicamente
        if (!participante.valorInscricao) {
          participante.valorInscricao = 100.0;
        }
      },
    },
  }
);

export default Participante;
