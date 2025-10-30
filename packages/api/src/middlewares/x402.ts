import type { FacilitatorConfig, Network, PaymentRequirements, Price, Resource } from "x402/types";
import { createMiddleware } from "hono/factory";
import { getPaywallHtml } from "x402/paywall";
import { decodePayment } from "x402/schemes";
import { findMatchingPaymentRequirements, processPriceToAtomicAmount } from "x402/shared";
import { settleResponseHeader } from "x402/types";
import { useFacilitator } from "x402/verify";

import { paymentRequired, unexpectedError } from "../utils/response";

const createExactPaymentRequirements = (
  payTo: string,
  price: Price,
  network: Network,
  resource: Resource,
  description: string,
  extra?: Record<string, unknown>
): PaymentRequirements | null => {
  const atomicAmountForAsset = processPriceToAtomicAmount(price, network);
  if ("error" in atomicAmountForAsset) return null;

  const { asset, maxAmountRequired } = atomicAmountForAsset;

  return {
    scheme: "exact",
    payTo,
    asset: asset.address,
    maxAmountRequired,
    description,
    network,
    resource,
    maxTimeoutSeconds: 60,
    mimeType: "application/json",
    extra,
  };
};

export interface X402PaymentMiddlewareOptions {
  network: Network;
  payTo: string;
  price: number | (() => Promise<number> | number);
  description?: string;
  facilitatorConfig?: FacilitatorConfig;
}

export const x402PaymentMiddleware = ({
  network,
  payTo,
  price,
  facilitatorConfig,
  description = "",
}: X402PaymentMiddlewareOptions) =>
  createMiddleware(async (c, next) => {
    const logger = c.env.LOGGER;

    const { verify, settle, supported } = useFacilitator(facilitatorConfig);

    const paymentHeader = c.req.header("X-PAYMENT");

    const paymentRequirements: PaymentRequirements[] = [];

    const _price = typeof price === "function" ? await price() : price;

    const currentUrl = c.req.url as Resource;

    const paymentKinds = await supported();

    const kind = paymentKinds.kinds.find((kind) => kind.network === network && kind.scheme === "exact");
    if (!kind) {
      logger.error(`No payment kind found for network ${network}`);

      return unexpectedError(c);
    }

    const paymentRequirement = createExactPaymentRequirements(
      payTo,
      _price,
      network,
      currentUrl,
      description,
      kind.extra
    );
    if (!paymentRequirement) {
      logger.error(`Failed to create payment requirement for network ${network}`);

      return unexpectedError(c);
    }

    paymentRequirements.push(paymentRequirement);

    if (!paymentHeader)
      return c.html(
        getPaywallHtml({
          amount: _price,
          currentUrl,
          paymentRequirements,
          testnet: true,
        })
      );

    const decoded = decodePayment(paymentHeader);

    const matchingPaymentRequirements = findMatchingPaymentRequirements(paymentRequirements, decoded);
    if (!matchingPaymentRequirements) return paymentRequired(c, { message: "x402 payment is invalid" });

    const verifyResponse = await verify(decoded, matchingPaymentRequirements);
    if (!verifyResponse.isValid) return paymentRequired(c, { message: "x402 payment is invalid" });

    await next();

    const status = c.res.status;
    if (status >= 400) return c.res;

    const settlement = await settle(decoded, matchingPaymentRequirements);
    if (!settlement.success) return paymentRequired(c, { message: "x402 payment is invalid" });

    const paymentResponseHeader = settleResponseHeader(settlement);

    c.header("X-PAYMENT-RESPONSE", paymentResponseHeader);

    return c.res;
  });
