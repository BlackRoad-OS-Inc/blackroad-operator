# Co-Coding Portal Service

Real-time collaborative code editing platform with live synchronization, cursor sharing, and integrated code execution.

## Features

- **Real-time Collaboration**: Multiple users can edit the same code simultaneously
- **CRDT-based Sync**: Uses Yjs for conflict-free collaborative editing
- **Cursor Sharing**: See where other developers are working in real-time
- **Integrated Chat**: Built-in chat for discussing code changes
- **Code Execution**: Run code snippets directly in the portal
- **Session Management**: Create and manage collaborative coding sessions
- **Language Support**: Multi-language syntax support

## API Endpoints

### REST API

- `POST /api/v1/sessions` - Create new coding session
- `GET /api/v1/sessions/:sessionId` - Get session details
- `GET /api/v1/sessions` - List all active sessions
- `GET /health` - Health check

### WebSocket Events

**Client → Server:**
- `join-session` - Join a coding session
- `code-change` - Send code changes
- `cursor-move` - Update cursor position
- `execute-code` - Execute code snippet
- `chat-message` - Send chat message

**Server → Client:**
- `user-joined` - User joined session
- `user-left` - User left session
- `code-update` - Code changes from other users
- `cursor-update` - Cursor position updates
- `execution-result` - Code execution results
- `chat-message` - Chat messages

## Configuration

Environment variables:

```bash
PORT=4200
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=*
```

## Running

### Development
```bash
npm install
npm run dev
```

### Production
```bash
docker build -t co-coding-portal .
docker run -p 4200:4200 co-coding-portal
```

### Docker Compose
```bash
docker-compose up co-coding-portal
```

## Integration

Integrates with:
- **Auth Service** - User authentication
- **LLM Gateway** - Code suggestions and AI assistance
- **Redis** - Session persistence
- **API Gateway** - Route management

## Architecture

```
┌─────────────┐      WebSocket      ┌──────────────────┐
│   Clients   │◄───────────────────►│  Co-Coding       │
│  (Browser)  │                     │  Portal Service  │
└─────────────┘                     └────────┬─────────┘
                                             │
                    ┌────────────────────────┼────────────────┐
                    │                        │                │
              ┌─────▼─────┐          ┌──────▼──────┐  ┌──────▼──────┐
              │   Redis   │          │ LLM Gateway │  │    Auth     │
              │  (Cache)  │          │  (AI Code)  │  │  Service    │
              └───────────┘          └─────────────┘  └─────────────┘
```

## Technology Stack

- **Node.js** - Runtime
- **Express** - HTTP server
- **Socket.IO** - WebSocket communication
- **Yjs** - CRDT for collaborative editing
- **Redis** - Session storage
- **JWT** - Authentication tokens
