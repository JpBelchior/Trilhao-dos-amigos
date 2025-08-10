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
import { IBGEService } from "../Service/IBGEService";
import { escape } from "querystring";
import { AuthenticatedRequest } from "./GerenteController";

export class ParticipanteController {
  // POST /api/participantes - Criar participante PENDENTE (reserva camisetas)
  public static async criarParticipante(
    req: Request,
    res: Response
  ): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const dadosParticipante: ICriarParticipanteDTO = req.body;

      console.log(
        "🎯 [ParticipanteController] Criando participante PENDENTE:",
        dadosParticipante.nome
      );

      // Validação básica
      if (
        !dadosParticipante.nome ||
        !dadosParticipante.email ||
        !dadosParticipante.cpf ||
        !dadosParticipante.estado ||
        !dadosParticipante.cidade
      ) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Dados obrigatórios não informados",
          detalhes: "Nome, email, CPF, estado e cidade são obrigatórios",
        };
        res.status(400).json(response);
        await transaction.rollback();
        return;
      }

      // ✅ Verificar se email já existe
      const emailExiste = await Participante.findOne({
        where: { email: dadosParticipante.email },
        transaction,
      });

      const estadoValido = await IBGEService.validarEstado(
        dadosParticipante.estado
      );
      if (!estadoValido) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Estado inválido",
          detalhes: `"${dadosParticipante.estado}" não é um estado brasileiro válido`,
        };
        res.status(400).json(response);
        await transaction.rollback();
        return;
      }

      // ✅ Validar cidade brasileira via IBGE

      const cidadeValida = await IBGEService.validarCidade(
        dadosParticipante.cidade,
        dadosParticipante.estado
      );
      if (!cidadeValida) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Cidade inválida",
          detalhes: `"${dadosParticipante.cidade}" não existe no estado ${dadosParticipante.estado}`,
        };
        res.status(400).json(response);
        await transaction.rollback();
        return;
      }

      console.log(
        `✅ Localização validada: ${dadosParticipante.cidade}/${dadosParticipante.estado}`
      );

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

      //  Verificar se CPF já existe
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

      //  Verificar disponibilidade da camiseta grátis
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

      //  Verificar disponibilidade das camisetas extras
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

      //  Criar participante com status PENDENTE
      const novoParticipante = await Participante.create(
        {
          nome: dadosParticipante.nome,
          cpf: dadosParticipante.cpf,
          email: dadosParticipante.email,
          telefone: dadosParticipante.telefone,
          cidade: dadosParticipante.cidade,
          estado: dadosParticipante.estado,
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

      console.log(" Participante PENDENTE criado:", {
        id: novoParticipante.id,
        numeroInscricao: novoParticipante.numeroInscricao,
        nome: novoParticipante.nome,
        status: novoParticipante.statusPagamento,
      });

      //  Criar camisetas extras (reserva automaticamente)
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
          console.log(
            "👕 Camiseta extra reservada:",
            extra.tamanho,
            extra.tipo
          );
        }
      }

      //  Atualizar estoque (recalcular quantidades reservadas)
      await camisetaGratis.atualizarReservadas();
      console.log("📦 Estoque atualizado para camiseta principal");

      if (dadosParticipante.camisetasExtras) {
        for (const extra of dadosParticipante.camisetasExtras) {
          const estoque = await EstoqueCamiseta.findOne({
            where: { tamanho: extra.tamanho, tipo: extra.tipo },
          });
          if (estoque) {
            await estoque.atualizarReservadas();
            console.log(
              "📦 Estoque atualizado para extra:",
              extra.tamanho,
              extra.tipo
            );
          }
        }
      }

      await transaction.commit();

      console.log(" Participante PENDENTE criado + camisetas reservadas!");
      console.log(" Participante tem 10 minutos para pagar ou será excluído");

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
        mensagem:
          "Participante criado como PENDENTE. Prossiga para o pagamento.",
      };

      res.status(201).json(response);
    } catch (error) {
      await transaction.rollback();
      console.error(" Erro ao criar participante:", error);

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  //  Confirmar participante Pagamento confirmado
  public static async confirmarParticipante(
    numeroInscricao: string,
    pagamentoInfo: {
      id: string;
      external_reference: string;
      date_approved?: string;
    }
  ): Promise<{ sucesso: boolean; dados?: any; erro?: string }> {
    try {
      console.log(
        "✅ [ParticipanteController] Confirmando participante:",
        numeroInscricao
      );

      // Buscar participante pelo número da inscrição
      const participante = await Participante.findOne({
        where: { numeroInscricao },
      });

      if (!participante) {
        console.error("❌ Participante não encontrado:", numeroInscricao);
        return {
          sucesso: false,
          erro: "Participante não encontrado",
        };
      }

      if (participante.statusPagamento === StatusPagamento.CONFIRMADO) {
        console.log("⚠️ Participante já confirmado:", numeroInscricao);
        return {
          sucesso: true,
          dados: {
            id: participante.id,
            numeroInscricao: participante.numeroInscricao,
            nome: participante.nome,
            statusPagamento: participante.statusPagamento,
          },
        };
      }

      // Confirmar participante (mudar status)
      participante.statusPagamento = StatusPagamento.CONFIRMADO;
      participante.observacoes =
        (participante.observacoes || "") +
        `\nPagamento confirmado: ${pagamentoInfo.id} | Data: ${
          pagamentoInfo.date_approved || new Date().toISOString()
        }`;

      await participante.save();

      console.log(
        "🎉 [ParticipanteController] Participante confirmado com sucesso:",
        {
          id: participante.id,
          numeroInscricao: participante.numeroInscricao,
          nome: participante.nome,
          status: participante.statusPagamento,
        }
      );

      return {
        sucesso: true,
        dados: {
          id: participante.id,
          numeroInscricao: participante.numeroInscricao,
          nome: participante.nome,
          email: participante.email,
          valorInscricao: participante.valorInscricao,
          statusPagamento: participante.statusPagamento,
        },
      };
    } catch (error) {
      console.error(
        "💥 [ParticipanteController] Erro ao confirmar participante:",
        error
      );

      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  //  Excluir participante pendente (libera camisetas)
  public static async excluirParticipantePendente(
    participanteId: number
  ): Promise<boolean> {
    try {
      console.log(
        "🗑️ [ParticipanteController] Excluindo participante pendente:",
        participanteId
      );

      const participante = await Participante.findByPk(participanteId);

      if (!participante) {
        console.log("👻 Participante já foi excluído:", participanteId);
        return false;
      }

      // Só excluir se ainda estiver pendente
      if (participante.statusPagamento !== StatusPagamento.PENDENTE) {
        console.log("⚠️ Participante não está mais pendente:", {
          id: participante.id,
          numeroInscricao: participante.numeroInscricao,
          status: participante.statusPagamento,
        });
        return false;
      }

      console.log("🗑️ Excluindo participante pendente após timeout:", {
        id: participante.id,
        numeroInscricao: participante.numeroInscricao,
        nome: participante.nome,
      });

      // ✅ Excluir participante (cascade vai excluir camisetas extras + liberar estoque automaticamente)
      await participante.destroy();

      console.log(
        "✅ [ParticipanteController] Participante excluído e camisetas liberadas:",
        participante.numeroInscricao
      );

      return true;
    } catch (error) {
      console.error(
        "💥 [ParticipanteController] Erro ao excluir participante pendente:",
        error
      );
      return false;
    }
  }

  public static async editarParticipante(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;
      const gerente = req.gerente;

      console.log(
        `📝 [ParticipanteController] Gerente ${gerente?.nome} editando participante ${id}`
      );

      // Buscar participante
      const participante = await Participante.findByPk(id, {
        transaction,
      });

      if (!participante) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Participante não encontrado",
        };
        res.status(404).json(response);
        await transaction.rollback();
        return;
      }

      // Campos que podem ser editados pelo admin
      const camposEditaveis = [
        "nome",
        "modeloMoto",
        "categoriaMoto",
        "statusPagamento",
        "observacoes",
      ];

      // Validar que apenas campos permitidos estão sendo alterados
      const camposInvalidos = Object.keys(dadosAtualizacao).filter(
        (campo) => !camposEditaveis.includes(campo)
      );

      if (camposInvalidos.length > 0) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Campos não editáveis detectados",
          detalhes: `Campos não permitidos: ${camposInvalidos.join(", ")}`,
        };
        res.status(400).json(response);
        await transaction.rollback();
        return;
      }

      // Apenas validações básicas necessárias
      // (Validações específicas removidas conforme solicitado)

      // Atualizar dados
      await participante.update(dadosAtualizacao, { transaction });

      await transaction.commit();

      console.log(
        `✅ Participante ${id} atualizado pelo gerente ${gerente?.nome}`
      );

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          id: participante.id,
          numeroInscricao: participante.numeroInscricao,
          nome: participante.nome,
          email: participante.email,
          cpf: participante.cpf,
          telefone: participante.telefone,
          estado: participante.estado,
          cidade: participante.cidade,
          modeloMoto: participante.modeloMoto,
          categoriaMoto: participante.categoriaMoto,
          statusPagamento: participante.statusPagamento,
          observacoes: participante.observacoes,
          tamanhoCamiseta: participante.tamanhoCamiseta,
          tipoCamiseta: participante.tipoCamiseta,
          valorInscricao: participante.valorInscricao,
          createdAt: participante.createdAt,
          updatedAt: participante.updatedAt,
        },
        mensagem: "Participante atualizado com sucesso",
      };

      res.json(response);
    } catch (error) {
      await transaction.rollback();
      console.error(
        "💥 [ParticipanteController] Erro ao editar participante:",
        error
      );

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao atualizar participante",
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
        estado,
        status = "todos",
        page = "1",
        limit = "50",
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Construir filtros
      const whereClause: any = {};
      if (estado) {
        whereClause.estado = { [Op.iLike]: `%${estado}}%` };
      }
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

  // PUT /api/participantes/:id/pagamento - Confirmar pagamento manualmente
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
        participante.observacoes =
          (participante.observacoes || "") +
          `\nComprovante manual: ${comprovante}`;
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

  public static async excluirParticipante(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const gerente = req.gerente;

      console.log(
        `🗑️ [ParticipanteController] Gerente ${gerente?.nome} excluindo participante ${id}`
      );

      // Buscar participante com camisetas extras
      const participante = await Participante.findByPk(id, {
        include: [
          {
            model: CamisetaExtra,
            as: "camisetasExtras",
          },
        ],
        transaction,
      });

      if (!participante) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Participante não encontrado",
        };
        res.status(404).json(response);
        await transaction.rollback();
        return;
      }

      // Buscar todas as camisetas para liberar do estoque
      const camisetasParaLiberar = [
        {
          tamanho: participante.tamanhoCamiseta,
          tipo: participante.tipoCamiseta,
        },
      ];

      // Adicionar camisetas extras
      const camisetasExtras = (participante as any).camisetasExtras || [];
      for (const extra of camisetasExtras) {
        camisetasParaLiberar.push({ tamanho: extra.tamanho, tipo: extra.tipo });
      }

      // Excluir participante (cascade vai excluir camisetas extras automaticamente)
      await participante.destroy({ transaction });

      console.log(
        `📦 Liberando camisetas no estoque para: ${participante.numeroInscricao}`
      );

      // Liberar todas as camisetas no estoque
      for (const camiseta of camisetasParaLiberar) {
        const estoque = await EstoqueCamiseta.findOne({
          where: { tamanho: camiseta.tamanho, tipo: camiseta.tipo },
          transaction,
        });

        if (estoque) {
          await estoque.atualizarReservadas();
          console.log(
            `✅ Camiseta liberada: ${camiseta.tamanho} ${camiseta.tipo}`
          );
        }
      }

      await transaction.commit();

      console.log(
        `✅ Participante excluído completamente pelo gerente ${gerente?.nome}`
      );

      const response: IApiResponse = {
        sucesso: true,
        mensagem: "Participante excluído com sucesso",
      };

      res.json(response);
    } catch (error) {
      await transaction.rollback();
      console.error(
        "💥 [ParticipanteController] Erro ao excluir participante:",
        error
      );

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao excluir participante",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }
  //  Excluir participantes com status CANCELADO do banco
  public static async verificarEExcluirCancelados(): Promise<{
    sucesso: boolean;
    excluidos: number;
    erro?: string;
  }> {
    const transaction = await sequelize.transaction();

    try {
      console.log(
        "🔍 [ParticipanteController] Verificando participantes cancelados no banco..."
      );

      // Buscar TODOS os participantes com status CANCELADO
      const participantesCancelados = await Participante.findAll({
        where: {
          statusPagamento: StatusPagamento.CANCELADO,
        },
        include: [
          {
            model: CamisetaExtra,
            as: "camisetasExtras",
          },
        ],
        transaction,
      });

      console.log(
        `📋 Encontrados ${participantesCancelados.length} participantes cancelados no banco`
      );

      if (participantesCancelados.length === 0) {
        await transaction.commit();
        return {
          sucesso: true,
          excluidos: 0,
        };
      }

      let totalExcluidos = 0;

      // Excluir cada participante cancelado
      for (const participante of participantesCancelados) {
        console.log(
          `🗑️ Excluindo participante cancelado: ${participante.numeroInscricao} - ${participante.nome}`
        );

        // Coletar informações das camisetas antes da exclusão
        const camisetaGratis = {
          tamanho: participante.tamanhoCamiseta,
          tipo: participante.tipoCamiseta,
        };

        const camisetasExtras = (participante as any).camisetasExtras || [];

        // EXCLUIR PARTICIPANTE (cascade vai excluir camisetas extras automaticamente)
        await participante.destroy({ transaction });
        totalExcluidos++;

        // ATUALIZAR ESTOQUE - liberar camisetas
        console.log(
          `📦 Liberando camisetas no estoque para: ${participante.numeroInscricao}`
        );

        // Liberar camiseta grátis
        const estoqueGratis = await EstoqueCamiseta.findOne({
          where: {
            tamanho: camisetaGratis.tamanho,
            tipo: camisetaGratis.tipo,
          },
          transaction,
        });

        if (estoqueGratis) {
          await estoqueGratis.atualizarReservadas();
          console.log(
            `✅ Camiseta grátis liberada: ${camisetaGratis.tamanho} ${camisetaGratis.tipo}`
          );
        }

        // Liberar camisetas extras
        for (const extra of camisetasExtras) {
          const estoqueExtra = await EstoqueCamiseta.findOne({
            where: {
              tamanho: extra.tamanho,
              tipo: extra.tipo,
            },
            transaction,
          });

          if (estoqueExtra) {
            await estoqueExtra.atualizarReservadas();
            console.log(
              `✅ Camiseta extra liberada: ${extra.tamanho} ${extra.tipo}`
            );
          }
        }

        console.log(
          `✅ Participante ${participante.numeroInscricao} excluído e camisetas liberadas`
        );
      }

      await transaction.commit();

      console.log(
        `🎉 Limpeza concluída! ${totalExcluidos} participantes cancelados foram excluídos do banco`
      );

      return {
        sucesso: true,
        excluidos: totalExcluidos,
      };
    } catch (error) {
      await transaction.rollback();
      console.error(
        "💥 [ParticipanteController] Erro ao verificar/excluir cancelados:",
        error
      );

      return {
        sucesso: false,
        excluidos: 0,
        erro: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  //  FUNÇÃO PARA EXECUTAR VERIFICAÇÃO AUTOMÁTICA A CADA 15 MINUTOS
  public static async executarVerificacaoAutomatica(): Promise<void> {
    try {
      console.log(
        "🔄 [VerificacaoAutomatica] Iniciando verificação de cancelados..."
      );

      const resultado =
        await ParticipanteController.verificarEExcluirCancelados();

      if (resultado.sucesso && resultado.excluidos > 0) {
        console.log(
          `✅ [VerificacaoAutomatica] ${resultado.excluidos} participantes cancelados excluídos`
        );
      } else if (resultado.sucesso && resultado.excluidos === 0) {
        console.log(
          "ℹ️ [VerificacaoAutomatica] Nenhum participante cancelado encontrado"
        );
      } else {
        console.error("❌ [VerificacaoAutomatica] Erro:", resultado.erro);
      }
    } catch (error) {
      console.error("💥 [VerificacaoAutomatica] Erro fatal:", error);
    }
  }
}
