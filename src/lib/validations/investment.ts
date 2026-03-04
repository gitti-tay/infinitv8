import { z } from "zod";

export const createInvestmentSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  amount: z.number().positive("Amount must be positive").max(10_000_000, "Maximum investment is $10,000,000"),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
