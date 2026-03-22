import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import type { AppConfig } from './config';
import { createLogger } from './logger';

const logger = createLogger();

let sdk: NodeSDK | undefined;

export const initTracing = async (config: AppConfig): Promise<void> => {
  if (!config.OTLP_ENDPOINT) {
    logger.info({ event: 'otel_disabled' });
    return;
  }

  sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({ url: config.OTLP_ENDPOINT }),
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.APP_NAME,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.ENVIRONMENT,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  try {
    await sdk.start();
  } catch (error) {
    logger.error({ event: 'otel_start_failed', error });
  }
};

export const shutdownTracing = async (): Promise<void> => {
  if (!sdk) return;
  try {
    await sdk.shutdown();
  } catch (error) {
    logger.error({ event: 'otel_shutdown_failed', error });
  }
};
