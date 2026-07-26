import { PrismaClient } from "@prisma/client";
import { isProduction } from "./env";
import { logger } from "./logger";

export const prisma = new PrismaClient({
  log: isProduction ? ["error", "warn"] : ["warn", "error"],
});

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("✅ Conectado ao PostgreSQL via Prisma Client");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("🔌 Conexão com o banco de dados encerrada");
}
