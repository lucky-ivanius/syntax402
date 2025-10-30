import pino from "pino";

export type WithPinoLogger = {
  LOGGER: pino.Logger;
};

export interface LoggerOptions {
  service: string;
  version: string;
  environment?: "development" | "production";
  level?: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
  redactPath?: string[];
}

export const DEFAULT_REDACTED_PATHS = ["headers.authorization", "headers.cookie", 'headers["set-cookie"]'];

export const createPinoLogger = ({
  service,
  version,
  environment,
  level,
  redactPath = DEFAULT_REDACTED_PATHS,
}: LoggerOptions) => {
  const logger = pino({
    level,

    // Redact sensitive fields that might contain secrets
    redact: {
      paths: redactPath,
      censor: "[REDACTED]",
    },

    // Pretty print in development
    transport:
      environment === "development"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "yyyy-mm-dd HH:MM:ss.l Z",
            },
          }
        : undefined,

    // Production settings
    ...(environment === "production" && {
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    }),

    // Base context for all logs
    base: {
      service,
      version,
    },
  });

  return logger;
};
