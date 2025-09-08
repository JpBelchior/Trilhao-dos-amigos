// backend/src/services/FotoService.ts
import fs from "fs";
import path from "path";
import Foto, { CategoriaFoto, StatusFoto } from "../models/Foto";
import { Op } from "sequelize";

export interface UploadFotoResult {
  sucesso: boolean;
  dados?: any[];
  erro?: string;
  detalhes?: string;
}

export interface EditarFotoResult {
  sucesso: boolean;
  dados?: any;
  erro?: string;
  detalhes?: string;
}

export interface DeletarFotoResult {
  sucesso: boolean;
  erro?: string;
  detalhes?: string;
}

export interface ListarFotosResult {
  sucesso: boolean;
  dados?: any;
  erro?: string;
  detalhes?: string;
}

export class FotoService {
  /**
   * Obter próxima ordem para uma categoria
   */
  private static async obterProximaOrdem(
    categoria: CategoriaFoto
  ): Promise<number> {
    const ultimaOrdem =
      ((await Foto.max("ordem", {
        where: { categoria },
      })) as number) || 0;

    return ultimaOrdem + 1;
  }

  /**
   * Criar diretório de upload se não existir
   */
  private static garantirDiretorioUpload(): string {
    const uploadDir = path.join(process.cwd(), "uploads", "fotos");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    return uploadDir;
  }

  /**
   * Processar upload de múltiplas fotos
   */
  public static async processarUpload(
    dados: any,
    files: Express.Multer.File[]
  ): Promise<UploadFotoResult> {
    try {
      console.log(" [FotoService] Processando upload:", {
        files: files.length,
        titulo: dados.titulo,
        categoria: dados.categoria,
      });

      const fotosUpload: Foto[] = [];
      const { titulo, descricao, stats, categoria, edicao, ano } = dados;

      // Garantir que diretório existe
      this.garantirDiretorioUpload();

      // Processar cada arquivo
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Obter próxima ordem para esta categoria
        const proximaOrdem = await this.obterProximaOrdem(categoria);

        // Criar registro no banco
        const novaFoto = await Foto.create({
          titulo: files.length > 1 ? `${titulo} (${i + 1})` : titulo,
          descricao: descricao || null,
          stats: stats || null,
          categoria,
          edicao:
            categoria === CategoriaFoto.EDICOES_ANTERIORES ? edicao : null,
          ano: ano ? parseInt(ano) : undefined,
          ordem: proximaOrdem + i,
          nomeArquivo: file.filename,
          caminhoArquivo: file.path,
          tipoArquivo: file.mimetype,
          status: StatusFoto.ATIVO,
        });

        fotosUpload.push(novaFoto);
      }

      console.log(
        `✅ [FotoService] ${fotosUpload.length} foto(s) processada(s)`
      );

      return {
        sucesso: true,
        dados: fotosUpload.map((foto) => ({
          id: foto.id,
          titulo: foto.titulo,
          categoria: foto.categoria,
          urlFoto: foto.urlFoto,
        })),
      };
    } catch (error) {
      console.error("💥 [FotoService] Erro no upload:", error);

      return {
        sucesso: false,
        erro: "Erro ao processar upload",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Listar fotos com filtros e paginação
   */
  public static async listarFotos(
    filtros: any = {},
    paginacao: { page?: number; limit?: number } = {}
  ): Promise<ListarFotosResult> {
    try {
      console.log("📋 [FotoService] Listando fotos com filtros:", filtros);

      const where: any = {};

      // Aplicar filtros
      if (filtros.categoria) {
        where.categoria = filtros.categoria;
      }

      if (filtros.status) {
        where.status = filtros.status;
      } else {
        // Por padrão, mostrar apenas fotos ativas
        where.status = StatusFoto.ATIVO;
      }

      if (filtros.ano) {
        where.ano = filtros.ano;
      }

      if (filtros.edicao) {
        where.edicao = { [Op.iLike]: `%${filtros.edicao}%` };
      }

      // Configurar paginação
      const page = Math.max(1, paginacao.page || 1);
      const limit = Math.min(50, Math.max(1, paginacao.limit || 20));
      const offset = (page - 1) * limit;

      // Buscar fotos
      const { count, rows: fotos } = await Foto.findAndCountAll({
        where,
        order: [
          ["ordem", "ASC"],
          ["createdAt", "DESC"],
        ],
        limit,
        offset,
      });

      return {
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
            tipoArquivo: foto.tipoArquivo,
            createdAt: foto.createdAt,
          })),
          paginacao: {
            paginaAtual: page,
            totalPaginas: Math.ceil(count / limit),
            totalItens: count,
            itensPorPagina: limit,
          },
        },
      };
    } catch (error) {
      console.error("💥 [FotoService] Erro ao listar fotos:", error);

      return {
        sucesso: false,
        erro: "Erro ao listar fotos",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Listar fotos por categoria (para galeria pública)
   */
  public static async listarPorCategoria(
    categoria: CategoriaFoto
  ): Promise<ListarFotosResult> {
    try {
      console.log(" [FotoService] Listando fotos da categoria:", categoria);

      const fotos = await Foto.findAll({
        where: {
          categoria,
          status: StatusFoto.ATIVO,
        },
        order: [
          ["ordem", "ASC"],
          ["createdAt", "DESC"],
        ],
      });

      return {
        sucesso: true,
        dados: {
          categoria,
          fotos: fotos.map((foto) => ({
            id: foto.id,
            titulo: foto.titulo,
            descricao: foto.descricao,
            stats: foto.stats,
            edicao: foto.edicao,
            ano: foto.ano,
            urlFoto: foto.urlFoto,
          })),
          total: fotos.length,
        },
      };
    } catch (error) {
      console.error("💥 [FotoService] Erro ao listar por categoria:", error);

      return {
        sucesso: false,
        erro: "Erro ao listar fotos da categoria",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Buscar foto por ID
   */
  public static async buscarPorId(id: number): Promise<Foto | null> {
    try {
      return await Foto.findByPk(id);
    } catch (error) {
      console.error("💥 [FotoService] Erro ao buscar foto:", error);
      return null;
    }
  }

  /**
   * Editar dados da foto
   */
  public static async editarFoto(
    id: number,
    dadosAtualizacao: any
  ): Promise<EditarFotoResult> {
    try {
      console.log(`📝 [FotoService] Editando foto ${id}`);

      const foto = await this.buscarPorId(id);
      if (!foto) {
        return {
          sucesso: false,
          erro: "Foto não encontrada",
        };
      }

      // Preparar dados para atualização
      const dadosLimpos: any = {};

      if (dadosAtualizacao.titulo) dadosLimpos.titulo = dadosAtualizacao.titulo;
      if (dadosAtualizacao.descricao !== undefined)
        dadosLimpos.descricao = dadosAtualizacao.descricao;
      if (dadosAtualizacao.stats !== undefined)
        dadosLimpos.stats = dadosAtualizacao.stats;
      if (dadosAtualizacao.categoria)
        dadosLimpos.categoria = dadosAtualizacao.categoria;
      if (dadosAtualizacao.edicao !== undefined)
        dadosLimpos.edicao = dadosAtualizacao.edicao;
      if (dadosAtualizacao.ano)
        dadosLimpos.ano = parseInt(dadosAtualizacao.ano);
      if (dadosAtualizacao.ordem !== undefined)
        dadosLimpos.ordem = parseInt(dadosAtualizacao.ordem);
      if (dadosAtualizacao.status) dadosLimpos.status = dadosAtualizacao.status;

      // Atualizar foto
      await foto.update(dadosLimpos);

      console.log(`✅ [FotoService] Foto ${id} editada com sucesso`);

      return {
        sucesso: true,
        dados: {
          id: foto.id,
          titulo: foto.titulo,
          categoria: foto.categoria,
          urlFoto: foto.urlFoto,
        },
      };
    } catch (error) {
      console.error("💥 [FotoService] Erro ao editar foto:", error);

      return {
        sucesso: false,
        erro: "Erro ao editar foto",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Deletar foto (arquivo + registro)
   */
  public static async deletarFoto(id: number): Promise<DeletarFotoResult> {
    try {
      console.log(`🗑️ [FotoService] Deletando foto ${id}`);

      const foto = await this.buscarPorId(id);
      if (!foto) {
        return {
          sucesso: false,
          erro: "Foto não encontrada",
        };
      }

      // Tentar deletar arquivo físico
      try {
        if (fs.existsSync(foto.caminhoArquivo)) {
          fs.unlinkSync(foto.caminhoArquivo);
          console.log("📁 Arquivo físico deletado:", foto.nomeArquivo);
        }
      } catch (fileError) {
        console.warn("⚠️ Erro ao deletar arquivo físico:", fileError);
        // Continua mesmo se não conseguir deletar o arquivo
      }

      // Deletar registro do banco
      await foto.destroy();

      console.log(`✅ [FotoService] Foto ${id} deletada com sucesso`);

      return {
        sucesso: true,
      };
    } catch (error) {
      console.error("💥 [FotoService] Erro ao deletar foto:", error);

      return {
        sucesso: false,
        erro: "Erro ao deletar foto",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Reordenar foto
   */
  public static async reordenarFoto(
    id: number,
    novaOrdem: number
  ): Promise<EditarFotoResult> {
    try {
      console.log(
        `🔄 [FotoService] Reordenando foto ${id} para ordem ${novaOrdem}`
      );

      const foto = await this.buscarPorId(id);
      if (!foto) {
        return {
          sucesso: false,
          erro: "Foto não encontrada",
        };
      }

      await foto.update({ ordem: novaOrdem });

      console.log(`✅ [FotoService] Foto ${id} reordenada para ${novaOrdem}`);

      return {
        sucesso: true,
        dados: {
          id: foto.id,
          ordem: foto.ordem,
        },
      };
    } catch (error) {
      console.error("💥 [FotoService] Erro ao reordenar foto:", error);

      return {
        sucesso: false,
        erro: "Erro ao reordenar foto",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Limpar arquivos órfãos (arquivos sem registro no banco)
   */
  public static async limparArquivosOrfaos(): Promise<void> {
    try {
      console.log("🧹 [FotoService] Limpando arquivos órfãos...");

      const uploadDir = path.join(process.cwd(), "uploads", "fotos");

      if (!fs.existsSync(uploadDir)) {
        return;
      }

      const arquivos = fs.readdirSync(uploadDir);
      const fotosNoBanco = await Foto.findAll({
        attributes: ["nomeArquivo"],
      });

      const nomesArquivosNoBanco = new Set(
        fotosNoBanco.map((f) => f.nomeArquivo)
      );

      for (const arquivo of arquivos) {
        if (!nomesArquivosNoBanco.has(arquivo)) {
          const caminhoArquivo = path.join(uploadDir, arquivo);
          try {
            fs.unlinkSync(caminhoArquivo);
            console.log("🗑️ Arquivo órfão deletado:", arquivo);
          } catch (error) {
            console.warn("⚠️ Erro ao deletar arquivo órfão:", arquivo, error);
          }
        }
      }

      console.log("✅ [FotoService] Limpeza de arquivos órfãos concluída");
    } catch (error) {
      console.error("💥 [FotoService] Erro na limpeza:", error);
    }
  }
}
