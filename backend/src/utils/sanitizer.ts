import validator from 'validator';

export class Sanitizer {
  /**
   * Sanitizar string removendo HTML/scripts maliciosos
   */
  public static sanitizeString(input: string | undefined | null): string {
    if (!input) return '';
    
    // Remove tags HTML e escapa caracteres especiais
    const sanitized = validator.escape(input.trim());
    
    return sanitized;
  }

  /**
   * Sanitizar email (normaliza e valida formato)
   */
  public static sanitizeEmail(email: string | undefined | null): string {
    if (!email) return '';
    
    // Normaliza email (lowercase, remove espaços, etc)
    const normalized = validator.normalizeEmail(email.trim(), {
      gmail_remove_dots: false, // Não remove pontos do Gmail
      gmail_remove_subaddress: false, // Mantém +alias
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false,
    });
    
    return normalized || email.trim().toLowerCase();
  }

  /**
   * Sanitizar CPF (remove caracteres não numéricos)
   */
  public static sanitizeCPF(cpf: string | undefined | null): string {
    if (!cpf) return '';
    
    // Remove tudo que não é número
    return cpf.replace(/\D/g, '');
  }

  /**
   * Sanitizar telefone (remove caracteres não numéricos)
   */
  public static sanitizeTelefone(telefone: string | undefined | null): string {
    if (!telefone) return '';
    
    // Remove tudo que não é número
    return telefone.replace(/\D/g, '');
  }

  /**
   * Sanitizar nome (remove caracteres especiais perigosos mas mantém acentos)
   */
  public static sanitizeName(name: string | undefined | null): string {
    if (!name) return '';
    
    // Remove tags HTML mas mantém acentos e espaços
    let sanitized = validator.escape(name.trim());
    
    // Remove múltiplos espaços
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Remove números (nomes não devem ter números)
    sanitized = sanitized.replace(/\d/g, '');
    
    return sanitized.trim();
  }

  /**
   * Sanitizar texto livre (observações, etc) - mais permissivo
   */
  public static sanitizeText(text: string | undefined | null): string {
    if (!text) return '';
    
    // Remove apenas tags HTML perigosas, mas permite texto normal
    const sanitized = validator.escape(text.trim());
    
    // Remove múltiplos espaços/quebras de linha
    return sanitized.replace(/\s+/g, ' ').trim();
  }

  /**
   * Sanitizar número (garante que é um número válido)
   */
  public static sanitizeNumber(num: any): number {
    if (typeof num === 'number') return num;
    
    const parsed = parseFloat(String(num));
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Sanitizar objeto completo de participante
   */
  public static sanitizeParticipanteData(data: any): any {
    return {
      nome: this.sanitizeName(data.nome),
      cpf: this.sanitizeCPF(data.cpf),
      email: this.sanitizeEmail(data.email),
      telefone: this.sanitizeTelefone(data.telefone),
      cidade: data.cidade,
      estado: data.estado,
      modeloMoto: data.modeloMoto,
      categoriaMoto: data.categoriaMoto, // Enum, não precisa sanitizar
      tamanhoCamiseta: data.tamanhoCamiseta, // Enum, não precisa sanitizar
      tipoCamiseta: data.tipoCamiseta, // Enum, não precisa sanitizar
      observacoes: this.sanitizeText(data.observacoes),
      camisetasExtras: Array.isArray(data.camisetasExtras) 
        ? data.camisetasExtras.map((extra: any) => ({
            tamanho: extra.tamanho,
            tipo: extra.tipo,
          }))
        : [],
    };
  }

  /**
   * Sanitizar dados de gerente
   */
  public static sanitizeGerenteData(data: any): any {
    return {
      nome: this.sanitizeName(data.nome),
      email: this.sanitizeEmail(data.email),
      senha: data.senha, // Senha NÃO deve ser sanitizada (vai pro bcrypt)
    };
  }
}