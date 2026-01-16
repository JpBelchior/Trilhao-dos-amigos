
/**
 * Funções de formatação
 * Responsabilidade: Transformar dados para exibição
 */

export const formatarCpf = (cpf) => {
  if (!cpf) return '';
  const limpo = cpf.replace(/\D/g, '');
  return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatarTelefone = (telefone) => {
  if (!telefone) return '';
  const limpo = telefone.replace(/\D/g, '');
  
  if (limpo.length === 11) {
    return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

export const formatarData = (data) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatarDataHora = (data) => {
  if (!data) return '';
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const limparNumeros = (texto) => {
  return texto.replace(/\D/g, '');
};