import type { PriceEstimator } from "../../../interfaces/price-estimator";

export const createRandomPriceEstimator = (): PriceEstimator => {
  return {
    estimate: async (request) => {
      return parseFloat(Math.random().toFixed(6));
    },
  };
};
