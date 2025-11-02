import type { Network } from "x402/types";
import { createFacilitatorConfig } from "@coinbase/x402";
import { Hono } from "hono";
import { App } from "octokit";

import type { Env } from "../env";
import type { GithubCodeReviewMetadata } from "../lib/github/metadata";
import type { Payment } from "../types/payment";
import { x402PaymentMiddleware } from "../middlewares/x402";
import { notFound, ok, unauthorized } from "../utils/response";

const paymentsHandlers = new Hono<
  Env<{
    payment: Payment<GithubCodeReviewMetadata>;
  }>
>();

paymentsHandlers.get(
  "/:paymentId",
  async (c, next) => {
    const { paymentId } = c.req.param();

    const existingPayment = await c.env.KV.get(`payment:${paymentId}`);
    if (!existingPayment) return notFound(c, { error: "payment_not_found", message: "Payment not found" });

    const payment = JSON.parse(existingPayment) as Payment<GithubCodeReviewMetadata>;

    c.set("payment", payment);

    return next();
  },
  async (c, next) =>
    x402PaymentMiddleware({
      network: c.env.NETWORK as Network,
      payTo: c.env.RECIPIENT_WALLET_ADDRESS,
      price: c.var.payment.price,
      facilitatorConfig:
        c.env.ENV === "production"
          ? createFacilitatorConfig(c.env.CDP_API_KEY_ID, c.env.CDP_API_KEY_SECRET)
          : undefined,
    })(c, next),
  async (c) => {
    const app = new App({
      appId: c.env.GITHUB_APP_ID,
      privateKey: c.env.GITHUB_APP_PRIVATE_KEY,
      webhooks: {
        secret: c.env.GITHUB_WEBHOOK_SECRET,
      },
    });

    const { installationId, owner, repo, sha } = c.var.payment.metadata;

    const octokit = await app.getInstallationOctokit(installationId);
    if (!octokit) return unauthorized(c, { error: "github_app_not_installed", message: "GitHub app not installed" });

    await octokit.rest.repos.createCommitStatus({
      owner,
      repo,
      sha,
      state: "pending",
      context: "syntax402/review",
      description: "On progress",
      operationName: "syntax402/review",
    });

    await c.env.KV.delete(`payment:${c.var.payment.id}`);

    return ok(c);
  }
);

export default paymentsHandlers;
