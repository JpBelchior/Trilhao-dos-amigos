// backend/src/controllers/EntregaController.ts
import { Response } from "express";
import { Participante, CamisetaExtra } from "../models";
import { AuthenticatedRequest } from "./GerenteController";
import { IApiResponse, StatusEntrega } from "../types/models";

export class EntregaController {
  // PUT /api/entrega/participante/:id/camiseta-principal
  // Marcar/desmarcar entrega da camiseta grátis
  public static async toggleEntregaCamisetaPrincipal(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const gerente = req.gerente;

      console.log(
        `📦 [EntregaController] Gerente ${gerente?.nome} alterando entrega da camiseta principal do participante ${id}`
      );

      if (!gerente) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Gerente não autenticado",
        };
        res.status(401).json(response);
        return;
      }

      // Buscar participante
      const participante = await Participante.findByPk(id);

      if (!participante) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Participante não encontrado",
        };
        res.status(404).json(response);
        return;
      }

      // Verificar se participante tem pagamento confirmado
      if (participante.statusPagamento !== "confirmado") {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Camiseta só pode ser entregue para participantes com pagamento confirmado",
        };
        res.status(400).json(response);
        return;
      }

      // Toggle do status de entrega
      const novoStatus =
        participante.statusEntregaCamiseta === StatusEntrega.ENTREGUE
          ? StatusEntrega.NAO_ENTREGUE
          : StatusEntrega.ENTREGUE;

      // Atualizar campos
      const dadosUpdate: any = {
        statusEntregaCamiseta: novoStatus,
      };

      if (novoStatus === StatusEntrega.ENTREGUE) {
        // Marcando como entregue
        dadosUpdate.dataEntregaCamiseta = new Date();
        dadosUpdate.entreguePor = gerente.nome;
      } else {
        // Desmarcando entrega
        dadosUpdate.dataEntregaCamiseta = null;
        dadosUpdate.entreguePor = null;
      }

      await participante.update(dadosUpdate);

      console.log(
        `✅ Camiseta principal ${
          novoStatus === StatusEntrega.ENTREGUE ? "ENTREGUE" : "DESMARCADA"
        } para ${participante.nome}`
      );

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          participanteId: participante.id,
          nome: participante.nome,
          statusEntrega: novoStatus,
          dataEntrega: participante.dataEntregaCamiseta,
          entreguePor: participante.entreguePor,
          camiseta: {
            tamanho: participante.tamanhoCamiseta,
            tipo: participante.tipoCamiseta,
          },
        },
        mensagem: `Camiseta principal ${
          novoStatus === StatusEntrega.ENTREGUE
            ? "marcada como entregue"
            : "desmarcada"
        }`,
      };

      res.json(response);
    } catch (error) {
      console.error("💥 [EntregaController] Erro ao alterar entrega:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao alterar status de entrega",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // PUT /api/entrega/camiseta-extra/:id
  // Marcar/desmarcar entrega de camiseta extra
  public static async toggleEntregaCamisetaExtra(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const gerente = req.gerente;

      console.log(
        `📦 [EntregaController] Gerente ${gerente?.nome} alterando entrega da camiseta extra ${id}`
      );

      if (!gerente) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Gerente não autenticado",
        };
        res.status(401).json(response);
        return;
      }

      // Buscar camiseta extra com dados do participante
      const camisetaExtra = await CamisetaExtra.findByPk(id, {
        include: [
          {
            model: Participante,
            as: "participante",
            attributes: ["id", "nome", "statusPagamento"],
          },
        ],
      });

      if (!camisetaExtra) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Camiseta extra não encontrada",
        };
        res.status(404).json(response);
        return;
      }

      // Verificar se participante tem pagamento confirmado
      const participante = (camisetaExtra as any).participante;
      if (participante.statusPagamento !== "confirmado") {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Camiseta só pode ser entregue para participantes com pagamento confirmado",
        };
        res.status(400).json(response);
        return;
      }

      // Toggle do status de entrega
      const novoStatus =
        camisetaExtra.statusEntrega === StatusEntrega.ENTREGUE
          ? StatusEntrega.NAO_ENTREGUE
          : StatusEntrega.ENTREGUE;

      // Atualizar campos
      const dadosUpdate: any = {
        statusEntrega: novoStatus,
      };

      if (novoStatus === StatusEntrega.ENTREGUE) {
        // Marcando como entregue
        dadosUpdate.dataEntrega = new Date();
        dadosUpdate.entreguePor = gerente.nome;
      } else {
        // Desmarcando entrega
        dadosUpdate.dataEntrega = null;
        dadosUpdate.entreguePor = null;
      }

      await camisetaExtra.update(dadosUpdate);

      console.log(
        `✅ Camiseta extra ${
          novoStatus === StatusEntrega.ENTREGUE ? "ENTREGUE" : "DESMARCADA"
        } para ${participante.nome}`
      );

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          camisetaExtraId: camisetaExtra.id,
          participanteId: participante.id,
          nome: participante.nome,
          statusEntrega: novoStatus,
          dataEntrega: camisetaExtra.dataEntrega,
          entreguePor: camisetaExtra.entreguePor,
          camiseta: {
            tamanho: camisetaExtra.tamanho,
            tipo: camisetaExtra.tipo,
          },
        },
        mensagem: `Camiseta extra ${
          novoStatus === StatusEntrega.ENTREGUE
            ? "marcada como entregue"
            : "desmarcada"
        }`,
      };

      res.json(response);
    } catch (error) {
      console.error(
        "💥 [EntregaController] Erro ao alterar entrega extra:",
        error
      );

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao alterar status de entrega",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // GET /api/entrega/relatorio
  // Relatório geral de entregas
  public static async obterRelatorioEntregas(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const gerente = req.gerente;

      if (!gerente) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Gerente não autenticado",
        };
        res.status(401).json(response);
        return;
      }

      // Buscar todos os participantes confirmados com suas camisetas extras
      const participantes = await Participante.findAll({
        where: {
          statusPagamento: "confirmado",
        },
        include: [
          {
            model: CamisetaExtra,
            as: "camisetasExtras",
          },
        ],
        order: [["nome", "ASC"]],
      });

      // Calcular estatísticas
      let camisetasPrincipaisEntregues = 0;
      let camisetasPrincipaisNaoEntregues = 0;
      let camisetasExtrasEntregues = 0;
      let camisetasExtrasNaoEntregues = 0;

      participantes.forEach((participante) => {
        // Camiseta principal
        if (participante.statusEntregaCamiseta === StatusEntrega.ENTREGUE) {
          camisetasPrincipaisEntregues++;
        } else {
          camisetasPrincipaisNaoEntregues++;
        }

        // Camisetas extras
        const extras = (participante as any).camisetasExtras || [];
        extras.forEach((extra: any) => {
          if (extra.statusEntrega === StatusEntrega.ENTREGUE) {
            camisetasExtrasEntregues++;
          } else {
            camisetasExtrasNaoEntregues++;
          }
        });
      });

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          resumo: {
            totalParticipantes: participantes.length,
            camisetasPrincipais: {
              entregues: camisetasPrincipaisEntregues,
              naoEntregues: camisetasPrincipaisNaoEntregues,
              total: participantes.length,
            },
            camisetasExtras: {
              entregues: camisetasExtrasEntregues,
              naoEntregues: camisetasExtrasNaoEntregues,
              total: camisetasExtrasEntregues + camisetasExtrasNaoEntregues,
            },
          },
          participantes: participantes.map((p) => ({
            id: p.id,
            nome: p.nome,
            numeroInscricao: p.numeroInscricao,
            cidade: p.cidade,
            camisetaPrincipal: {
              tamanho: p.tamanhoCamiseta,
              tipo: p.tipoCamiseta,
              entregue: p.statusEntregaCamiseta === StatusEntrega.ENTREGUE,
              dataEntrega: p.dataEntregaCamiseta,
              entreguePor: p.entreguePor,
            },
            camisetasExtras: ((p as any).camisetasExtras || []).map(
              (extra: any) => ({
                id: extra.id,
                tamanho: extra.tamanho,
                tipo: extra.tipo,
                entregue: extra.statusEntrega === StatusEntrega.ENTREGUE,
                dataEntrega: extra.dataEntrega,
                entreguePor: extra.entreguePor,
              })
            ),
          })),
        },
        mensagem: "Relatório de entregas gerado com sucesso",
      };

      res.json(response);
    } catch (error) {
      console.error("💥 [EntregaController] Erro ao gerar relatório:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao gerar relatório de entregas",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }
}
