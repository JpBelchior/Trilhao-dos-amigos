// backend/src/services/PagamentoService.ts
import { MercadoPagoConfig, Payment } from "mercadopago";
import { Participante } from "../models";
import { StatusPagamento } from "../types/models";
import { ParticipanteController } from "../controllers/ParticipanteController";

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
  options: {
    timeout: 5000,
  },
});

const payment = new Payment(client);

export interface CriarPixResult {
  sucesso: boolean;
  dados?: any;
  erro?: string;
  detalhes?: string;
}

export interface ConsultarStatusResult {
  sucesso: boolean;
  dados?: any;
  erro?: string;
  participanteConfirmado?: boolean;
  detalhes?: string;
}

export interface ProcessarWebhookResult {
  sucesso: boolean;
  participanteConfirmado?: boolean;
  erro?: string;
  detalhes?: string;
}

export class PagamentoService {
  // Gerar external_reference único para rastreamento

  private static gerarExternalReference(numeroInscricao: string): string {
    return `trilhao_${numeroInscricao}_${Date.now()}`;
  }

  // Calcular data de expiração (10 minutos)

  private static calcularDataExpiracao(): string {
    return new Date(Date.now() + 10 * 60 * 1000).toISOString();
  }

  //* Preparar dados do pagador para Mercado Pago

  private static prepararDadosPagador(participante: any): any {
    const nomeCompleto = participante.nome.split(" ");

    return {
      email: participante.email,
      first_name: nomeCompleto[0] || "Participante",
      last_name: nomeCompleto.slice(1).join(" ") || "Trilhão",
      identification: {
        type: "CPF",
        number: participante.cpf.replace(/\D/g, ""), // Remove caracteres especiais
      },
    };
  }

  // Criar PIX no Mercado Pago

  public static async criarPix(
    participante: any,
    valorTotal: number
  ): Promise<CriarPixResult> {
    try {
      console.log("🏦 [PagamentoService] Criando PIX para:", {
        participante: participante.numeroInscricao,
        valor: valorTotal,
      });

      // Gerar referência externa
      const externalReference = this.gerarExternalReference(
        participante.numeroInscricao
      );

      // Preparar dados do pagamento
      const dadosPagamento = {
        transaction_amount: valorTotal,
        description: `Trilhão dos Amigos - ${participante.numeroInscricao} - ${participante.nome}`,
        payment_method_id: "pix",
        payer: this.prepararDadosPagador(participante),
        external_reference: externalReference,
        date_of_expiration: this.calcularDataExpiracao(),
      };

      console.log("📋 Enviando para MP:", {
        valor: dadosPagamento.transaction_amount,
        descricao: dadosPagamento.description,
        expiraEm: "10 minutos",
      });

      // Criar pagamento no Mercado Pago
      const pagamentoMp = await payment.create({ body: dadosPagamento });

      console.log("✅ Pagamento criado no MP:", {
        id: pagamentoMp.id,
        status: pagamentoMp.status,
        qrCodeGerado:
          !!pagamentoMp.point_of_interaction?.transaction_data?.qr_code_base64,
      });

      // Verificar se o QR Code foi gerado
      if (!pagamentoMp.point_of_interaction?.transaction_data?.qr_code_base64) {
        console.error("❌ QR Code não foi gerado pelo MP");
        return {
          sucesso: false,
          erro: "Erro ao gerar QR Code PIX",
          detalhes: "Mercado Pago não retornou o QR Code",
        };
      }

      // Atualizar observações do participante
      await this.salvarReferenciaPagamento(
        participante,
        pagamentoMp,
        externalReference,
        dadosPagamento.date_of_expiration
      );

      // Agendar exclusão automática após 10 minutos
      this.agendarExclusaoAutomatica(participante.id);

      return {
        sucesso: true,
        dados: {
          // Dados do pagamento
          pagamentoId: pagamentoMp.id,
          status: pagamentoMp.status,
          externalReference: pagamentoMp.external_reference,

          // Dados do PIX
          qrCode:
            pagamentoMp.point_of_interaction?.transaction_data?.qr_code || "",
          qrCodeBase64:
            pagamentoMp.point_of_interaction?.transaction_data
              ?.qr_code_base64 || "",

          // Dados do participante
          participante: {
            id: participante.id,
            numeroInscricao: participante.numeroInscricao,
            nome: participante.nome,
            email: participante.email,
            statusPagamento: participante.statusPagamento,
          },

          // Dados para exibição
          valor: valorTotal,
          descricao: dadosPagamento.description,
          expiraEm: dadosPagamento.date_of_expiration,

          // Para debug
          mpResponse: {
            id: pagamentoMp.id,
            status: pagamentoMp.status,
            status_detail: pagamentoMp.status_detail,
          },
        },
      };
    } catch (error) {
      console.error("💥 [PagamentoService] Erro ao criar PIX:", error);

      return {
        sucesso: false,
        erro: "Erro ao processar pagamento",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  // Salvar referência do pagamento no participante

  private static async salvarReferenciaPagamento(
    participante: any,
    pagamentoMp: any,
    externalReference: string,
    dataExpiracao: string
  ): Promise<void> {
    try {
      participante.observacoes =
        (participante.observacoes || "") +
        `\nPagamento MP criado: ${pagamentoMp.id} | Ref: ${externalReference} | Expira: ${dataExpiracao}`;

      await participante.save();

      console.log("💾 Referência do pagamento salva no participante");
    } catch (error) {
      console.error("⚠️ Erro ao salvar referência:", error);
      // Não é crítico, continua o processo
    }
  }

  //Agendar exclusão automática após 10 minutos

  private static agendarExclusaoAutomatica(participanteId: number): void {
    setTimeout(async () => {
      console.log(
        "⏰ Timeout de 10 minutos - verificando participante:",
        participanteId
      );
      await ParticipanteController.excluirParticipantePendente(participanteId);
    }, 10 * 60 * 1000); // 10 minutos
  }

  //Consultar status do pagamento no Mercado Pago

  public static async consultarStatus(
    pagamentoId: string
  ): Promise<ConsultarStatusResult> {
    try {
      console.log(
        "🔍 [PagamentoService] Consultando status do pagamento:",
        pagamentoId
      );

      // Consultar pagamento no Mercado Pago
      const pagamentoMp = await payment.get({ id: pagamentoId });

      console.log("📊 Status atual no MP:", {
        id: pagamentoMp.id,
        status: pagamentoMp.status,
        status_detail: pagamentoMp.status_detail,
      });

      let participanteConfirmado = false;

      // Se foi aprovado, confirmar participante
      if (pagamentoMp.status === "approved" && pagamentoMp.external_reference) {
        console.log("💳 Pagamento aprovado! Confirmando participante...");

        const numeroInscricao = this.extrairNumeroInscricao(
          pagamentoMp.external_reference
        );
        if (numeroInscricao) {
          const resultado = await ParticipanteController.confirmarParticipante(
            numeroInscricao,
            {
              id: String(pagamentoMp.id ?? ""),
              external_reference: pagamentoMp.external_reference,
              date_approved: pagamentoMp.date_approved,
            }
          );

          if (resultado.sucesso) {
            participanteConfirmado = true;
            console.log("✅ Participante confirmado automaticamente");
          }
        }
      }

      return {
        sucesso: true,
        participanteConfirmado,
        dados: {
          pagamentoId: pagamentoMp.id,
          status: pagamentoMp.status,
          statusDetail: pagamentoMp.status_detail,
          valor: pagamentoMp.transaction_amount,
          dataPagamento: pagamentoMp.date_approved,
          externalReference: pagamentoMp.external_reference,
        },
      };
    } catch (error) {
      console.error("💥 [PagamentoService] Erro ao consultar status:", error);

      return {
        sucesso: false,
        erro: "Erro ao consultar status do pagamento",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  // Processar webhook do Mercado Pago

  public static async processarWebhook(
    dadosWebhook: any
  ): Promise<ProcessarWebhookResult> {
    try {
      console.log(
        "🔔 [PagamentoService] Processando webhook do MP:",
        dadosWebhook
      );

      const { type, data } = dadosWebhook;

      // Verificar se é notificação de pagamento
      if (type !== "payment") {
        return {
          sucesso: true, // Sucesso mas ignorado
          detalhes: `Tipo ${type} ignorado. Apenas 'payment' é processado.`,
        };
      }

      const pagamentoId = data.id;
      console.log("💰 Processando webhook de pagamento:", pagamentoId);

      // Consultar dados completos do pagamento
      const pagamentoMp = await payment.get({ id: pagamentoId });

      console.log("📋 Dados do pagamento via webhook:", {
        id: pagamentoMp.id,
        status: pagamentoMp.status,
        external_reference: pagamentoMp.external_reference,
        valor: pagamentoMp.transaction_amount,
      });

      let participanteConfirmado = false;

      // Se o pagamento foi aprovado, confirmar participante AUTOMATICAMENTE
      if (pagamentoMp.status === "approved" && pagamentoMp.external_reference) {
        console.log(
          "🚀 PAGAMENTO APROVADO VIA WEBHOOK! Confirmando participante automaticamente..."
        );

        const numeroInscricao = this.extrairNumeroInscricao(
          pagamentoMp.external_reference
        );
        if (numeroInscricao) {
          const resultado = await ParticipanteController.confirmarParticipante(
            numeroInscricao,
            {
              id: String(pagamentoMp.id ?? ""),
              external_reference: pagamentoMp.external_reference,
              date_approved: pagamentoMp.date_approved,
            }
          );

          if (resultado.sucesso) {
            participanteConfirmado = true;
            console.log("✅ Participante confirmado com sucesso via webhook!");
          } else {
            console.warn(
              "⚠️ Falha ao confirmar participante via webhook:",
              resultado.erro
            );
          }
        }
      }

      return {
        sucesso: true,
        participanteConfirmado,
        detalhes: participanteConfirmado
          ? "Participante confirmado automaticamente"
          : "Webhook processado",
      };
    } catch (error) {
      console.error("💥 [PagamentoService] Erro ao processar webhook:", error);

      return {
        sucesso: false,
        erro: "Erro ao processar webhook",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  // Simular status de pagamento (para desenvolvimento/testes)

  public static async simularStatus(
    pagamentoId: string,
    novoStatus: string,
    externalReference?: string,
    dateApproved?: string
  ): Promise<{
    sucesso: boolean;
    dados?: any;
    erro?: string;
    participanteConfirmado?: boolean;
    detalhes?: string;
  }> {
    try {
      console.log("🧪 [PagamentoService] Simulando status de pagamento:", {
        pagamentoId,
        novoStatus,
        externalReference,
      });

      let participanteConfirmado = false;

      // Se for simulação de aprovação, confirmar participante
      if (novoStatus === "approved" && externalReference) {
        console.log(
          "💳 Pagamento simulado como aprovado! Confirmando participante..."
        );

        const numeroInscricao = this.extrairNumeroInscricao(externalReference);
        if (numeroInscricao) {
          const resultado = await ParticipanteController.confirmarParticipante(
            numeroInscricao,
            {
              id: pagamentoId,
              external_reference: externalReference,
              date_approved: dateApproved || new Date().toISOString(),
            }
          );

          if (resultado.sucesso) {
            participanteConfirmado = true;
            console.log(
              "✅ Participante confirmado com sucesso via simulação!"
            );

            return {
              sucesso: true,
              participanteConfirmado: true,
              dados: {
                pagamentoId,
                status: "approved",
                statusDetail: "approved",
                participante: resultado.dados,
                simulado: true,
              },
            };
          } else {
            throw new Error(resultado.erro);
          }
        } else {
          throw new Error("Formato de external_reference inválido");
        }
      }

      // Para outros status, apenas retornar
      return {
        sucesso: true,
        dados: {
          pagamentoId,
          status: novoStatus,
          statusDetail: novoStatus,
          simulado: true,
        },
      };
    } catch (error) {
      console.error("💥 [PagamentoService] Erro ao simular status:", error);

      return {
        sucesso: false,
        erro: "Erro ao simular status do pagamento",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  // Extrair número de inscrição do external_reference

  private static extrairNumeroInscricao(
    externalReference: string
  ): string | null {
    const match = externalReference.match(/trilhao_([^_]+)_/);
    return match ? match[1] : null;
  }
  // Buscar participante por ID

  public static async buscarParticipante(participanteId: number): Promise<any> {
    try {
      const participante = await Participante.findByPk(participanteId);
      return participante;
    } catch (error) {
      console.error(
        "💥 [PagamentoService] Erro ao buscar participante:",
        error
      );
      return null;
    }
  }
}
