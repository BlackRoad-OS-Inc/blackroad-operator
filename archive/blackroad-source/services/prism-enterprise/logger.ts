import pino from 'pino';

export const createLogger = (level: pino.Level = 'info') => {
  const baseConfig = {
    level,
    timestamp: pino.stdTimeFunctions.isoTime,
  } as const;

  if (process.env.NODE_ENV !== 'development') {
    return pino(baseConfig);
  }

  try {
    return pino({
      ...baseConfig,
      transport: { target: 'pino-pretty' },
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes('pino-pretty')) {
      return pino(baseConfig);
    }
    throw err;
  }
};
