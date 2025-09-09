// backend/src/Service/EstoqueService.ts
// ✅ RECRIADO BASEADO NO CÓDIGO ANTIGO QUE FUNCIONAVA

import { EstoqueCamiseta, Participante, CamisetaExtra } from "../models";
import { TamanhoCamiseta, TipoCamiseta } from "../types/models";

export interface EstoqueResult {
  sucesso: boolean;
  dados?: any;
  erro?: string;
  detalhes?: string;
}

export class EstoqueService {
  /**
   * Obter estoque completo organizado
   * ✅ BASEADO NO CÓDIGO ANTIGO - EstoqueController.obterEstoque()
   */
  public static async obterEstoqueCompleto(): Promise<EstoqueResult> {
    try {
      console.log("📦 [EstoqueService] Buscando estoque completo...");

      // Buscar todos os itens do estoque
      const estoque = await EstoqueCamiseta.findAll({
        order: [
          ["tipo", "ASC"],
          ["tamanho", "ASC"],
        ],
      });

      // Para cada item, atualizar a quantidade reservada baseada no banco real
      for (const item of estoque) {
        await item.atualizarReservadas();
      }

      // Organizar dados por tipo e tamanho para o frontend
      const estoqueOrganizado: any = {};

      estoque.forEach((item) => {
        if (!estoqueOrganizado[item.tipo]) {
          estoqueOrganizado[item.tipo] = {};
        }

        estoqueOrganizado[item.tipo][item.tamanho] = {
          quantidadeTotal: item.quantidadeTotal,
          quantidadeReservada: item.quantidadeReservada,
          quantidadeDisponivel: item.quantidadeDisponivel,
        };
      });

      console.log("✅ [EstoqueService] Estoque organizado com sucesso");

      return {
        sucesso: true,
        dados: estoqueOrganizado,
      };
    } catch (error) {
      console.error("❌ [EstoqueService] Erro ao buscar estoque:", error);
      return {
        sucesso: false,
        erro: "Erro ao carregar estoque",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Obter resumo do estoque (estatísticas gerais)
   * ✅ EXATAMENTE COMO ERA NO CÓDIGO ANTIGO - EstoqueController.obterResumo()
   */
  public static async obterResumoEstoque(): Promise<EstoqueResult> {
    try {
      console.log("📊 [EstoqueService] Calculando resumo REAL do estoque...");

      // Buscar estoque e atualizar quantidades reservadas
      const estoque = await EstoqueCamiseta.findAll();

      // Para cada item, recalcular a quantidade reservada baseada nos participantes REAIS
      for (const item of estoque) {
        await item.atualizarReservadas();
      }

      // ✅ CALCULAR EXATAMENTE COMO ERA ANTES
      const totalProdutos = estoque.length;
      const totalCamisetas = estoque.reduce(
        (total, item) => total + item.quantidadeTotal,
        0
      );

      // ✅ Contar diretamente do banco de dados (como era antes)
      const totalReservadasReal = await this.calcularTotalReservadasReal();

      const totalDisponiveis = estoque.reduce(
        (total, item) => total + item.quantidadeDisponivel,
        0
      );

      // ✅ Produtos em baixo estoque (menos de 5 unidades) - como era antes
      const baixoEstoque = estoque
        .filter((item) => item.quantidadeDisponivel < 5)
        .map((item) => ({
          tamanho: item.tamanho,
          tipo: item.tipo,
          disponivel: item.quantidadeDisponivel,
        }));

      // ✅ Produtos esgotados - como era antes
      const esgotados = estoque
        .filter((item) => item.quantidadeDisponivel === 0)
        .map((item) => ({
          tamanho: item.tamanho,
          tipo: item.tipo,
        }));

      console.log("✅ [EstoqueService] Resumo calculado:", {
        totalProdutos,
        totalCamisetas,
        totalReservadasReal,
        totalDisponiveis,
      });

      // ✅ RETORNAR EXATAMENTE O MESMO FORMATO DO CÓDIGO ANTIGO
      return {
        sucesso: true,
        dados: {
          totalProdutos,
          totalCamisetas,
          totalReservadas: totalReservadasReal,
          totalDisponiveis,
          baixoEstoque,
          esgotados,
        },
      };
    } catch (error) {
      console.error("❌ [EstoqueService] Erro ao gerar resumo:", error);
      return {
        sucesso: false,
        erro: "Erro ao gerar resumo do estoque",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Verificar disponibilidade de um item específico
   * ✅ BASEADO NO CÓDIGO ANTIGO - EstoqueController.verificarDisponibilidade()
   */
  public static async verificarDisponibilidade(
    tamanho: TamanhoCamiseta,
    tipo: TipoCamiseta
  ): Promise<EstoqueResult> {
    try {
      const item = await EstoqueCamiseta.findOne({
        where: { tamanho, tipo },
      });

      if (!item) {
        return {
          sucesso: false,
          erro: "Item não encontrado",
        };
      }

      // Atualizar quantidade reservada antes de retornar
      await item.atualizarReservadas();

      return {
        sucesso: true,
        dados: {
          tamanho: item.tamanho,
          tipo: item.tipo,
          quantidadeTotal: item.quantidadeTotal,
          quantidadeReservada: item.quantidadeReservada,
          quantidadeDisponivel: item.quantidadeDisponivel,
          disponivel: item.quantidadeDisponivel > 0,
        },
      };
    } catch (error) {
      console.error(
        "❌ [EstoqueService] Erro ao verificar disponibilidade:",
        error
      );
      return {
        sucesso: false,
        erro: "Erro ao verificar disponibilidade",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Atualizar estoque de um item específico
   * ✅ BASEADO NO CÓDIGO ANTIGO - EstoqueController.atualizarEstoque()
   */
  public static async atualizarEstoque(
    tamanho: TamanhoCamiseta,
    tipo: TipoCamiseta,
    dadosAtualizacao: { quantidadeTotal?: number }
  ): Promise<EstoqueResult> {
    try {
      const { quantidadeTotal } = dadosAtualizacao;

      const item = await EstoqueCamiseta.findOne({
        where: { tamanho, tipo },
      });

      if (!item) {
        return {
          sucesso: false,
          erro: "Item não encontrado",
        };
      }

      // Atualizar quantidade reservada para ter o valor real atual
      await item.atualizarReservadas();

      // Verificar se a nova quantidade não é menor que as reservas REAIS
      if (
        quantidadeTotal !== undefined &&
        quantidadeTotal < item.quantidadeReservada
      ) {
        return {
          sucesso: false,
          erro: "Quantidade insuficiente",
          detalhes: `Não é possível reduzir para ${quantidadeTotal}. Já existem ${item.quantidadeReservada} reservadas (calculado em tempo real).`,
        };
      }

      // Atualizar
      if (quantidadeTotal !== undefined) {
        await item.update({ quantidadeTotal });
      }

      console.log("✅ [EstoqueService] Estoque atualizado:", {
        tamanho: item.tamanho,
        tipo: item.tipo,
        quantidadeTotal: item.quantidadeTotal,
        quantidadeReservada: item.quantidadeReservada,
        quantidadeDisponivel: item.quantidadeDisponivel,
      });

      return {
        sucesso: true,
        dados: {
          tamanho: item.tamanho,
          tipo: item.tipo,
          quantidadeTotal: item.quantidadeTotal,
          quantidadeReservada: item.quantidadeReservada,
          quantidadeDisponivel: item.quantidadeDisponivel,
        },
      };
    } catch (error) {
      console.error("❌ [EstoqueService] Erro ao atualizar estoque:", error);
      return {
        sucesso: false,
        erro: "Erro ao atualizar estoque",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Sincronizar todo o estoque (recalcular quantidades reservadas)
   * ✅ BASEADO NO CÓDIGO ANTIGO - EstoqueController.sincronizarEstoque()
   */
  public static async sincronizarEstoque(): Promise<EstoqueResult> {
    try {
      console.log(
        "🔄 [EstoqueService] Iniciando sincronização completa do estoque..."
      );

      // Buscar todos os itens do estoque
      const todosItens = await EstoqueCamiseta.findAll();

      let itensAtualizados = 0;
      const detalhes = [];

      // Para cada item, recalcular e atualizar
      for (const item of todosItens) {
        const quantidadeAnterior = item.quantidadeReservada;

        // Recalcular baseado no banco real
        await item.atualizarReservadas();

        const quantidadeAtual = item.quantidadeReservada;

        if (quantidadeAnterior !== quantidadeAtual) {
          itensAtualizados++;
          detalhes.push({
            tamanho: item.tamanho,
            tipo: item.tipo,
            reservadaAnterior: quantidadeAnterior,
            reservadaAtual: quantidadeAtual,
            diferenca: quantidadeAtual - quantidadeAnterior,
          });

          console.log(
            `✅ ${item.tamanho} ${item.tipo}: ${quantidadeAnterior} → ${quantidadeAtual}`
          );
        }
      }

      // Calcular totais finais
      const totalReservadas = todosItens.reduce(
        (total, item) => total + item.quantidadeReservada,
        0
      );

      console.log("🎉 [EstoqueService] Sincronização completa!");
      console.log(
        `📊 Itens atualizados: ${itensAtualizados}/${todosItens.length}`
      );
      console.log(`📦 Total de camisas reservadas: ${totalReservadas}`);

      return {
        sucesso: true,
        dados: {
          totalItens: todosItens.length,
          itensAtualizados,
          totalReservadas,
          detalhesAtualizacoes: detalhes,
        },
      };
    } catch (error) {
      console.error("❌ [EstoqueService] Erro na sincronização:", error);
      return {
        sucesso: false,
        erro: "Erro ao sincronizar estoque",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * ✅ CALCULAR TOTAL RESERVADAS BASEADO NO BANCO REAL
   * COPIADO EXATAMENTE DO CÓDIGO ANTIGO - EstoqueController.calcularTotalReservadasReal()
   */
  private static async calcularTotalReservadasReal(): Promise<number> {
    try {
      console.log(
        "🔍 [EstoqueService] Calculando reservas baseado no banco real..."
      );

      // 1. Contar camisetas principais (1 por participante confirmado)
      const camisetasPrincipais = await Participante.count({
        where: {
          statusPagamento: "confirmado",
        },
      });

      // 2. Contar camisetas extras
      const camisetasExtras = await CamisetaExtra.count();

      const totalReal = camisetasPrincipais + camisetasExtras;

      console.log("📊 Resultado do cálculo real:", {
        camisetasPrincipais,
        camisetasExtras,
        totalReal,
      });

      return totalReal;
    } catch (error) {
      console.error("❌ Erro ao calcular reservas reais:", error);
      return 0;
    }
  }
}
