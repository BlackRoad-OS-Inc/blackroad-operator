const express = require('express');
const httpProxy = require('http-proxy');
const cors = require('cors');
const redis = require('redis');
const promClient = require('prom-client');
const winston = require('winston');
require('dotenv').config();

const app = express();
const proxy = httpProxy.createProxyServer({});

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'backroad.log' })
  ]
});

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const requestCounter = new promClient.Counter({
  name: 'backroad_requests_total',
  help: 'Total number of requests',
  labelNames: ['service', 'status'],
  registers: [register]
});

const requestDuration = new promClient.Histogram({
  name: 'backroad_request_duration_seconds',
  help: 'Request duration in seconds',
  labelNames: ['service'],
  registers: [register]
});

// Middleware
app.use(cors());
app.use(express.json());

// Redis for caching and session management
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

// Service registry - tracks available backend services
const serviceRegistry = new Map();

// Routing configuration
const routingRules = [
  {
    path: '/api/auth',
    service: 'auth-service',
    backends: ['http://auth:4001'],
    strategy: 'round-robin'
  },
  {
    path: '/api/llm',
    service: 'llm-gateway',
    backends: ['http://llm-gateway:4002'],
    strategy: 'least-connections'
  },
  {
    path: '/api/prism',
    service: 'prism-console-api',
    backends: ['http://prism-console-api:8000'],
    strategy: 'weighted'
  },
  {
    path: '/api/roadview',
    service: 'roadview-enhanced',
    backends: ['http://roadview-enhanced:4210'],
    strategy: 'round-robin'
  },
  {
    path: '/api/cocoding',
    service: 'co-coding-portal',
    backends: ['http://co-coding-portal:4200'],
    strategy: 'sticky-session'
  },
  {
    path: '/api/roadcoin',
    service: 'roadcoin',
    backends: ['http://roadcoin:4220'],
    strategy: 'round-robin'
  },
  {
    path: '/api/roadchain',
    service: 'roadchain',
    backends: ['http://roadchain:4221'],
    strategy: 'round-robin'
  }
];

// Initialize service registry
routingRules.forEach(rule => {
  serviceRegistry.set(rule.service, {
    backends: rule.backends.map(url => ({
      url,
      healthy: true,
      activeConnections: 0,
      weight: 1,
      responseTime: 0
    })),
    strategy: rule.strategy,
    currentIndex: 0
  });
});

// Health check
app.get('/health', (req, res) => {
  const healthyServices = Array.from(serviceRegistry.entries())
    .filter(([_, config]) => config.backends.some(b => b.healthy))
    .map(([name]) => name);

  res.json({
    status: 'ok',
    service: 'backroad',
    uptime: process.uptime(),
    servicesTracked: serviceRegistry.size,
    healthyServices
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API: Service registration
app.post('/api/v1/register', async (req, res) => {
  try {
    const { serviceName, backendUrl, weight } = req.body;

    if (!serviceName || !backendUrl) {
      return res.status(400).json({ error: 'serviceName and backendUrl required' });
    }

    let service = serviceRegistry.get(serviceName);
    if (!service) {
      service = {
        backends: [],
        strategy: 'round-robin',
        currentIndex: 0
      };
      serviceRegistry.set(serviceName, service);
    }

    service.backends.push({
      url: backendUrl,
      healthy: true,
      activeConnections: 0,
      weight: weight || 1,
      responseTime: 0
    });

    logger.info(`Registered backend: ${backendUrl} for service: ${serviceName}`);
    res.json({ success: true, service: serviceName, backend: backendUrl });
  } catch (error) {
    logger.error('Error registering service:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// API: Service deregistration
app.post('/api/v1/deregister', async (req, res) => {
  try {
    const { serviceName, backendUrl } = req.body;

    const service = serviceRegistry.get(serviceName);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    service.backends = service.backends.filter(b => b.url !== backendUrl);
    logger.info(`Deregistered backend: ${backendUrl} from service: ${serviceName}`);

    res.json({ success: true });
  } catch (error) {
    logger.error('Error deregistering service:', error);
    res.status(500).json({ error: 'Deregistration failed' });
  }
});

// API: Get routing table
app.get('/api/v1/routes', (req, res) => {
  const routes = Array.from(serviceRegistry.entries()).map(([name, config]) => ({
    service: name,
    backends: config.backends.map(b => ({
      url: b.url,
      healthy: b.healthy,
      activeConnections: b.activeConnections
    })),
    strategy: config.strategy
  }));

  res.json({ routes });
});

// Load balancing strategies
function selectBackend(service, strategy, sessionId = null) {
  const backends = service.backends.filter(b => b.healthy);

  if (backends.length === 0) {
    throw new Error('No healthy backends available');
  }

  switch (strategy) {
    case 'round-robin':
      const backend = backends[service.currentIndex % backends.length];
      service.currentIndex++;
      return backend;

    case 'least-connections':
      return backends.reduce((min, b) =>
        b.activeConnections < min.activeConnections ? b : min
      );

    case 'weighted':
      const totalWeight = backends.reduce((sum, b) => sum + b.weight, 0);
      let random = Math.random() * totalWeight;
      for (const backend of backends) {
        random -= backend.weight;
        if (random <= 0) return backend;
      }
      return backends[0];

    case 'sticky-session':
      if (sessionId) {
        const hash = hashCode(sessionId);
        return backends[Math.abs(hash) % backends.length];
      }
      return backends[0];

    case 'fastest':
      return backends.reduce((min, b) =>
        b.responseTime < min.responseTime ? b : min
      );

    default:
      return backends[0];
  }
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Main proxy handler
app.use('*', async (req, res) => {
  const startTime = Date.now();

  try {
    // Find matching routing rule
    const rule = routingRules.find(r => req.originalUrl.startsWith(r.path));

    if (!rule) {
      return res.status(404).json({ error: 'No route configured for this path' });
    }

    const service = serviceRegistry.get(rule.service);
    if (!service) {
      return res.status(503).json({ error: 'Service unavailable' });
    }

    // Select backend using load balancing strategy
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    const backend = selectBackend(service, rule.strategy, sessionId);

    // Update connection count
    backend.activeConnections++;

    // Proxy the request
    proxy.web(req, res, {
      target: backend.url,
      changeOrigin: true,
      timeout: 30000
    }, (error) => {
      backend.activeConnections--;

      if (error) {
        logger.error(`Proxy error for ${rule.service}:`, error);
        backend.healthy = false;

        // Retry with another backend
        setTimeout(() => { backend.healthy = true; }, 30000);

        requestCounter.inc({ service: rule.service, status: 'error' });

        if (!res.headersSent) {
          res.status(502).json({ error: 'Bad Gateway' });
        }
      }
    });

    // Track response time
    res.on('finish', () => {
      backend.activeConnections--;
      const duration = (Date.now() - startTime) / 1000;
      backend.responseTime = duration;

      requestDuration.observe({ service: rule.service }, duration);
      requestCounter.inc({ service: rule.service, status: res.statusCode });

      logger.info({
        service: rule.service,
        backend: backend.url,
        path: req.originalUrl,
        method: req.method,
        status: res.statusCode,
        duration
      });
    });

  } catch (error) {
    logger.error('Routing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check polling for backends
setInterval(async () => {
  for (const service of serviceRegistry.values()) {
    for (const backend of service.backends) {
      try {
        const axios = require('axios');
        const response = await axios.get(`${backend.url}/health`, { timeout: 5000 });
        backend.healthy = response.status === 200;
      } catch (error) {
        backend.healthy = false;
        logger.warn(`Health check failed for ${backend.url}`);
      }
    }
  }
}, 30000); // Every 30 seconds

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => {
  logger.info(`Backroad service running on port ${PORT}`);
  console.log(`Backroad routing service listening on port ${PORT}`);
});
