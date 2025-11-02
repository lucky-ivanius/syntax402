import type { CodeReviewRequest } from "../types/code-review";

export interface PriceEstimator {
  estimate: (request: CodeReviewRequest) => Promise<number>;
}
