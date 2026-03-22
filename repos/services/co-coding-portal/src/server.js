const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const redis = require('redis');
const Y = require('yjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Redis client for session management
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

// In-memory storage for active coding sessions
const codingSessions = new Map();
const yDocuments = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'co-coding-portal',
    uptime: process.uptime(),
    activeSessions: codingSessions.size
  });
});

// API: Create new coding session
app.post('/api/v1/sessions', async (req, res) => {
  try {
    const { name, language, userId } = req.body;
    const sessionId = uuidv4();

    const session = {
      id: sessionId,
      name: name || 'Untitled Session',
      language: language || 'javascript',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      participants: [userId],
      activeUsers: 0
    };

    codingSessions.set(sessionId, session);

    // Create Yjs document for this session
    const yDoc = new Y.Doc();
    yDocuments.set(sessionId, yDoc);

    // Store in Redis for persistence
    await redisClient.set(
      `session:${sessionId}`,
      JSON.stringify(session),
      { EX: 86400 } // 24 hour expiry
    );

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// API: Get session details
app.get('/api/v1/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    let session = codingSessions.get(sessionId);

    if (!session) {
      // Try to load from Redis
      const cached = await redisClient.get(`session:${sessionId}`);
      if (cached) {
        session = JSON.parse(cached);
        codingSessions.set(sessionId, session);
      }
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// API: List all active sessions
app.get('/api/v1/sessions', (req, res) => {
  const sessions = Array.from(codingSessions.values());
  res.json({ sessions });
});

// Socket.IO real-time collaboration
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join coding session
  socket.on('join-session', async ({ sessionId, userId, username }) => {
    console.log(`User ${username} joining session ${sessionId}`);

    const session = codingSessions.get(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    socket.join(sessionId);
    socket.sessionId = sessionId;
    socket.userId = userId;
    socket.username = username;

    // Add to participants
    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
    }
    session.activeUsers = (session.activeUsers || 0) + 1;

    // Notify others
    socket.to(sessionId).emit('user-joined', {
      userId,
      username,
      activeUsers: session.activeUsers
    });

    // Send current document state
    const yDoc = yDocuments.get(sessionId);
    if (yDoc) {
      const state = Y.encodeStateAsUpdate(yDoc);
      socket.emit('sync-document', { state: Array.from(state) });
    }

    socket.emit('joined', {
      sessionId,
      participants: session.participants,
      activeUsers: session.activeUsers
    });
  });

  // Handle code changes
  socket.on('code-change', ({ sessionId, delta, content }) => {
    console.log(`Code change in session ${sessionId}`);

    // Apply update to Yjs document
    const yDoc = yDocuments.get(sessionId);
    if (yDoc && delta) {
      Y.applyUpdate(yDoc, new Uint8Array(delta));
    }

    // Broadcast to all other users in the session
    socket.to(sessionId).emit('code-update', {
      userId: socket.userId,
      username: socket.username,
      delta,
      content,
      timestamp: Date.now()
    });
  });

  // Handle cursor position
  socket.on('cursor-move', ({ sessionId, position }) => {
    socket.to(sessionId).emit('cursor-update', {
      userId: socket.userId,
      username: socket.username,
      position
    });
  });

  // Handle code execution requests
  socket.on('execute-code', async ({ sessionId, code, language }) => {
    console.log(`Code execution request in session ${sessionId}`);

    try {
      // Forward to LLM Gateway or execution service
      const result = await executeCode(code, language);

      // Broadcast results to all users
      io.to(sessionId).emit('execution-result', {
        userId: socket.userId,
        username: socket.username,
        result,
        timestamp: Date.now()
      });
    } catch (error) {
      socket.emit('execution-error', {
        error: error.message
      });
    }
  });

  // Handle chat messages
  socket.on('chat-message', ({ sessionId, message }) => {
    io.to(sessionId).emit('chat-message', {
      userId: socket.userId,
      username: socket.username,
      message,
      timestamp: Date.now()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    if (socket.sessionId) {
      const session = codingSessions.get(socket.sessionId);
      if (session) {
        session.activeUsers = Math.max(0, (session.activeUsers || 1) - 1);

        socket.to(socket.sessionId).emit('user-left', {
          userId: socket.userId,
          username: socket.username,
          activeUsers: session.activeUsers
        });

        // Clean up empty sessions after timeout
        if (session.activeUsers === 0) {
          setTimeout(() => {
            const currentSession = codingSessions.get(socket.sessionId);
            if (currentSession && currentSession.activeUsers === 0) {
              codingSessions.delete(socket.sessionId);
              yDocuments.delete(socket.sessionId);
              console.log(`Cleaned up inactive session: ${socket.sessionId}`);
            }
          }, 300000); // 5 minutes
        }
      }
    }
  });
});

// Mock code execution (replace with actual execution service)
async function executeCode(code, language) {
  // This would integrate with LLM Gateway or a code execution sandbox
  return {
    success: true,
    output: `Execution result for ${language} code`,
    executionTime: 42
  };
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await redisClient.quit();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 4200;
server.listen(PORT, () => {
  console.log(`Co-Coding Portal running on port ${PORT}`);
});
