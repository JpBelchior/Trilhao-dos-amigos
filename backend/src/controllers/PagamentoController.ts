// src/controllers/PagamentoController.ts
import { Request, Response } from "express";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { IApiResponse, StatusPagamento } from "../types/models";
import { Participante } from "../models";
import { ParticipanteController } from "./ParticipanteController";

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
  options: {
    timeout: 5000,
  },
});

const payment = new Payment(client);

export class PagamentoController {
  // POST /api/pagamento/criar-pix - Criar PIX para participante já existente (PENDENTE)
  public static async criarPagamentoPix(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { participanteId, valorTotal } = req.body;

      console.log(
        "🏦 [PagamentoController] Criando PIX para participante:",
        participanteId
      );

      // ✅ Buscar participante existente no banco
      const participante = await Participante.findByPk(participanteId);

      if (!participante) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Participante não encontrado",
          detalhes: "ID do participante inválido",
        };
        res.status(404).json(response);
        return;
      }

      // ✅ Verificar se participante está pendente
      if (participante.statusPagamento !== StatusPagamento.PENDENTE) {
        const response: IApiResponse = {
          sucesso: false,
          erro: "Participante não está pendente",
          detalhes: `Status atual: ${participante.statusPagamento}`,
        };
        res.status(400).json(response);
        return;
      }

      console.log("👤 Participante encontrado:", {
        id: participante.id,
        nome: participante.nome,
        numeroInscricao: participante.numeroInscricao,
        status: participante.statusPagamento,
      });

      // Gerar external_reference usando o número da inscrição
      const externalReference = `trilhao_${
        participante.numeroInscricao
      }_${Date.now()}`;

      // Dados do pagamento PIX
      const dadosPagamento = {
        transaction_amount: valorTotal,
        description: `Trilhão dos Amigos - ${participante.numeroInscricao} - ${participante.nome}`,
        payment_method_id: "pix",

        // Dados do pagador
        payer: {
          email: participante.email,
          first_name: participante.nome.split(" ")[0],
          last_name:
            participante.nome.split(" ").slice(1).join(" ") || "Participante",
          identification: {
            type: "CPF",
            number: participante.cpf.replace(/\D/g, ""), // Remove caracteres especiais
          },
        },

        // Referência externa para rastrear
        external_reference: externalReference,

        // URL de notificação (webhook)
        notification_url: `${process.env.BACKEND_URL}/api/pagamento/webhook`,

        // ✅ Configurações específicas do PIX - 10 minutos conforme solicitado
        date_of_expiration: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutos
      };

      console.log("📋 Criando pagamento no MP para:", {
        participante: participante.numeroInscricao,
        valor: valorTotal,
        expiraEm: "10 minutos",
      });

      // Criar pagamento no Mercado Pago
      const pagamentoMp = await payment.create({ body: dadosPagamento });

      console.log("✅ Pagamento criado no MP:", {
        id: pagamentoMp.id,
        status: pagamentoMp.status,
        external_reference: pagamentoMp.external_reference,
        qr_code: pagamentoMp.point_of_interaction?.transaction_data?.qr_code
          ? "Gerado"
          : "Não gerado",
      });

      // Verificar se o PIX foi criado corretamente
      if (!pagamentoMp.point_of_interaction?.transaction_data?.qr_code_base64) {
        console.error("❌ QR Code não foi gerado pelo MP");

        const response: IApiResponse = {
          sucesso: false,
          erro: "Erro ao gerar QR Code PIX",
          detalhes: "Mercado Pago não retornou o QR Code",
        };
        res.status(500).json(response);
        return;
      }

      // Salvar referência do pagamento no participante
      participante.observacoes =
        (participante.observacoes || "") +
        `\nPagamento MP criado: ${pagamentoMp.id} | Ref: ${externalReference} | Expira: ${dadosPagamento.date_of_expiration}`;
      await participante.save();

      // ✅ Agendar exclusão automática após 10 minutos (se não pagar)
      setTimeout(async () => {
        console.log(
          " Timeout de 10 minutos - verificando participante:",
          participante.id
        );
        await ParticipanteController.excluirParticipantePendente(
          participante.id!
        );
      }, 10 * 60 * 1000); // 10 minutos

      // Resposta de sucesso
      const response: IApiResponse = {
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
        mensagem: "PIX criado com sucesso. Pagamento expira em 10 minutos.",
      };

      res.json(response);
    } catch (error) {
      console.error(
        "💥 [PagamentoController] Erro ao criar pagamento PIX:",
        error
      );

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao processar pagamento",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // GET /api/pagamento/status/:id - Consultar status do pagamento
  public static async consultarStatusPagamento(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      console.log(
        "🔍 [PagamentoController] Consultando status do pagamento:",
        id
      );

      // Consultar pagamento no Mercado Pago
      const pagamentoMp = await payment.get({ id });

      console.log("📊 Status atual no MP:", {
        id: pagamentoMp.id,
        status: pagamentoMp.status,
        status_detail: pagamentoMp.status_detail,
      });

      // ✅ Se foi aprovado, confirmar participante
      if (pagamentoMp.status === "approved" && pagamentoMp.external_reference) {
        console.log("💳 Pagamento aprovado! Confirmando participante...");

        // Extrair número da inscrição do external_reference
        const match = pagamentoMp.external_reference.match(/trilhao_([^_]+)_/);
        if (match) {
          const numeroInscricao = match[1];
          await ParticipanteController.confirmarParticipante(numeroInscricao, {
            id: String(pagamentoMp.id ?? ""),
            external_reference: pagamentoMp.external_reference,
            date_approved: pagamentoMp.date_approved,
          });
        }
      }

      const response: IApiResponse = {
        sucesso: true,
        dados: {
          pagamentoId: pagamentoMp.id,
          status: pagamentoMp.status,
          statusDetail: pagamentoMp.status_detail,
          valor: pagamentoMp.transaction_amount,
          dataPagamento: pagamentoMp.date_approved,
          externalReference: pagamentoMp.external_reference,
        },
        mensagem: `Status: ${pagamentoMp.status}`,
      };

      res.json(response);
    } catch (error) {
      console.error(
        "💥 [PagamentoController] Erro ao consultar status:",
        error
      );

      const response: IApiResponse = {
        sucesso: false,
        erro: "Erro ao consultar status do pagamento",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      };

      res.status(500).json(response);
    }
  }

  // POST /api/pagamento/webhook - Receber notificações do Mercado Pago (AUTOMÁTICO)
  public static async receberWebhook(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log("🔔 [PagamentoController] Webhook recebido do MP:", req.body);

      const { type, data } = req.body;

      // Verificar se é notificação de pagamento
      if (type === "payment") {
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

        // ✅ Se o pagamento foi aprovado, confirmar participante AUTOMATICAMENTE
        if (
          pagamentoMp.status === "approved" &&
          pagamentoMp.external_reference
        ) {
          console.log(
            "🚀 PAGAMENTO APROVADO VIA WEBHOOK! Confirmando participante automaticamente..."
          );

          // Extrair número da inscrição do external_reference
          const match =
            pagamentoMp.external_reference.match(/trilhao_([^_]+)_/);
          if (match) {
            const numeroInscricao = match[1];
            const resultado =
              await ParticipanteController.confirmarParticipante(
                numeroInscricao,
                {
                  id: String(pagamentoMp.id ?? ""),
                  external_reference: pagamentoMp.external_reference,
                  date_approved: pagamentoMp.date_approved,
                }
              );

            if (resultado.sucesso) {
              console.log(
                "✅ Participante confirmado com sucesso via webhook!"
              );
            } else {
              console.warn(
                "⚠️ Falha ao confirmar participante via webhook:",
                resultado.erro
              );
            }
          }
        }
      }

      // ✅ Sempre responder com 200 para evitar reenvios do Mercado Pago
      res.status(200).json({ received: true });
    } catch (error) {
      console.error(
        "💥 [PagamentoController] Erro ao processar webhook:",
        error
      );

      // Mesmo com erro, é importante responder 200 para evitar reenvios
      res.status(200).json({
        erro: true,
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}
