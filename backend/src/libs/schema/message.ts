import { z } from "zod";

export const MessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message content is required")
    .max(1000, "Message content must be less than 1000 characters")
    .transform(val => val.trim())
});

export type Message = z.infer<typeof MessageSchema>;
