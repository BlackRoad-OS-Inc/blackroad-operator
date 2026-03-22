# AgentMeeting Feature Documentation

## Overview

**AgentMeeting** is a collaborative communication feature in the AgentMonitor Dashboard that enables users to bring all their AI agents together for real-time group discussions, brainstorming sessions, and decision-making conversations.

---

## What It Is

AgentMeeting is an interactive chat interface that:

- **Aggregates all available agents** into a single collaborative space
- **Simulates multi-agent responses** when you send messages
- **Displays participant information** including agent names, emojis, and sub-agent status
- **Maintains conversation history** within an active meeting session
- **Provides visual meeting status** with start/end controls

Think of it as a "war room" where you can coordinate with all your AI agents simultaneously rather than interacting with them one-on-one.

---

## How to Use

### Starting a Meeting

1. Navigate to the AgentMonitor Dashboard (`http://localhost:3000`)
2. Locate the **Agent Meeting Room** card on the main page
3. Click the **Start Meeting** button

The meeting will initialize with a system message confirming all agents can now collaborate.

### During a Meeting

1. **Type a message** in the input field at the bottom
2. Press **Enter** or click **Send** to broadcast your message
3. Agents will respond with simulated collaborative replies
4. View participant list showing all available agents

### Ending a Meeting

1. Click the **End Meeting** button in the header
2. All messages are cleared and the meeting session terminates

---

## Features List

| Feature                  | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| **One-Click Start**      | Single button to initiate a multi-agent meeting      |
| **Real-Time Chat**       | Send messages and receive agent responses instantly  |
| **Participant Display**  | Shows all available agents with their emoji and name |
| **Sub-Agent Detection**  | Labels sub-agents with a "Sub-Agent" badge           |
| **Timestamp Tracking**   | Each message shows time of delivery                  |
| **Auto-Scroll**          | Automatically scrolls to newest messages             |
| **Visual Meeting State** | Clear active/inactive visual states                  |
| **Agent Count**          | Displays number of available participants            |

---

## Agent Modes

The AgentMeeting feature supports multiple collaboration modes:

### 🧠 Brainstorming Mode

When you pose a question or idea, agents contribute various perspectives and suggestions. Example prompts:

- "What are some ideas for optimizing our workflow?"
- "How should we approach this new feature?"

### 🤝 Collaboration Mode

Agents work together on a shared task, with each contributing their specialized knowledge. Example:

- "Let's plan the architecture for this project"

### 📋 Planning Mode

Use the meeting to coordinate project planning across multiple agents. Example:

- "Create a task list for the next sprint"

### ✅ Decision Making Mode

Present options to agents and gather consensus or recommendations. Example:

- "Should we use TypeScript or JavaScript for this module?"

---

## Screenshots & UI Components

### Inactive State (Meeting Room)

```
┌─────────────────────────────────────────────────────┐
│ 💬 Agent Meeting Room                    [Start]   │
├─────────────────────────────────────────────────────┤
│ Bring all your agents together for collaborative   │
│ discussions, brainstorming, and decision-making.   │
│                                                     │
│ 🧠 Brainstorming  🤝 Collaboration                 │
│ 📋 Planning       ✅ Decision Making               │
├─────────────────────────────────────────────────────┤
│ Available Agents (3):                               │
│ 🤖 Agent-1  🦆 DuckBot  🔧 CodeAgent               │
└─────────────────────────────────────────────────────┘
```

### Active State (Meeting Chat)

```
┌─────────────────────────────────────────────────────┐
│ 💬 Agent Meeting                         [End]     │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🤖 System   10:30:15 AM                         │ │
│ │ Meeting started! All agents can now collaborate│ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ │ 👤 You       10:30:45 AM                         │ │
│ │ Let's discuss the new feature plan              │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ │ 🤖 Agent-1  10:30:47 AM                          │ │
│ │ Great idea! Let me contribute.                 │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ [Type a message...                          ] [Send]│
├─────────────────────────────────────────────────────┤
│ Participants (4):                                   │
│ 👤 You  🤖 Agent-1  🦆 DuckBot  🔧 CodeAgent       │
└─────────────────────────────────────────────────────┘
```

---

## Integration Details

### Component Location

- **Main Component:** `src/components/meeting/AgentMeeting.tsx`
- **Used In:** `src/app/page.tsx` (imported as `<AgentMeeting agents={agents} />`)

### Props Interface

```typescript
interface AgentMeetingProps {
  agents?: any[] // Array of available agent objects
}

interface Message {
  id: string
  agentId: string
  agentName: string
  agentEmoji: string
  content: string
  timestamp: number
  isSubAgent: boolean
}
```

### State Management

- `isMeetingActive` - Boolean tracking meeting state
- `messages` - Array of Message objects for chat history
- `inputMessage` - Current user input

### Dependencies

- React (useState, useRef, useEffect)
- Tailwind CSS for styling
- CSS custom properties for theming

### Office Integration

The meeting room is visualized in the pixel-art office view:

- **Location:** Grid position (col: 14, row: 7)
- **Zone:** `meeting_room` with 🤝 emoji
- **Furniture:** Meeting chairs available via `drawMeetingChair`

---

## Technical Notes

### Message Flow

1. User types and sends message
2. Message added to local state with `agentId: 'user'`
3. After 1.5s delay, random agent simulates response
4. Response added to message thread

### Demo Mode

In demo mode (when no real agents connected), the feature still works with simulated agent data.

### Theming

Uses CSS custom properties:

- `--bg-card` - Card background
- `--bg-secondary` - Secondary background
- `--border` - Border color
- `--text-primary` - Primary text
- `--text-secondary` - Secondary text
- `--accent-primary` - Accent/button color

---

## Best Practices

1. **Start with Clear Objectives** - State your goal at the beginning of the meeting
2. **Use Specific Prompts** - More specific questions get better agent responses
3. **Review Participant List** - Ensure all needed agents are available
4. **End When Done** - Close meetings to keep the interface clean

---

## Related Documentation

- [AI-COUNCIL-ARCHITECTURE.md](./AI-COUNCIL-ARCHITECTURE.md) - Multi-agent council system
- [FEATURE-COMPARISON.md](./FEATURE-COMPARISON.md) - Feature overview
- [README.md](../README.md) - Main dashboard documentation

---

**Last Updated:** February 28, 2026
**Component Version:** 1.0.0
