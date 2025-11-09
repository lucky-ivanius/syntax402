import type { Context, Env } from "hono";
import type { FacilitatorConfig, Network, PaymentRequirements, Price, Resource, SettleResponse } from "x402/types";
import { createMiddleware } from "hono/factory";
import { getPaywallHtml } from "x402/paywall";
import { decodePayment } from "x402/schemes";
import { findMatchingPaymentRequirements, processPriceToAtomicAmount } from "x402/shared";
import { settleResponseHeader } from "x402/types";
import { useFacilitator } from "x402/verify";

import { logger } from "../logger";
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

export interface X402PaymentContext {
  price: number;
  description?: string;
  network: Network;
  payTo: string;
  facilitatorConfig?: FacilitatorConfig;
  onSettlement?: (settlement: SettleResponse) => void;
}

export type X402PaymentSetContextFn<TEnv extends Env> = <TContext extends Context<TEnv>>(
  c: TContext
) => Promise<X402PaymentContext | Response>;

export const x402PaymentMiddleware = <TEnv extends Env>(setContext: X402PaymentSetContextFn<TEnv>) =>
  createMiddleware<TEnv>(async (c, next) => {
    const paymentContext = await setContext(c);
    if (paymentContext instanceof Response) return paymentContext;

    const { price, network, payTo, facilitatorConfig, description = "", onSettlement } = paymentContext;

    const { verify, settle, supported } = useFacilitator(facilitatorConfig);

    const paymentHeader = c.req.header("X-PAYMENT");

    const currentUrl = c.req.url as Resource;

    const paymentKinds = await supported();

    const kind = paymentKinds.kinds.find((kind) => kind.network === network && kind.scheme === "exact");
    if (!kind) {
      logger.error(`No payment kind found for network ${network}`);

      return unexpectedError(c);
    }

    const paymentRequirement = createExactPaymentRequirements(
      payTo,
      price,
      network,
      currentUrl,
      description,
      kind.extra
    );
    if (!paymentRequirement) {
      logger.error(`Failed to create payment requirement for network ${network}`);

      return unexpectedError(c);
    }

    const paymentRequirements = [paymentRequirement];

    if (!paymentHeader)
      return c.html(
        getPaywallHtml({
          amount: price,
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

    if (onSettlement) onSettlement(settlement);

    const paymentResponseHeader = settleResponseHeader(settlement);

    c.header("X-PAYMENT-RESPONSE", paymentResponseHeader);

    return c.res;
  });
