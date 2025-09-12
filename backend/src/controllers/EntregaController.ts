import { Request, Response } from "express";
import { Participante, CamisetaExtra } from "../models";
import { StatusEntrega, IApiResponse } from "../types/models";

export class EntregaController {
  // PUT /api/entrega/participante/:id/camiseta-principal
  // Toggle do status de entrega da camiseta principal do participante
  public static async toggleEntregaCamisetaPrincipal(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const participanteId = parseInt(id);

      if (isNaN(participanteId)) {
        res.status(400).json({
          sucesso: false,
          erro: "ID inválido",
          detalhes: "ID deve ser um número",
        });
        return;
      }

      console.log(
        `🔄 [EntregaController] Processando entrega principal para participante ID: ${participanteId}`
      );

      // Buscar participante
      const participante = await Participante.findByPk(participanteId);
      if (!participante) {
        res.status(404).json({
          sucesso: false,
          erro: "Participante não encontrado",
          detalhes: `Participante com ID ${participanteId} não existe`,
        });
        return;
      }

      // Verificar se o pagamento foi confirmado
      if (participante.statusPagamento !== "confirmado") {
        res.status(400).json({
          sucesso: false,
          erro: "Pagamento não confirmado",
          detalhes:
            "Só é possível entregar camisetas para participantes com pagamento confirmado",
        });
        return;
      }

      // Toggle do status de entrega
      const novoStatus: StatusEntrega =
        participante.statusEntregaCamiseta === StatusEntrega.ENTREGUE
          ? StatusEntrega.NAO_ENTREGUE
          : StatusEntrega.ENTREGUE;

      // Dados para atualização
      const dadosAtualizacao: any = {
        statusEntregaCamiseta: novoStatus,
      };

      // Se está marcando como entregue, adicionar timestamp
      if (novoStatus === StatusEntrega.ENTREGUE) {
        dadosAtualizacao.dataEntregaCamiseta = new Date();
        dadosAtualizacao.entreguePor = "Admin"; // TODO: pegar do token JWT
      } else {
        // Se está desmarcando, limpar dados de entrega
        dadosAtualizacao.dataEntregaCamiseta = null;
        dadosAtualizacao.entreguePor = null;
      }

      // Atualizar no banco
      await participante.update(dadosAtualizacao);

      const statusTexto =
        novoStatus === StatusEntrega.ENTREGUE ? "entregue" : "não entregue";

      console.log(
        `✅ Camiseta principal marcada como ${statusTexto} para ${participante.nome}`
      );

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          participanteId: participante.id,
          nome: participante.nome,
          statusEntrega: novoStatus,
          dataEntrega: dadosAtualizacao.dataEntregaCamiseta,
        },
        mensagem: `Camiseta principal marcada como ${statusTexto}`,
      };

      res.json(response);
    } catch (error) {
      console.error(
        "❌ [EntregaController] Erro ao atualizar entrega principal:",
        error
      );

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // PUT /api/entrega/camiseta-extra/:id
  // Toggle do status de entrega de uma camiseta extra específica
  public static async toggleEntregaCamisetaExtra(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const camisetaExtraId = parseInt(id);

      if (isNaN(camisetaExtraId)) {
        res.status(400).json({
          sucesso: false,
          erro: "ID inválido",
          detalhes: "ID deve ser um número",
        });
        return;
      }

      console.log(
        `🔄 [EntregaController] Processando entrega extra ID: ${camisetaExtraId}`
      );

      // Buscar camiseta extra
      const camisetaExtra = await CamisetaExtra.findByPk(camisetaExtraId);

      if (!camisetaExtra) {
        res.status(404).json({
          sucesso: false,
          erro: "Camiseta extra não encontrada",
          detalhes: `Camiseta extra com ID ${camisetaExtraId} não existe`,
        });
        return;
      }

      // Buscar participante separadamente usando o participanteId
      const participante = await Participante.findByPk(
        camisetaExtra.participanteId
      );

      if (!participante) {
        res.status(404).json({
          sucesso: false,
          erro: "Participante não encontrado",
          detalhes: "Participante associado à camiseta extra não existe",
        });
        return;
      }

      // Verificar se o participante tem pagamento confirmado
      if (participante.statusPagamento !== "confirmado") {
        res.status(400).json({
          sucesso: false,
          erro: "Pagamento não confirmado",
          detalhes:
            "Só é possível entregar camisetas para participantes com pagamento confirmado",
        });
        return;
      }

      // Toggle do status de entrega
      const novoStatus: StatusEntrega =
        camisetaExtra.statusEntrega === StatusEntrega.ENTREGUE
          ? StatusEntrega.NAO_ENTREGUE
          : StatusEntrega.ENTREGUE;

      // Dados para atualização
      const dadosAtualizacao: any = {
        statusEntrega: novoStatus,
      };

      // Se está marcando como entregue, adicionar timestamp
      if (novoStatus === StatusEntrega.ENTREGUE) {
        dadosAtualizacao.dataEntrega = new Date();
        dadosAtualizacao.entreguePor = "Admin"; // TODO: pegar do token JWT
      } else {
        // Se está desmarcando, limpar dados de entrega
        dadosAtualizacao.dataEntrega = null;
        dadosAtualizacao.entreguePor = null;
      }

      // Atualizar no banco
      await camisetaExtra.update(dadosAtualizacao);

      const statusTexto =
        novoStatus === StatusEntrega.ENTREGUE ? "entregue" : "não entregue";

      console.log(
        `✅ Camiseta extra ${camisetaExtra.tamanho} ${camisetaExtra.tipo} marcada como ${statusTexto}`
      );

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          camisetaExtraId: camisetaExtra.id,
          participanteNome: participante.nome,
          tamanho: camisetaExtra.tamanho,
          tipo: camisetaExtra.tipo,
          statusEntrega: novoStatus,
          dataEntrega: dadosAtualizacao.dataEntrega,
        },
        mensagem: `Camiseta extra ${camisetaExtra.tamanho} ${camisetaExtra.tipo} marcada como ${statusTexto}`,
      };

      res.json(response);
    } catch (error) {
      console.error(
        "❌ [EntregaController] Erro ao atualizar entrega extra:",
        error
      );

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // GET /api/entrega/resumo
  // Estatísticas gerais de entrega
  public static async obterResumoEntregas(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log("📊 [EntregaController] Calculando resumo de entregas...");

      // Contar camisetas principais
      const [
        principaisEntregues,
        principaisTotal,
        extrasEntregues,
        extrasTotal,
      ] = await Promise.all([
        Participante.count({
          where: {
            statusPagamento: "confirmado",
            statusEntregaCamiseta: StatusEntrega.ENTREGUE,
          },
        }),
        Participante.count({
          where: {
            statusPagamento: "confirmado",
          },
        }),
        CamisetaExtra.count({
          where: {
            statusEntrega: StatusEntrega.ENTREGUE,
          },
        }),
        CamisetaExtra.count(),
      ]);

      const totalEntregues = principaisEntregues + extrasEntregues;
      const totalReservadas = principaisTotal + extrasTotal;
      const percentualEntregue =
        totalReservadas > 0
          ? Math.round((totalEntregues / totalReservadas) * 100)
          : 0;

      const resumo = {
        camisetasPrincipais: {
          entregues: principaisEntregues,
          total: principaisTotal,
          pendentes: principaisTotal - principaisEntregues,
        },
        camisetasExtras: {
          entregues: extrasEntregues,
          total: extrasTotal,
          pendentes: extrasTotal - extrasEntregues,
        },
        geral: {
          totalEntregues,
          totalReservadas,
          pendentes: totalReservadas - totalEntregues,
          percentualEntregue,
        },
      };

      console.log("✅ Resumo calculado:", resumo);

      const response: IApiResponse = {
        sucesso: true,
        dados: resumo,
        mensagem: "Resumo de entregas calculado com sucesso",
      };

      res.json(response);
    } catch (error) {
      console.error("❌ [EntregaController] Erro ao calcular resumo:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }
}
