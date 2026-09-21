import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/arcgis"),
  CLIENT_ORIGIN: z.url().default("http://localhost:5173"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters."),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),
});

export type Env = z.infer<typeof envSchema>;
