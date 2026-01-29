import sequelize from "../config/db";
import { Participante, CamisetaExtra, EstoqueCamiseta } from "../models";
import { TamanhoCamiseta, TipoCamiseta, StatusEntrega } from "../types/models";

interface AdicionarCamisetaExtraDTO {
  tamanho: TamanhoCamiseta;
  tipo: TipoCamiseta;
}

interface CamisetasExtrasResult {
  sucesso: boolean;
  dados?: any;
  erro?: string;
}

export class CamisetasExtrasService {
  /**
   * Adicionar camiseta extra para um participante
   */
  public static async adicionarCamisetaExtra(
    participanteId: number,
    dadosCamiseta: AdicionarCamisetaExtraDTO
  ): Promise<CamisetasExtrasResult> {
    const transaction = await sequelize.transaction();

    try {
      console.log(
        `➕ [CamisetasExtrasService] Adicionando camiseta extra para participante ${participanteId}:`,
        dadosCamiseta
      );

      // 1. Verificar se participante existe
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

      // 2. Verificar disponibilidade no estoque
      const estoque = await EstoqueCamiseta.findOne({
        where: {
          tamanho: dadosCamiseta.tamanho,
          tipo: dadosCamiseta.tipo,
        },
        transaction,
      });

      if (!estoque) {
        await transaction.rollback();
        return {
          sucesso: false,
          erro: `Estoque não encontrado para ${dadosCamiseta.tipo} tamanho ${dadosCamiseta.tamanho}`,
        };
      }

      if (estoque.quantidadeReservada >= estoque.quantidadeTotal) {
        await transaction.rollback();
        return {
          sucesso: false,
          erro: `Camiseta ${dadosCamiseta.tipo} tamanho ${dadosCamiseta.tamanho} indisponível no estoque`,
        };
      }

      // 3. Criar camiseta extra SEM hooks automáticos
      const novaCamisetaExtra = await CamisetaExtra.create(
        {
          participanteId: participanteId,
          tamanho: dadosCamiseta.tamanho,
          tipo: dadosCamiseta.tipo,
          preco: 50, // R$ 50 por camiseta extra
          statusEntrega: StatusEntrega.NAO_ENTREGUE,
        },
        {
          transaction,
          hooks: false, // ← IMPORTANTE: Desabilitar hooks para evitar conflitos
        }
      );

      // 4. MANUALMENTE: Atualizar valor da inscrição do participante
      await participante.increment("valorInscricao", {
        by: 50,
        transaction,
      });

      // 5. MANUALMENTE: Atualizar estoque (reservar camiseta)
      await estoque.increment("quantidadeReservada", {
        by: 1,
        transaction,
      });

      await transaction.commit();

      console.log(
        `✅ [CamisetasExtrasService] Camiseta extra criada:`,
        novaCamisetaExtra.id
      );

      return {
        sucesso: true,
        dados: {
          camisetaExtra: novaCamisetaExtra,
          participante: {
            id: participante.id,
            valorInscricao: participante.valorInscricao + 50,
          },
        },
      };
    } catch (error) {
      await transaction.rollback();
      console.error(
        "💥 [CamisetasExtrasService] Erro ao adicionar camiseta extra:",
        error
      );

      return {
        sucesso: false,
        erro: "Erro interno do servidor",
      };
    }
  }

  /**
   * Remover camiseta extra específica
   */
  public static async removerCamisetaExtra(
    camisetaExtraId: number
  ): Promise<CamisetasExtrasResult> {
    const transaction = await sequelize.transaction();

    try {
      console.log(
        `🗑️ [CamisetasExtrasService] Removendo camiseta extra ${camisetaExtraId}`
      );

      // 1. Buscar camiseta extra
      const camisetaExtra = await CamisetaExtra.findByPk(camisetaExtraId, {
        transaction,
      });

      if (!camisetaExtra) {
        await transaction.rollback();
        return {
          sucesso: false,
          erro: "Camiseta extra não encontrada",
        };
      }

      // 2. Buscar participante
      const participante = await Participante.findByPk(
        camisetaExtra.participanteId,
        { transaction }
      );

      if (!participante) {
        await transaction.rollback();
        return {
          sucesso: false,
          erro: "Participante não encontrado",
        };
      }

      // 3. PRIMEIRO: Deletar camiseta extra (sem hooks para evitar conflito)
      await CamisetaExtra.destroy({
        where: { id: camisetaExtraId },
        transaction,
        hooks: false, // ← IMPORTANTE: Desabilitar hooks para evitar locks
      });

      // 4. DEPOIS: Atualizar participante manualmente
      await participante.decrement("valorInscricao", {
        by: camisetaExtra.preco,
        transaction,
      });

      // 5. DEPOIS: Liberar estoque manualmente
      const estoque = await EstoqueCamiseta.findOne({
        where: {
          tamanho: camisetaExtra.tamanho,
          tipo: camisetaExtra.tipo,
        },
        transaction,
      });

      if (estoque) {
        await estoque.decrement("quantidadeReservada", {
          by: 1,
          transaction,
        });
      }

      await transaction.commit();

      console.log(
        `✅ [CamisetasExtrasService] Camiseta extra removida: ${camisetaExtraId}`
      );

      return {
        sucesso: true,
        dados: {
          participante: {
            id: participante.id,
            valorInscricao: participante.valorInscricao - camisetaExtra.preco,
          },
        },
      };
    } catch (error) {
      await transaction.rollback();
      console.error(
        "💥 [CamisetasExtrasService] Erro ao remover camiseta extra:",
        error
      );

      return {
        sucesso: false,
        erro: "Erro interno do servidor",
      };
    }
  }
}
