// backend/src/controllers/EstoqueController.ts
// ✅ SUBSTITUA TODO O CONTEÚDO DESTE ARQUIVO PELO CÓDIGO ABAIXO

import { Request, Response } from "express";
import { EstoqueCamiseta, Participante, CamisetaExtra } from "../models";
import { TamanhoCamiseta, TipoCamiseta, IApiResponse } from "../types/models";

export class EstoqueController {
  // GET /api/estoque - Obter todo o estoque organizado
  public static async obterEstoque(req: Request, res: Response): Promise<void> {
    try {
      console.log("📦 [EstoqueController] Buscando estoque completo...");

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

      console.log("✅ [EstoqueController] Estoque organizado com sucesso");

      const response: IApiResponse = {
        sucesso: true,
        dados: estoqueOrganizado,
        mensagem: "Estoque carregado com sucesso",
      };

      res.json(response);
    } catch (error) {
      console.error("❌ [EstoqueController] Erro ao buscar estoque:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao carregar estoque",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // GET /api/estoque/resumo - Resumo geral do estoque
  public static async obterResumo(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "📊 [EstoqueController] Calculando resumo REAL do estoque..."
      );

      // Buscar estoque e atualizar quantidades reservadas
      const estoque = await EstoqueCamiseta.findAll();

      // Para cada item, recalcular a quantidade reservada baseada nos participantes REAIS
      for (const item of estoque) {
        await item.atualizarReservadas();
      }

      // Calcular totais
      const totalProdutos = estoque.length;
      const totalCamisetas = estoque.reduce(
        (total, item) => total + item.quantidadeTotal,
        0
      );

      //  Contar diretamente do banco de dados
      const totalReservadasReal =
        await EstoqueController.calcularTotalReservadasReal();

      const totalDisponiveis = estoque.reduce(
        (total, item) => total + item.quantidadeDisponivel,
        0
      );

      // Produtos em baixo estoque (menos de 5 unidades)
      const baixoEstoque = estoque.filter(
        (item) => item.quantidadeDisponivel < 5
      );

      // Produtos esgotados
      const esgotados = estoque.filter(
        (item) => item.quantidadeDisponivel === 0
      );

      console.log("✅ [EstoqueController] Resumo calculado:", {
        totalProdutos,
        totalCamisetas,
        totalReservadasReal,
        totalDisponiveis,
      });

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          totalProdutos,
          totalCamisetas,
          totalReservadas: totalReservadasReal,
          totalDisponiveis,
          baixoEstoque: baixoEstoque.map((item) => ({
            tamanho: item.tamanho,
            tipo: item.tipo,
            disponivel: item.quantidadeDisponivel,
          })),
          esgotados: esgotados.map((item) => ({
            tamanho: item.tamanho,
            tipo: item.tipo,
          })),
        },
        mensagem: "Resumo do estoque gerado com sucesso",
      };

      res.json(response);
    } catch (error) {
      console.error("❌ [EstoqueController] Erro ao gerar resumo:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao gerar resumo do estoque",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  //  Calcular total de camisas reservadas baseado nos participantes REAIS
  public static async calcularTotalReservadasReal(): Promise<number> {
    try {
      console.log(
        "🔍 [EstoqueController] Calculando reservas baseado no banco real..."
      );

      // 1. Contar camisetas principais (1 por participante confirmado)
      const camisetasPrincipais = await Participante.count({
        where: {
          statusPagamento: "confirmado",
        },
      });

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

  // POST /api/estoque/sincronizar - Sincronizar todo o estoque com dados reais
  public static async sincronizarEstoque(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "🔄 [EstoqueController] Iniciando sincronização completa do estoque..."
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

      console.log("🎉 [EstoqueController] Sincronização completa!");
      console.log(
        `📊 Itens atualizados: ${itensAtualizados}/${todosItens.length}`
      );
      console.log(`📦 Total de camisas reservadas: ${totalReservadas}`);

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          totalItens: todosItens.length,
          itensAtualizados,
          totalReservadas,
          detalhesAtualizacoes: detalhes,
        },
        mensagem: `Estoque sincronizado! ${itensAtualizados} itens foram atualizados.`,
      };

      res.json(response);
    } catch (error) {
      console.error("❌ [EstoqueController] Erro na sincronização:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao sincronizar estoque",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // GET /api/estoque/:tamanho/:tipo - Verificar disponibilidade específica
  public static async verificarDisponibilidade(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { tamanho, tipo } = req.params;

      const item = await EstoqueCamiseta.findOne({
        where: {
          tamanho: tamanho as TamanhoCamiseta,
          tipo: tipo as TipoCamiseta,
        },
      });

      if (!item) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Item não encontrado",
        };
        res.status(404).json(response);
        return;
      }

      // Atualizar quantidade reservada antes de retornar
      await item.atualizarReservadas();

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          tamanho: item.tamanho,
          tipo: item.tipo,
          quantidadeTotal: item.quantidadeTotal,
          quantidadeReservada: item.quantidadeReservada,
          quantidadeDisponivel: item.quantidadeDisponivel,
          disponivel: item.quantidadeDisponivel > 0,
        },
        mensagem: "Disponibilidade verificada",
      };

      res.json(response);
    } catch (error) {
      console.error("Erro ao verificar disponibilidade:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao verificar disponibilidade",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // PUT /api/estoque/:tamanho/:tipo - Atualizar estoque (admin)
  public static async atualizarEstoque(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { tamanho, tipo } = req.params;
      const { quantidadeTotal } = req.body;

      // Validações
      if (!quantidadeTotal || quantidadeTotal < 0) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Quantidade inválida",
          detalhes: "Quantidade deve ser um número positivo",
        };
        res.status(400).json(response);
        return;
      }

      const item = await EstoqueCamiseta.findOne({
        where: {
          tamanho: tamanho as TamanhoCamiseta,
          tipo: tipo as TipoCamiseta,
        },
      });

      if (!item) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Item não encontrado",
        };
        res.status(404).json(response);
        return;
      }

      // Atualizar quantidade reservada para ter o valor real atual
      await item.atualizarReservadas();

      // Verificar se a nova quantidade não é menor que as reservas REAIS
      if (quantidadeTotal < item.quantidadeReservada) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Quantidade insuficiente",
          detalhes: `Não é possível reduzir para ${quantidadeTotal}. Já existem ${item.quantidadeReservada} reservadas (calculado em tempo real).`,
        };
        res.status(400).json(response);
        return;
      }

      // Atualizar
      await item.update({ quantidadeTotal });

      console.log("✅ [EstoqueController] Estoque atualizado:", {
        tamanho: item.tamanho,
        tipo: item.tipo,
        quantidadeTotal: item.quantidadeTotal,
        quantidadeReservada: item.quantidadeReservada,
        quantidadeDisponivel: item.quantidadeDisponivel,
      });

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          tamanho: item.tamanho,
          tipo: item.tipo,
          quantidadeTotal: item.quantidadeTotal,
          quantidadeReservada: item.quantidadeReservada,
          quantidadeDisponivel: item.quantidadeDisponivel,
        },
        mensagem: "Estoque atualizado com sucesso",
      };

      res.json(response);
    } catch (error) {
      console.error("❌ [EstoqueController] Erro ao atualizar estoque:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao atualizar estoque",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }
}
