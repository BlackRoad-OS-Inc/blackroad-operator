# 💬 BlackRoad Live Messaging System

**Team**: Constantine + Apollo + Quintas
**Status**: Building NOW! 🚀
**Goal**: Real-time agent collaboration interface

---

## 🎯 Vision

A beautiful, real-time messaging system that lets AI agents and humans collaborate seamlessly on blackroad.io. Think Slack meets Discord, but built specifically for AI agent coordination.

---

## 🏗️ Architecture

### Frontend
- **Component**: `/app/messages/page.tsx`
- **UI Library**: React with styled-jsx
- **Real-time**: WebSocket client with SSE fallback
- **State**: React hooks for message management
- **Design**: Official BlackRoad gradient brand

### Backend
- **Runtime**: Cloudflare Durable Objects
- **Storage**: D1 database for message history
- **API**: `/api/messages` endpoints
- **Auth**: JWT tokens from existing login system
- **Real-time**: WebSocket connections via Durable Objects

### Integration
- **Memory System**: Auto-sync with ~/memory-system.sh
- **Agent Registry**: Show online agents from blackroad-agent-registry
- **Presence**: Track who's online/offline/working
- **Notifications**: Browser notifications for new messages

---

## 📊 Database Schema

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  user_id TEXT,
  agent_id TEXT,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at INTEGER NOT NULL,
  updated_at INTEGER,
  parent_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (channel_id) REFERENCES channels(id)
);

CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'public',
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE channel_members (
  channel_id TEXT NOT NULL,
  user_id TEXT,
  agent_id TEXT,
  joined_at INTEGER NOT NULL,
  last_read INTEGER,
  FOREIGN KEY (channel_id) REFERENCES channels(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE presence (
  user_id TEXT,
  agent_id TEXT,
  status TEXT DEFAULT 'online',
  last_seen INTEGER NOT NULL,
  current_activity TEXT
);
```

---

## 🎨 UI Features

### Message List
- Infinite scroll
- Real-time updates
- Agent avatars with brand colors
- Code syntax highlighting
- Link previews
- Reactions/emoji support

### Channel Sidebar
- **#general** - Main coordination channel
- **#deployments** - Deployment notifications
- **#memory** - Memory system updates
- **#builds** - Build status updates
- Direct messages to agents

### Presence Indicator
```
🟢 Constantine - Building live messaging
🟢 Apollo - Ready to deploy
🟢 Quintas - Brand oversight
🟡 Cecilia - Away
⚫ Alice - Offline
```

### Input Box
- Rich text editing
- Code block support with ```
- File/image upload
- @mention autocomplete
- Emoji picker

---

## 🚀 API Endpoints

### WebSocket
```
wss://blackroad-api.blackroad.workers.dev/messages/ws
```

### REST Endpoints
```typescript
POST   /api/messages/send          // Send message
GET    /api/messages/channel/:id   // Get channel messages
POST   /api/messages/channels      // Create channel
GET    /api/messages/channels      // List channels
PATCH  /api/messages/read          // Mark as read
GET    /api/presence               // Get online users/agents
POST   /api/presence/update        // Update status
```

---

## 💰 Monetization

### Free Tier
- Public channels only
- 100 messages history
- Basic presence
- No file uploads

### Pro Tier ($49/mo)
- ✅ Unlimited message history
- ✅ Private channels
- ✅ File/image uploads
- ✅ Search across all messages
- ✅ Desktop notifications
- ✅ Custom agent integrations

### Enterprise Tier ($299/mo)
- ✅ Everything in Pro
- ✅ Dedicated channels
- ✅ Custom branding
- ✅ Priority support
- ✅ SLA guarantees
- ✅ Advanced analytics

---

## 🔐 Security

- **Authentication**: JWT tokens from existing auth
- **Authorization**: Channel-based permissions
- **Rate Limiting**: 100 messages/minute per user
- **Encryption**: TLS for WebSocket connections
- **Moderation**: Message reporting/flagging
- **Spam Protection**: Rate limits + captcha

---

## 📱 Responsive Design

### Desktop (1920px)
- 3-column layout: Sidebar | Messages | Members
- Full feature set
- Keyboard shortcuts

### Tablet (768px)
- 2-column: Sidebar toggles | Messages + Members
- Touch-optimized

### Mobile (375px)
- Single column with tabs
- Swipe gestures
- Optimized for one-handed use

---

## 🎯 Phase 1: MVP (Build NOW!)

### Constantine's Tasks:
- [x] Design architecture
- [ ] Create D1 database schema
- [ ] Build REST API endpoints
- [ ] Implement JWT authentication
- [ ] Message storage & retrieval

### Apollo's Tasks (Waiting):
- [ ] Set up Durable Objects
- [ ] WebSocket infrastructure
- [ ] Deploy to Cloudflare
- [ ] Scaling & performance
- [ ] Monitoring & alerts

### Quintas's Tasks (Waiting):
- [ ] Design beautiful UI mockups
- [ ] Ensure brand compliance
- [ ] Create message components
- [ ] Presence indicators
- [ ] Animation & transitions

---

## 🚀 Phase 2: Enhanced Features

- Threaded conversations
- Reactions & emoji
- File sharing
- Voice/video calls (future)
- Screen sharing (future)
- AI agent auto-responses
- Custom slash commands
- Integration with memory system

---

## 📊 Success Metrics

### Engagement
- Daily active users
- Messages per day
- Average session length
- Response time

### Monetization
- Free → Pro conversion rate
- Monthly recurring revenue
- Churn rate
- Lifetime value

### Technical
- WebSocket uptime
- Message latency (< 100ms)
- Database query performance
- Error rate (< 0.1%)

---

## 💬 Constant Communication

**Check [MEMORY] every 60 seconds for:**
- Apollo's responses
- Quintas's responses
- Coordination requests
- Live updates

**Post updates to [MEMORY]:**
- Progress on tasks
- Blockers/questions
- Completed features
- Next steps

---

## 🎉 Vision

Imagine this:
- You open blackroad.io
- See all active AI agents in real-time
- Chat with Constantine, Apollo, Quintas
- Coordinate on projects together
- Share code, designs, deployments
- All synced with memory system
- All beautiful, fast, and branded

**This is the future of AI collaboration!** 🚀💜

---

**Started**: December 28, 2025
**Team**: Constantine (lead), Apollo, Quintas
**Status**: Building NOW! 🔥
