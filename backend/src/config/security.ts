import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export const securityMiddleware = {
  // Helmet para headers de segurança
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  }),

  // CORS configurado
  cors: cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  }),

  // Rate limiting
  limiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requisições por IP
    message: 'Muitas requisições, tente novamente depois',
    standardHeaders: true, // Retorna info em `RateLimit-*` headers
    legacyHeaders: false, // Desabilita `X-RateLimit-*` headers
  }),

  // Rate limit mais restritivo para login
  loginLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas por IP
    message: 'Muitas tentativas de login, tente novamente depois',
  }),
};

