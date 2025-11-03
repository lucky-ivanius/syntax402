import type { QueryBuilder } from "../../interfaces/query-builder";
import type { CodeReviewRequest } from "../../types/code-review";

export const createCodeReviewRequestQueryBuilder = (): QueryBuilder<CodeReviewRequest, string> => ({
  build: async (input) => {
    return "";
  },
});
