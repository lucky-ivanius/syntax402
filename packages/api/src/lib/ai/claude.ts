import { countTokens } from "@anthropic-ai/tokenizer";

import type { AiProvider } from "../../interfaces/ai";

export const CLAUDE_SONNET_4_5 = "claude-sonnet-4.5";
export type ClaudeSonnet45 = typeof CLAUDE_SONNET_4_5;

export const createClaudeSonnet45AiProvider = (): AiProvider<ClaudeSonnet45> => {
  return {
    name: CLAUDE_SONNET_4_5,
    pricePer1M: {
      input: 3.0, // $3 per 1M input tokens
      output: 15.0, // $15 per 1M output tokens
    },
    countTokens: (text: string) => {
      return countTokens(text);
    },
    query: async (input) => {
      return input;
    },
  };
};
