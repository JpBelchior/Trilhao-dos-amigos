import { Request, Response } from "express";
import { Participante, CamisetaExtra } from "../models";
import { ICriarParticipanteDTO, StatusPagamento } from "../types/models";
import { Op } from "sequelize";
import { AuthenticatedRequest } from "./GerenteController";

import { ParticipanteValidator } from "../validators/ParticipanteValidator";
import { ParticipanteService } from "../Service/participanteService";
import { LoteService, DATA_LIMITE_COMPETICAO } from "../Service/LoteService";
import { ResponseUtil } from "../utils/responseUtil";
import { formatarNome} from "../utils/formatarNome";

export class ParticipanteController {
  /**
   * POST /api/participantes - Criar participante PENDENTE
   */
  public static async criarParticipante(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const dadosParticipante: ICriarParticipanteDTO = req.body;

      console.log(
        " [ParticipanteController] Criando participante:",
        dadosParticipante.nome
      );

      // 1. VALIDAR usando Validator
      const validacao = await ParticipanteValidator.validarCriacao(
        dadosParticipante
      );
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          "Dados inválidos",
          validacao.detalhes
        );
      }

      // 2. CHAMAR Service
      const resultado = await ParticipanteService.criarParticipante(
        dadosParticipante
      );
      if (!resultado.sucesso) {
        return ResponseUtil.erroValidacao(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      // 3. RETORNAR sucesso
      return ResponseUtil.criado(
        res,
        resultado.participante,
        "Participante criado com sucesso! Prossiga para o pagamento."
      );
    } catch (error) {
      console.error(
        " [ParticipanteController] Erro ao criar participante:",
        error
      );
      return ResponseUtil.erroInterno(
        res,
        "Erro interno do servidor",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * PUT /api/participantes/:id - Editar participante (Admin)
   */
  public static async editarParticipante(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;
      const gerente = req.gerente;

      console.log(
        ` [ParticipanteController] Gerente ${gerente?.nome} editando participante ${id}`
      );

      // 1. VALIDAR usando Validator
      const validacao =
        ParticipanteValidator.validarCamposEditaveis(dadosAtualizacao);
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          validacao.errors[0],
          validacao.detalhes
        );
      }

      // 2. CHAMAR Service
      const resultado = await ParticipanteService.atualizarParticipante(
        parseInt(id),
        dadosAtualizacao
      );
      if (!resultado.sucesso) {
        return ResponseUtil.naoEncontrado(res, resultado.erro!);
      }

      // 3. RETORNAR sucesso
      return ResponseUtil.sucesso(
        res,
        resultado.participante,
        "Participante atualizado com sucesso"
      );
    } catch (error) {
      console.error(
        " [ParticipanteController] Erro ao editar participante:",
        error
      );
      return ResponseUtil.erroInterno(
        res,
        "Erro ao atualizar participante",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * PUT /api/participantes/:id/pagamento - Confirmar pagamento via API
   */
  public static async confirmarPagamento(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { numeroInscricao, pagamentoId } = req.body;

      console.log(
        ` [ParticipanteController] Confirmando pagamento para participante ${id}`
      );

      // 1. VALIDAR dados obrigatórios
      if (!numeroInscricao || !pagamentoId) {
        return ResponseUtil.erroValidacao(
          res,
          "Dados obrigatórios não informados",
          "numeroInscricao e pagamentoId são obrigatórios"
        );
      }

      // 2. CHAMAR Service
      const resultado = await ParticipanteService.confirmarParticipante(
        numeroInscricao,
        {
          id: pagamentoId,
          external_reference: numeroInscricao,
          date_approved: new Date().toISOString(),
        }
      );

      if (!resultado.sucesso) {
        return ResponseUtil.erroValidacao(res, resultado.erro!);
      }

      // 3. RETORNAR sucesso
      return ResponseUtil.sucesso(
        res,
        resultado.dados,
        "Pagamento confirmado com sucesso"
      );
    } catch (error) {
      console.error(
        " [ParticipanteController] Erro ao confirmar pagamento:",
        error
      );
      return ResponseUtil.erroInterno(
        res,
        "Erro ao confirmar pagamento",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * DELETE /api/participantes/:id - Excluir participante (Admin)
   */
  public static async excluirParticipante(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const gerente = req.gerente;

      console.log(
        ` [ParticipanteController] Gerente ${gerente?.nome} excluindo participante ${id}`
      );

      // CHAMAR Service com método MANUAL (permite qualquer status)
      const resultado = await ParticipanteService.excluirParticipante(
        parseInt(id)
      );

      if (!resultado.sucesso) {
        return ResponseUtil.erroValidacao(
          res,
          resultado.erro || "Não foi possível excluir o participante",
          "Participante não encontrado"
        );
      }

      return ResponseUtil.sucesso(
        res,
        null,
        "Participante excluído com sucesso"
      );
    } catch (error) {
      console.error(
        " [ParticipanteController] Erro ao excluir participante:",
        error
      );
      return ResponseUtil.erroInterno(
        res,
        "Erro ao excluir participante",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * Confirmar participante (método interno para PagamentoController)
   */
  public static async confirmarParticipante(
    numeroInscricao: string,
    pagamentoInfo: {
      id: string;
      external_reference: string;
      date_approved?: string;
    }
  ): Promise<{ sucesso: boolean; dados?: any; erro?: string }> {
    try {
      // CHAMAR Service
      return await ParticipanteService.confirmarParticipante(
        numeroInscricao,
        pagamentoInfo
      );
    } catch (error) {
      console.error(
        " [ParticipanteController] Erro ao confirmar participante:",
        error
      );
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Excluir participante pendente (método interno)
   */
  public static async excluirParticipantePendente(
    participanteId: number
  ): Promise<boolean> {
    try {
      // CHAMAR Service com método AUTOMÁTICO 
      return await ParticipanteService.excluirParticipantePendente(
        participanteId
      );
    } catch (error) {
      console.error(
        " [ParticipanteController] Erro ao excluir participante pendente:",
        error
      );
      return false;
    }
  }

  /**
   * GET /api/participantes - Listar participantes com filtros
   */
  public static async listarParticipantes(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const {
        nome,
        cidade,
        estado,
        categoriaMoto,
        statusPagamento,
        page = "1",
        limit = "50",
      } = req.query;

      // Construir filtros
      const where: any = {};

      if (nome) where.nome = { [Op.iLike]: `%${nome}%` };
      if (cidade) where.cidade = { [Op.iLike]: `%${cidade}%` };
      if (estado) where.estado = estado;
      if (categoriaMoto && categoriaMoto !== "todos")
        where.categoriaMoto = categoriaMoto;
      if (statusPagamento && statusPagamento !== "todos")
        where.statusPagamento = statusPagamento;

      // Paginação
      const pageNumber = Math.max(1, parseInt(page as string) || 1);
      const limitNumber = Math.min(
        100,
        Math.max(1, parseInt(limit as string) || 50)
      );
      const offset = (pageNumber - 1) * limitNumber;

      // Buscar participantes
      const { count, rows: participantes } = await Participante.findAndCountAll(
        {
          where,
          include: [
            { model: CamisetaExtra, as: "camisetasExtras", required: false },
          ],
          order: [["dataInscricao", "DESC"]],
          limit: limitNumber,
          offset,
        }
      );

      return ResponseUtil.sucesso(
        res,
        {
          participantes: participantes.map((p) => ({
            id: p.id,
            numeroInscricao: p.numeroInscricao,
            nome: formatarNome(p.nome),
            email: p.email,
            cpf: p.cpf,
            telefone: p.telefone,
            cidade: p.cidade,
            estado: p.estado,
            modeloMoto: p.modeloMoto,
            categoriaMoto: p.categoriaMoto,
            tamanhoCamiseta: p.tamanhoCamiseta,
            tipoCamiseta: p.tipoCamiseta,
            valorInscricao: p.valorInscricao,
            statusPagamento: p.statusPagamento,
            statusEntregaCamiseta: p.statusEntregaCamiseta,
            dataInscricao: p.dataInscricao,
            observacoes: p.observacoes,
            camisetasExtras: (p as any).camisetasExtras || [],
          })),
          paginacao: {
            paginaAtual: pageNumber,
            totalPaginas: Math.ceil(count / limitNumber),
            totalItens: count,
            itensPorPagina: limitNumber,
          },
        },
        `${participantes.length} participantes encontrados`
      );
    } catch (error) {
      console.error(
        " [ParticipanteController] Erro ao listar participantes:",
        error
      );
      return ResponseUtil.erroInterno(
        res,
        "Erro ao buscar participantes",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * GET /api/participantes/:id - Buscar participante específico
   */
  public static async buscarParticipante(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const participante = await Participante.findByPk(id, {
        include: [
          { model: CamisetaExtra, as: "camisetasExtras", required: false },
        ],
      });

      if (!participante) {
        return ResponseUtil.naoEncontrado(res, "Participante não encontrado");
      }

      return ResponseUtil.sucesso(res, {
        participante: {
          id: participante.id,
          numeroInscricao: participante.numeroInscricao,
          nome: participante.nome,
          email: participante.email,
          cpf: participante.cpf,
          telefone: participante.telefone,
          cidade: participante.cidade,
          estado: participante.estado,
          modeloMoto: participante.modeloMoto,
          categoriaMoto: participante.categoriaMoto,
          tamanhoCamiseta: participante.tamanhoCamiseta,
          tipoCamiseta: participante.tipoCamiseta,
          valorInscricao: participante.valorInscricao,
          statusPagamento: participante.statusPagamento,
          statusEntregaCamiseta: participante.statusEntregaCamiseta,
          dataInscricao: participante.dataInscricao,
          observacoes: participante.observacoes,
          camisetasExtras: (participante as any).camisetasExtras || [],
        },
      });
    } catch (error) {
      console.error(
        " [ParticipanteController] Erro ao buscar participante:",
        error
      );
      return ResponseUtil.erroInterno(
        res,
        "Erro ao buscar participante",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * Verificação automática de participantes cancelados
   */
  public static async executarVerificacaoAutomatica(): Promise<void> {
    try {
      console.log(
        " [ParticipanteController] Executando verificação automática..."
      );
      const limiteTempo = new Date();
      limiteTempo.setMinutes(limiteTempo.getMinutes() - 30);

      const participantesPendentes = await Participante.findAll({
        where: {
          statusPagamento: StatusPagamento.PENDENTE,
          dataInscricao: {
            [Op.lt]: limiteTempo,
          },
        },
      });

      console.log(
        ` Encontrados ${participantesPendentes.length} participantes para verificar`
      );

      for (const participante of participantesPendentes) {
        console.log(
          ` Cancelando participante pendente: ${participante.numeroInscricao}`
        );

        await ParticipanteService.excluirParticipantePendente(participante.id);
      }

      console.log(
        " [ParticipanteController] Verificação automática concluída"
      );
    } catch (error) {
      console.error(
        " [ParticipanteController] Erro na verificação automática:",
        error
      );
    }
  }

/**
 * POST /api/participantes/validar - Validar dados ANTES de criar participante
 */
public static async validarDados(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!LoteService.isInscricoesAbertas()) {
      return ResponseUtil.erroValidacao(
        res,
        "Inscrições encerradas",
        `As inscrições foram encerradas no dia da competição (${DATA_LIMITE_COMPETICAO.split("-").reverse().join("/")})`
      );
    }

    const dadosParticipante: ICriarParticipanteDTO = req.body;

    console.log(
      " [ParticipanteController] Validando dados:",
      dadosParticipante.email
    );

    // 1. VALIDAR formato dos dados usando Validator
    const validacao = await ParticipanteValidator.validarCriacao(
      dadosParticipante
    );
    if (!validacao.isValid) {
      return ResponseUtil.erroValidacao(
        res,
        "Dados inválidos",
        validacao.detalhes
      );
    }

    // 2. Verificar se EMAIL já existe
    const emailExiste = await ParticipanteService.verificarEmailExistente(
      dadosParticipante.email
    );
    if (emailExiste) {
      return ResponseUtil.erroValidacao(
        res,
        "Email já cadastrado",
        "Este email já está sendo usado por outro participante. Use outro email ou faça login se já tem cadastro."
      );
    }
    const cpfExiste = await ParticipanteService.verificarCPFExistente(
      dadosParticipante.cpf
    );
    if (cpfExiste) {
      return ResponseUtil.erroValidacao(
        res,
        "CPF já cadastrado",
        "Este CPF já está sendo usado por outro participante. Verifique seus dados ou entre em contato com o suporte."
      );
    }
    console.log(" [ParticipanteController] Dados válidos!");
    return ResponseUtil.sucesso(
      res,
      { valido: true },
      "Dados validados com sucesso"
    );
  } catch (error) {
    console.error(
      " [ParticipanteController] Erro ao validar dados:",
      error
    );
    return ResponseUtil.erroInterno(
      res,
      "Erro ao validar dados",
      error instanceof Error ? error.message : "Erro desconhecido"
    );
  }
}
}
