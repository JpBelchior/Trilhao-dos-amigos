// backend/src/validators/FotoValidator.ts
import { CategoriaFoto, StatusFoto } from "../models/Foto";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  detalhes?: string;
}

export class FotoValidator {
  // * Validar dados obrigatórios para upload

  public static validarDadosUpload(dados: any): ValidationResult {
    const errors: string[] = [];

    if (!dados.titulo?.trim()) {
      errors.push("Título é obrigatório");
    }

    if (!dados.categoria) {
      errors.push("Categoria é obrigatória");
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  // Validar categoria

  public static validarCategoria(categoria: string): ValidationResult {
    if (!Object.values(CategoriaFoto).includes(categoria as CategoriaFoto)) {
      return {
        isValid: false,
        errors: ["Categoria inválida"],
        detalhes: `Categorias válidas: ${Object.values(CategoriaFoto).join(
          ", "
        )}`,
      };
    }

    return { isValid: true, errors: [] };
  }

  // * Validar arquivos enviados

  public static validarArquivos(
    files: Express.Multer.File[]
  ): ValidationResult {
    const errors: string[] = [];

    if (!files || files.length === 0) {
      errors.push("Nenhuma foto foi enviada");
    }

    if (files && files.length > 10) {
      errors.push("Máximo de 10 fotos por upload");
    }

    // Validar cada arquivo
    if (files) {
      for (const file of files) {
        const tiposPermitidos = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];

        if (!tiposPermitidos.includes(file.mimetype)) {
          errors.push(
            `Arquivo ${file.originalname} tem tipo inválido. Use JPEG, PNG ou WebP`
          );
        }

        if (file.size > 10 * 1024 * 1024) {
          // 10MB
          errors.push(
            `Arquivo ${file.originalname} é muito grande. Máximo 10MB`
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  // * Validar dados para edição

  public static validarDadosEdicao(dados: any): ValidationResult {
    const errors: string[] = [];

    if (dados.titulo !== undefined && !dados.titulo.trim()) {
      errors.push("Título não pode ser vazio");
    }

    if (
      dados.categoria &&
      !Object.values(CategoriaFoto).includes(dados.categoria)
    ) {
      errors.push("Categoria inválida");
    }

    if (dados.status && !Object.values(StatusFoto).includes(dados.status)) {
      errors.push("Status inválido");
    }

    if (dados.ano && (dados.ano < 2020 || dados.ano > 2030)) {
      errors.push("Ano deve estar entre 2020 e 2030");
    }

    if (dados.ordem !== undefined && (isNaN(dados.ordem) || dados.ordem < 0)) {
      errors.push("Ordem deve ser um número maior ou igual a 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  /**
   * Validar categoria específica para edições anteriores
   */
  public static validarCategoriaEdicaoAnterior(
    categoria: string,
    edicao?: string
  ): ValidationResult {
    if (categoria === CategoriaFoto.EDICOES_ANTERIORES && !edicao?.trim()) {
      return {
        isValid: false,
        errors: ["Edição é obrigatória para categoria 'Edições Anteriores'"],
        detalhes: "Informe qual edição (ex: '8ª Edição')",
      };
    }

    return { isValid: true, errors: [] };
  }

  // * Validar título único por categoria (opcional)

  //* Validar dados completos para upload

  public static validarUploadCompleto(
    dados: any,
    files: Express.Multer.File[]
  ): ValidationResult {
    const errors: string[] = [];

    // Validar dados básicos
    const validacaoDados = this.validarDadosUpload(dados);
    if (!validacaoDados.isValid) {
      errors.push(...validacaoDados.errors);
    }

    // Validar categoria
    const validacaoCategoria = this.validarCategoria(dados.categoria);
    if (!validacaoCategoria.isValid) {
      errors.push(...validacaoCategoria.errors);
    }

    // Validar edição anterior se necessário
    const validacaoEdicao = this.validarCategoriaEdicaoAnterior(
      dados.categoria,
      dados.edicao
    );
    if (!validacaoEdicao.isValid) {
      errors.push(...validacaoEdicao.errors);
    }

    // Validar arquivos
    const validacaoArquivos = this.validarArquivos(files);
    if (!validacaoArquivos.isValid) {
      errors.push(...validacaoArquivos.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  /**
   * Validar nova ordem para reordenação
   */
  public static validarNovaOrdem(novaOrdem: any): ValidationResult {
    if (typeof novaOrdem !== "number") {
      return {
        isValid: false,
        errors: ["Nova ordem deve ser um número"],
        detalhes: "Envie um número inteiro válido",
      };
    }

    if (novaOrdem < 0) {
      return {
        isValid: false,
        errors: ["Nova ordem deve ser maior ou igual a 0"],
        detalhes: "Ordem não pode ser negativa",
      };
    }

    return { isValid: true, errors: [] };
  }
}
