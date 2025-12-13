import { z } from "zod";

export const analyticsEventNameSchema = z.enum([
  "page_view",
  "add_to_cart",
  "checkout_started",
  "checkout_completed",
  "checkout_abandoned",
  "payment_success",
  "payment_failure",
  "user_signup",
]);

export const analyticsIngestSchema = z.object({
  event_name: analyticsEventNameSchema,
  path: z.string().min(1).max(2048),
  referrer: z.string().max(2048).optional().nullable(),
  meta: z.record(z.string(), z.unknown()).optional().nullable(),
});


