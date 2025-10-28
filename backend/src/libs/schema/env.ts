import "dotenv/config";
import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(1, "JWT_SECRET must be provided"),
});

const _env = envSchema.parse(process.env);
export const env = _env;
