import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    sucesso: false,
    erro: 'Muitas tentativas de login',
    detalhes: 'Você excedeu o limite de tentativas. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? ''),
  handler: (req, res) => {
    console.warn(`⚠️ [RateLimit] IP bloqueado (auth): ${req.ip}`);
    res.status(429).json({
      sucesso: false,
      erro: 'Muitas tentativas de login',
      detalhes: 'Você excedeu o limite de tentativas. Tente novamente em 15 minutos.',
    });
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    sucesso: false,
    erro: 'Limite de cadastros atingido',
    detalhes: 'Você excedeu o limite de cadastros por hora. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? ''),
  handler: (req, res) => {
    console.warn(`⚠️ [RateLimit] IP bloqueado (cadastro): ${req.ip}`);
    res.status(429).json({
      sucesso: false,
      erro: 'Limite de cadastros atingido',
      detalhes: 'Você excedeu o limite de cadastros por hora. Tente novamente mais tarde.',
    });
  },
});

export const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    sucesso: false,
    erro: 'Limite de tentativas de pagamento atingido',
    detalhes: 'Aguarde alguns minutos antes de tentar novamente.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? ''),
  handler: (req, res) => {
    console.warn(`⚠️ [RateLimit] IP bloqueado (pagamento): ${req.ip}`);
    res.status(429).json({
      sucesso: false,
      erro: 'Limite de tentativas de pagamento atingido',
      detalhes: 'Aguarde alguns minutos antes de tentar novamente.',
    });
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  message: {
    sucesso: false,
    erro: 'Muitas requisições',
    detalhes: 'Você excedeu o limite de requisições. Tente novamente em alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? ''),
  handler: (req, res) => {
    console.warn(`⚠️ [RateLimit] IP bloqueado (API geral): ${req.ip}`);
    res.status(429).json({
      sucesso: false,
      erro: 'Muitas requisições',
      detalhes: 'Você excedeu o limite de requisições. Tente novamente em alguns minutos.',
    });
  },
});
