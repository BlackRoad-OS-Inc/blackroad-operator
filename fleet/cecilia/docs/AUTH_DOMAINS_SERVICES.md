# BlackRoad Auth & Domains Services

## 🔐 Auth Service (Port 3004)

Self-hosted authentication service to replace Clerk.

### Features
- JWT-based token authentication
- User registration and login
- Session verification
- Gateway integration ready

### API Endpoints

**POST /api/auth/register**
```bash
curl -X POST http://localhost:3004/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"User Name"}'
```

**POST /api/auth/login**
```bash
curl -X POST http://localhost:3004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

**POST /api/session/verify**
```bash
curl -X POST http://localhost:3004/api/session/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token-here"}'
```

**GET /api/gateway/stats** - Copilot Gateway integration

### Configuration

Copy `.env.example` to `.env`:
```bash
cd ~/services/auth
cp .env.example .env
echo "GATEWAY_URL=http://localhost:3030" >> .env
```

### Development

```bash
cd ~/services/auth
npm run dev  # Runs on port 3004
```

---

## 🌐 Domains Service (Port 3005)

Domain management and DNS provider service.

### Features
- Domain registry management
- DNS record management
- Multi-provider support (Cloudflare, Namecheap)
- Gateway integration ready

### API Endpoints

**GET /api/domains/list**
```bash
curl http://localhost:3005/api/domains/list
```

**POST /api/domains/register**
```bash
curl -X POST http://localhost:3005/api/domains/register \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com","provider":"cloudflare"}'
```

**GET /api/dns/records?domain=example.com**
```bash
curl "http://localhost:3005/api/dns/records?domain=example.com"
```

**POST /api/dns/records**
```bash
curl -X POST http://localhost:3005/api/dns/records \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com","type":"A","name":"@","content":"192.0.2.1","ttl":3600}'
```

**GET /api/registry** - Get registry stats

**GET /api/gateway/stats** - Copilot Gateway integration

### Configuration

Copy `.env.example` to `.env`:
```bash
cd ~/services/domains
cp .env.example .env
echo "GATEWAY_URL=http://localhost:3030" >> .env
echo "CLOUDFLARE_API_TOKEN=your-token" >> .env
```

### Development

```bash
cd ~/services/domains
npm run dev  # Runs on port 3005
```

---

## 🚀 Quick Start

### Start All Services

```bash
# Terminal 1: Gateway
cd ~/copilot-agent-gateway
node web-server.js

# Terminal 2: Auth
cd ~/services/auth
npm run dev

# Terminal 3: Domains
cd ~/services/domains
npm run dev
```

### Test Integration

```bash
# Register a user
curl -X POST http://localhost:3004/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alexa@blackroad.io","password":"blackroad123","name":"Alexa"}'

# Login
curl -X POST http://localhost:3004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alexa@blackroad.io","password":"blackroad123"}'

# List domains
curl http://localhost:3005/api/domains/list

# Get registry stats
curl http://localhost:3005/api/registry
```

---

## 📦 Deployment

### Railway Deployment

```bash
# Deploy auth service
cd ~/services/auth
railway up

# Deploy domains service
cd ~/services/domains
railway up
```

### Environment Variables

Set these in Railway dashboard:

**Auth Service:**
- `GATEWAY_URL` - https://gateway.up.railway.app
- `JWT_SECRET` - Random secure string
- `DATABASE_URL` - PostgreSQL connection string (optional)

**Domains Service:**
- `GATEWAY_URL` - https://gateway.up.railway.app
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare token
- `CLOUDFLARE_ZONE_ID` - Your zone ID
- `DATABASE_URL` - PostgreSQL connection string (optional)

---

## 🔗 Integration with Other Services

Replace Clerk in existing services:

### Before (Clerk):
```typescript
import { clerkMiddleware } from '@clerk/nextjs/server'
```

### After (BlackRoad Auth):
```typescript
// Verify token with BlackRoad Auth
const response = await fetch('http://auth.blackroad.systems/api/session/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
})
```

---

## 🎯 Next Steps

1. **Add database support** - Replace mock data with PostgreSQL
2. **Add password hashing** - Use bcrypt for secure passwords
3. **Add refresh tokens** - Implement token refresh flow
4. **Add OAuth providers** - GitHub, Google, etc.
5. **Add Cloudflare API** - Real DNS management
6. **Add webhooks** - Domain/DNS change notifications

---

## 📊 Status

- ✅ Auth service running on port 3004
- ✅ Domains service running on port 3005
- ✅ Gateway integration routes added
- ✅ Mock API endpoints working
- ⏳ Database integration pending
- ⏳ Real provider APIs pending

