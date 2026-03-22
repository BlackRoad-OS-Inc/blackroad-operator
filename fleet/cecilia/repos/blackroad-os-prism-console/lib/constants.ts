export const BEACON_URL = process.env.NEXT_PUBLIC_BEACON_URL ?? '';
export const CORE_HUB = process.env.NEXT_PUBLIC_CORE_HUB ?? '';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
export const SERVICE_ENV = process.env.NEXT_PUBLIC_ENV ?? 'dev';

export const SIG_HEADERS = {
  'x-bros-service': 'prism-console',
  'x-bros-env': SERVICE_ENV
};
