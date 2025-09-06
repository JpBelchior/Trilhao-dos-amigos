// backend/src/controllers/FotoController.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
import multer from "multer";
import path from "path";
import fs from "fs";
import Foto, { CategoriaFoto, StatusFoto } from "../models/Foto";
import { IApiResponse } from "../types/models";
import { AuthenticatedRequest } from "./GerenteController";

// 📁 Configuração do Multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "fotos");

    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extensao = path.extname(file.originalname);
    const nomeUnico = `foto_${timestamp}_${Math.random()
      .toString(36)
      .substring(2, 15)}${extensao}`;
    cb(null, nomeUnico);
  },
});

// 🔍 Filtro de tipos de arquivo permitidos
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const tiposPermitidos = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não suportado. Use JPEG, PNG ou WebP"));
  }
};

// 📤 Middleware de upload configurado
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
});

export class FotoController {
  // 📤 POST /api/fotos/upload - Fazer upload de fotos
  public static async uploadFoto(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const gerente = req.gerente;
      const files = req.files as Express.Multer.File[];

      // Extrair dados do corpo da requisição (vem como strings no FormData)
      const { titulo, descricao, stats, categoria, edicao, ano } = req.body;

      console.log("📸 [Upload] Dados recebidos:", {
        files: files?.length || 0,
        titulo,
        categoria,
        gerente: gerente?.nome,
      });

      // Validar se arquivo foi enviado
      if (!files || files.length === 0) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Nenhuma foto foi enviada",
        };
        res.status(400).json(response);
        return;
      }

      // Validar campos obrigatórios
      if (!titulo || !categoria) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Título e categoria são obrigatórios",
        };
        res.status(400).json(response);
        return;
      }

      // Validar categoria
      if (!Object.values(CategoriaFoto).includes(categoria)) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Categoria inválida",
          detalhes: `Categorias válidas: ${Object.values(CategoriaFoto).join(
            ", "
          )}`,
        };
        res.status(400).json(response);
        return;
      }

      const fotosUpload: Foto[] = [];

      // Processar cada arquivo enviado
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Obter próxima ordem para esta categoria
        const ultimaOrdem =
          ((await Foto.max("ordem", {
            where: { categoria },
          })) as number) || 0;

        const novaFoto = await Foto.create({
          titulo: files.length > 1 ? `${titulo} (${i + 1})` : titulo,
          descricao: descricao || null,
          stats: stats || null,
          categoria,
          edicao:
            categoria === CategoriaFoto.EDICOES_ANTERIORES ? edicao : null,
          ano: ano ? parseInt(ano) : undefined,
          ordem: ultimaOrdem + 1 + i,
          nomeArquivo: file.filename,
          caminhoArquivo: file.path,
          tipoArquivo: file.mimetype,
          status: StatusFoto.ATIVO,
        });

        fotosUpload.push(novaFoto);
      }

      console.log(
        `📸 [FotoController] ${fotosUpload.length} foto(s) enviada(s) por ${gerente?.nome}`
      );

      const response: IApiResponse = {
        sucesso: true,
        dados: fotosUpload.map((foto) => ({
          id: foto.id,
          titulo: foto.titulo,
          categoria: foto.categoria,
          urlFoto: foto.urlFoto,
        })),
        mensagem: `${fotosUpload.length} foto(s) enviada(s) com sucesso!`,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("❌ Erro ao fazer upload:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao fazer upload da foto",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // 📋 GET /api/fotos - Listar todas as fotos (para admin)
  public static async listarFotos(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { categoria, status, ano, limite, pagina } = req.query;

      // Construir filtros
      const filtros: any = {};

      if (categoria) {
        filtros.categoria = categoria;
      }

      if (status) {
        filtros.status = status;
      } else {
        // Por padrão, mostrar apenas fotos ativas
        filtros.status = StatusFoto.ATIVO;
      }

      if (ano) {
        filtros.ano = parseInt(ano as string);
      }

      // Paginação
      const limitePorPagina = parseInt(limite as string) || 20;
      const paginaAtual = parseInt(pagina as string) || 1;
      const offset = (paginaAtual - 1) * limitePorPagina;

      const { count, rows: fotos } = await Foto.findAndCountAll({
        where: filtros,
        order: [
          ["categoria", "ASC"],
          ["ordem", "ASC"],
          ["createdAt", "DESC"],
        ],
        limit: limitePorPagina,
        offset,
      });

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          fotos: fotos.map((foto) => ({
            id: foto.id,
            titulo: foto.titulo,
            descricao: foto.descricao,
            stats: foto.stats,
            categoria: foto.categoria,
            edicao: foto.edicao,
            ano: foto.ano,
            ordem: foto.ordem,
            status: foto.status,
            urlFoto: foto.urlFoto,
            createdAt: foto.createdAt,
          })),
          total: count,
          pagina: paginaAtual,
          totalPaginas: Math.ceil(count / limitePorPagina),
          limitePorPagina,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("❌ Erro ao listar fotos:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao listar fotos",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // 🌐 GET /api/fotos/galeria/:categoria - Listar fotos por categoria (para frontend público)
  public static async listarPorCategoria(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { categoria } = req.params;

      // Validar categoria
      if (!Object.values(CategoriaFoto).includes(categoria as CategoriaFoto)) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Categoria inválida",
        };
        res.status(400).json(response);
        return;
      }

      const fotos = await Foto.findAll({
        where: {
          categoria,
          status: StatusFoto.ATIVO,
        },
        order: [
          ["ordem", "ASC"],
          ["createdAt", "DESC"],
        ],
        attributes: [
          "id",
          "titulo",
          "descricao",
          "stats",
          "edicao",
          "ano",
          "nomeArquivo",
        ],
      });

      const response: IApiResponse = {
        sucesso: true,
        dados: fotos.map((foto) => ({
          id: foto.id,
          titulo: foto.titulo,
          descricao: foto.descricao,
          stats: foto.stats,
          edicao: foto.edicao,
          ano: foto.ano,
          urlFoto: foto.urlFoto,
        })),
      };

      res.json(response);
    } catch (error) {
      console.error("❌ Erro ao buscar fotos por categoria:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao buscar fotos",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // ✏️ PUT /api/fotos/:id - Editar dados da foto
  public static async editarFoto(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const {
        titulo,
        descricao,
        stats,
        categoria,
        edicao,
        ano,
        ordem,
        status,
      } = req.body;

      const foto = await Foto.findByPk(id);

      if (!foto) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Foto não encontrada",
        };
        res.status(404).json(response);
        return;
      }

      // Atualizar campos permitidos
      const dadosAtualizacao: any = {};

      if (titulo) dadosAtualizacao.titulo = titulo;
      if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
      if (stats !== undefined) dadosAtualizacao.stats = stats;
      if (categoria) dadosAtualizacao.categoria = categoria;
      if (edicao !== undefined) dadosAtualizacao.edicao = edicao;
      if (ano) dadosAtualizacao.ano = parseInt(ano);
      if (ordem !== undefined) dadosAtualizacao.ordem = parseInt(ordem);
      if (status) dadosAtualizacao.status = status;

      await foto.update(dadosAtualizacao);

      console.log(
        `📝 [FotoController] Foto ${id} editada por ${req.gerente?.nome}`
      );

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          id: foto.id,
          titulo: foto.titulo,
          categoria: foto.categoria,
          urlFoto: foto.urlFoto,
        },
        mensagem: "Foto editada com sucesso!",
      };

      res.json(response);
    } catch (error) {
      console.error("❌ Erro ao editar foto:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao editar foto",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // 🗑️ DELETE /api/fotos/:id - Deletar foto
  public static async deletarFoto(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const foto = await Foto.findByPk(id);

      if (!foto) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Foto não encontrada",
        };
        res.status(404).json(response);
        return;
      }

      // Deletar arquivo do sistema
      try {
        if (fs.existsSync(foto.caminhoArquivo)) {
          fs.unlinkSync(foto.caminhoArquivo);
        }
      } catch (fileError) {
        console.warn("⚠️ Erro ao deletar arquivo físico:", fileError);
      }

      // Deletar registro do banco
      await foto.destroy();

      console.log(
        `🗑️ [FotoController] Foto ${id} deletada por ${req.gerente?.nome}`
      );

      const response: IApiResponse = {
        sucesso: true,
        mensagem: "Foto deletada com sucesso!",
      };

      res.json(response);
    } catch (error) {
      console.error("❌ Erro ao deletar foto:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao deletar foto",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // 🔄 PUT /api/fotos/:id/reordenar - Alterar ordem de exibição
  public static async reordenarFoto(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { novaOrdem } = req.body;

      if (typeof novaOrdem !== "number") {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Nova ordem deve ser um número",
        };
        res.status(400).json(response);
        return;
      }

      const foto = await Foto.findByPk(id);

      if (!foto) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Foto não encontrada",
        };
        res.status(404).json(response);
        return;
      }

      await foto.update({ ordem: novaOrdem });

      const response: IApiResponse = {
        sucesso: true,
        mensagem: "Ordem alterada com sucesso!",
      };

      res.json(response);
    } catch (error) {
      console.error("❌ Erro ao reordenar foto:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao reordenar foto",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }
}
