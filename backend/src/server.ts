import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectDatabase, disconnectDatabase } from "./config/prisma";
import * as Sentry from "@sentry/node";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";

// Inicializar Sentry
Sentry.init({
  dsn: "https://93d2bc3cad32ac0f50d99b59638ed23b@o4511730618400768.ingest.us.sentry.io/4511730637144064",
  environment: "production",
  tracesSampleRate: 1.0,
});

// Rate limiters
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: "Muitas requisições, tente novamente depois",
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: "Muitas tentativas de login, tente novamente depois",
});

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  // Segurança: Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    })
  );

  // Segurança: CORS
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        process.env.FRONTEND_URL || "http://localhost:5173",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 3600,
    })
  );

  // Segurança: Rate Limiting geral
  app.use(limiter);

  // Segurança: Rate Limiting para login (mais restritivo)
  app.use("/api/v1/auth/login", loginLimiter);

  // Performance: Compressão de respostas (gzip)
  app.use(compression());

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 API rodando em http://localhost:${env.PORT}${env.API_PREFIX}`);
    logger.info(`📚 Swagger disponível em http://localhost:${env.PORT}/api-docs`);
    logger.info(`🔒 Segurança ativa: Helmet, CORS, Rate Limiting`);
    logger.info(`⚡ Performance ativa: Compressão Gzip, Caching`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Recebido ${signal}, encerrando graciosamente...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  logger.error("❌ Falha ao iniciar a aplicação", {
    error: err instanceof Error ? err.message : err,
  });
  process.exit(1);
});