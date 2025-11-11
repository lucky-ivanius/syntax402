import type { Network } from "x402/types";
import { Hono } from "hono";

import { deserialize } from "@syntax402/utils/serializer";

import type { CodeReview } from "../types/code-review";
import type { Payment } from "../types/payment";
import { claudeSonnet45Reviewer, coinbaseFacilitator, githubApp, redis } from "../containers";
import { env } from "../env";
import { x402PaymentMiddleware } from "../middlewares/x402";
import { notFound, ok, unauthorized } from "../utils/response";
import { shortenString } from "../utils/strings";

const paymentsHandlers = new Hono();

interface PaymentEnv {
  Variables: {
    payment: Payment<CodeReview>;
  };
}

paymentsHandlers.get(
  "/:paymentId",
  x402PaymentMiddleware<PaymentEnv>(async (c) => {
    const paymentId = c.req.param("paymentId");

    const paymentBuffer = await redis.get(`payment:${paymentId}`);
    if (!paymentBuffer) return notFound(c, { error: "payment_not_found", message: "Payment not found" });

    const payment = deserialize<Payment<CodeReview>>(paymentBuffer);

    c.set("payment", payment);

    return {
      network: env.NETWORK as Network,
      payTo: env.RECIPIENT_WALLET_ADDRESS,
      facilitatorConfig: env.NODE_ENV === "production" ? coinbaseFacilitator : undefined,
      price: payment.price,
      description: payment.description,
      onSettlement: async (settlement) => {
        if (!payment.externalId) return;

        const { userId, owner, repo } = c.var.payment.metadata;

        const octokit = await githubApp.getInstallationOctokit(Number(userId));
        if (!octokit) return;

        await octokit.rest.issues.updateComment({
          owner,
          repo,
          comment_id: Number(payment.externalId),
          body: `# syntax402 - Review Request\n\n**Payment ID:** ${c.var.payment.id}\n**Status:** Paid ✅\n**Tx hash:** [${shortenString(settlement.transaction)}](https://solscan.io/tx/${settlement.transaction}${env.NODE_ENV === "development" ? "?cluster=devnet" : ""})`,
        });
      },
    };
  }),
  async (c) => {
    const codeReview = c.var.payment.metadata;
    const { userId, owner, repo, sha, pr } = codeReview;

    const octokit = await githubApp.getInstallationOctokit(Number(userId));
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

    claudeSonnet45Reviewer.start(codeReview, async (result) => {
      await octokit.rest.repos.createCommitStatus({
        owner,
        repo,
        sha,
        state: "success",
        context: "syntax402/review",
        description: "PR Reviewed",
        operationName: "syntax402/review",
      });

      const comments = Object.entries(result.files ?? {}).reduce(
        (acc, [filename, comments]) => {
          comments.forEach((comment) => {
            acc.push({
              path: filename,
              body: comment.comment,
              position: comment.position,
              line: comment.line,
              side: comment.side,
              start_line: comment.start,
              start_side: comment.startSide,
            });
          });

          return acc;
        },
        [] as {
          path: string;
          body: string;
          position?: number;
          line?: number;
          side?: "left" | "right";
          start_line?: number;
          start_side?: "left" | "right";
        }[]
      );
      const body = result.comment;

      await octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: pr,
        comments,
        body,
        event: "COMMENT",
      });

      await redis.del(`payment:${c.var.payment.id}`);
    });

    return ok(c);
  }
);

export default paymentsHandlers;
