import type { ReviewRequest } from "../../types/code-review";

export const buildCodeReviewRequestQueryPrompt = (request: ReviewRequest): string => {
  const { title, description, files, context } = request;

  const fileEntries = Object.entries(files);

  if (fileEntries.length === 0) {
    return "";
  }

  let prompt = `You are an expert code reviewer. Please review the following pull request changes and provide constructive feedback.

## Pull Request Details

**Title:** ${title}

**Description:**
${description ?? "_No description provided_"}

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

Please provide a comprehensive code review focusing on:
1. **Bugs & Errors**: Identify any potential bugs, logic errors, or runtime issues
2. **Security**: Flag security vulnerabilities (SQL injection, XSS, auth issues, etc.)
3. **Performance**: Point out performance bottlenecks or inefficient patterns
4. **Code Quality**: Suggest improvements for readability, maintainability, and best practices
5. **Positive Feedback**: Acknowledge well-written code and good design decisions

## Output Format

You MUST respond with a valid JSON object matching this exact structure:

\`\`\`typescript
{
  "files": {
    "[filename]": [
      {
        "comment": "Your inline comment here",
        "position": <line_number_in_diff>
      }
    ]
  },
  "comment": "Your overall review summary here"
}
\`\`\`

**Important formatting rules:**
- Return ONLY valid JSON, no additional text or markdown outside the JSON
- \`files\`: Object where keys are filenames and values are arrays of inline comments
- \`position\`: The line number in the diff (not the file) where the comment applies
- \`comment\` (in inline comments): Specific, actionable feedback for that line/section. Use GitHub markdown format.
- \`comment\` (top-level): Overall summary of the PR review, highlighting main concerns and positives
- If no inline comments are needed for a file, omit it from the \`files\` object
- If no inline comments are needed at all, use an empty object: \`"files": {}\`

**GitHub Markdown Support for Inline Comments:**
You can use full GitHub-flavored markdown in your comments, including:
- **Code suggestions**: Use \`\`\`suggestion\`\`\` blocks to suggest specific code changes
- **Code blocks**: Use fenced code blocks with language syntax highlighting
- **Formatting**: Use bold, italic, lists, and other markdown formatting
- **Emojis**: Use emojis like ⚠️ 🔒 ⚡ ✅ 💡 to highlight different types of feedback

**Example response:**
\`\`\`json
{
  "files": {
    "src/auth.ts": [
      {
        "comment": "🔒 **Security Issue**: This function is vulnerable to SQL injection attacks.\\n\\nThe current implementation directly interpolates user input into the SQL query:\\n\\n\`\`\`typescript\\nconst query = \`SELECT * FROM users WHERE email = '\${email}'\`;\\n\`\`\`\\n\\nThis allows attackers to manipulate the query. Use parameterized queries instead:\\n\\n\`\`\`suggestion\\nconst query = 'SELECT * FROM users WHERE email = ?';\\nconst result = await db.execute(query, [email]);\\n\`\`\`\\n\\nThis prevents SQL injection by properly escaping user input.",
        "position": 15
      },
      {
        "comment": "💡 **Enhancement**: Add error handling for failed authentication attempts.\\n\\nConsider implementing exponential backoff or rate limiting:\\n\\n\`\`\`suggestion\\ntry {\\n  const user = await authenticate(credentials);\\n  return user;\\n} catch (error) {\\n  logger.error('Authentication failed', { email: credentials.email, error });\\n  throw new AuthenticationError('Invalid credentials');\\n}\\n\`\`\`",
        "position": 23
      }
    ],
    "src/utils.ts": [
      {
        "comment": "✅ **Great work**: Excellent use of memoization here for performance optimization. This will significantly reduce redundant calculations.",
        "position": 42
      }
    ],
    "src/validation.ts": [
      {
        "comment": "⚡ **Performance**: This regex is compiled on every call.\\n\\nMove it outside the function for better performance:\\n\\n\`\`\`suggestion\\nconst EMAIL_REGEX = /^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$/;\\n\\nfunction validateEmail(email: string): boolean {\\n  return EMAIL_REGEX.test(email);\\n}\\n\`\`\`",
        "position": 8
      }
    ]
  },
  "comment": "## Summary\\n\\nOverall this PR introduces useful authentication functionality, but there are **critical security issues** that must be addressed before merging.\\n\\n### 🔴 Critical Issues\\n- **SQL Injection vulnerability** in \`src/auth.ts:15\` - Must fix before merging\\n\\n### 🟡 Recommendations\\n- Add error handling and logging for auth failures\\n- Optimize regex compilation in validation\\n\\n### ✅ Highlights\\n- Excellent performance optimization with memoization in \`src/utils.ts\`\\n- Clean code structure and good separation of concerns\\n\\n### Next Steps\\n1. Fix the SQL injection vulnerability\\n2. Add unit tests for authentication flows\\n3. Consider adding rate limiting for login attempts"
}
\`\`\``;

  return prompt;
};
