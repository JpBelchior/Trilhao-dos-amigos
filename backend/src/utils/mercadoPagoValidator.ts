// backend/src/utils/mercadoPagoValidator.ts
import crypto from 'crypto';

/**
 * Validador de assinatura de webhooks do Mercado Pago
 * Garante que a notificação realmente veio do MP
 */
export class MercadoPagoValidator {
  /**
   * Validar assinatura do webhook do Mercado Pago
   * 
   * @param body - Corpo da requisição (req.body)
   * @param headers - Headers da requisição (req.headers)
   * @returns true se assinatura é válida, false caso contrário
   */
  public static validarAssinaturaWebhook(body: any, headers: any): boolean {
    try {
      // Em desenvolvimento, webhook não funciona (MP não acessa localhost)
      // Então permitimos requisições sem assinatura APENAS em dev
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ [Webhook] Validação de assinatura DESABILITADA em desenvolvimento');
        return true;
      }

      // 1. Extrair headers necessários
      const xSignature = headers['x-signature'];
      const xRequestId = headers['x-request-id'];

      if (!xSignature || !xRequestId) {
        console.warn('❌ [Webhook] Headers x-signature ou x-request-id ausentes');
        return false;
      }

      // 2. Extrair parâmetros da assinatura
      // Formato: ts=1234567890,v1=hash_value
      const parts = xSignature.split(',');
      let ts = '';
      let hash = '';

      for (const part of parts) {
        const [key, value] = part.split('=');
        if (key === 'ts') ts = value;
        if (key === 'v1') hash = value;
      }

      if (!ts || !hash) {
        console.warn('❌ [Webhook] Formato de assinatura inválido');
        return false;
      }

      // 3. Obter secret do webhook (configurado no painel do MP)
      const secret = process.env.MP_WEBHOOK_SECRET;

      if (!secret) {
        console.error('❌ [Webhook] MP_WEBHOOK_SECRET não configurado no .env');
        console.error('   Configure essa variável para validar webhooks em produção');
        return false;
      }

      // 4. Construir manifest (string que será hasheada)
      const dataId = body?.data?.id || '';
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

      // 5. Calcular hash HMAC SHA256
      const expectedHash = crypto
        .createHmac('sha256', secret)
        .update(manifest)
        .digest('hex');

      // 6. Comparar hashes (timing-safe para prevenir timing attacks)
      const isValid = crypto.timingSafeEqual(
        Buffer.from(hash, 'hex'),
        Buffer.from(expectedHash, 'hex')
      );

      if (!isValid) {
        console.warn('❌ [Webhook] Assinatura inválida! Possível tentativa de fraude.');
        console.warn('   Hash esperado:', expectedHash);
        console.warn('   Hash recebido:', hash);
      } else {
        console.log('✅ [Webhook] Assinatura válida - requisição autêntica do MP');
      }

      return isValid;

    } catch (error) {
      console.error('❌ [Webhook] Erro ao validar assinatura:', error);
      return false;
    }
  }

  /**
   * Validar timestamp do webhook (prevenir replay attacks)
   * Webhook não deve ter mais de 5 minutos
   */
  public static validarTimestamp(headers: any): boolean {
    try {
      const xSignature = headers['x-signature'];
      
      if (!xSignature) return false;

      // Extrair timestamp
      const tsPart = xSignature.split(',').find((p: string) => p.startsWith('ts='));
      if (!tsPart) return false;

      const ts = parseInt(tsPart.split('=')[1]);
      const agora = Math.floor(Date.now() / 1000);
      const diferenca = agora - ts;

      // Webhook deve ter menos de 5 minutos (300 segundos)
      const MAX_AGE = 300;

      if (diferenca > MAX_AGE) {
        console.warn(`❌ [Webhook] Timestamp muito antigo: ${diferenca}s (máximo: ${MAX_AGE}s)`);
        return false;
      }

      if (diferenca < 0) {
        console.warn('❌ [Webhook] Timestamp do futuro! Relógio do servidor pode estar errado.');
        return false;
      }

      return true;

    } catch (error) {
      console.error('❌ [Webhook] Erro ao validar timestamp:', error);
      return false;
    }
  }
}