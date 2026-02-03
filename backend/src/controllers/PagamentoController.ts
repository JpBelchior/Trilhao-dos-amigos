import { Request, Response } from "express";

// Importar as classes SOLID
import { PagamentoValidator } from "../validators/PagamentoValidator";
import { PagamentoService } from "../Service/pagamentoService";
import { ResponseUtil } from "../utils/responseUtil";
import { MercadoPagoValidator } from "../utils/mercadoPagoValidator";

export class PagamentoController {
  /**
   * POST /api/pagamento/criar-pix - Criar PIX para participante
   * 🔒 SEGURANÇA: Valor vem do banco de dados, NÃO do frontend!
   */
  public static async criarPagamentoPix(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { participanteId } = req.body; // ✅ Só recebe o ID

    console.log(
      "🏦 [PagamentoController] Criando PIX para participante:",
      participanteId
    );

    // 1. VALIDAR dados básicos usando Validator
    const validacaoDados = PagamentoValidator.validarCriacaoPix({
      participanteId,
    });
    if (!validacaoDados.isValid) {
      return ResponseUtil.erroValidacao(
        res,
        "Dados inválidos",
        validacaoDados.detalhes
      );
    }

    // 2. BUSCAR participante usando Service
    const participante = await PagamentoService.buscarParticipante(
      parseInt(participanteId)
    );
    if (!participante) {
      return ResponseUtil.naoEncontrado(
        res,
        "Participante não encontrado",
        "ID do participante inválido"
      );
    }

    // 3. VALIDAR participante para PIX usando Validator
    const validacaoParticipante =
      PagamentoValidator.validarParticipanteParaPix(participante);
    if (!validacaoParticipante.isValid) {
      return ResponseUtil.erroValidacao(
        res,
        validacaoParticipante.errors[0],
        validacaoParticipante.detalhes
      );
    }
    const verificacao = await PagamentoService.verificarPixPendente(
      parseInt(participanteId)
    );
    
    if (verificacao.temPendente) {
      console.warn(
        `⚠️ [PagamentoController] Tentativa de criar PIX duplicado para participante ${participanteId}`
      );
      return ResponseUtil.erroValidacao(
        res,
        "PIX já existe",
        verificacao.mensagem
      );
    }

    // 5. Calcular valor total do banco
    const valorTotal = parseFloat(participante.valorInscricao);

    console.log("👤 Participante encontrado:", {
      id: participante.id,
      nome: participante.nome,
      numeroInscricao: participante.numeroInscricao,
      status: participante.statusPagamento,
      valorInscricao: valorTotal, // ✅ Valor seguro do banco
    });

    // 6. CRIAR PIX usando Service com valor DO BANCO
    const resultado = await PagamentoService.criarPix(
      participante,
      valorTotal 
    );

    if (!resultado.sucesso) {
      return ResponseUtil.erroInterno(
        res,
        resultado.erro!,
        resultado.detalhes
      );
    }

    // 7. RETORNAR sucesso
    return ResponseUtil.sucesso(
      res,
      resultado.dados,
      "PIX criado com sucesso. Pagamento expira em 15 minutos."
    );
  } catch (error) {
    console.error(
      "💥 [PagamentoController] Erro ao criar pagamento PIX:",
      error
    );
    return ResponseUtil.erroInterno(
      res,
      "Erro ao processar pagamento",
      error instanceof Error ? error.message : "Erro desconhecido"
    );
  }
}

  /**
   * GET /api/pagamento/status/:id - Consultar status do pagamento
   * RESPONSABILIDADE: Apenas orquestração (SRP)
   */
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

      // CHAMAR Service para consultar status
      const resultado = await PagamentoService.consultarStatus(id);

      if (!resultado.sucesso) {
        return ResponseUtil.erroInterno(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      const mensagem = resultado.participanteConfirmado
        ? "Pagamento aprovado! Participante confirmado."
        : `Status: ${resultado.dados?.status}`;

      return ResponseUtil.sucesso(res, resultado.dados, mensagem);
    } catch (error) {
      console.error(
        "💥 [PagamentoController] Erro ao consultar status:",
        error
      );
      return ResponseUtil.erroInterno(
        res,
        "Erro ao consultar status do pagamento",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  /**
   * POST /api/pagamento/webhook - Receber notificações do Mercado Pago
   */
  public static async receberWebhook(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log("🔔 [PagamentoController] Webhook recebido do MP:", req.body);

      // 1. VALIDAR ASSINATURA (segurança!)
      const assinaturaValida = MercadoPagoValidator.validarAssinaturaWebhook(
        req.body,
        req.headers
      );

      if (!assinaturaValida) {
        console.warn("⚠️ [Webhook] Assinatura inválida - requisição rejeitada");
        // Ainda retorna 200 para não gerar reenvios
        res.status(200).json({ 
          received: false, 
          erro: "Assinatura inválida" 
        });
        return;
      }

      // 2. VALIDAR TIMESTAMP (prevenir replay attacks)
      const timestampValido = MercadoPagoValidator.validarTimestamp(req.headers);

      if (!timestampValido) {
        console.warn("⚠️ [Webhook] Timestamp inválido - possível replay attack");
        res.status(200).json({ 
          received: false, 
          erro: "Timestamp inválido" 
        });
        return;
      }

      // 3. VALIDAR dados do webhook usando Validator
      const validacao = PagamentoValidator.validarWebhook(req.body);
      if (!validacao.isValid) {
        console.warn("⚠️ Webhook com dados inválidos:", validacao.detalhes);
        res.status(200).json({ received: false, erro: validacao.detalhes });
        return;
      }

      // 4. PROCESSAR webhook usando Service
      const resultado = await PagamentoService.processarWebhook(req.body);

      if (resultado.sucesso) {
        console.log("✅ Webhook processado com sucesso");

        if (resultado.participanteConfirmado) {
          console.log(
            "🎉 Participante confirmado automaticamente via webhook!"
          );
        }
      } else {
        console.warn("⚠️ Erro ao processar webhook:", resultado.erro);
      }

      // 5. SEMPRE responder 200 para evitar reenvios do Mercado Pago
      res.status(200).json({
        received: true,
        participanteConfirmado: resultado.participanteConfirmado || false,
      });
      return;
    } catch (error) {
      console.error(
        "💥 [PagamentoController] Erro ao processar webhook:",
        error
      );

      // Mesmo com erro, é importante responder 200 para evitar reenvios
      res.status(200).json({
        received: false,
        erro: error instanceof Error ? error.message : "Erro desconhecido",
      });
      return;
    }
  }

  /**
   * PUT /api/pagamento/status/:id - Simular status de pagamento (desenvolvimento)
   */
  public static async simularStatusPagamento(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status, external_reference, date_approved } = req.body;

      console.log("🧪 [PagamentoController] Simulando status de pagamento:", {
        id,
        status,
        external_reference,
      });

      // 1. VALIDAR dados da simulação usando Validator
      const validacao = PagamentoValidator.validarSimulacaoStatus(req.body);
      if (!validacao.isValid) {
        return ResponseUtil.erroValidacao(
          res,
          "Dados de simulação inválidos",
          validacao.detalhes
        );
      }

      // 2. SIMULAR status usando Service
      const resultado = await PagamentoService.simularStatus(
        id,
        status,
        external_reference,
        date_approved
      );

      if (!resultado.sucesso) {
        return ResponseUtil.erroInterno(
          res,
          resultado.erro!,
          resultado.detalhes
        );
      }

      const mensagem = resultado.participanteConfirmado
        ? "Pagamento simulado como aprovado"
        : `Status simulado: ${status}`;

      // 3. RETORNAR resultado
      return ResponseUtil.sucesso(res, resultado.dados, mensagem);
    } catch (error) {
      console.error("💥 [PagamentoController] Erro ao simular status:", error);
      return ResponseUtil.erroInterno(
        res,
        "Erro ao simular status do pagamento",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }
}