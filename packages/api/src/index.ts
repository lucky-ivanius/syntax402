import app from "./app";
import { env } from "./env";
import { logger } from "./logger";

export const server = Bun.serve({
  fetch: app.fetch,
  port: env.PORT,
});
logger.info({ url: server.url }, `Application started!`);

export const stop = () => {
  server.stop();
  process.exit(0);
};

process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
