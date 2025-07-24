// src/types/index.ts

// ============ ENUMS (Valores fixos permitidos) ============

export enum TamanhoCamiseta {
  PP = "PP",
  P = "P",
  M = "M",
  G = "G",
  GG = "GG",
}

export enum TipoCamiseta {
  MANGA_CURTA = "manga_curta",
  MANGA_LONGA = "manga_longa",
}

export enum CategoriaMoto {
  NACIONAL = "nacional",
  IMPORTADA = "importada",
}

export enum StatusPagamento {
  PENDENTE = "pendente",
  CONFIRMADO = "confirmado",
  CANCELADO = "cancelado",
}

// ============ INTERFACES (Estrutura dos dados) ============

// Interface para Camisetas Extras
export interface ICamisetaExtra {
  id?: number;
  participanteId: number;
  tamanho: TamanhoCamiseta;
  tipo: TipoCamiseta;
  preco: number; // R$ 50,00 por camiseta extra
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para um Participante
export interface IParticipante {
  id?: number; // Opcional porque é gerado automaticamente
  numeroInscricao?: string; // Opcional porque é gerado automaticamente

  // Dados obrigatórios
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cidade: string;
  modeloMoto: string;
  categoriaMoto: CategoriaMoto;
  tamanhoCamiseta: TamanhoCamiseta;
  tipoCamiseta: TipoCamiseta;

  // Dados automáticos
  valorInscricao: number; // R$ 100 base + (R$ 50 × camisetas extras)
  statusPagamento: StatusPagamento;
  dataInscricao?: Date; // Opcional porque é gerado automaticamente
  observacoes?: string; // Opcional

  // Relacionamento com camisetas extras
  camisetasExtras?: ICamisetaExtra[];
}

// Interface para Estoque de Camisetas
export interface IEstoqueCamiseta {
  id?: number;
  tamanho: TamanhoCamiseta;
  tipo: TipoCamiseta;
  quantidadeTotal: number;
  quantidadeReservada: number;
}

// Interface para Campeões do Barranco
export interface ICampeaoBarranco {
  id?: number;
  nome: string;
  edicao: string; // Ex: "15ª Edição"
  ano: number; // Ex: 2024
  resultadoAltura: number; // Em metros, ex: 47.2
  modeloMoto: string;
  categoriaMoto: CategoriaMoto;
}

// ============ DTOs (Data Transfer Objects) ============
// São os dados que vêm do frontend no formato JSON

export interface ICriarParticipanteDTO {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cidade: string;
  modeloMoto: string;
  categoriaMoto: CategoriaMoto;
  tamanhoCamiseta: TamanhoCamiseta; // Camiseta grátis obrigatória
  tipoCamiseta: TipoCamiseta; // Camiseta grátis obrigatória
  observacoes?: string;
  // Camisetas extras opcionais
  camisetasExtras?: Array<{
    tamanho: TamanhoCamiseta;
    tipo: TipoCamiseta;
  }>;
}

// ============ TIPOS DE RESPOSTA DA API ============

export interface IApiResponse<T = any> {
  sucesso: boolean;
  dados?: T;
  mensagem?: string;
  erro?: string;
  detalhes?: string;
}

// Interface para estoque organizado por tipo e tamanho
export interface IEstoqueDisponivel {
  [TipoCamiseta.MANGA_CURTA]: {
    [key in TamanhoCamiseta]?: {
      quantidadeTotal: number;
      quantidadeReservada: number;
      quantidadeDisponivel: number;
      preco: number;
    };
  };
  [TipoCamiseta.MANGA_LONGA]: {
    [key in TamanhoCamiseta]?: {
      quantidadeTotal: number;
      quantidadeReservada: number;
      quantidadeDisponivel: number;
      preco: number;
    };
  };
}
