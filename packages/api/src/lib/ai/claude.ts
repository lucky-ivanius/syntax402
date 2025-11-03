import type { AiProvider } from "../../interfaces/ai";

export const CLAUDE_SONNET_4_5 = "claude-sonnet-4.5";
export type ClaudeSonnet45 = typeof CLAUDE_SONNET_4_5;

export const createClaudeSonnet45AiProvider = (): AiProvider<ClaudeSonnet45> => {
  return {
    name: CLAUDE_SONNET_4_5,
    pricePer1m: {
      input: 0.02,
      output: 0.02,
    },
    estimatePrice: async (input) => {
      return parseFloat(Math.random().toFixed(6));
    },
    query: async (input) => {
      return input;
    },
  };
};
