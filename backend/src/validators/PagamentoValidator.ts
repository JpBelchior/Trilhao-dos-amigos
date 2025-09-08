// backend/src/validators/PagamentoValidator.ts
import { StatusPagamento } from "../types/models";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  detalhes?: string;
}

export class PagamentoValidator {
  /**
   * Validar dados para criação de PIX
   */
  public static validarCriacaoPix(dados: any): ValidationResult {
    const errors: string[] = [];

    // Validar participanteId
    if (!dados.participanteId) {
      errors.push("ID do participante é obrigatório");
    } else if (isNaN(parseInt(dados.participanteId))) {
      errors.push("ID do participante deve ser um número válido");
    }

    // Validar valorTotal
    if (!dados.valorTotal) {
      errors.push("Valor total é obrigatório");
    } else if (isNaN(parseFloat(dados.valorTotal))) {
      errors.push("Valor total deve ser um número válido");
    } else if (parseFloat(dados.valorTotal) <= 0) {
      errors.push("Valor total deve ser maior que zero");
    } else if (parseFloat(dados.valorTotal) > 10000) {
      errors.push("Valor total não pode exceder R$ 10.000");
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  /**
   * Validar external_reference do Mercado Pago
   */
  public static validarExternalReference(
    externalReference: string
  ): ValidationResult {
    if (!externalReference) {
      return {
        isValid: false,
        errors: ["External reference é obrigatório"],
        detalhes: "External reference é necessário para rastrear o pagamento",
      };
    }

    // Verificar formato: trilhao_NUMERO_TIMESTAMP
    const formatoValido = /^trilhao_[A-Z0-9]+_\d+$/.test(externalReference);

    if (!formatoValido) {
      return {
        isValid: false,
        errors: ["Formato de external reference inválido"],
        detalhes: "Formato esperado: trilhao_NUMERO_TIMESTAMP",
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Extrair número de inscrição do external_reference
   */
  public static extrairNumeroInscricao(
    externalReference: string
  ): string | null {
    const match = externalReference.match(/trilhao_([^_]+)_/);
    return match ? match[1] : null;
  }

  /**
   * Validar status de pagamento do Mercado Pago
   */
  public static validarStatusMercadoPago(status: string): ValidationResult {
    const statusPermitidos = [
      "pending", // Pendente
      "approved", // Aprovado
      "authorized", // Autorizado
      "in_process", // Em processamento
      "in_mediation", // Em mediação
      "rejected", // Rejeitado
      "cancelled", // Cancelado
      "refunded", // Reembolsado
      "charged_back", // Chargeback
    ];

    if (!status) {
      return {
        isValid: false,
        errors: ["Status do pagamento é obrigatório"],
        detalhes: "Status é necessário para processar o pagamento",
      };
    }

    if (!statusPermitidos.includes(status)) {
      return {
        isValid: false,
        errors: ["Status de pagamento inválido"],
        detalhes: `Status permitidos: ${statusPermitidos.join(", ")}`,
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Validar dados do webhook do Mercado Pago
   */
  public static validarWebhook(dados: any): ValidationResult {
    const errors: string[] = [];

    if (!dados.type) {
      errors.push("Tipo de notificação é obrigatório");
    }

    if (!dados.data) {
      errors.push("Dados da notificação são obrigatórios");
    } else {
      if (!dados.data.id) {
        errors.push("ID do pagamento é obrigatório nos dados da notificação");
      }
    }

    // Verificar se é uma notificação de pagamento
    if (dados.type && dados.type !== "payment") {
      return {
        isValid: false,
        errors: ["Tipo de notificação não suportado"],
        detalhes: `Tipo recebido: ${dados.type}. Apenas 'payment' é suportado.`,
      };
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  /**
   * Validar dados para simulação de status
   */
  public static validarSimulacaoStatus(dados: any): ValidationResult {
    const errors: string[] = [];

    if (!dados.status) {
      errors.push("Status é obrigatório para simulação");
    }

    // Se é simulação de aprovação, external_reference é obrigatório
    if (dados.status === "approved" && !dados.external_reference) {
      errors.push(
        "External reference é obrigatório para simulação de aprovação"
      );
    }

    // Validar external_reference se fornecido
    if (dados.external_reference) {
      const validacaoRef = this.validarExternalReference(
        dados.external_reference
      );
      if (!validacaoRef.isValid) {
        errors.push(...validacaoRef.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  /**
   * Validar se participante pode receber PIX
   */
  public static validarParticipanteParaPix(
    participante: any
  ): ValidationResult {
    const errors: string[] = [];

    if (!participante) {
      errors.push("Participante não encontrado");
      return {
        isValid: false,
        errors,
        detalhes: "Participante é obrigatório para gerar PIX",
      };
    }

    // Verificar se está pendente
    if (participante.statusPagamento !== StatusPagamento.PENDENTE) {
      errors.push("Participante não está pendente");
      return {
        isValid: false,
        errors,
        detalhes: `Status atual: ${participante.statusPagamento}. Apenas participantes pendentes podem gerar PIX.`,
      };
    }

    // Verificar dados essenciais para o PIX
    if (!participante.email) {
      errors.push("Email do participante é obrigatório");
    }

    if (!participante.cpf) {
      errors.push("CPF do participante é obrigatório");
    }

    if (!participante.nome) {
      errors.push("Nome do participante é obrigatório");
    }

    if (!participante.numeroInscricao) {
      errors.push("Número de inscrição é obrigatório");
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  /**
   * Validar valor do PIX
   */
  public static validarValorPix(
    valorInscricao: number,
    valorSolicitado: number
  ): ValidationResult {
    if (Math.abs(valorInscricao - valorSolicitado) > 0.01) {
      // Tolerância de 1 centavo
      return {
        isValid: false,
        errors: ["Valor incorreto"],
        detalhes: `Valor esperado: R$ ${valorInscricao.toFixed(
          2
        )}, valor solicitado: R$ ${valorSolicitado.toFixed(2)}`,
      };
    }

    return { isValid: true, errors: [] };
  }
}
