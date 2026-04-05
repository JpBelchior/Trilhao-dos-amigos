import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { AuthenticatedRequest } from "./GerenteController";
import { CategoriaFoto } from "../models/Foto";

import { FotoValidator } from "../validators/FotoValidator";
import { FotoService } from "../Service/fotoService";
import { ResponseUtil } from "../utils/responseUtil";

// Configuração do Multer (responsabilidade de configuração)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "fotos");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extensao = path.extname(file.originalname);
    const prefixo = file.mimetype.startsWith("video/") ? "video" : "foto";
    const nomeUnico = `${prefixo}_${timestamp}_${Math.random()
      .toString(36)
      .substring(2, 15)}${extensao}`;
    cb(null, nomeUnico);
  },
});

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
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/avi",
  ];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não suportado. Use JPEG, PNG, WebP, MP4, WebM ou MOV"));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB (comporta fotos e vídeos curtos)
  },
});

export class FotoController {
  /**
   * POST /api/fotos/upload - Upload de fotos
   */
  public static async uploadFoto(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const gerente = req.gerente;
      const files = req.files as Express.Multer.File[];
      const dados = req.body;

      console.log("📸 [FotoController] Upload solicitado por:", gerente?.nome);

      // 1. VALIDAR dados usando Validator
      const validacao = FotoValidator.validarUploadCompleto(dados, files);
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          "Dados inválidos",
          validacao.detalhes
        );
      }

      // 2. PROCESSAR upload usando Service
      const resultado = await FotoService.processarUpload(dados, files);

      if (!resultado.sucesso) {
        return ResponseUtil.erroInterno(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      console.log(
        `📸 [FotoController] ${resultado.dados?.length} foto(s) enviada(s) por ${gerente?.nome}`
      );

      // 3. RETORNAR sucesso
      return ResponseUtil.criado(
        res,
        resultado.dados,
        `${resultado.dados?.length} foto(s) enviada(s) com sucesso!`
      );
    } catch (error) {
      console.error("❌ [FotoController] Erro no upload:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro ao fazer upload da foto",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * GET /api/fotos - Listar fotos (admin)
   */
  public static async listarFotos(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { categoria, status, ano, edicao, page, limit } = req.query;

      console.log("📋 [FotoController] Listando fotos admin");

      // CHAMAR Service para listar
      const resultado = await FotoService.listarFotos(
        { categoria, status, ano, edicao },
        {
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
        }
      );

      if (!resultado.sucesso) {
        return ResponseUtil.erroInterno(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        `${resultado.dados?.fotos?.length || 0} fotos encontradas`
      );
    } catch (error) {
      console.error("❌ [FotoController] Erro ao listar fotos:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro ao listar fotos",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * GET /api/fotos/galeria/:categoria - Listar fotos por categoria (público)
   */
  public static async listarPorCategoria(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { categoria } = req.params;

      console.log("🖼️ [FotoController] Galeria pública categoria:", categoria);

      // 1. VALIDAR categoria usando Validator
      const validacao = FotoValidator.validarCategoria(categoria);
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          validacao.errors[0],
          validacao.detalhes
        );
      }

      // 2. LISTAR fotos usando Service
      const resultado = await FotoService.listarPorCategoria(
        categoria as CategoriaFoto
      );

      if (!resultado.sucesso) {
        return ResponseUtil.erroInterno(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        `${resultado.dados?.total || 0} fotos da categoria ${categoria}`
      );
    } catch (error) {
      console.error("❌ [FotoController] Erro na galeria:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro ao carregar galeria",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }
  /**
   * PUT /api/fotos/:id - Editar foto
   */
  public static async editarFoto(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;
      const gerente = req.gerente;

      console.log(
        `📝 [FotoController] Editando foto ${id} por ${gerente?.nome}`
      );

      // 1. VALIDAR dados usando Validator
      const validacao = FotoValidator.validarDadosEdicao(dadosAtualizacao);
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          validacao.errors[0],
          validacao.detalhes
        );
      }

      // 2. EDITAR foto usando Service
      const resultado = await FotoService.editarFoto(
        parseInt(id),
        dadosAtualizacao
      );

      if (!resultado.sucesso) {
        if (resultado.erro === "Foto não encontrada") {
          return ResponseUtil.naoEncontrado(res, resultado.erro);
        }
        return ResponseUtil.erroInterno(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        "Foto editada com sucesso!"
      );
    } catch (error) {
      console.error("❌ [FotoController] Erro ao editar foto:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro ao editar foto",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * DELETE /api/fotos/:id - Deletar foto
   */
  public static async deletarFoto(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const gerente = req.gerente;

      console.log(
        `🗑️ [FotoController] Deletando foto ${id} por ${gerente?.nome}`
      );

      // CHAMAR Service para deletar
      const resultado = await FotoService.deletarFoto(parseInt(id));

      if (!resultado.sucesso) {
        if (resultado.erro === "Foto não encontrada") {
          return ResponseUtil.naoEncontrado(res, resultado.erro);
        }
        return ResponseUtil.erroInterno(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      return ResponseUtil.sucesso(res, null, "Foto deletada com sucesso!");
    } catch (error) {
      console.error("❌ [FotoController] Erro ao deletar foto:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro ao deletar foto",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * PUT /api/fotos/:id/reordenar - Reordenar foto
   */
  public static async reordenarFoto(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { novaOrdem } = req.body;
      const gerente = req.gerente;

      console.log(
        `🔄 [FotoController] Reordenando foto ${id} por ${gerente?.nome}`
      );

      // 1. VALIDAR nova ordem usando Validator
      const validacao = FotoValidator.validarNovaOrdem(novaOrdem);
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          validacao.errors[0],
          validacao.detalhes
        );
      }

      // 2. REORDENAR usando Service
      const resultado = await FotoService.reordenarFoto(
        parseInt(id),
        novaOrdem
      );

      if (!resultado.sucesso) {
        if (resultado.erro === "Foto não encontrada") {
          return ResponseUtil.naoEncontrado(res, resultado.erro);
        }
        return ResponseUtil.erroInterno(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        "Ordem alterada com sucesso!"
      );
    } catch (error) {
      console.error("❌ [FotoController] Erro ao reordenar foto:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro ao reordenar foto",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }
}
