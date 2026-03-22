const runtimeEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}

const getEnv = (...keys) => {
  for (const key of keys) {
    if (runtimeEnv && runtimeEnv[key] !== undefined) return runtimeEnv[key]
    if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
      return process.env[key]
    }
  }
  return undefined
}

const normalizeUrl = (value) => {
  if (!value) return ''
  return value.replace(/\/$/, '')
}

const environment = getEnv('NODE_ENV', 'VITE_NODE_ENV', 'MODE') || 'development'

export const config = {
  environment,
  coreApiUrl: normalizeUrl(
    getEnv('NEXT_PUBLIC_CORE_API_URL', 'VITE_CORE_API_URL', 'CORE_API_URL')
  ),
  agentsApiUrl: normalizeUrl(
    getEnv('NEXT_PUBLIC_AGENTS_API_URL', 'VITE_AGENTS_API_URL', 'AGENTS_API_URL')
  ),
  consoleUrl: normalizeUrl(
    getEnv('NEXT_PUBLIC_CONSOLE_URL', 'VITE_CONSOLE_URL', 'PUBLIC_CONSOLE_URL')
  ),
}

if (config.environment !== 'development') {
  const missing = ['coreApiUrl', 'agentsApiUrl', 'consoleUrl'].filter(key => !config[key])
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export default config
