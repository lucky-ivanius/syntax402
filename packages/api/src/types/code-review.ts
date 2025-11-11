export type FilePatch = {
  status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
  patch?: string;
};

export type FileChanges = {
  [filename: string]: FilePatch;
};

export interface ReviewRequest {
  title: string;
  description: string | null;
  files: FileChanges;
  context?: string;
}

export type InlineComment = {
  comment: string;
  position: number;
};

export type FileComments = {
  [filename: string]: InlineComment[];
};

export interface ReviewResult {
  files: FileComments;
  comment: string;
}

export interface CodeReview {
  userId: string;
  owner: string;
  repo: string;
  pr: number;
  sha: string;
  reviewRequest: ReviewRequest;
  prompt: string;
}
