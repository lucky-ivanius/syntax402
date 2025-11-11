import { createFacilitatorConfig } from "@coinbase/x402";
import { App } from "octokit";
import { createClient, RESP_TYPES } from "redis";

import { env } from "./env";
import { createClaudeSonnet45AiProvider } from "./lib/ai/claude";
import { createClaudeCodeReview } from "./lib/review/claude";

export const coinbaseFacilitator = createFacilitatorConfig(env.CDP_API_KEY_ID, env.CDP_API_KEY_SECRET);

export const redis = createClient({
  url: env.REDIS_URL,
  commandOptions: {
    typeMapping: {
      [RESP_TYPES.BLOB_STRING]: Buffer,
    },
  },
});
await redis.connect();

export const githubApp = new App({
  appId: env.GITHUB_APP_ID,
  privateKey: env.GITHUB_APP_PRIVATE_KEY,
  webhooks: {
    secret: env.GITHUB_WEBHOOK_SECRET,
  },
});

export const claudeSonnet45 = createClaudeSonnet45AiProvider();
export const claudeSonnet45Reviewer = createClaudeCodeReview(claudeSonnet45);
