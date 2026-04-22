import {
  Participante,
  CamisetaExtra,
  EstoqueCamiseta,
  sequelize,
} from "../models";
import {
  IApiResponse,
  ICriarParticipanteDTO,
  StatusPagamento,
  StatusEntrega,
  TamanhoCamiseta,
  TipoCamiseta,
} from "../types/models";
import { Sanitizer } from "../utils/sanitizer";
import { LoteService, DATA_LIMITE_COMPETICAO } from "./LoteService";
import { Op } from "sequelize";

export interface CriarParticipanteResult extends IApiResponse {
  participante?: any;
}

export class ParticipanteService {
  /**
   * Calcular valor total da inscrição
   */
  private static async calcularValorInscricao(camisetasExtras: any[] = []): Promise<number> {
    const { precoInscricao, precoCamisa } = await LoteService.getPrecos();
    return precoInscricao + camisetasExtras.length * precoCamisa;
  }

  /**
   * Gerar número de inscrição único
   */
  private static async gerarNumeroInscricao(): Promise<string> {
    const ano = new Date().getFullYear();

    // Buscar último número de inscrição do ano
    const ultimoParticipante = await Participante.findOne({
      where: {
        numeroInscricao: {
          [Op.like]: `${ano}%`,
        },
      },
      order: [["numeroInscricao", "DESC"]],
    });

    let proximoNumero = 1;

    if (ultimoParticipante) {
      const ultimoNumero = parseInt(
        ultimoParticipante.numeroInscricao.substring(4)
      );
      proximoNumero = ultimoNumero + 1;
    }

    return `${ano}${proximoNumero.toString().padStart(4, "0")}`;
  }

  /**
   * Verificar se email já existe
   */
  public static async verificarEmailExistente(email: string): Promise<boolean> {
    const participanteExistente = await Participante.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    return !!participanteExistente;
  }

  /**
   * Verificar disponibilidade de camisetas no estoque
   */
  private static async verificarDisponibilidadeEstoque(
    tamanhoPrincipal: TamanhoCamiseta,
    tipoPrincipal: TipoCamiseta,
    camisetasExtras: any[] = []
  ): Promise<{ disponivel: boolean; erro?: string }> {
    // Verificar camiseta principal
    const estoquePrincipal = await EstoqueCamiseta.findOne({
      where: {
        tamanho: tamanhoPrincipal,
        tipo: tipoPrincipal,
      },
    });

    if (
      !estoquePrincipal ||
      estoquePrincipal.quantidadeReservada >= estoquePrincipal.quantidadeTotal
    ) {
      return {
        disponivel: false,
        erro: `Camiseta ${tipoPrincipal} tamanho ${tamanhoPrincipal} indisponível`,
      };
    }

    // Verificar camisetas extras
    for (const extra of camisetasExtras) {
      const estoqueExtra = await EstoqueCamiseta.findOne({
        where: {
          tamanho: extra.tamanho,
          tipo: extra.tipo,
        },
      });

      if (
        !estoqueExtra ||
        estoqueExtra.quantidadeReservada >= estoqueExtra.quantidadeTotal
      ) {
        return {
          disponivel: false,
          erro: `Camiseta extra ${extra.tipo} tamanho ${extra.tamanho} indisponível`,
        };
      }
    }

    return { disponivel: true };
  }

  /**
   * Reservar camisetas no estoque
   */
  private static async reservarCamisetas(
    tamanhoPrincipal: TamanhoCamiseta,
    tipoPrincipal: TipoCamiseta,
    camisetasExtras: any[] = [],
    transaction: any
  ): Promise<void> {
    // Reservar camiseta principal
    await EstoqueCamiseta.increment("quantidadeReservada", {
      by: 1,
      where: {
        tamanho: tamanhoPrincipal,
        tipo: tipoPrincipal,
      },
      transaction,
    });

    // Reservar camisetas extras
    for (const extra of camisetasExtras) {
      await EstoqueCamiseta.increment("quantidadeReservada", {
        by: 1,
        where: {
          tamanho: extra.tamanho,
          tipo: extra.tipo,
        },
        transaction,
      });
    }
  }

  /**
   * Criar participante PENDENTE
   */

  public static async verificarCPFExistente(cpf: string): Promise<boolean> {
    const cpfLimpo = cpf.replace(/\D/g, ""); // Remove caracteres não numéricos

    const participanteExistente = await Participante.findOne({
      where: {
        cpf: {
          [Op.or]: [
            cpfLimpo, // CPF sem formatação
            cpf.trim(), // CPF como veio (com ou sem formatação)
          ],
        },
      },
    });

    return !!participanteExistente;
  }

  public static async criarParticipante(
    dados: ICriarParticipanteDTO
  ): Promise<CriarParticipanteResult> {
    if (!LoteService.isInscricoesAbertas()) {
      return {
        sucesso: false,
        erro: "Inscrições encerradas",
        detalhes: `As inscrições foram encerradas no dia da competição (${DATA_LIMITE_COMPETICAO.split("-").reverse().join("/")})`,
      };
    }

    const transaction = await sequelize.transaction();

    try {
      console.log("🎯 [ParticipanteService] Criando participante:", dados.nome);

      // 1. Verificar se email já existe
      const emailExiste = await this.verificarEmailExistente(dados.email);
      if (emailExiste) {
        await transaction.rollback();
        return {
          sucesso: false,
          erro: "Email já cadastrado",
          detalhes: "Este email já está sendo usado por outro participante",
        };
      }

     
      const cpfExiste = await this.verificarCPFExistente(dados.cpf);
      if (cpfExiste) {
        await transaction.rollback();
        return {
          sucesso: false,
          erro: "CPF já cadastrado",
          detalhes: "Este CPF já está sendo usado por outro participante",
        };
      }

      // 3. Verificar disponibilidade no estoque
      const estoqueDisponivel = await this.verificarDisponibilidadeEstoque(
        dados.tamanhoCamiseta,
        dados.tipoCamiseta,
        dados.camisetasExtras || []
      );

      if (!estoqueDisponivel.disponivel) {
        await transaction.rollback();
        return {
          sucesso: false,
          erro: "Camiseta indisponível",
          detalhes: estoqueDisponivel.erro,
        };
      }

      // 4. Gerar número de inscrição
      const numeroInscricao = await this.gerarNumeroInscricao();

      // 5. Calcular valor total
      const { precoCamisa } = await LoteService.getPrecos();
      const valorTotal = await this.calcularValorInscricao(
        dados.camisetasExtras || []
      );

      // 6. Criar participante
      const dadosSanitizados = Sanitizer.sanitizeParticipanteData(dados);

      const participante = await Participante.create(
        {
          numeroInscricao,
          nome: dadosSanitizados.nome,
          cpf: dadosSanitizados.cpf,
          email: dadosSanitizados.email,
          telefone: dadosSanitizados.telefone,
          cidade: dadosSanitizados.cidade,
          estado: dadosSanitizados.estado,
          modeloMoto: dadosSanitizados.modeloMoto,
          categoriaMoto: dadosSanitizados.categoriaMoto,
          tamanhoCamiseta: dadosSanitizados.tamanhoCamiseta,
          tipoCamiseta: dadosSanitizados.tipoCamiseta,
          valorInscricao: valorTotal,
          statusPagamento: StatusPagamento.PENDENTE,
          statusEntregaCamiseta: StatusEntrega.NAO_ENTREGUE,
          observacoes: dadosSanitizados.observacoes || undefined,
          dataInscricao: new Date(),
        },
        { transaction }
      );

      // 7. Criar camisetas extras se houver
      if (dados.camisetasExtras && dados.camisetasExtras.length > 0) {
        const camisetasExtrasData = dados.camisetasExtras.map((extra) => ({
          participanteId: participante.id,
          tamanho: extra.tamanho,
          tipo: extra.tipo,
          preco: precoCamisa,
          statusEntrega: StatusEntrega.NAO_ENTREGUE,
        }));

        await CamisetaExtra.bulkCreate(camisetasExtrasData, { transaction });
      }

      // 8. Reservar camisetas no estoque
      await this.reservarCamisetas(
        dados.tamanhoCamiseta,
        dados.tipoCamiseta,
        dados.camisetasExtras || [],
        transaction
      );

      await transaction.commit();

      console.log("✅ [ParticipanteService] Participante criado:", {
        id: participante.id,
        numeroInscricao: participante.numeroInscricao,
        nome: participante.nome,
        valorTotal,
      });

      return {
        sucesso: true,
        participante: {
          id: participante.id,
          numeroInscricao: participante.numeroInscricao,
          nome: participante.nome,
          email: participante.email,
          valorInscricao: participante.valorInscricao,
          statusPagamento: participante.statusPagamento,
          dataInscricao: participante.dataInscricao,
          cidade: participante.cidade, 
          estado: participante.estado, 
          modeloMoto: participante.modeloMoto, 
          categoriaMoto: participante.categoriaMoto, 
        },
      };
    } catch (error) {
      await transaction.rollback();
      console.error(
        "💥 [ParticipanteService] Erro ao criar participante:",
        error
      );

      return {
        sucesso: false,
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Confirmar participante (pagamento aprovado)
   */
  public static async confirmarParticipante(
    numeroInscricao: string,
    pagamentoInfo: {
      id: string;
      external_reference: string;
      date_approved?: string;
    }
  ): Promise<IApiResponse> {
    try {
      console.log(
        "✅ [ParticipanteService] Confirmando participante:",
        numeroInscricao
      );

      // Buscar participante
      const participante = await Participante.findOne({
        where: { numeroInscricao },
      });

      if (!participante) {
        return {
          sucesso: false,
          erro: "Participante não encontrado",
        };
      }

      // Se já confirmado, retornar sucesso
      if (participante.statusPagamento === StatusPagamento.CONFIRMADO) {
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

      // Confirmar participante
      participante.statusPagamento = StatusPagamento.CONFIRMADO;
      participante.observacoes =
        (participante.observacoes || "") +
        `\nPagamento confirmado: ${pagamentoInfo.id} | Data: ${
          pagamentoInfo.date_approved || new Date().toISOString()
        }`;

      await participante.save();

      console.log("🎉 [ParticipanteService] Participante confirmado:", {
        id: participante.id,
        numeroInscricao: participante.numeroInscricao,
        nome: participante.nome,
      });

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
        "💥 [ParticipanteService] Erro ao confirmar participante:",
        error
      );

      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Atualizar participante (edição admin)
   */
  public static async atualizarParticipante(
    participanteId: number,
    dadosAtualizacao: any
  ): Promise<{ sucesso: boolean; participante?: any; erro?: string }> {
    const transaction = await sequelize.transaction();

    try {
      console.log(
        `📝 [ParticipanteService] Atualizando participante ${participanteId}`
      );

      const participante = await Participante.findByPk(participanteId, {
        transaction,
      });

      if (!participante) {
        await transaction.rollback();
        return {
          sucesso: false,
          erro: "Participante não encontrado",
        };
      }

      // Atualizar dados
      await participante.update(dadosAtualizacao, { transaction });
      await transaction.commit();

      console.log(
        `✅ [ParticipanteService] Participante ${participanteId} atualizado`
      );

      return {
        sucesso: true,
        participante: {
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
      };
    } catch (error) {
      await transaction.rollback();
      console.error(
        "💥 [ParticipanteService] Erro ao atualizar participante:",
        error
      );

      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : "Erro interno",
      };
    }
  }

  public static async excluirParticipantePendente(
    participanteId: number
  ): Promise<boolean> {
    try {
      console.log(
        "🗑️ [ParticipanteService] Excluindo participante pendente (automático):",
        participanteId
      );

      const participante = await Participante.findByPk(participanteId);

      if (!participante) {
        console.log("👻 Participante já foi excluído:", participanteId);
        return false;
      }

      // Só excluir se ainda estiver pendente (REGRA AUTOMÁTICA)
      if (participante.statusPagamento !== StatusPagamento.PENDENTE) {
        console.log("⚠️ Participante não está mais pendente:", {
          id: participante.id,
          status: participante.statusPagamento,
        });
        return false;
      }

      // Excluir participante (cascade vai liberar estoque automaticamente)
      await participante.destroy();

      console.log(
        "✅ [ParticipanteService] Participante pendente excluído automaticamente:",
        participante.numeroInscricao
      );
      return true;
    } catch (error) {
      console.error(
        "💥 [ParticipanteService] Erro ao excluir participante pendente:",
        error
      );
      return false;
    }
  }

  /**
   * Excluir participante (MANUAL - para gerentes)
   * Permite excluir participante independente do status
   */
  public static async excluirParticipante(
    participanteId: number
  ): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      console.log(
        "🗑️ [ParticipanteService] Excluindo participante (ação do gerente):",
        participanteId
      );

      const participante = await Participante.findByPk(participanteId);

      if (!participante) {
        console.log("👻 Participante não encontrado:", participanteId);
        return { sucesso: false, erro: "Participante não encontrado" };
      }

      // Log do status para debug
      console.log("📊 Status do participante:", {
        id: participante.id,
        status: participante.statusPagamento,
        nome: participante.nome,
        numeroInscricao: participante.numeroInscricao,
      });

      // GERENTE PODE EXCLUIR QUALQUER PARTICIPANTE
      await participante.destroy();

      console.log(
        "✅ [ParticipanteService] Participante excluído pelo gerente:",
        participante.numeroInscricao
      );

      return { sucesso: true };
    } catch (error) {
      console.error(
        "💥 [ParticipanteService] Erro ao excluir participante:",
        error
      );
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
}
