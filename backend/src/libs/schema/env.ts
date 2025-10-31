import "dotenv/config";
import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(1, "JWT_SECRET must be provided"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL must be provided"),
  
  // Environment Configuration
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  
  // Frontend URLs
  FRONTEND_URL: z.url("FRONTEND_URL_DEVELOPMENT must be a valid URL"),
  
  // Backend URLs
});

const _env = envSchema.parse(process.env);


export const getFrontendUrl = (): string => {
  return _env.FRONTEND_URL;
};

export const env = _env;
