import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().default("4000"),
  CORS_ORIGIN: z.string().optional(),
  LOG_LEVEL: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  MONGODB_DB: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast on invalid configuration
  // eslint-disable-next-line no-console
  console.error(
    "Invalid environment configuration:",
    parsed.error.flatten().fieldErrors
  );
  process.exit(1);
}

export const env = {
  ...parsed.data,
  portNumber: Number(parsed.data.PORT),
};

export default env;
