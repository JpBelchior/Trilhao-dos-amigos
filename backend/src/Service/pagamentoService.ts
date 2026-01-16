// backend/src/Service/pagamentoService.ts - VERSÃO REESTRUTURADA
import { MercadoPagoConfig, Payment } from "mercadopago";
import { Participante } from "../models";
import { StatusPagamento } from "../types/models";
import { ParticipanteController } from "../controllers/ParticipanteController";

// ========================================
// CONFIGURAÇÃO MERCADO PAGO COM VALIDAÇÃO
// ========================================

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
  console.error("❌ [ERRO CRÍTICO] MP_ACCESS_TOKEN não configurado no .env");
  console.error("   Configure MP_ACCESS_TOKEN no arquivo .env");
  console.error("   A aplicação não pode processar pagamentos sem essa configuração");
  process.exit(1); // Encerra a aplicação
}

console.log("✅ Mercado Pago configurado corretamente");

const client = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN,
  options: {
    timeout: 10000, // 10 segundos (aumentado de 5)
    idempotencyKey: undefined, // Será gerado por requisição
  },
});

const payment = new Payment(client);

// ========================================
// INTERFACES
// ========================================

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

// ========================================
// SERVIÇO DE PAGAMENTO
// ========================================

export class PagamentoService {
  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  /**
   * Gerar external_reference único
   */
  private static gerarExternalReference(numeroInscricao: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `trilhao_${numeroInscricao}_${timestamp}_${random}`;
  }

  /**
   * Calcular data de expiração (15 minutos - aumentado de 10)
   */
  private static calcularDataExpiracao(): string {
    const minutos = 15;
    return new Date(Date.now() + minutos * 60 * 1000).toISOString();
  }

  /**
   * Preparar dados do pagador
   */
  private static prepararDadosPagador(participante: any): any {
    const nomeCompleto = participante.nome.trim().split(" ");
    const cpfLimpo = participante.cpf.replace(/\D/g, "");

    return {
      email: participante.email.toLowerCase().trim(),
      first_name: nomeCompleto[0] || "Participante",
      last_name: nomeCompleto.slice(1).join(" ") || "Trilhao",
      identification: {
        type: "CPF",
        number: cpfLimpo,
      },
    };
  }

  /**
   * Buscar participante do banco
   */
  public static async buscarParticipante(
    participanteId: number
  ): Promise<any | null> {
    try {
      return await Participante.findByPk(participanteId);
    } catch (error) {
      console.error("❌ Erro ao buscar participante:", error);
      return null;
    }
  }

  /**
   * Salvar referência do pagamento no participante
   */
  private static async salvarReferenciaPagamento(
    participante: any,
    pagamentoId: string,
    externalReference: string,
    expiraEm: string
  ): Promise<void> {
    try {
      const obs = `PIX MP: ${pagamentoId} | Ref: ${externalReference} | Expira: ${new Date(
        expiraEm
      ).toLocaleString("pt-BR")}`;

      await participante.update({
        observacoes: obs,
      });

      console.log("✅ Referência salva nas observações do participante");
    } catch (error) {
      console.error("⚠️ Erro ao salvar referência (não crítico):", error);
    }
  }

  // ========================================
  // CRIAR PIX
  // ========================================

  /**
   * Criar PIX no Mercado Pago
   */
  public static async criarPix(
    participante: any,
    valorTotal: number
  ): Promise<CriarPixResult> {
    const logPrefix = `[PIX ${participante.numeroInscricao}]`;

    try {
      console.log(`🏦 ${logPrefix} Iniciando criação de PIX`);
      console.log(`💰 ${logPrefix} Valor: R$ ${valorTotal.toFixed(2)}`);

      // 1. VALIDAR Access Token
      if (!MP_ACCESS_TOKEN || MP_ACCESS_TOKEN === "") {
        console.error(`❌ ${logPrefix} Access Token do MP não configurado`);
        return {
          sucesso: false,
          erro: "Configuração inválida",
          detalhes:
            "Sistema de pagamento não configurado. Contate o administrador.",
        };
      }

      // 2. GERAR dados do pagamento
      const externalReference = this.gerarExternalReference(
        participante.numeroInscricao
      );
      const dataExpiracao = this.calcularDataExpiracao();

      const dadosPagamento = {
        transaction_amount: Number(valorTotal.toFixed(2)),
        description: `Trilhão dos Amigos ${new Date().getFullYear()} - ${
          participante.numeroInscricao
        }`,
        payment_method_id: "pix",
        payer: this.prepararDadosPagador(participante),
        external_reference: externalReference,
        date_of_expiration: dataExpiracao,
        notification_url: process.env.MP_WEBHOOK_URL || undefined,
      };

      console.log(`📋 ${logPrefix} Dados preparados:`, {
        valor: dadosPagamento.transaction_amount,
        referencia: externalReference,
        expiraEm: "15 minutos",
        pagador: {
          nome: `${dadosPagamento.payer.first_name} ${dadosPagamento.payer.last_name}`,
          cpf: dadosPagamento.payer.identification.number,
          email: dadosPagamento.payer.email,
        },
      });

      // 3. CRIAR PAGAMENTO NO MERCADO PAGO
      console.log(`🔄 ${logPrefix} Enviando requisição ao Mercado Pago...`);

      let pagamentoMp;
      try {
        pagamentoMp = await payment.create({
          body: dadosPagamento,
        });
      } catch (mpError: any) {
        console.error(`❌ ${logPrefix} Erro do Mercado Pago:`, mpError);
        console.log("🔥 TOKEN MP EM USO:", process.env.MP_ACCESS_TOKEN);
        console.log("🌍 NODE_ENV:", process.env.NODE_ENV);

        // Extrair mensagem de erro do MP
        const mensagemErro =
          mpError?.cause?.[0]?.description ||
          mpError?.message ||
          "Erro desconhecido do Mercado Pago";

        return {
          sucesso: false,
          erro: "Erro ao processar pagamento",
          detalhes: `Mercado Pago: ${mensagemErro}`,
        };
      }

      console.log(`✅ ${logPrefix} Pagamento criado no MP:`, {
        id: pagamentoMp.id,
        status: pagamentoMp.status,
        statusDetail: pagamentoMp.status_detail,
      });

      // 4. VALIDAR QR CODE
      const qrCode =
        pagamentoMp.point_of_interaction?.transaction_data?.qr_code;
      const qrCodeBase64 =
        pagamentoMp.point_of_interaction?.transaction_data?.qr_code_base64;

      if (!qrCode || !qrCodeBase64) {
        console.error(`❌ ${logPrefix} QR Code não foi gerado pelo MP`);
        console.error(
          `❌ ${logPrefix} Response completa:`,
          JSON.stringify(pagamentoMp, null, 2)
        );

        return {
          sucesso: false,
          erro: "QR Code não foi gerado",
          detalhes:
            "O Mercado Pago não retornou o QR Code. Tente novamente ou contate o suporte.",
        };
      }

      // 5. SALVAR REFERÊNCIA
      await this.salvarReferenciaPagamento(
        participante,
        pagamentoMp.id!.toString(),
        externalReference,
        dataExpiracao
      );

      // 6. RETORNAR SUCESSO
      console.log(`✅ ${logPrefix} PIX criado com sucesso!`);

      return {
        sucesso: true,
        dados: {
          // Dados do pagamento MP
          pagamentoId: pagamentoMp.id,
          status: pagamentoMp.status,
          externalReference: pagamentoMp.external_reference,

          // Dados do PIX
          qrCode: qrCode,
          qrCodeBase64: qrCodeBase64,
          ticket_url: pagamentoMp.point_of_interaction?.transaction_data?.ticket_url,

          // Dados do participante
          participante: {
            id: participante.id,
            numeroInscricao: participante.numeroInscricao,
            nome: participante.nome,
            email: participante.email,
            statusPagamento: participante.statusPagamento,
          },

          // Informações para exibição
          valor: valorTotal,
          descricao: dadosPagamento.description,
          expiraEm: dataExpiracao,
          minutosExpiracao: 15,

          // Debug
          debug: {
            mpId: pagamentoMp.id,
            mpStatus: pagamentoMp.status,
            mpStatusDetail: pagamentoMp.status_detail,
            tempoGeracao: new Date().toISOString(),
          },
        },
      };
    } catch (error) {
      console.error(`💥 ${logPrefix} Erro inesperado ao criar PIX:`, error);

      return {
        sucesso: false,
        erro: "Erro interno ao processar pagamento",
        detalhes:
          error instanceof Error
            ? error.message
            : "Erro desconhecido. Tente novamente.",
      };
    }
  }

  // ========================================
  // CONSULTAR STATUS
  // ========================================

  /**
   * Consultar status do pagamento no MP
   */
  public static async consultarStatus(
    pagamentoId: string
  ): Promise<ConsultarStatusResult> {
    try {
      console.log(`🔍 [Status] Consultando pagamento: ${pagamentoId}`);

      const pagamento = await payment.get({ id: pagamentoId });

      console.log(`📊 [Status] Recebido:`, {
        id: pagamento.id,
        status: pagamento.status,
        statusDetail: pagamento.status_detail,
      });

      // Verificar se foi aprovado
      const foiAprovado =
        pagamento.status === "approved" &&
        pagamento.status_detail === "accredited";

      let participanteConfirmado = false;

      // Se aprovado, confirmar participante
      if (foiAprovado && pagamento.external_reference) {
        console.log(`✅ [Status] Pagamento aprovado! Confirmando participante...`);

        const resultado = await ParticipanteController.confirmarParticipante(
          pagamento.external_reference,
          {
            id: pagamento.id!.toString(),
            external_reference: pagamento.external_reference,
            date_approved: pagamento.date_approved,
          }
        );

        participanteConfirmado = resultado.sucesso || false;
      }

      return {
        sucesso: true,
        dados: {
          id: pagamento.id,
          status: pagamento.status,
          statusDetail: pagamento.status_detail,
          approved: foiAprovado,
          valor: pagamento.transaction_amount,
          dataAprovacao: pagamento.date_approved,
        },
        participanteConfirmado,
      };
    } catch (error) {
      console.error(`❌ [Status] Erro ao consultar:`, error);

      return {
        sucesso: false,
        erro: "Erro ao consultar status",
        detalhes:
          error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  // ========================================
  // PROCESSAR WEBHOOK
  // ========================================

  /**
   * Processar webhook do Mercado Pago
   */
  public static async processarWebhook(
    webhookData: any
  ): Promise<ProcessarWebhookResult> {
    try {
      console.log("🔔 [Webhook] Recebido:", webhookData);

      const { type, data } = webhookData;

      // Ignorar se não for do tipo payment
      if (type !== "payment") {
        console.log(`⏭️ [Webhook] Tipo ${type} ignorado`);
        return { sucesso: true };
      }

      // Consultar status atualizado
      const resultado = await this.consultarStatus(data.id);

      return {
        sucesso: resultado.sucesso,
        participanteConfirmado: resultado.participanteConfirmado,
        erro: resultado.erro,
      };
    } catch (error) {
      console.error("❌ [Webhook] Erro ao processar:", error);

      return {
        sucesso: false,
        erro: "Erro ao processar webhook",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
}