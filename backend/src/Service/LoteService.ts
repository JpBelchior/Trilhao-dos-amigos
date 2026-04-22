import { Op } from "sequelize";
import { Lote } from "../models";
import { ICriarLoteDTO } from "../types/models";

// Preços padrão usados como fallback quando não há lote ativo
const FALLBACK_PRECO_INSCRICAO = 100;
const FALLBACK_PRECO_CAMISA = 50;

export const DATA_LIMITE_COMPETICAO = "2026-06-28";

export interface LotePrecos {
  precoInscricao: number;
  precoCamisa: number;
  loteAtivo: Lote | null;
  usandoFallback: boolean;
}

export type StatusLote = "ATIVO" | "FUTURO" | "ENCERRADO";

export class LoteService {
  static isInscricoesAbertas(): boolean {
    return this.getHojeBrasilia() <= DATA_LIMITE_COMPETICAO;
  }

  /**
   * Retorna a data atual no fuso horário de Brasília no formato YYYY-MM-DD
   */
  static getHojeBrasilia(): string {
    return new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });
  }

  /**
   * Calcula o status de um lote com base na data atual (horário de Brasília)
   */
  static calcularStatus(lote: Lote): StatusLote {
    const hoje = this.getHojeBrasilia();
    if (hoje >= lote.dataInicio && hoje <= lote.dataFim) return "ATIVO";
    if (hoje < lote.dataInicio) return "FUTURO";
    return "ENCERRADO";
  }

  /**
   * Retorna o lote ativo (data atual dentro do período), ou null se não houver
   */
  static async getLoteAtivo(): Promise<Lote | null> {
    const hoje = this.getHojeBrasilia();
    console.log(`[LoteService] Buscando lote ativo para: ${hoje}`);

    const lote = await Lote.findOne({
      where: {
        dataInicio: { [Op.lte]: hoje },
        dataFim: { [Op.gte]: hoje },
      },
      order: [["dataInicio", "DESC"]], // Em caso de sobreposição, pega o mais recente
    });

    if (lote) {
      console.log(`[LoteService] Lote ativo encontrado: Lote ${lote.numero}`);
    } else {
      console.log("[LoteService] Nenhum lote ativo encontrado. Usando fallback.");
    }

    return lote;
  }

  /**
   * Retorna os preços vigentes: do lote ativo ou do fallback hardcoded
   */
  static async getPrecos(): Promise<LotePrecos> {
    const loteAtivo = await this.getLoteAtivo();

    if (loteAtivo) {
      return {
        precoInscricao: Number(loteAtivo.precoInscricao),
        precoCamisa: Number(loteAtivo.precoCamisa),
        loteAtivo,
        usandoFallback: false,
      };
    }

    return {
      precoInscricao: FALLBACK_PRECO_INSCRICAO,
      precoCamisa: FALLBACK_PRECO_CAMISA,
      loteAtivo: null,
      usandoFallback: true,
    };
  }

  /**
   * Lista todos os lotes ordenados por data de início (mais recente primeiro)
   */
  static async listarTodos(): Promise<Lote[]> {
    return Lote.findAll({
      order: [["dataInicio", "DESC"]],
    });
  }

  /**
   * Busca um lote pelo ID
   */
  static async buscarPorId(id: number): Promise<Lote | null> {
    return Lote.findByPk(id);
  }

  /**
   * Busca um lote cujo período se sobrepõe ao intervalo informado.
   * Datas adjacentes (fim de um = início do outro) são permitidas — usa < e > estritos.
   * Passa idExcluir para ignorar o próprio lote ao atualizar.
   */
  static async buscarSobreposicao(dataInicio: string, dataFim: string, idExcluir?: number): Promise<Lote | null> {
    const where: any = {
      dataInicio: { [Op.lt]: dataFim },
      dataFim: { [Op.gt]: dataInicio },
    };
    if (idExcluir !== undefined) {
      where.id = { [Op.ne]: idExcluir };
    }
    return Lote.findOne({ where });
  }

  /**
   * Cria um novo lote
   */
  static async criar(dados: ICriarLoteDTO): Promise<Lote> {
    console.log(`[LoteService] Criando lote: ${dados.numero}`);

    const lote = await Lote.create({
      numero: dados.numero.trim(),
      dataInicio: dados.dataInicio,
      dataFim: dados.dataFim,
      precoInscricao: dados.precoInscricao,
      precoCamisa: dados.precoCamisa,
    });

    console.log(`[LoteService] Lote ${lote.numero} criado com ID ${lote.id}`);
    return lote;
  }

  /**
   * Atualiza um lote existente
   */
  static async atualizar(id: number, dados: Partial<ICriarLoteDTO>): Promise<Lote> {
    console.log(`[LoteService] Atualizando lote ID: ${id}`);

    const lote = await Lote.findByPk(id);
    if (!lote) {
      throw new Error("Lote não encontrado");
    }

    await lote.update({
      ...(dados.numero !== undefined && { numero: dados.numero.trim() }),
      ...(dados.dataInicio !== undefined && { dataInicio: dados.dataInicio }),
      ...(dados.dataFim !== undefined && { dataFim: dados.dataFim }),
      ...(dados.precoInscricao !== undefined && { precoInscricao: dados.precoInscricao }),
      ...(dados.precoCamisa !== undefined && { precoCamisa: dados.precoCamisa }),
    });

    console.log(`[LoteService] Lote ${lote.numero} atualizado`);
    return lote;
  }

  /**
   * Exclui um lote pelo ID
   */
  static async deletar(id: number): Promise<void> {
    console.log(`[LoteService] Deletando lote ID: ${id}`);

    const lote = await Lote.findByPk(id);
    if (!lote) {
      throw new Error("Lote não encontrado");
    }

    await lote.destroy();
    console.log(`[LoteService] Lote ${lote.numero} deletado`);
  }
}
