import { z } from 'zod';

const configSchema = z
  .object({
    APP_NAME: z.string().default('svc-template-node'),
    ENVIRONMENT: z.string().default('local'),
    PORT: z.coerce.number().default(4000),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    BUILD_SHA: z.string().default('local'),
    OTLP_ENDPOINT: z.string().optional(),
    METRICS_AUTH_TOKEN: z.string().optional(),
    READINESS_DEPENDENCIES: z.string().optional(),
  })
  .transform((value) => ({
    ...value,
    READINESS_DEPENDENCIES: value.READINESS_DEPENDENCIES
      ? value.READINESS_DEPENDENCIES.split(',').map((item) => item.trim()).filter(Boolean)
      : [],
  }));

type ConfigSchema = z.infer<typeof configSchema>;

export const loadConfig = (): ConfigSchema => {
  const parsed = configSchema.parse(process.env);
  return parsed;
};

export type AppConfig = ConfigSchema;
