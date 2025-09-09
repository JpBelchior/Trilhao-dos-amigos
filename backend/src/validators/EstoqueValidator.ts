import { TamanhoCamiseta, TipoCamiseta } from "../types/models";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  detalhes?: string;
}

export class EstoqueValidator {
  /**
   * Validar parâmetros para buscar estoque específico (/:tamanho/:tipo)
   */
  public static validarParametrosEstoque(dados: {
    tamanho: any;
    tipo: any;
  }): ValidationResult {
    const errors: string[] = [];

    // Validar tamanho
    if (!dados.tamanho) {
      errors.push("Tamanho da camiseta é obrigatório");
    } else if (!Object.values(TamanhoCamiseta).includes(dados.tamanho)) {
      errors.push("Tamanho da camiseta inválido");
    }

    // Validar tipo
    if (!dados.tipo) {
      errors.push("Tipo da camiseta é obrigatório");
    } else if (!Object.values(TipoCamiseta).includes(dados.tipo)) {
      errors.push("Tipo da camiseta inválido");
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes:
        errors.length > 0
          ? `Valores válidos: Tamanhos: ${Object.values(TamanhoCamiseta).join(
              ", "
            )}. Tipos: ${Object.values(TipoCamiseta).join(", ")}`
          : undefined,
    };
  }

  /**
   * Validar dados para atualização de estoque
   */
  public static validarAtualizacaoEstoque(dados: {
    tamanho: any;
    tipo: any;
    quantidadeTotal?: any;
    quantidadeReservada?: any;
  }): ValidationResult {
    const errors: string[] = [];

    // Validar tamanho e tipo (obrigatórios)
    if (
      !dados.tamanho ||
      !Object.values(TamanhoCamiseta).includes(dados.tamanho)
    ) {
      errors.push("Tamanho da camiseta inválido");
    }

    if (!dados.tipo || !Object.values(TipoCamiseta).includes(dados.tipo)) {
      errors.push("Tipo da camiseta inválido");
    }

    // Validar quantidades se fornecidas
    if (dados.quantidadeTotal !== undefined) {
      const total = parseInt(dados.quantidadeTotal);
      if (isNaN(total) || total < 0) {
        errors.push("Quantidade total deve ser um número maior ou igual a 0");
      } else if (total > 10000) {
        errors.push("Quantidade total não pode exceder 10.000");
      }
    }

    if (dados.quantidadeReservada !== undefined) {
      const reservada = parseInt(dados.quantidadeReservada);
      if (isNaN(reservada) || reservada < 0) {
        errors.push(
          "Quantidade reservada deve ser um número maior ou igual a 0"
        );
      }
    }

    // Validar lógica de negócio: reservada não pode ser maior que total
    if (
      dados.quantidadeTotal !== undefined &&
      dados.quantidadeReservada !== undefined
    ) {
      const total = parseInt(dados.quantidadeTotal);
      const reservada = parseInt(dados.quantidadeReservada);

      if (!isNaN(total) && !isNaN(reservada) && reservada > total) {
        errors.push(
          `Quantidade reservada (${reservada}) não pode ser maior que a quantidade total (${total})`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  /**
   * Validar se uma alteração de estoque é segura
   * (não vai deixar estoque negativo, etc.)
   */
  public static validarSegurancaEstoque(dados: {
    quantidadeTotalAtual: number;
    quantidadeReservadaAtual: number;
    novaQuantidadeTotal?: number;
    novaQuantidadeReservada?: number;
  }): ValidationResult {
    const errors: string[] = [];

    const totalFinal = dados.novaQuantidadeTotal ?? dados.quantidadeTotalAtual;
    const reservadaFinal =
      dados.novaQuantidadeReservada ?? dados.quantidadeReservadaAtual;

    // Verificar se não vai ficar negativo
    if (totalFinal < 0) {
      errors.push("Quantidade total não pode ser negativa");
    }

    if (reservadaFinal < 0) {
      errors.push("Quantidade reservada não pode ser negativa");
    }

    // Verificar se reservada não excede total
    if (reservadaFinal > totalFinal) {
      errors.push(
        `Quantidade reservada (${reservadaFinal}) não pode exceder total (${totalFinal})`
      );
    }

    // Verificar se há disponibilidade suficiente
    const disponivelFinal = totalFinal - reservadaFinal;
    if (disponivelFinal < 0) {
      errors.push(`Estoque ficaria negativo: ${disponivelFinal} disponível`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }
}
