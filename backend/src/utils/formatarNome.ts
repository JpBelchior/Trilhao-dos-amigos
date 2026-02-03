// backend/src/utils/formatarNome.ts

/**
 * 📝 Formata um nome completo com capitalização correta
 * 
 * Regras:
 * - Primeira letra de cada palavra em MAIÚSCULA
 * - Resto em minúscula
 * - Preposições (de, da, do, dos, das, e) ficam em minúscula (exceto se for a primeira palavra)
 * - Remove espaços extras
 * 
 * @example
 * formatarNome("JOÃO PEDRO DA SILVA") → "João Pedro da Silva"
 * formatarNome("maria de souza") → "Maria de Souza"
 * formatarNome("  jose   carlos  ") → "Jose Carlos"
 */
export const formatarNome = (nome: string): string => {
  if (!nome || typeof nome !== 'string') {
    return '';
  }

  // Preposições que devem ficar em minúscula (exceto se for a primeira palavra)
  const preposicoes = ['de', 'da', 'do', 'dos', 'das', 'e'];

  return nome
    .trim() // Remove espaços do início e fim
    .toLowerCase() // Converte tudo para minúscula primeiro
    .split(/\s+/) // Separa por espaços (remove espaços extras)
    .map((palavra, index) => {
      // Se for preposição E não for a primeira palavra, manter em minúscula
      if (index > 0 && preposicoes.includes(palavra)) {
        return palavra;
      }
      
      // Capitalizar: primeira letra maiúscula + resto minúsculo
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(' '); // Junta tudo com um espaço
};

/**
 * 📝 Formata nome de cidade
 * Mesma lógica do formatarNome
 */
export const formatarCidade = (cidade: string): string => {
  return formatarNome(cidade);
};

/**
 * 📝 Formata múltiplos campos de texto
 */
export const formatarCamposTexto = (objeto: any, campos: string[]): any => {
  const resultado = { ...objeto };
  
  campos.forEach(campo => {
    if (resultado[campo] && typeof resultado[campo] === 'string') {
      resultado[campo] = formatarNome(resultado[campo]);
    }
  });
  
  return resultado;
};

export default {
  formatarNome,
  formatarCidade,
  formatarCamposTexto,
};