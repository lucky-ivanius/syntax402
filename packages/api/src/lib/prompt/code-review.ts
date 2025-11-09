import type { ReviewRequest } from "../../types/code-review";

export const buildCodeReviewRequestQueryPrompt = (request: ReviewRequest): string => {
  const { files, context } = request;

  const fileEntries = Object.entries(files);

  if (fileEntries.length === 0) {
    return "";
  }

  let prompt = `You are an expert code reviewer. Please review the following pull request changes and provide constructive feedback.

`;

  if (context?.trim()) {
    prompt += `## Additional Context
${context.trim()}

`;
  }

  prompt += `## Files Changed (${fileEntries.length})

`;

  for (const [filename, filePatch] of fileEntries) {
    prompt += `### File: ${filename}
**Status:** ${filePatch.status}

`;

    if (filePatch.patch) {
      prompt += `\`\`\`diff
${filePatch.patch}
\`\`\`

`;
    } else {
      prompt += `_No patch available for this file_

`;
    }
  }

  prompt += `## Review Instructions

Please provide:
1. **Overall Assessment**: A summary of the changes and overall code quality
2. **Specific Issues**: Point out any bugs, security vulnerabilities, performance issues, or code smells
3. **Best Practices**: Suggest improvements following best practices
4. **Positive Feedback**: Highlight well-written code and good practices

Format your response as a thorough code review comment.`;

  return prompt;
};
