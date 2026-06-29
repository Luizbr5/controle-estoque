import winston from "winston";
import { isProduction } from "./env";

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `[${ts}] ${level}: ${message}${metaStr}`;
  }),
);

export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: isProduction ? combine(timestamp(), json()) : devFormat,
  transports: [new winston.transports.Console()],
});

export const httpLogStream = {
  write: (message: string) => logger.info(message.trim()),
};
