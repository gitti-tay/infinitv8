import { z } from "zod";

export const projectQuerySchema = z.object({
  category: z
    .enum(["REAL_ESTATE", "AGRICULTURE", "HEALTHCARE", "COMMODITIES"])
    .optional(),
  status: z.enum(["ACTIVE", "SOLD_OUT", "COMING_SOON"]).optional(),
});

export const projectIdSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
});
