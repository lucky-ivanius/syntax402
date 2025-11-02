export type FilePatch = {
  status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
  patch?: string;
};

export type FileChanges = {
  [filename: string]: FilePatch;
};

export interface CodeReviewRequest {
  files: FileChanges;
  style?: string[];
  focus?: string[];
  includes?: string[];
  excludes?: string[];
  context?: string;
}

export type InlineComment = {
  comment: string;
  position: number;
};

export type FileComments = {
  [filename: string]: InlineComment[];
};

export interface CodeReviewResult {
  files: FileComments;
  comment: string;
}
