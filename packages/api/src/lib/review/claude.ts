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
                        position: z
                          .number()
                          .describe(
                            `The position in the diff where you want to add a review comment. Note this value is not the same as the line number in the file. The position value equals the number of lines down from the first "@@" hunk header in the file you want to add a comment. The line just below the "@@" line is position 1, the next line is position 2, and so on. The position in the diff continues to increase through lines of whitespace and additional hunks until the beginning of a new file.`
                          )
                          .optional(),
                        line: z.number().optional().describe("Line number"),
                        side: z.enum(["left", "right"]).optional().describe("Side of the diff"),
                        start: z.number().optional().describe("Start line of the diff"),
                        startSide: z.enum(["left", "right"]).optional().describe("Start side of the diff"),
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
