import type { EmitterWebhookEventName } from "@octokit/webhooks";
import type { IssueCommentEvent } from "@octokit/webhooks-types";
import { addSeconds, formatDistanceToNow } from "date-fns";
import { Hono } from "hono";
import { v7 } from "uuid";

import type { CodeReview, FileChanges, ReviewRequest } from "../types/code-review";
import type { Payment } from "../types/payment";
import { IGNORE_PATTERNS } from "../consts/code-review";
import { claudeSonnet45Reviewer, githubApp, redis } from "../containers";
import { env } from "../env";
import { buildCodeReviewRequestQueryPrompt } from "../lib/prompt/code-review";
import { checkFile } from "../utils/file-filter";
import { badRequest, ok } from "../utils/response";
import { serialize } from "../utils/serializer";

const webhookHandlers = new Hono();

webhookHandlers.post("/github", async (c) => {
  const event = c.req.header("X-GitHub-Event");
  if (!event) return badRequest(c, { error: "missing_github_event", message: "Invalid/missing event" });

  const eventPayload = await c.req.text();
  const signature = c.req.header("X-Hub-Signature-256");
  if (!signature) return badRequest(c, { error: "missing_github_signature", message: "Invalid/missing signature" });

  const isValid = await githubApp.webhooks.verify(eventPayload, signature);
  if (!isValid) return badRequest(c, { error: "invalid_github_event", message: "Invalid/missing event" });

  switch (event as EmitterWebhookEventName) {
    case "issue_comment": {
      const { action, issue, repository, comment, installation } = JSON.parse(eventPayload) as IssueCommentEvent;
      if (!installation) return ok(c);

      const octokit = await githubApp.getInstallationOctokit(installation.id);

      if (action !== "created") return ok(c);

      const { number: pr, pull_request } = issue;
      if (!pull_request) return ok(c);

      const { body } = comment;

      if (!body.includes("/review")) return ok(c);
      const [, context] = body.split("/review");

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

      const compareCommits = await octokit.rest.repos.compareCommits({
        owner,
        repo,
        base: prData.base.sha,
        head: prData.head.sha,
      });

      const { data: comparison } = compareCommits;
      if (!comparison.files?.length) {
        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: pr,
          body: `# syntax402 - Review Request\n\nThere's no files to review. Please make sure you've added the files you want to review.`,
        });

        return ok(c);
      }

      const fileChanges: FileChanges = comparison.files.reduce((acc, file) => {
        if (checkFile(file.filename, IGNORE_PATTERNS)) {
          acc[file.filename] = {
            status: file.status,
            patch: file.patch,
          };
        }

        return acc;
      }, {} as FileChanges);

      if (Object.keys(fileChanges).length === 0) {
        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: pr,
          body: `# syntax402 - Review Request\n\nNo reviewable files found. All changed files are ignored (e.g., lock files, generated files, binaries).`,
        });

        return ok(c);
      }

      const reviewRequest: ReviewRequest = {
        title: prData.title,
        description: prData.body,
        files: fileChanges,
        context: context.trim(),
      };

      const prompt = buildCodeReviewRequestQueryPrompt(reviewRequest);
      const price = claudeSonnet45Reviewer.getPrice(reviewRequest);

      const id = v7();

      const expiresAt = addSeconds(new Date(), env.PAYMENT_EXPIRY_SECONDS);
      const expiresIn = formatDistanceToNow(expiresAt, { addSuffix: true });

      const requestPaymentComment = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pr,
        body: `# syntax402 - Review Request\n**Payment ID:** ${id}\n**Cost:** $${price} USDC\n**Expires:** ${expiresIn}\n\n**Pay:** ${env.PAYWALL_URL}/${id}`,
      });

      const payment: Payment<CodeReview> = {
        id,
        externalId: requestPaymentComment.data.id.toString(),
        price,
        description: `syntax402 - Code Review Request - ${id}`,
        redirectUrl: comment.html_url,
        metadata: {
          userId: installation.id.toString(),
          owner,
          repo,
          pr,
          sha: prData.head.sha,
          reviewRequest,
          prompt,
        },
      };

      await redis.setEx(`payment:${id}`, env.PAYMENT_EXPIRY_SECONDS, serialize(payment));

      return ok(c);
    }
    default:
      return ok(c);
  }
});

export default webhookHandlers;
