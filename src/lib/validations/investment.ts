import { z } from "zod";

export const createInvestmentSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  amount: z.number().positive("Amount must be positive").max(10_000_000, "Maximum investment is $10,000,000"),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash").optional(),
  asset: z.enum(["USDC", "USDT", "ETH"]).optional(),
  network: z.literal("base").optional(),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
