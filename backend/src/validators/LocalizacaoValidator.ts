export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  detalhes?: string;
}

export class LocalizacaoValidator {
  /**
   * Validar parâmetro de estado
   */
  public static validarEstado(estado: any): ValidationResult {
    if (!estado) {
      return {
        isValid: false,
        errors: ["Estado é obrigatório"],
        detalhes: "Parâmetro 'estado' deve ser fornecido",
      };
    }

    if (typeof estado !== "string") {
      return {
        isValid: false,
        errors: ["Estado deve ser uma string"],
        detalhes: "Formato de estado inválido",
      };
    }

    const estadoLimpo = estado.trim();
    if (estadoLimpo.length === 0) {
      return {
        isValid: false,
        errors: ["Estado não pode ser vazio"],
        detalhes: "Estado deve conter pelo menos 1 caractere",
      };
    }

    return { isValid: true, errors: [] };
  }
  /**
   * Validar parâmetros para busca de cidades
   */
  public static validarBuscaCidades(dados: {
    nome?: any;
    estado?: any;
  }): ValidationResult {
    const errors: string[] = [];

    // Nome é obrigatório para busca
    if (!dados.nome || typeof dados.nome !== "string") {
      errors.push("Nome da cidade é obrigatório");
    } else if (dados.nome.trim().length === 0) {
      errors.push("Nome da cidade não pode ser vazio");
    }

    // Estado é opcional para busca, mas se fornecido deve ser válido
    if (dados.estado && typeof dados.estado !== "string") {
      errors.push("Estado deve ser uma string");
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes:
        errors.length > 0 ? "Parâmetro 'nome' deve ser fornecido" : undefined,
    };
  }

  /**
   * Validar dados para validação de localização
   */
  public static validarDadosLocalizacao(dados: {
    estado?: any;
    cidade?: any;
  }): ValidationResult {
    const errors: string[] = [];

    // Estado obrigatório
    if (!dados.estado) {
      errors.push("Estado é obrigatório");
    } else if (
      typeof dados.estado !== "string" ||
      dados.estado.trim().length === 0
    ) {
      errors.push("Estado deve ser uma string não vazia");
    }

    // Cidade obrigatória
    if (!dados.cidade) {
      errors.push("Cidade é obrigatória");
    } else if (
      typeof dados.cidade !== "string" ||
      dados.cidade.trim().length === 0
    ) {
      errors.push("Cidade deve ser uma string não vazia");
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes:
        errors.length > 0 ? "Ambos os campos devem ser fornecidos" : undefined,
    };
  }
}
