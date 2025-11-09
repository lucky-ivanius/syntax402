import { calculateTokenCost } from "../../../utils/tokens";

const estimateCodeReviewOutputTokens = (inputTokens: number): number => {
  // Rough estimate: output is typically 10-30% of input for code reviews
  // Using 20% as a reasonable middle ground
  return Math.ceil(inputTokens * 0.2);
};

export const calculateClaudeCodeReviewPrice = (
  estimatedInputTokens: number,
  inputPricePer1M: number,
  outputPricePer1M: number
): number => {
  const estimatedOutputTokens = estimateCodeReviewOutputTokens(estimatedInputTokens);

  const baseCost = calculateTokenCost(estimatedInputTokens, estimatedOutputTokens, inputPricePer1M, outputPricePer1M);

  // Add a small margin (e.g., 20%) to account for variability
  const margin = 1.2;
  const finalPrice = baseCost * margin;

  return parseFloat(finalPrice.toFixed(6));
};
