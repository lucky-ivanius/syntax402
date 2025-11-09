import type { CodeReview, ReviewRequest, ReviewResult } from "../types/code-review";

export type DismissReview = () => void;
export type OnReviewFinished = (result: ReviewResult) => void;

export interface CodeReviewService {
  getPrice: (reviewRequest: ReviewRequest) => number;
  start: (codeReview: CodeReview, onFinished: OnReviewFinished) => DismissReview;
}
