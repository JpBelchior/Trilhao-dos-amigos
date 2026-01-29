// frontend/src/constants/index.js
/**
 * 📋 Constantes centralizadas do projeto
 */

// ========================================
// TAMANHOS DE CAMISETA
// ========================================
export const TamanhoCamiseta = {
  PP: "PP",
  P: "P",
  M: "M",
  G: "G",
  GG: "GG",
};

// Array para listagens (select, map, etc)
export const TamanhosCamisetaArray = Object.values(TamanhoCamiseta);

// ========================================
// TIPOS DE CAMISETA
// ========================================
export const TipoCamiseta = {
  MANGA_CURTA: "manga_curta",
  MANGA_LONGA: "manga_longa",
};

// Labels amigáveis para exibição
export const TipoCamisetaLabel = {
  manga_curta: "Manga Curta",
  manga_longa: "Manga Longa",
};

// Array para listagens
export const TiposCamisetaArray = Object.values(TipoCamiseta);

// ========================================
// CATEGORIAS DE MOTO
// ========================================
export const CategoriaMoto = {
  NACIONAL: "nacional",
  IMPORTADA: "importada",
};

// Labels amigáveis
export const CategoriaMotoLabel = {
  nacional: "Nacional",
  importada: "Importada",
};

// ========================================
// STATUS DE PAGAMENTO
// ========================================
export const StatusPagamento = {
  PENDENTE: "pendente",
  CONFIRMADO: "confirmado",
  CANCELADO: "cancelado",
};

// Labels amigáveis
export const StatusPagamentoLabel = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

// Cores para badges
export const StatusPagamentoCor = {
  pendente: "yellow",
  confirmado: "green",
  cancelado: "red",
};

// ========================================
// STATUS DE ENTREGA
// ========================================
export const StatusEntrega = {
  NAO_ENTREGUE: "nao_entregue",
  ENTREGUE: "entregue",
};

// Labels amigáveis
export const StatusEntregaLabel = {
  nao_entregue: "Não Entregue",
  entregue: "Entregue",
};

// ========================================
// VALORES DO SISTEMA
// ========================================
export const Valores = {
  INSCRICAO_BASE: 100, // R$ 100,00
  CAMISETA_EXTRA: 50,  // R$ 50,00
};

// ========================================
// CONFIGURAÇÕES DE PAGINAÇÃO
// ========================================
export const Paginacao = {
  ITENS_POR_PAGINA_PADRAO: 20,
  OPCOES_ITENS_POR_PAGINA: [10, 20, 50, 100],
};

// ========================================
// EXPORT DEFAULT (todas as constantes)
// ========================================
export default {
  TamanhoCamiseta,
  TamanhosCamisetaArray,
  TipoCamiseta,
  TipoCamisetaLabel,
  TiposCamisetaArray,
  CategoriaMoto,
  CategoriaMotoLabel,
  StatusPagamento,
  StatusPagamentoLabel,
  StatusPagamentoCor,
  StatusEntrega,
  StatusEntregaLabel,
  Valores,
  Paginacao,
};