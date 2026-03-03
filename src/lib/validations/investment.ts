import { z } from "zod";

export const createInvestmentSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  amount: z.number().positive("Amount must be positive"),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
