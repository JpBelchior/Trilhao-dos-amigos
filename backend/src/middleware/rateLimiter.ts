import rateLimit from 'express-rate-limit';

// ========================================
// RATE LIMITER PARA AUTENTICAÇÃO
// ========================================
// Protege contra tentativas de força bruta em login
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 tentativas
  message: {
    sucesso: false,
    erro: 'Muitas tentativas de login',
    detalhes: 'Você excedeu o limite de tentativas. Tente novamente em 15 minutos.',
  },
  standardHeaders: true, // Retorna info de rate limit nos headers
  legacyHeaders: false, // Desabilita headers antigos (X-RateLimit-*)
  
  // Função para gerar chave única por IP
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },

  // Handler customizado quando limite é atingido
  handler: (req, res) => {
    console.warn(`⚠️ [RateLimit] IP bloqueado (auth): ${req.ip}`);
    res.status(429).json({
      sucesso: false,
      erro: 'Muitas tentativas de login',
      detalhes: 'Você excedeu o limite de tentativas. Tente novamente em 15 minutos.',
    });
  },
});

// ========================================
// RATE LIMITER PARA CADASTRO
// ========================================
// Protege contra spam de cadastros
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Máximo 3 cadastros por hora
  message: {
    sucesso: false,
    erro: 'Limite de cadastros atingido',
    detalhes: 'Você excedeu o limite de cadastros por hora. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },

  handler: (req, res) => {
    console.warn(`⚠️ [RateLimit] IP bloqueado (cadastro): ${req.ip}`);
    res.status(429).json({
      sucesso: false,
      erro: 'Limite de cadastros atingido',
      detalhes: 'Você excedeu o limite de cadastros por hora. Tente novamente mais tarde.',
    });
  },
});

// ========================================
// RATE LIMITER PARA PAGAMENTO
// ========================================
// Protege contra spam de criação de pagamentos PIX
export const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 10, // Máximo 5 pagamentos em 10 minutos
  message: {
    sucesso: false,
    erro: 'Limite de tentativas de pagamento atingido',
    detalhes: 'Aguarde alguns minutos antes de tentar novamente.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },

  handler: (req, res) => {
    console.warn(`⚠️ [RateLimit] IP bloqueado (pagamento): ${req.ip}`);
    res.status(429).json({
      sucesso: false,
      erro: 'Limite de tentativas de pagamento atingido',
      detalhes: 'Aguarde alguns minutos antes de tentar novamente.',
    });
  },
});

// ========================================
// RATE LIMITER GERAL PARA API
// ========================================
// Protege contra abuso geral da API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3000, // Máximo 100 requisições em 15 minutos
  message: {
    sucesso: false,
    erro: 'Muitas requisições',
    detalhes: 'Você excedeu o limite de requisições. Tente novamente em alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },

  handler: (req, res) => {
    console.warn(`⚠️ [RateLimit] IP bloqueado (API geral): ${req.ip}`);
    res.status(429).json({
      sucesso: false,
      erro: 'Muitas requisições',
      detalhes: 'Você excedeu o limite de requisições. Tente novamente em alguns minutos.',
    });
  },
});