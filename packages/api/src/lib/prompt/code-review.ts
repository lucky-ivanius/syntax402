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
- \`comment\` (top-level): Overall summary - keep it SHORT and STRAIGHTFORWARD but INFORMATIONAL and DETAILED
  - Start with 1-2 sentence overview of main issue(s)
  - List critical issues (🔴) separately from warnings (🟡)
  - Include file/line references for each issue
  - End with clear action items
  - Avoid fluff, focus on facts
- If no inline comments are needed for a file, omit it from the \`files\` object
- If no inline comments are needed at all, use an empty object: \`"files": {}\`

**GitHub Markdown Support for Inline Comments:**
You can use full GitHub-flavored markdown in your comments, including:
- **Code suggestions**: Use \`\`\`suggestion\`\`\` blocks to suggest specific code changes
- **Code blocks**: Use fenced code blocks with language syntax highlighting
- **Formatting**: Use bold, italic, lists, and other markdown formatting
- **Severity badges**: Use ONLY these emojis to indicate severity:
  - 🔴 Critical issues (security vulnerabilities, major bugs)
  - 🟡 Warnings (performance issues, code quality problems)
  - Do NOT use emojis for descriptions or general feedback

**Example response:**
\`\`\`json
{
  "files": {
    "src/auth.ts": [
      {
        "comment": "🔴 **SQL Injection Vulnerability**\\n\\nThe current implementation directly interpolates user input into the SQL query:\\n\\n\`\`\`typescript\\nconst query = \`SELECT * FROM users WHERE email = '\${email}'\`;\\n\`\`\`\\n\\nUse parameterized queries to prevent SQL injection:\\n\\n\`\`\`suggestion\\nconst query = 'SELECT * FROM users WHERE email = ?';\\nconst result = await db.execute(query, [email]);\\n\`\`\`",
        "position": 15
      },
      {
        "comment": "🟡 **Missing Error Handling**\\n\\nNo error handling for failed authentication attempts could lead to unhandled promise rejections.\\n\\n\`\`\`suggestion\\ntry {\\n  const user = await authenticate(credentials);\\n  return user;\\n} catch (error) {\\n  logger.error('Authentication failed', { email: credentials.email, error });\\n  throw new AuthenticationError('Invalid credentials');\\n}\\n\`\`\`",
        "position": 23
      }
    ],
    "src/validation.ts": [
      {
        "comment": "🟡 **Performance Issue**\\n\\nRegex is compiled on every function call. Move it outside:\\n\\n\`\`\`suggestion\\nconst EMAIL_REGEX = /^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$/;\\n\\nfunction validateEmail(email: string): boolean {\\n  return EMAIL_REGEX.test(email);\\n}\\n\`\`\`",
        "position": 8
      }
    ]
  },
  "comment": "This PR has a critical SQL injection vulnerability that must be fixed before merging.\\n\\n**Critical (🔴):**\\n- SQL injection in \`src/auth.ts:15\` - user input directly interpolated into query\\n\\n**Warnings (🟡):**\\n- Missing error handling in authentication flow (\`src/auth.ts:23\`)\\n- Regex compiled on every call (\`src/validation.ts:8\`)\\n\\n**Action Required:** Fix SQL injection immediately, add error handling, and optimize regex usage."
}
\`\`\`

**Note:** In this example, \`src/utils.ts\` had no issues, so it is not mentioned at all. Remember: only comment on code that needs improvement.`;

  return prompt;
};
