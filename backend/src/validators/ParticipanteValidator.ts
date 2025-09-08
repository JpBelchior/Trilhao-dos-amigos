import { ICriarParticipanteDTO } from "../types/models";
import { IBGEService } from "../Service/IBGEService";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  detalhes?: string;
}

export class ParticipanteValidator {
  /**
   * Validar dados básicos obrigatórios
   */
  public static validarDadosObrigatorios(
    dados: ICriarParticipanteDTO
  ): ValidationResult {
    const errors: string[] = [];

    if (!dados.nome?.trim()) {
      errors.push("Nome é obrigatório");
    }

    if (!dados.email?.trim()) {
      errors.push("Email é obrigatório");
    }

    if (!dados.cpf?.trim()) {
      errors.push("CPF é obrigatório");
    }

    if (!dados.estado?.trim()) {
      errors.push("Estado é obrigatório");
    }

    if (!dados.cidade?.trim()) {
      errors.push("Cidade é obrigatória");
    }

    if (!dados.telefone?.trim()) {
      errors.push("Telefone é obrigatório");
    }

    if (!dados.modeloMoto?.trim()) {
      errors.push("Modelo da moto é obrigatório");
    }

    if (!dados.categoriaMoto) {
      errors.push("Categoria da moto é obrigatória");
    }

    if (!dados.tamanhoCamiseta) {
      errors.push("Tamanho da camiseta é obrigatório");
    }

    if (!dados.tipoCamiseta) {
      errors.push("Tipo da camiseta é obrigatório");
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  /**
   * Validar formato do email
   */
  public static validarEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        errors: ["Formato de email inválido"],
        detalhes: "Email deve ter formato válido (exemplo@dominio.com)",
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Validar formato do CPF
   */
  public static validarCPF(cpf: string): ValidationResult {
    // Remove caracteres não numéricos
    const cpfLimpo = cpf.replace(/\D/g, "");

    // Verificar se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
      return {
        isValid: false,
        errors: ["CPF deve ter 11 dígitos"],
        detalhes: "CPF informado não possui formato válido",
      };
    }

    // Verificar se não são todos os dígitos iguais
    if (/^(\d)\1+$/.test(cpfLimpo)) {
      return {
        isValid: false,
        errors: ["CPF inválido"],
        detalhes: "CPF não pode ter todos os dígitos iguais",
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Validar telefone
   */
  public static validarTelefone(telefone: string): ValidationResult {
    // Remove caracteres não numéricos
    const telefoneLimpo = telefone.replace(/\D/g, "");

    // Verificar se tem entre 10 e 11 dígitos
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      return {
        isValid: false,
        errors: ["Telefone deve ter 10 ou 11 dígitos"],
        detalhes: "Formato: (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX",
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Validar localização usando IBGE
   */
  public static async validarLocalizacao(
    estado: string,
    cidade: string
  ): Promise<ValidationResult> {
    try {
      // Validar estado
      const estadoValido = await IBGEService.validarEstado(estado);
      if (!estadoValido) {
        return {
          isValid: false,
          errors: ["Estado inválido"],
          detalhes: `"${estado}" não é um estado brasileiro válido`,
        };
      }

      // Validar cidade
      const cidadeValida = await IBGEService.validarCidade(cidade, estado);
      if (!cidadeValida) {
        return {
          isValid: false,
          errors: ["Cidade inválida"],
          detalhes: `"${cidade}" não existe no estado ${estado}`,
        };
      }

      return { isValid: true, errors: [] };
    } catch (error) {
      return {
        isValid: false,
        errors: ["Erro ao validar localização"],
        detalhes: "Não foi possível verificar estado/cidade no momento",
      };
    }
  }

  /**
   * Validar campos editáveis (para edição de participante)
   */
  public static validarCamposEditaveis(dados: any): ValidationResult {
    const camposPermitidos = [
      "nome",
      "modeloMoto",
      "categoriaMoto",
      "statusPagamento",
      "observacoes",
    ];

    const camposInvalidos = Object.keys(dados).filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    if (camposInvalidos.length > 0) {
      return {
        isValid: false,
        errors: ["Campos não editáveis detectados"],
        detalhes: `Campos não permitidos: ${camposInvalidos.join(", ")}`,
      };
    }

    // Validar campos específicos se fornecidos
    const errors: string[] = [];

    if (dados.nome && !dados.nome.trim()) {
      errors.push("Nome não pode ser vazio");
    }

    if (dados.modeloMoto && !dados.modeloMoto.trim()) {
      errors.push("Modelo da moto não pode ser vazio");
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  /**
   * Validação completa para criação de participante
   */
  public static async validarCriacao(
    dados: ICriarParticipanteDTO
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    // 1. Validar dados obrigatórios
    const dadosObrigatorios = this.validarDadosObrigatorios(dados);
    if (!dadosObrigatorios.isValid) {
      errors.push(...dadosObrigatorios.errors);
    }

    // Se dados obrigatórios faltam, não continuar
    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
        detalhes: errors.join(", "),
      };
    }

    // 2. Validar email
    const emailValidation = this.validarEmail(dados.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }

    // 3. Validar CPF
    const cpfValidation = this.validarCPF(dados.cpf);
    if (!cpfValidation.isValid) {
      errors.push(...cpfValidation.errors);
    }

    // 4. Validar telefone
    const telefoneValidation = this.validarTelefone(dados.telefone);
    if (!telefoneValidation.isValid) {
      errors.push(...telefoneValidation.errors);
    }

    // 5. Validar localização (assíncrono)
    const localizacaoValidation = await this.validarLocalizacao(
      dados.estado,
      dados.cidade
    );
    if (!localizacaoValidation.isValid) {
      errors.push(...localizacaoValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }
}
