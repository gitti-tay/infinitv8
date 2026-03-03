import { z } from "zod";

export const sumsubWebhookSchema = z.object({
  applicantId: z.string(),
  externalUserId: z.string(),
  type: z.string(),
  reviewResult: z
    .object({
      reviewAnswer: z.string(),
    })
    .optional(),
});

export type SumsubWebhookPayload = z.infer<typeof sumsubWebhookSchema>;
