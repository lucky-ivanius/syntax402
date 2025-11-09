import type { HTTPResponseError } from "hono/types";
import type { SolanaAddress } from "x402-hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";
import { decodePayment } from "x402/schemes";
import { paymentMiddleware } from "x402-hono";

import { env } from "./env";
import paymentsHandlers from "./handlers/payments";
import webhookHandlers from "./handlers/webhook";
import { logger } from "./logger";
import { badRequest, notFound, unauthorized, unexpectedError } from "./utils/response";

const app = new Hono();

app
  .use(cors())
  .use(trimTrailingSlash())
  .use(requestId())
  .use(honoLogger((str) => logger.info(str)));

app
  /* Set base /v1 path */
  .basePath("/v1")
  /* Register payment handlers */
  .route("/payments", paymentsHandlers)
  /* Register webhook handlers */
  .route("/webhook", webhookHandlers);

app
  .all("*", async (c) => notFound(c))
  .onError(async (err, c) => {
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
