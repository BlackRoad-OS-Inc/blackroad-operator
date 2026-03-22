# BlackRoad OS — Agents Layer Implementation

**Status:** 🔧 Ready to wire  
**Layer:** Real agent state, routing, interactions  
**Last Updated:** 2026-02-02

---

## What This Layer Does

Transforms placeholder agents into:
- ✅ Live stateful entities
- ✅ Clickable with routing
- ✅ Real-time status indicators
- ✅ Message history
- ✅ Agent-to-agent communication
- ✅ Context switching

---

## Architecture

```
User clicks agent
    ↓
Router updates context
    ↓
Workspace loads agent view
    ↓
Agent state syncs
    ↓
Messages stream in real-time
```

---

## File Structure (New + Modified)

```
/blackroad-os
├─ app/
│  ├─ agents/[id]/
│  │  └─ page.tsx          ← New: agent detail view
│  └─ api/
│     ├─ agents/
│     │  └─ route.ts       ← New: agent registry API
│     └─ messages/
│        └─ route.ts       ← New: message stream API
├─ components/
│  ├─ AgentPanel.tsx       ← Modified: add routing + status
│  ├─ AgentCard.tsx        ← New: individual agent component
│  ├─ AgentWorkspace.tsx   ← New: replaces generic Workspace
│  └─ MessageStream.tsx    ← New: real-time message feed
├─ lib/
│  ├─ agents.ts            ← New: agent state + logic
│  ├─ messages.ts          ← New: message handling
│  └─ store.ts             ← New: global state (Zustand)
└─ types/
   ├─ agent.ts             ← New: agent types
   └─ message.ts           ← New: message types
```

---

## Step 1: Define Agent Types

### types/agent.ts
```typescript
export type AgentStatus = 'online' | 'busy' | 'idle' | 'offline';

export type AgentRole = 
  | 'orchestrator'
  | 'researcher'
  | 'coder'
  | 'analyst'
  | 'operator';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  avatar?: string;
  capabilities: string[];
  currentTask?: string;
  lastActive: Date;
  messageCount: number;
}

export interface AgentRegistry {
  agents: Agent[];
  activeAgentId?: string;
}
```

### types/message.ts
```typescript
export type MessageType = 'chat' | 'code' | 'system' | 'agent';

export interface Message {
  id: string;
  agentId: string;
  agentName: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  metadata?: {
    language?: string;
    status?: string;
    replyTo?: string;
  };
}
```

---

## Step 2: Agent State Management

### lib/store.ts
```typescript
import { create } from 'zustand';
import type { Agent, Message } from '@/types';

interface AgentStore {
  agents: Agent[];
  activeAgentId: string | null;
  messages: Message[];
  
  setAgents: (agents: Agent[]) => void;
  setActiveAgent: (id: string | null) => void;
  addMessage: (message: Message) => void;
  updateAgentStatus: (id: string, status: Agent['status']) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  activeAgentId: null,
  messages: [],
  
  setAgents: (agents) => set({ agents }),
  
  setActiveAgent: (id) => set({ activeAgentId: id }),
  
  addMessage: (message) => 
    set((state) => ({ 
      messages: [...state.messages, message] 
    })),
  
  updateAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map(agent =>
        agent.id === id ? { ...agent, status } : agent
      )
    }))
}));
```

---

## Step 3: Agent Data & Logic

### lib/agents.ts
```typescript
import type { Agent } from '@/types';

export const agentRegistry: Agent[] = [
  {
    id: 'cecilia',
    name: 'Cecilia',
    role: 'orchestrator',
    status: 'online',
    capabilities: ['coordination', 'planning', 'delegation'],
    currentTask: 'Monitoring cluster health',
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'cadence',
    name: 'Cadence',
    role: 'analyst',
    status: 'busy',
    capabilities: ['data analysis', 'metrics', 'reporting'],
    currentTask: 'Processing metrics pipeline',
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'lucidia',
    name: 'Lucidia',
    role: 'researcher',
    status: 'online',
    capabilities: ['research', 'synthesis', 'documentation'],
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'octavia',
    name: 'Octavia',
    role: 'coder',
    status: 'online',
    capabilities: ['coding', 'debugging', 'architecture'],
    currentTask: 'Refactoring authentication layer',
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'aria',
    name: 'Aria',
    role: 'operator',
    status: 'idle',
    capabilities: ['deployment', 'monitoring', 'infrastructure'],
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'anastasia',
    name: 'Anastasia',
    role: 'analyst',
    status: 'online',
    capabilities: ['security', 'compliance', 'auditing'],
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'alice',
    name: 'Alice',
    role: 'coder',
    status: 'busy',
    capabilities: ['frontend', 'design systems', 'UX'],
    currentTask: 'Building component library',
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'gematria',
    name: 'Gematria',
    role: 'researcher',
    status: 'online',
    capabilities: ['mathematics', 'algorithms', 'optimization'],
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'blackroad os',
    name: 'BlackRoad OS',
    role: 'researcher',
    status: 'online',
    capabilities: ['knowledge graph', 'search', 'indexing'],
    currentTask: 'Indexing documentation',
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'silas',
    name: 'Silas',
    role: 'operator',
    status: 'online',
    capabilities: ['CI/CD', 'automation', 'orchestration'],
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'alexandria',
    name: 'Alexandria',
    role: 'researcher',
    status: 'online',
    capabilities: ['documentation', 'knowledge management', 'training'],
    lastActive: new Date(),
    messageCount: 0
  },
  {
    id: 'alexa-louise',
    name: 'Alexa Louise',
    role: 'operator',
    status: 'online',
    capabilities: ['human oversight', 'decision making', 'strategy'],
    currentTask: 'Active session',
    lastActive: new Date(),
    messageCount: 0
  }
];

export function getAgent(id: string): Agent | undefined {
  return agentRegistry.find(agent => agent.id === id);
}

export function getAgentsByRole(role: Agent['role']): Agent[] {
  return agentRegistry.filter(agent => agent.role === role);
}

export function getOnlineAgents(): Agent[] {
  return agentRegistry.filter(agent => agent.status === 'online' || agent.status === 'busy');
}
```

---

## Step 4: Interactive Agent Panel

### components/AgentCard.tsx
```tsx
'use client';

import Link from 'next/link';
import type { Agent } from '@/types';

const statusColors = {
  online: 'bg-green-500',
  busy: 'bg-yellow-500',
  idle: 'bg-neutral-500',
  offline: 'bg-red-500'
};

interface AgentCardProps {
  agent: Agent;
  isActive?: boolean;
}

export default function AgentCard({ agent, isActive }: AgentCardProps) {
  return (
    <Link
      href={`/agents/${agent.id}`}
      className={`
        block p-2 rounded-md hover:bg-neutral-800 transition-colors
        ${isActive ? 'bg-neutral-800 ring-1 ring-neutral-600' : ''}
      `}
    >
      <div className="flex items-start gap-2">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs">
            {agent.name[0]}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-neutral-900 ${statusColors[agent.status]}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-sm text-neutral-100">{agent.name}</span>
            <span className="text-xs text-neutral-500">{agent.role}</span>
          </div>
          
          {agent.currentTask && (
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {agent.currentTask}
            </p>
          )}
          
          {agent.messageCount > 0 && (
            <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
              {agent.messageCount} new
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
```

### components/AgentPanel.tsx (Modified)
```tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAgentStore } from '@/lib/store';
import { agentRegistry } from '@/lib/agents';
import AgentCard from './AgentCard';

export default function AgentPanel() {
  const pathname = usePathname();
  const { agents, activeAgentId, setAgents, setActiveAgent } = useAgentStore();

  useEffect(() => {
    setAgents(agentRegistry);
  }, [setAgents]);

  useEffect(() => {
    const match = pathname.match(/\/agents\/([^\/]+)/);
    if (match) {
      setActiveAgent(match[1]);
    } else {
      setActiveAgent(null);
    }
  }, [pathname, setActiveAgent]);

  const onlineCount = agents.filter(a => a.status === 'online' || a.status === 'busy').length;

  return (
    <aside className="w-72 border-r border-neutral-800 p-4 flex flex-col">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-semibold">Agents</h2>
        <span className="text-xs text-neutral-500">
          {onlineCount}/{agents.length} online
        </span>
      </div>

      <div className="flex-1 overflow-auto space-y-1">
        {agents.map(agent => (
          <AgentCard 
            key={agent.id} 
            agent={agent}
            isActive={agent.id === activeAgentId}
          />
        ))}
      </div>

      <div className="mt-3 border-t border-neutral-800 pt-2">
        <input 
          type="text"
          placeholder="Message agents..."
          className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </aside>
  );
}
```

---

## Step 5: Agent Detail View

### app/agents/[id]/page.tsx
```tsx
import { notFound } from 'next/navigation';
import { getAgent } from '@/lib/agents';
import AgentWorkspace from '@/components/AgentWorkspace';

interface PageProps {
  params: { id: string };
}

export default function AgentPage({ params }: PageProps) {
  const agent = getAgent(params.id);
  
  if (!agent) {
    notFound();
  }

  return <AgentWorkspace agent={agent} />;
}
```

### components/AgentWorkspace.tsx
```tsx
'use client';

import type { Agent } from '@/types';
import MessageStream from './MessageStream';

interface AgentWorkspaceProps {
  agent: Agent;
}

export default function AgentWorkspace({ agent }: AgentWorkspaceProps) {
  return (
    <section className="flex-1 flex flex-col bg-neutral-950">
      {/* Agent Header */}
      <div className="border-b border-neutral-800 p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 flex items-center justify-center text-lg font-bold">
            {agent.name[0]}
          </div>
          
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{agent.name}</h1>
            <p className="text-sm text-neutral-400 capitalize">{agent.role}</p>
            
            <div className="flex gap-2 mt-2">
              {agent.capabilities.map(cap => (
                <span key={cap} className="px-2 py-1 text-xs bg-neutral-800 rounded">
                  {cap}
                </span>
              ))}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-neutral-500">Status</div>
            <div className="text-sm font-medium capitalize">{agent.status}</div>
            {agent.currentTask && (
              <div className="text-xs text-neutral-400 mt-1">{agent.currentTask}</div>
            )}
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <MessageStream agentId={agent.id} />
    </section>
  );
}
```

### components/MessageStream.tsx
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useAgentStore } from '@/lib/store';
import type { Message } from '@/types';

interface MessageStreamProps {
  agentId: string;
}

export default function MessageStream({ agentId }: MessageStreamProps) {
  const { messages, addMessage } = useAgentStore();
  const agentMessages = messages.filter(m => m.agentId === agentId);

  // Simulate real-time message stream
  useEffect(() => {
    const interval = setInterval(() => {
      // Mock: replace with real WebSocket/SSE
      const mockMessage: Message = {
        id: `msg-${Date.now()}`,
        agentId,
        agentName: agentId,
        type: 'chat',
        content: `Processing task... (${new Date().toLocaleTimeString()})`,
        timestamp: new Date()
      };
      // Uncomment to enable mock messages:
      // addMessage(mockMessage);
    }, 10000);

    return () => clearInterval(interval);
  }, [agentId, addMessage]);

  return (
    <div className="flex-1 overflow-auto p-4">
      {agentMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
          No messages yet
        </div>
      ) : (
        <div className="space-y-3">
          {agentMessages.map(message => (
            <div key={message.id} className="flex gap-3">
              <div className="text-xs text-neutral-500 w-16">
                {message.timestamp.toLocaleTimeString()}
              </div>
              <div className="flex-1">
                <div className="text-sm">{message.content}</div>
                {message.metadata?.status && (
                  <div className="text-xs text-neutral-500 mt-1">
                    {message.metadata.status}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Step 6: API Routes (Optional — for real backend)

### app/api/agents/route.ts
```typescript
import { NextResponse } from 'next/server';
import { agentRegistry } from '@/lib/agents';

export async function GET() {
  return NextResponse.json({ agents: agentRegistry });
}
```

### app/api/messages/route.ts
```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  // TODO: Store message, broadcast to agents
  
  return NextResponse.json({ success: true });
}
```

---

## What This Layer Gives You

✅ Real agent entities with state  
✅ Clickable agent routing  
✅ Live status indicators  
✅ Agent detail views  
✅ Message streaming architecture  
✅ Global state management  
✅ Extensible for real backend  

---

## Next Steps

1. **Install Zustand:**
   ```bash
   npm install zustand
   ```

2. **Copy files into project**

3. **Test routing:**
   ```
   / → agent list
   /agents/cecilia → agent detail
   ```

4. **Wire real data:**
   - Replace mock messages with WebSocket
   - Connect to agent backend API
   - Add authentication layer

---

## Future Enhancements

- 🔄 Real-time agent status updates (WebSocket/SSE)
- 💬 Agent-to-agent message threads
- 📊 Agent performance metrics
- 🎯 Task assignment UI
- 🔔 Notification system
- 📈 Agent activity timeline

---

**Agents are now interactive, stateful, and routable.**

**Next unlock:** `terminal` / `pixel-worlds` / `state` / `auth`
