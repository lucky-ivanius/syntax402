import type { EmitterWebhookEventName } from "@octokit/webhooks";
import type { IssueCommentEvent } from "@octokit/webhooks-types";
import { Hono } from "hono";
import { App } from "octokit";
import { v7 } from "uuid";

import type { Env } from "../env";
import type { GithubCodeReviewMetadata } from "../lib/github/metadata";
import type { CodeReviewRequest, FileChanges } from "../types/code-review";
import type { Payment } from "../types/payment";
import { createRandomPriceEstimator } from "../lib/ai/random/price-estimator";
import { badRequest, ok } from "../utils/response";

const webhookHandlers = new Hono<Env>();

webhookHandlers.post("/github", async (c) => {
  const app = new App({
    appId: c.env.GITHUB_APP_ID,
    privateKey: c.env.GITHUB_APP_PRIVATE_KEY,
    webhooks: {
      secret: c.env.GITHUB_WEBHOOK_SECRET,
    },
  });

  const event = c.req.header("X-GitHub-Event");
  if (!event) return badRequest(c, { error: "missing_github_event", message: "Invalid/missing event" });

  const eventPayload = await c.req.text();
  const signature = c.req.header("X-Hub-Signature-256");
  if (!signature) return badRequest(c, { error: "missing_github_signature", message: "Invalid/missing signature" });

  const isValid = await app.webhooks.verify(eventPayload, signature);
  if (!isValid) return badRequest(c, { error: "invalid_github_event", message: "Invalid/missing event" });

  switch (event as EmitterWebhookEventName) {
    case "issue_comment": {
      const { action, issue, repository, comment, installation } = JSON.parse(eventPayload) as IssueCommentEvent;
      if (!installation) return ok(c);

      const octokit = await app.getInstallationOctokit(installation.id);

      if (action !== "created") return ok(c);

      const { number: pr, pull_request } = issue;
      if (!pull_request) return ok(c);

      const { body } = comment;

      const {
        owner: { login: owner },
        name: repo,
      } = repository;

      const getPullRequest = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pr,
      });

      const { data: prData } = getPullRequest;

      if (body.includes("/done")) {
        const commitStatus = await c.env.KV.get(`review:${prData.head.sha}:commit_status_id`);
        if (!commitStatus) return ok(c);

        await octokit.rest.repos.createCommitStatus({
          owner,
          repo,
          sha: prData.head.sha,
          state: "success",
          context: "syntax402/review",
          description: "PR Reviewed",
          operationName: "syntax402/review",
        });

        await octokit.rest.pulls.createReview({
          owner,
          repo,
          pull_number: pr,
          body: "LGTM 👍",
          event: "COMMENT",
        });

        return ok(c);
      }
      if (!body.includes("/review")) return ok(c);

      const compareCommits = await octokit.rest.repos.compareCommits({
        owner,
        repo,
        base: prData.base.sha,
        head: prData.head.sha,
      });

      const { data: comparison } = compareCommits;

      if (!comparison.files?.length) return ok(c);

      const fileChanges: FileChanges = comparison.files.reduce((acc, file) => {
        acc[file.filename] = {
          status: file.status,
          patch: file.patch,
        };

        return acc;
      }, {} as FileChanges);

      const fileNames = Object.keys(fileChanges);
      if (!fileNames.length) {
        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: pr,
          body: `# syntax402 - Review Request\n\nThere's no files to review. Please make sure you've added the files you want to review.`,
        });

        return ok(c);
      }

      const reviewRequest: CodeReviewRequest = {
        files: fileChanges,
      };

      const reviewPriceEstimator = createRandomPriceEstimator();

      const price = await reviewPriceEstimator.estimate(reviewRequest);

      const id = v7();

      const paymentComment = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pr,
        body: `# syntax402 - Review Request\n**Files:** ${fileNames.length} file(s)\n**Cost:** $${price} USDC\n\n**Pay:** ${c.env.PAYWALL_URL}/${id}`,
      });

      const payment: Payment<GithubCodeReviewMetadata> = {
        id,
        reviewRequest,
        price,
        redirectUrl: comment.html_url,
        metadata: {
          installationId: installation.id,
          owner,
          repo,
          pr,
          sha: prData.head.sha,
          paymentCommentId: paymentComment.data.id,
        },
      };

      await c.env.KV.put(`payment:${id}`, JSON.stringify(payment), {
        expirationTtl: parseInt(c.env.PAYMENT_EXPIRY_SECONDS, 10),
      });

      return ok(c);
    }
    default:
      return ok(c);
  }
});

export default webhookHandlers;
