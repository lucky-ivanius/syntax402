export const calculateTokenCost = (
  inputTokens: number,
  outputTokens: number = 0,
  inputPricePer1M: number = 0.003,
  outputPricePer1M: number = 0.015
): number => {
  const inputCost = (inputTokens / 1_000_000) * inputPricePer1M;
  const outputCost = (outputTokens / 1_000_000) * outputPricePer1M;
  return inputCost + outputCost;
};
