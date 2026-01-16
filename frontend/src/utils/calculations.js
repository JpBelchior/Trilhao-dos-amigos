// src/utils/calculations.js

import { PRECO_INSCRICAO_BASE, PRECO_CAMISETA_EXTRA } from '../constants/enums';

/**
 * Cálculos e operações
 * Responsabilidade: Lógica matemática pura
 */

export const calcularValorInscricao = (camisetasExtras = []) => {
  const valorExtras = camisetasExtras.length * PRECO_CAMISETA_EXTRA;
  return PRECO_INSCRICAO_BASE + valorExtras;
};

export const calcularTotalCamisetas = (camisetaPrincipal, camisetasExtras = []) => {
  return 1 + camisetasExtras.length;
};

export const calcularTempoRestante = (dataExpiracao) => {
  const agora = new Date().getTime();
  const expiracao = new Date(dataExpiracao).getTime();
  const diferenca = expiracao - agora;

  if (diferenca <= 0) return 0;

  return Math.floor(diferenca / 1000); // Retorna em segundos
};

export const formatarTempoRestante = (segundos) => {
  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
};