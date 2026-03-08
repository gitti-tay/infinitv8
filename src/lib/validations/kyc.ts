import { z } from "zod";

export const diditWebhookSchema = z.object({
  session_id: z.string(),
  status: z.string(),
  vendor_data: z.string(),
});

export type DiditWebhookPayload = z.infer<typeof diditWebhookSchema>;
