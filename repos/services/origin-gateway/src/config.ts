import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z
    .string()
    .default("8080")
    .transform((value) => Number.parseInt(value, 10))
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "PORT must be a positive integer"
    }),
  DATABASE_URL: z.string().url().optional(),
  EVIDENCE_STREAM_URL: z.string().url().optional()
});

export type GatewayConfig = z.infer<typeof envSchema> & { PORT: number };

export function loadConfig(env: NodeJS.ProcessEnv = process.env): GatewayConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid gateway configuration: ${parsed.error.message}`);
  }

  return {
    ...parsed.data,
    PORT: parsed.data.PORT
  };
}
