import type { ReviewRequest } from "../../types/code-review";

export const buildCodeReviewRequestQueryPrompt = (request: ReviewRequest): string => {
  const { title, description, files, context } = request;

  const fileEntries = Object.entries(files);

  if (fileEntries.length === 0) {
    return "";
  }

  let prompt = `You are an expert code reviewer. Please review the following pull request changes and provide constructive feedback.

**Current Date:** ${new Date().toISOString()}

## Pull Request Details

**Title:** ${title}

**Description:**
${description ?? "_No description provided_"}

`;

  if (context?.trim()) {
    prompt += `## User-Provided Context

The user has provided the following context/requirements for this review:

${context.trim()}

**Note:** Please incorporate the user's context and follow their specific requirements while still adhering to our core review guidelines (security, bugs, performance, code quality).

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

**CRITICAL: Only comment on issues, problems, and areas that need improvement. Do NOT comment on good implementations or well-written code unless they need specific improvements. Silence means approval.**

Focus your review on identifying:
1. **Bugs & Errors**: Identify any potential bugs, logic errors, or runtime issues
2. **Security**: Flag security vulnerabilities (SQL injection, XSS, auth issues, etc.)
3. **Performance**: Point out performance bottlenecks or inefficient patterns
4. **Code Quality**: Suggest improvements for readability, maintainability, and best practices

If code is well-written and has no issues, do not comment on it. Only provide feedback where action is needed.

## Output Format

**GitHub Markdown Support for Inline Comments:**
You can use full GitHub-flavored markdown in your comments, including:
- **Code suggestions**: Use \`\`\`suggestion\`\`\` blocks to suggest specific code changes
- **Code blocks**: Use fenced code blocks with language syntax highlighting
- **Formatting**: Use bold, italic, lists, and other markdown formatting
- **Severity badges**: Use ONLY these emojis to indicate severity:
  - 🔴 Critical issues (security vulnerabilities, major bugs)
  - 🟡 Warnings (performance issues, code quality problems)
  - Do NOT use emojis for descriptions or general feedback`;

  return prompt;
};
