import type { AiProvider } from "../../interfaces/ai";
import type { CodeReviewService } from "../../interfaces/code-review";
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

    start: (_codeReview, onFinished) => {
      // TODO: Implement actual AI integration
      // The prompt is already built and stored in codeReview.prompt
      // Example implementation:
      // const response = await ai.query(codeReview.prompt);
      // Parse response and extract file comments and overall comment

      new Promise((resolve) => setTimeout(resolve, 15000)).then(() => {
        onFinished({
          files: {},
          comment: `LGTM 👍`,
        });
      });

      return () => {};
    },
  };
};
