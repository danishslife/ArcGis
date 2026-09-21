import "dotenv/config";
import { envSchema } from "../schemas/env.js";

const parsed = envSchema.parse(process.env);

export const env = {
  nodeEnv: parsed.NODE_ENV,
  port: parsed.PORT,
  mongoUri: parsed.MONGODB_URI,
  clientOrigin: parsed.CLIENT_ORIGIN,
  jwtSecret: parsed.JWT_SECRET,
  jwtExpiresIn: parsed.JWT_EXPIRES_IN,
} as const;
