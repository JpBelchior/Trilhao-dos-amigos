// frontend/src/utils/calcularEdicao.js

const ANO_PRIMEIRA_EDICAO = 2017;

/**
 * Calcula a edição baseada no ano
 * @param {number} ano - Ano do evento
 * @returns {{edicao: string, numeroEdicao: number}} Objeto com edição formatada e número
 */
export function calcularEdicao(ano) {
  const anoNumerico = parseInt(ano);

  if (isNaN(anoNumerico) || anoNumerico < ANO_PRIMEIRA_EDICAO) {
    return { edicao: "", numeroEdicao: 0 };
  }

  const numeroEdicao = anoNumerico - ANO_PRIMEIRA_EDICAO + 1;
  const edicao = `${numeroEdicao}ª Edição`;

  return { edicao, numeroEdicao };
}

/**
 * Valida se o ano é válido para criação de campeão
 * @param {number} ano 
 * @returns {boolean}
 */
export function anoEhValido(ano) {
  const anoNumerico = parseInt(ano);
  const anoAtual = new Date().getFullYear();
  
  return (
    !isNaN(anoNumerico) &&
    anoNumerico >= ANO_PRIMEIRA_EDICAO &&
    anoNumerico <= anoAtual + 1 // Permite até próximo ano
  );
}