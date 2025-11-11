import type z from "zod";
import { createAnthropic } from "@ai-sdk/anthropic";
import { countTokens } from "@anthropic-ai/tokenizer";
import { generateObject, generateText } from "ai";

import type { AiProvider } from "../../interfaces/ai";

export const CLAUDE_SONNET_4_5 = "claude-sonnet-4.5";
export type ClaudeSonnet45 = typeof CLAUDE_SONNET_4_5;

export const createClaudeSonnet45AiProvider = (apiKey: string): AiProvider<ClaudeSonnet45, z.ZodType> => {
  const claude = createAnthropic({
    apiKey,
  });

  const model = claude.languageModel("claude-sonnet-4-5");

  return {
    name: CLAUDE_SONNET_4_5,
    pricePer1M: {
      input: 3.0, // $3 per 1M input tokens
      output: 15.0, // $15 per 1M output tokens
    },
    countTokens: (text: string) => {
      return countTokens(text);
    },
    queryText: async (input, abortSignal) => {
      const response = await generateText({
        model,
        prompt: input,
        abortSignal,
      });

      return response.text;
    },
    queryObject: async <TOutput = string, TSchema extends z.ZodType = z.ZodType>(
      input: string,
      schema: TSchema,
      abortSignal?: AbortSignal
    ): Promise<TOutput> => {
      const response = await generateObject({
        model,
        schema,
        prompt: input,
        abortSignal,
      });

      return response.object as TOutput;
    },
  };
};
