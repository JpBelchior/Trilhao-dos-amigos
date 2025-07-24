// src/controllers/ParticipanteController.ts
import { Request, Response } from "express";
import {
  Participante,
  CamisetaExtra,
  EstoqueCamiseta,
  sequelize,
} from "../models";
import {
  ICriarParticipanteDTO,
  IApiResponse,
  StatusPagamento,
} from "../types/models";
import { Op } from "sequelize";

export class ParticipanteController {
  // POST /api/participantes - Criar novo participante
  public static async criarParticipante(
    req: Request,
    res: Response
  ): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const dadosParticipante: ICriarParticipanteDTO = req.body;

      // Validação básica
      if (
        !dadosParticipante.nome ||
        !dadosParticipante.email ||
        !dadosParticipante.cpf
      ) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Dados obrigatórios não informados",
          detalhes: "Nome, email e CPF são obrigatórios",
        };
        res.status(400).json(response);
        await transaction.rollback();
        return;
      }

      // Verificar se email já existe
      const emailExiste = await Participante.findOne({
        where: { email: dadosParticipante.email },
        transaction,
      });

      if (emailExiste) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Email já cadastrado",
          detalhes: "Este email já está sendo usado por outro participante",
        };
        res.status(400).json(response);
        await transaction.rollback();
        return;
      }

      // Verificar se CPF já existe
      const cpfExiste = await Participante.findOne({
        where: { cpf: dadosParticipante.cpf },
        transaction,
      });

      if (cpfExiste) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "CPF já cadastrado",
          detalhes: "Este CPF já está sendo usado por outro participante",
        };
        res.status(400).json(response);
        await transaction.rollback();
        return;
      }

      // Verificar disponibilidade da camiseta grátis
      const camisetaGratis = await EstoqueCamiseta.findOne({
        where: {
          tamanho: dadosParticipante.tamanhoCamiseta,
          tipo: dadosParticipante.tipoCamiseta,
        },
        transaction,
      });

      if (!camisetaGratis || camisetaGratis.quantidadeDisponivel <= 0) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Camiseta indisponível",
          detalhes: `Camiseta ${dadosParticipante.tamanhoCamiseta} ${dadosParticipante.tipoCamiseta} não está disponível`,
        };
        res.status(400).json(response);
        await transaction.rollback();
        return;
      }

      // Verificar disponibilidade das camisetas extras
      if (
        dadosParticipante.camisetasExtras &&
        dadosParticipante.camisetasExtras.length > 0
      ) {
        for (const extra of dadosParticipante.camisetasExtras) {
          const estoque = await EstoqueCamiseta.findOne({
            where: {
              tamanho: extra.tamanho,
              tipo: extra.tipo,
            },
            transaction,
          });

          if (!estoque || estoque.quantidadeDisponivel <= 0) {
            const response: IApiResponse = {
              sucesso: false,
              erro: "Camiseta extra indisponível",
              detalhes: `Camiseta extra ${extra.tamanho} ${extra.tipo} não está disponível`,
            };
            res.status(400).json(response);
            await transaction.rollback();
            return;
          }
        }
      }

      // Calcular valor total
      const valorBase = 100.0; // Inscrição + camiseta grátis
      const qtdExtras = dadosParticipante.camisetasExtras?.length || 0;
      const valorExtras = qtdExtras * 50.0;
      const valorTotal = valorBase + valorExtras;

      // Criar participante
      const novoParticipante = await Participante.create(
        {
          nome: dadosParticipante.nome,
          cpf: dadosParticipante.cpf,
          email: dadosParticipante.email,
          telefone: dadosParticipante.telefone,
          cidade: dadosParticipante.cidade,
          modeloMoto: dadosParticipante.modeloMoto,
          categoriaMoto: dadosParticipante.categoriaMoto,
          tamanhoCamiseta: dadosParticipante.tamanhoCamiseta,
          tipoCamiseta: dadosParticipante.tipoCamiseta,
          valorInscricao: valorTotal,
          statusPagamento: StatusPagamento.PENDENTE,
          observacoes: dadosParticipante.observacoes,
        },
        { transaction }
      );

      // Criar camisetas extras
      if (
        dadosParticipante.camisetasExtras &&
        dadosParticipante.camisetasExtras.length > 0
      ) {
        for (const extra of dadosParticipante.camisetasExtras) {
          await CamisetaExtra.create(
            {
              participanteId: novoParticipante.id!,
              tamanho: extra.tamanho,
              tipo: extra.tipo,
              preco: 50.0,
            },
            { transaction }
          );
        }
      }

      // Atualizar estoque (recalcular quantidades reservadas)
      await camisetaGratis.atualizarReservadas();

      if (dadosParticipante.camisetasExtras) {
        for (const extra of dadosParticipante.camisetasExtras) {
          const estoque = await EstoqueCamiseta.findOne({
            where: { tamanho: extra.tamanho, tipo: extra.tipo },
          });
          if (estoque) {
            await estoque.atualizarReservadas();
          }
        }
      }

      await transaction.commit();

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          id: novoParticipante.id,
          numeroInscricao: novoParticipante.numeroInscricao,
          nome: novoParticipante.nome,
          email: novoParticipante.email,
          valorTotal: novoParticipante.valorInscricao,
          statusPagamento: novoParticipante.statusPagamento,
          camisetasExtras: qtdExtras,
        },
        mensagem: "Inscrição realizada com sucesso!",
      };

      res.status(201).json(response);
    } catch (error) {
      await transaction.rollback();
      console.error("Erro ao criar participante:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // GET /api/participantes - Listar participantes
  public static async listarParticipantes(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const {
        cidade,
        nome,
        status = "todos",
        page = "1",
        limit = "50",
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Construir filtros
      const whereClause: any = {};

      if (cidade) {
        whereClause.cidade = { [Op.iLike]: `%${cidade}%` };
      }

      if (nome) {
        whereClause.nome = { [Op.iLike]: `%${nome}%` };
      }

      if (status !== "todos") {
        whereClause.statusPagamento = status;
      }

      // Buscar participantes
      const { count, rows: participantes } = await Participante.findAndCountAll(
        {
          where: whereClause,
          include: [
            {
              model: CamisetaExtra,
              as: "camisetasExtras",
              required: false,
            },
          ],
          order: [["createdAt", "DESC"]],
          limit: limitNum,
          offset: offset,
        }
      );

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          participantes,
          totalItems: count,
          totalPages: Math.ceil(count / limitNum),
          currentPage: pageNum,
          itemsPerPage: limitNum,
        },
        mensagem: `${count} participantes encontrados`,
      };

      res.json(response);
    } catch (error) {
      console.error("Erro ao listar participantes:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao carregar participantes",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // GET /api/participantes/:id - Buscar participante específico
  public static async buscarParticipante(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const participante = await Participante.findByPk(id, {
        include: [
          {
            model: CamisetaExtra,
            as: "camisetasExtras",
          },
        ],
      });

      if (!participante) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Participante não encontrado",
        };
        res.status(404).json(response);
        return;
      }

      const response: IApiResponse = {
        sucesso: true,
        dados: participante,
        mensagem: "Participante encontrado",
      };

      res.json(response);
    } catch (error) {
      console.error("Erro ao buscar participante:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao buscar participante",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // PUT /api/participantes/:id/pagamento - Confirmar pagamento
  public static async confirmarPagamento(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status, comprovante } = req.body;

      const participante = await Participante.findByPk(id);

      if (!participante) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Participante não encontrado",
        };
        res.status(404).json(response);
        return;
      }

      // Atualizar status
      participante.statusPagamento = status;
      if (comprovante) {
        // Aqui você salvaria o comprovante (base64, URL, etc)
        participante.observacoes =
          (participante.observacoes || "") + `\nComprovante: ${comprovante}`;
      }

      await participante.save();

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          id: participante.id,
          numeroInscricao: participante.numeroInscricao,
          nome: participante.nome,
          statusPagamento: participante.statusPagamento,
        },
        mensagem: "Status de pagamento atualizado",
      };

      res.json(response);
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao atualizar pagamento",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }
}
