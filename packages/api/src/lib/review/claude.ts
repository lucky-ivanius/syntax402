import z from "zod";

import type { AiProvider } from "../../interfaces/ai";
import type { CodeReviewService } from "../../interfaces/code-review";
import type { ReviewResult } from "../../types/code-review";
import { calculateClaudeCodeReviewPrice } from "../pricing/code-review/claude";
import { buildCodeReviewRequestQueryPrompt } from "../prompt/code-review";

export type ClaudeModel = `claude-${string}`;

export const createClaudeCodeReview = (ai: AiProvider<ClaudeModel>): CodeReviewService => {
  return {
    getPrice: (reviewRequest) => {
      const prompt = buildCodeReviewRequestQueryPrompt(reviewRequest);
      const estimatedTokens = ai.countTokens(prompt);

      return calculateClaudeCodeReviewPrice(estimatedTokens, ai.pricePer1M.input, ai.pricePer1M.output);
    },

    start: (codeReview, onFinished) => {
      const abortController = new AbortController();

      ai.queryObject<ReviewResult, z.ZodType<ReviewResult>>(
        codeReview.prompt,
        z
          .object({
            files: z
              .record(
                z.string().describe("Filename"),
                z
                  .array(
                    z
                      .object({
                        comment: z.string().describe("Comments"),
                        position: z.number().describe("Line number"),
                      })
                      .describe("Inline comment")
                  )
                  .describe("List of inline comments")
              )
              .describe("File comments"),
            comment: z.string().describe("Overall review summary"),
          })
          .describe("Code review result"),
        abortController.signal
      ).then((result) => {
        onFinished(result);
      });

      return () => {
        abortController.abort();
      };
    },
  };
};
