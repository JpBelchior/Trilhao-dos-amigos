export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  detalhes?: string;
}

export class GerenteValidator {
  /**
   * Validar dados para login
   */
  public static validarDadosLogin(dados: {
    email?: any;
    senha?: any;
  }): ValidationResult {
    const errors: string[] = [];

    // Validações básicas (como era no código antigo)
    if (!dados.email || !dados.senha) {
      errors.push("Email e senha são obrigatórios");
    }

    // Validar formato de email se fornecido
    if (dados.email && typeof dados.email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dados.email)) {
        errors.push("Formato de email inválido");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  /**
   * Validar dados para criação de gerente
   */
  public static validarDadosCriacao(dados: {
    nome?: any;
    email?: any;
    senha?: any;
  }): ValidationResult {
    const errors: string[] = [];

    // Validações (exatamente como era no código antigo)
    if (!dados.nome || !dados.email || !dados.senha) {
      errors.push("Nome, email e senha são obrigatórios");
    }

    // Validar nome
    if (dados.nome && typeof dados.nome === "string") {
      if (dados.nome.trim().length < 2) {
        errors.push("Nome deve ter pelo menos 2 caracteres");
      }
    }

    // Validar email
    if (dados.email && typeof dados.email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dados.email)) {
        errors.push("Formato de email inválido");
      }
    }

    // Validar senha (como era no código antigo)
    if (dados.senha && dados.senha.length < 6) {
      errors.push("Senha deve ter pelo menos 6 caracteres");
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  /**
   * Validar dados para atualização de perfil
   */
  public static validarDadosAtualizacao(dados: {
    nome?: any;
    email?: any;
    senhaAtual?: any;
    novaSenha?: any;
    confirmarSenha?: any;
  }): ValidationResult {
    const errors: string[] = [];

    // Validar nome se fornecido
    if (dados.nome !== undefined) {
      if (typeof dados.nome !== "string" || dados.nome.trim().length < 2) {
        errors.push("Nome deve ter pelo menos 2 caracteres");
      }
    }

    // Validar email se fornecido
    if (dados.email !== undefined) {
      if (typeof dados.email !== "string") {
        errors.push("Email deve ser uma string válida");
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dados.email)) {
          errors.push("Formato de email inválido");
        }
      }
    }

    // Validar mudança de senha se fornecida 
    if (dados.novaSenha) {
      // Verificar se senha atual foi fornecida
      if (!dados.senhaAtual) {
        errors.push("Senha atual é obrigatória para alterar senha");
      }

      // Verificar se nova senha é válida
      if (dados.novaSenha.length < 6 || dados.novaSenha.length!==0 ) {
        errors.push("Nova senha deve ter pelo menos 6 caracteres");
      }

      // Verificar confirmação de senha
      if (dados.novaSenha !== dados.confirmarSenha) {
        errors.push("Confirmação de senha não confere");
      }
    }

    // Verificar se há algo para atualizar (como era no código antigo)
    const temDadosParaAtualizar =
      dados.nome !== undefined ||
      dados.email !== undefined ||
      dados.novaSenha !== undefined;

    if (!temDadosParaAtualizar) {
      errors.push("Nenhuma alteração foi enviada");
    }

    return {
      isValid: errors.length === 0,
      errors,
      detalhes: errors.length > 0 ? errors.join(", ") : undefined,
    };
  }

  /**
   * Validar format de email (reutilizável)
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
}
