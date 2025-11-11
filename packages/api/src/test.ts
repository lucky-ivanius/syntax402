import { writeFile, writeFileSync } from "node:fs";

// import type { FileChanges, ReviewRequest } from "./types/code-review";
// import { githubApp } from "./containers";
// import { buildCodeReviewRequestQueryPrompt } from "./lib/prompt/code-review";
// import { shouldReviewFile } from "./utils/file-filter";

// const octokit = await githubApp.getInstallationOctokit(92403619);

// const owner = "lucky-ivanius";
// const repo = "syntax402";
// const pr = 2;

// const getPullRequest = await octokit.rest.pulls.get({
//   owner,
//   repo,
//   pull_number: pr,
// });

// const { data: prData } = getPullRequest;

// const compareCommits = await octokit.rest.repos.compareCommits({
//   owner,
//   repo,
//   base: prData.base.sha,
//   head: prData.head.sha,
// });

// const { data: comparison } = compareCommits;
// if (!comparison.files?.length) {
//   await octokit.rest.issues.createComment({
//     owner,
//     repo,
//     issue_number: pr,
//     body: `# syntax402 - Review Request\n\nThere's no files to review. Please make sure you've added the files you want to review.`,
//   });

//   process.exit(0);
// }

// const fileChanges: FileChanges = comparison.files.reduce((acc, file) => {
//   if (shouldReviewFile(file.filename)) {
//     acc[file.filename] = {
//       status: file.status,
//       patch: file.patch,
//     };
//   }

//   return acc;
// }, {} as FileChanges);

// if (Object.keys(fileChanges).length === 0) {
//   await octokit.rest.issues.createComment({
//     owner,
//     repo,
//     issue_number: pr,
//     body: `# syntax402 - Review Request\n\nNo reviewable files found. All changed files are ignored (e.g., lock files, generated files, binaries).`,
//   });

//   process.exit(0);
// }

// const reviewRequest: ReviewRequest = {
//   title: prData.title,
//   description: prData.body,
//   files: fileChanges,
//   // context: context.trim(),
// };

// const prompt = buildCodeReviewRequestQueryPrompt(reviewRequest);

// writeFileSync("prompt.txt", prompt);

const result = {
  files: {
    "packages/api/src/containers.ts": [
      {
        comment:
          "⚠️ **Async/Await Issue**: Top-level `await` can cause problems in module initialization.\n\nIf the Redis connection fails, it will crash the entire application before it can start. Consider moving this inside an initialization function:\n\n```suggestion\nexport let redis: ReturnType<typeof createClient>;\n\nexport async function initializeContainers() {\n  redis = createClient({\n    url: env.REDIS_URL,\n    commandOptions: {\n      typeMapping: {\n        [RESP_TYPES.BLOB_STRING]: Buffer,\n      },\n    },\n  });\n  await redis.connect();\n}\n```\n\nThen call `await initializeContainers()` in your startup sequence with proper error handling.",
        position: 19,
      },
    ],
    "packages/api/src/env.ts": [
      {
        comment:
          "🔒 **Security**: Missing validation for sensitive fields.\n\nThe `RECIPIENT_WALLET_ADDRESS` should be validated as a valid Solana address, and private keys should have format validation:\n\n```suggestion\nRECIPIENT_WALLET_ADDRESS: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address'),\nGITHUB_APP_PRIVATE_KEY: z.string().min(1, 'Private key is required'),\n```",
        position: 13,
      },
    ],
    "packages/api/src/handlers/payments.ts": [
      {
        comment:
          "⚠️ **Error Handling**: Missing error handling for Redis operations.\n\nIf `redis.get()` fails, it will throw an unhandled error:\n\n```suggestion\nconst paymentBuffer = await redis.get(`payment:${paymentId}`).catch((err) => {\n  logger.error({ error: err, paymentId }, 'Failed to retrieve payment from Redis');\n  return null;\n});\n```",
        position: 26,
      },
      {
        comment:
          "⚠️ **Race Condition**: Payment deletion happens before review completion.\n\nAt line 92, `redis.del()` is called before the async `claudeSonnet45Reviewer.start()` completes. If the system crashes mid-review, the payment record is lost but the review never finished:\n\n```suggestion\nclaudeSonnet45Reviewer.start(codeReview, async (result) => {\n  try {\n    await octokit.rest.repos.createCommitStatus(/*...*/);\n    await octokit.rest.pulls.createReview(/*...*/);\n    \n    // Delete payment only after successful completion\n    await redis.del(`payment:${c.var.payment.id}`);\n  } catch (error) {\n    logger.error({ error, paymentId: c.var.payment.id }, 'Review completion failed');\n  }\n});\n```",
        position: 92,
      },
      {
        comment:
          '🔒 **Security**: Missing authorization check.\n\nThe code doesn\'t verify that the payment\'s `userId` matches the installation. An attacker could potentially trigger a review for a different user\'s installation:\n\n```suggestion\nconst octokit = await githubApp.getInstallationOctokit(Number(userId));\nif (!octokit) return unauthorized(c, { error: "github_app_not_installed", message: "GitHub app not installed" });\n\n// Verify the installation matches the payment\nconst installation = await octokit.rest.apps.getAuthenticated();\nif (installation.data.id.toString() !== userId) {\n  return unauthorized(c, { error: "installation_mismatch", message: "Installation does not match payment" });\n}\n```',
        position: 58,
      },
    ],
    "packages/api/src/handlers/webhook.ts": [
      {
        comment:
          "⚠️ **Type Safety**: Missing null check for installation.\n\nWhile you check `if (!installation)`, TypeScript may not narrow the type properly in the subsequent code:\n\n```suggestion\nif (!installation?.id) {\n  logger.warn('Webhook received without installation');\n  return ok(c);\n}\n\nconst octokit = await githubApp.getInstallationOctokit(installation.id);\n```",
        position: 31,
      },
      {
        comment:
          "🔒 **Security**: Unvalidated user input in context.\n\nThe `context` from the comment body is passed directly without sanitization. This could lead to prompt injection attacks:\n\n```suggestion\nconst MAX_CONTEXT_LENGTH = 2000;\nconst [, rawContext] = body.split(\"/review\");\nconst context = rawContext?.trim().slice(0, MAX_CONTEXT_LENGTH) ?? '';\n\n// Optionally sanitize to prevent prompt injection\nconst sanitizedContext = context\n  .replace(/[<>]/g, '') // Remove potential HTML\n  .replace(/\\{\\{.*?\\}\\}/g, ''); // Remove template-like syntax\n```",
        position: 55,
      },
      {
        comment:
          "⚠️ **Error Handling**: No error handling for payment creation failure.\n\nIf `redis.setEx()` fails, the GitHub comment is already created but payment isn't stored:\n\n```suggestion\ntry {\n  await redis.setEx(`payment:${id}`, env.PAYMENT_EXPIRY_SECONDS, serialize(payment));\n} catch (error) {\n  logger.error({ error, paymentId: id }, 'Failed to store payment');\n  \n  // Clean up the GitHub comment\n  await octokit.rest.issues.deleteComment({\n    owner,\n    repo,\n    comment_id: requestPaymentComment.data.id,\n  });\n  \n  return unexpectedError(c);\n}\n```",
        position: 119,
      },
    ],
    "packages/api/src/lib/pricing/code-review/claude.ts": [
      {
        comment:
          "💡 **Documentation**: Add JSDoc explaining the pricing logic.\n\nThis would help future maintainers understand the 20% output estimate and 20% margin:\n\n```suggestion\n/**\n * Calculates the estimated cost for a Claude code review.\n * \n * @param estimatedInputTokens - Number of input tokens in the prompt\n * @param inputPricePer1M - Cost per 1M input tokens in USD\n * @param outputPricePer1M - Cost per 1M output tokens in USD\n * @returns Estimated cost in USD with 20% margin for variability\n * \n * Assumptions:\n * - Output is typically 20% of input for code reviews\n * - 20% margin added to account for variability in response length\n */\n```",
        position: 9,
      },
    ],
    "packages/api/src/lib/review/claude.ts": [
      {
        comment:
          "⚠️ **Incomplete Implementation**: TODO without tracking.\n\nThe TODO at line 17 indicates missing core functionality. Add a tracking issue:\n\n```suggestion\n// TODO(#123): Implement actual AI integration with Claude API\n// The prompt is already built and stored in codeReview.prompt\n// See: https://github.com/your-org/your-repo/issues/123\n```",
        position: 17,
      },
      {
        comment:
          "⚠️ **Memory Leak**: Missing cleanup for dismissed reviews.\n\nThe `start()` function returns a dismiss callback but never uses it. The 15s timeout will continue even if dismissed:\n\n```suggestion\nstart: (_codeReview, onFinished) => {\n  let dismissed = false;\n  \n  const timeoutId = setTimeout(() => {\n    if (dismissed) return;\n    \n    onFinished({\n      files: {},\n      comment: `LGTM 👍`,\n    });\n  }, 15000);\n\n  return () => {\n    dismissed = true;\n    clearTimeout(timeoutId);\n  };\n},\n```",
        position: 24,
      },
    ],
    "packages/api/src/middlewares/x402.ts": [
      {
        comment:
          "✅ **Great improvement**: The refactored middleware with `setContext` callback is much more flexible and type-safe than the previous implementation. This allows for better composition and easier testing.",
        position: 44,
      },
      {
        comment:
          "⚠️ **Error Handling**: `onSettlement` callback errors are not caught.\n\nIf `onSettlement()` throws an error, it will crash the request:\n\n```suggestion\nif (onSettlement) {\n  try {\n    await onSettlement(settlement);\n  } catch (error) {\n    logger.error({ error, settlement }, 'Settlement callback failed');\n    // Continue processing - settlement was successful even if callback failed\n  }\n}\n```",
        position: 117,
      },
    ],
    "packages/api/src/index.ts": [
      {
        comment:
          "⚠️ **Graceful Shutdown**: Missing cleanup for Redis connection.\n\nThe `stop()` function should clean up resources:\n\n```suggestion\nexport const stop = async () => {\n  logger.info('Shutting down application...');\n  \n  try {\n    await redis.quit();\n    logger.info('Redis connection closed');\n  } catch (error) {\n    logger.error({ error }, 'Error closing Redis connection');\n  }\n  \n  server.stop();\n  process.exit(0);\n};\n```",
        position: 11,
      },
    ],
    "packages/api/src/utils/serializer.ts": [
      {
        comment:
          "💡 **Type Safety**: Consider adding runtime validation.\n\nSince `deserialize` can return any type, consider adding validation:\n\n```suggestion\nexport const deserialize = <TData>(data: Buffer, validator?: (data: unknown) => data is TData): TData => {\n  const result = _deserialize(data);\n  \n  if (validator && !validator(result)) {\n    throw new Error('Deserialized data failed validation');\n  }\n  \n  return result as TData;\n};\n```",
        position: 4,
      },
    ],
    "docker-compose.yaml": [
      {
        comment:
          "⚡ **Performance**: Consider adding resource limits.\n\nFor production-like development, add resource constraints:\n\n```suggestion\nvalkey:\n  image: valkey/valkey:8.0.1-alpine\n  container_name: syntax402-valkey\n  deploy:\n    resources:\n      limits:\n        cpus: '0.5'\n        memory: 512M\n      reservations:\n        cpus: '0.25'\n        memory: 256M\n```",
        position: 4,
      },
    ],
    "packages/api/src/lib/ai/claude.ts": [
      {
        comment:
          "✅ **Excellent**: Proper token counting implementation with the official Anthropic tokenizer. The updated pricing constants ($3/$15 per 1M tokens) are also accurate for Claude Sonnet 4.5.",
        position: 11,
      },
    ],
  },
  comment:
    "## Summary\n\nThis is a significant refactor that migrates from Cloudflare Workers (Wrangler) to Bun runtime with Redis persistence. The overall architecture is solid, but there are **critical issues** that must be addressed before merging.\n\n### 🔴 Critical Issues\n\n1. **Race Condition in Payment Deletion** (`packages/api/src/handlers/payments.ts:92`) - Payment is deleted before async review completes, risking data loss\n2. **Security: Missing Authorization Check** (`packages/api/src/handlers/payments.ts:58`) - No verification that payment's userId matches the installation\n3. **Security: Prompt Injection Risk** (`packages/api/src/handlers/webhook.ts:55`) - User-provided context is unsanitized\n4. **Resource Cleanup** (`packages/api/src/containers.ts:19`) - Top-level await can crash app on Redis connection failure\n\n### 🟡 Important Recommendations\n\n- Add comprehensive error handling for all Redis operations\n- Implement graceful shutdown with proper resource cleanup\n- Add validation for sensitive environment variables (wallet addresses, private keys)\n- Fix memory leak in review dismiss callback\n- Add error handling for settlement callbacks\n\n### ⚡ Performance Considerations\n\n- Token counting is now efficient with official tokenizer\n- Consider adding Redis connection pooling for high load\n- Add resource limits to Docker Compose for production-like development\n\n### ✅ Highlights\n\n- **Excellent refactoring** of the x402 middleware - much more flexible and type-safe\n- **Great choice** using official Anthropic tokenizer for accurate pricing\n- **Smart pricing calculation** with reasonable output estimation and margin\n- **Clean separation** of concerns with the container pattern\n- **Good use** of Zod for environment validation\n- **Proper migration** from KV to Redis with serialization\n\n### 📝 Minor Improvements\n\n- Add JSDoc documentation for pricing calculations\n- Add tracking issues for TODOs\n- Consider type-safe deserialization with validators\n- Improve null checks for better TypeScript narrowing\n\n### Next Steps\n\n1. **Fix critical security and race condition issues**\n2. Add comprehensive error handling throughout\n3. Implement proper resource cleanup\n4. Add unit tests for new pricing and review logic\n5. Consider adding integration tests for the Redis-backed payment flow\n6. Document the migration from Cloudflare Workers to Bun",
};

const comments = Object.entries(result.files ?? {}).reduce(
  (acc, [filename, comments]) => {
    comments.forEach((comment) => {
      acc.push({
        path: filename,
        body: comment.comment,
        position: comment.position,
      });
    });

    return acc;
  },
  [] as { path: string; body: string; position: number }[]
);

writeFileSync("comments.txt", JSON.stringify(comments, null, 2));
