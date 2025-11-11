import { calculateTokenCost } from "../../../utils/tokens";

const estimateCodeReviewOutputTokens = (inputTokens: number): number => {
  // Code reviews with detailed markdown formatting, code suggestions, and examples
  // tend to produce substantial output (often 50-100% of input length)
  // Using 75% as a realistic estimate based on observed usage patterns
  return Math.ceil(inputTokens * 0.75);
};

export const calculateClaudeCodeReviewPrice = (
  estimatedInputTokens: number,
  inputPricePer1M: number,
  outputPricePer1M: number
): number => {
  const estimatedOutputTokens = estimateCodeReviewOutputTokens(estimatedInputTokens);

  const baseCost = calculateTokenCost(estimatedInputTokens, estimatedOutputTokens, inputPricePer1M, outputPricePer1M);

  // Add margin (30%) to account for variability in output length and edge cases
  const margin = 1.3;
  const finalPrice = baseCost * margin;

  return parseFloat(finalPrice.toFixed(6));
};
