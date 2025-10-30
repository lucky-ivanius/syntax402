import type { HTTPResponseError } from "hono/types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";

import type { Env } from "./env";
import { createPinoLogger } from "./lib/logger";
import { badRequest, notFound, unauthorized, unexpectedError } from "./utils/response";

const app = new Hono<Env>();

app
  .use("*", async (c, next) => {
    const logger = createPinoLogger({
      service: "syntax402",
      version: "0.0.1",
      environment: c.env.ENV as "development" | "production",
      level: c.env.ENV === "production" ? "info" : "debug",
    });

    c.env.LOGGER = logger;

    next();
  })
  .use(cors())
  .use(trimTrailingSlash())
  .use(requestId())
  .use((c, next) => logger((str) => c.env.LOGGER.info(str))(c, next));

app.basePath("/v1").get("/", async (c) => {
  return c.text("Hello world!");
});

app
  .all("*", async (c) => notFound(c))
  .onError(async (err, c) => {
    const logger = c.env.LOGGER;

    const error = err as HTTPResponseError;
    if (!error.getResponse) {
      logger.error(err);

      return unexpectedError(c);
    }

    const response = error.getResponse();

    switch (response.status) {
      case 400:
        return badRequest(c, {
          message: error.message || "Bad request",
        });
      case 401:
        return unauthorized(c, {
          message: error.message || "Unauthorized",
        });
      case 404:
        return notFound(c);
      default:
        logger.error(err);

        return unexpectedError(c);
    }
  });

export default app;
