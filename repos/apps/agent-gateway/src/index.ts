import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { agentRegistry } from './services/agent-registry.js';
import agentsRouter from './routes/agents.js';
import tasksRouter from './routes/tasks.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/logger.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.AGENT_GATEWAY_PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests from this IP, please try again later'
});
app.use('/v1/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    agents_loaded: agentRegistry.getAllAgents().length
  });
});

// API version
app.get('/v1', (req, res) => {
  res.json({
    name: 'BlackRoad Agent Gateway',
    version: '1.0.0',
    description: 'RESTful API for agent orchestration and task execution',
    endpoints: {
      agents: '/v1/agents',
      tasks: '/v1/tasks',
      health: '/health'
    }
  });
});

// Routes
app.use('/v1/agents', agentsRouter);
app.use('/v1/tasks', tasksRouter);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize and start server
async function start() {
  try {
    console.log('🚀 BlackRoad Agent Gateway starting...');

    // Load agents from registry
    await agentRegistry.loadAgents();
    console.log(`✓ Loaded ${agentRegistry.getAllAgents().length} agents`);

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Agent Gateway listening on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/v1`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start Agent Gateway:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

start();
