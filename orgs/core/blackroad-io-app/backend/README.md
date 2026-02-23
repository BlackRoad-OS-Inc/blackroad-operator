# BlackRoad OS Backend API

Complete FastAPI backend for BlackRoad Operating System.

## Features

- **Authentication**: JWT-based auth with register/login
- **AI Chat**: Conversation management with AI responses
- **Agents**: Spawn, list, and manage 30,000+ AI agents
- **Blockchain**: RoadChain transactions and blocks
- **Payments**: Stripe checkout integration
- **Files**: Cloud file management
- **Social**: Social network feed

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload --port 8000

# Test
curl http://localhost:8000/health
```

## Railway Deployment

```bash
# From this directory
railway login
railway link
railway up
```

## Environment Variables

- `SECRET_KEY`: JWT secret (auto-generated if not set)
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `PORT`: Port to run on (default: 8000)

## API Endpoints

### Health
- `GET /health` - Health check
- `GET /ready` - Readiness check

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### AI Chat
- `POST /api/ai-chat/chat` - Send message
- `GET /api/ai-chat/conversations` - List conversations

### Agents
- `POST /api/agents/spawn` - Spawn new agent
- `GET /api/agents/list` - List agents
- `GET /api/agents/{id}` - Get agent details
- `DELETE /api/agents/{id}` - Terminate agent

### Blockchain
- `GET /api/blockchain/blocks` - Get blocks
- `POST /api/blockchain/transaction` - Create transaction
- `GET /api/blockchain/transactions` - Get transactions

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe checkout
- `POST /api/payments/verify-payment` - Verify payment

### Files
- `GET /api/files/list` - List files

### Social
- `GET /api/social/feed` - Get social feed

### System
- `GET /api/system/stats` - System statistics

## Architecture

- FastAPI with async/await
- JWT authentication
- In-memory storage (replace with PostgreSQL/Redis in production)
- CORS enabled for all origins
- Mock AI responses (integrate with real LLM)

## Production Considerations

1. Replace in-memory storage with PostgreSQL
2. Add Redis for sessions
3. Integrate real LLM (OpenAI/Anthropic)
4. Add rate limiting
5. Enable HTTPS only
6. Set strong SECRET_KEY
7. Configure CORS for specific origins
