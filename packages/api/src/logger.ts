import { env } from "./env";
import { createPinoLogger } from "./lib/logger";

export const logger = createPinoLogger({
  service: Bun.env.npm_package_name ?? "unknown",
  version: Bun.env.npm_package_version ?? "0.0.0",
  environment: env.NODE_ENV,
  level: env.NODE_ENV === "development" ? "debug" : "info",
});
