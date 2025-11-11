import z from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().int().min(0).max(65535).default(8080),

  REDIS_URL: z.url({ protocol: /^rediss?$/ }),

  PAYWALL_URL: z.url({ protocol: /^https?$/ }),
  PAYMENT_EXPIRY_SECONDS: z.coerce.number().int().min(0).default(300),

  NETWORK: z.enum(["solana-devnet", "solana-mainnet"]),
  RECIPIENT_WALLET_ADDRESS: z.string(),

  CDP_API_KEY_ID: z.string(),
  CDP_API_KEY_SECRET: z.string(),

  GITHUB_APP_ID: z.string(),
  GITHUB_APP_PRIVATE_KEY: z.string(),

  GITHUB_WEBHOOK_SECRET: z.string(),

  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-"),
});

export const env = envSchema.parse(process.env);
