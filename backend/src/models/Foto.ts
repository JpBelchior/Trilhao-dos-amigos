// backend/src/models/Foto.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from "sequelize";
import sequelize from "../config/db";

// 🏷️ Enum para as categorias de foto
export enum CategoriaFoto {
  EDICOES_ANTERIORES = "edicoes_anteriores",
  HALL_FAMA = "hall_fama",
  GALERIA_GERAL = "galeria_geral",
  EVENTO_ATUAL = "evento_atual",
}

// 📸 Enum para status da foto
export enum StatusFoto {
  ATIVO = "ativo",
  INATIVO = "inativo",
}

// 📋 Interface que define a estrutura de uma foto
export interface IFoto {
  id?: number;
  titulo: string;
  descricao?: string;
  stats?: string; // Ex: "100+ Pilotos • 25km • 4h de Duração"
  categoria: CategoriaFoto;
  edicao?: string; // Ex: "8ª Edição"
  ano?: number; // Ex: 2024
  ordem: number; // Para controlar ordem de exibição
  status: StatusFoto;
  nomeArquivo: string; // Nome único no servidor
  caminhoArquivo: string; // Caminho completo
  tipoArquivo: string; // Ex: "image/jpeg"
  createdAt?: Date;
  updatedAt?: Date;
}

// 🎯 Classe do modelo Foto
class Foto extends Model<InferAttributes<Foto>, InferCreationAttributes<Foto>> {
  declare id: CreationOptional<number>;
  declare titulo: string;
  declare descricao: CreationOptional<string>;
  declare stats: CreationOptional<string>;
  declare categoria: CategoriaFoto;
  declare edicao: CreationOptional<string>;
  declare ano: CreationOptional<number>;
  declare ordem: number;
  declare status: StatusFoto;
  declare nomeArquivo: string;
  declare caminhoArquivo: string;
  declare tipoArquivo: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // 🔗 Getter para URL pública da foto
  get urlFoto(): NonAttribute<string> {
    return `/uploads/fotos/${this.nomeArquivo}`;
  }
}

// 🏗️ Definição da estrutura da tabela no banco
Foto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Título é obrigatório" },
        len: {
          args: [1, 200],
          msg: "Título deve ter entre 1 e 200 caracteres",
        },
      },
    },

    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    stats: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment:
        "Estatísticas da edição (ex: '100+ Pilotos • 25km • 4h de Duração')",
    },

    categoria: {
      type: DataTypes.ENUM(...Object.values(CategoriaFoto)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(CategoriaFoto)],
          msg: "Categoria inválida",
        },
      },
    },

    edicao: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment:
        "Ex: '8ª Edição', usado principalmente para categoria edicoes_anteriores",
    },

    ano: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: { args: [2020], msg: "Ano deve ser maior que 2020" },
        max: { args: [2030], msg: "Ano deve ser menor que 2030" },
      },
    },

    ordem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Ordem de exibição (menor número = aparece primeiro)",
    },

    status: {
      type: DataTypes.ENUM(...Object.values(StatusFoto)),
      allowNull: false,
      defaultValue: StatusFoto.ATIVO,
    },

    nomeArquivo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: "Nome único do arquivo no servidor (ex: foto_1234567890.jpg)",
    },

    caminhoArquivo: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "Caminho completo do arquivo no sistema de arquivos",
    },

    tipoArquivo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: {
          args: [["image/jpeg", "image/jpg", "image/png", "image/webp"]],
          msg: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP",
        },
      },
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "fotos",
    modelName: "Foto",

    // 📈 Índices para otimizar consultas
    indexes: [
      {
        fields: ["categoria"], // Buscar por categoria
      },
      {
        fields: ["status"], // Buscar apenas fotos ativas
      },
      {
        fields: ["ano"], // Buscar por ano
      },
      {
        fields: ["ordem"], // Ordenar por ordem
      },
      {
        fields: ["categoria", "status", "ordem"], // Consulta otimizada principal
      },
    ],
  }
);

export default Foto;
