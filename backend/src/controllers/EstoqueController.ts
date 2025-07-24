// src/controllers/EstoqueController.ts
import { Request, Response } from "express";
import { EstoqueCamiseta } from "../models";
import {
  TamanhoCamiseta,
  TipoCamiseta,
  IApiResponse,
  IEstoqueDisponivel,
} from "../types/models";

export class EstoqueController {
  // GET /api/estoque - Obter todo o estoque organizado
  public static async obterEstoque(req: Request, res: Response): Promise<void> {
    try {
      const estoque = await EstoqueCamiseta.findAll({
        order: [
          ["tipo", "ASC"], // manga_curta primeiro
          ["tamanho", "ASC"], // PP, P, M, G, GG
        ],
      });

      // Organizar por tipo e tamanho para facilitar no frontend
      const estoqueOrganizado: IEstoqueDisponivel = {
        [TipoCamiseta.MANGA_CURTA]: {},
        [TipoCamiseta.MANGA_LONGA]: {},
      };

      estoque.forEach((item) => {
        estoqueOrganizado[item.tipo][item.tamanho] = {
          quantidadeTotal: item.quantidadeTotal,
          quantidadeReservada: item.quantidadeReservada,
          quantidadeDisponivel: item.quantidadeDisponivel,
          preco: 0, // Camiseta grátis na inscrição, R$ 50 se for extra
        };
      });

      const response: IApiResponse<IEstoqueDisponivel> = {
        sucesso: true,
        dados: estoqueOrganizado,
        mensagem: "Estoque carregado com sucesso",
      };

      res.json(response);
    } catch (error) {
      console.error("Erro ao obter estoque:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao carregar estoque",
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

      // Validar parâmetros
      if (
        !Object.values(TamanhoCamiseta).includes(tamanho as TamanhoCamiseta)
      ) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Tamanho inválido",
          detalhes: "Tamanhos válidos: PP, P, M, G, GG",
        };
        res.status(400).json(response);
        return;
      }

      if (!Object.values(TipoCamiseta).includes(tipo as TipoCamiseta)) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Tipo inválido",
          detalhes: "Tipos válidos: manga_curta, manga_longa",
        };
        res.status(400).json(response);
        return;
      }

      // Buscar no banco
      const item = await EstoqueCamiseta.findOne({
        where: {
          tamanho: tamanho as TamanhoCamiseta,
          tipo: tipo as TipoCamiseta,
        },
      });

      if (!item) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Item não encontrado no estoque",
        };
        res.status(404).json(response);
        return;
      }

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          tamanho: item.tamanho,
          tipo: item.tipo,
          disponivel: item.quantidadeDisponivel > 0,
          quantidadeDisponivel: item.quantidadeDisponivel,
          quantidadeTotal: item.quantidadeTotal,
          quantidadeReservada: item.quantidadeReservada,
        },
        mensagem: `${item.tamanho} ${item.tipo}: ${item.quantidadeDisponivel} disponíveis`,
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

  // GET /api/estoque/resumo - Resumo geral do estoque
  public static async obterResumo(req: Request, res: Response): Promise<void> {
    try {
      const estoque = await EstoqueCamiseta.findAll();

      // Calcular totais
      const totalProdutos = estoque.length;
      const totalCamisetas = estoque.reduce(
        (total, item) => total + item.quantidadeTotal,
        0
      );
      const totalReservadas = estoque.reduce(
        (total, item) => total + item.quantidadeReservada,
        0
      );
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

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          totalProdutos,
          totalCamisetas,
          totalReservadas,
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
      console.error("Erro ao gerar resumo:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao gerar resumo do estoque",
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

      // Verificar se a nova quantidade não é menor que as reservas
      if (quantidadeTotal < item.quantidadeReservada) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Quantidade insuficiente",
          detalhes: `Não é possível reduzir para ${quantidadeTotal}. Já existem ${item.quantidadeReservada} reservadas.`,
        };
        res.status(400).json(response);
        return;
      }

      // Atualizar
      await item.update({ quantidadeTotal });

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
      console.error("Erro ao atualizar estoque:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao atualizar estoque",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }
}
