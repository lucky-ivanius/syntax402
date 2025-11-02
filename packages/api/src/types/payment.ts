import type { CodeReviewRequest } from "./code-review";

export interface Payment<TMetadata = unknown> {
  id: string;
  reviewRequest: CodeReviewRequest;
  price: number;
  redirectUrl: string;
  metadata: TMetadata;
}
