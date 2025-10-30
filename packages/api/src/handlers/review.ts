import type { Network } from "x402/types";
import { createFacilitatorConfig } from "@coinbase/x402";
import { Hono } from "hono";

import type { Env } from "../env";
import { x402PaymentMiddleware } from "../middlewares/x402";
import { ok } from "../utils/response";

const reviewHandlers = new Hono<Env>();

reviewHandlers.get(
  "/",
  (c, next) =>
    x402PaymentMiddleware({
      network: c.env.NETWORK as Network,
      payTo: c.env.RECIPIENT_WALLET_ADDRESS,
      price: 0.025,
      facilitatorConfig:
        c.env.ENV === "production"
          ? createFacilitatorConfig(c.env.CDP_API_KEY_ID, c.env.CDP_API_KEY_SECRET)
          : undefined,
    })(c, next),
  async (c) => {
    return ok(c);
  }
);

export default reviewHandlers;
