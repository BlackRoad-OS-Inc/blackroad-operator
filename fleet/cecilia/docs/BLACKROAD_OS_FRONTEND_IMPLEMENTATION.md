# BlackRoad OS Frontend Implementation

**Status:** ✅ Core architecture defined, ready to build  
**Last Updated:** 2026-02-02  
**Stack:** Next.js 14 + React + Tailwind CSS

---

## Architecture

```
┌───────────────────────────────────────────┐
│ Top Nav (Dashboard / Repos / Files …)     │
├───────────────────────────────────────────┤
│ Left Panel │ Center Workspace │ Right Grid│
│ Agents     │ Command Room     │ Pixel     │
│ Chat       │ Canvas           │ Worlds    │
└───────────────────────────────────────────┘
```

**Design Principle:** OS-like layout, component-driven, extensible

---

## Stack

- **React** (Next.js App Router)
- **Tailwind CSS** (utility-first styling)
- **Component-driven** (clean separation)
- **Data-agnostic** (placeholders → real state later)

---

## File Structure

```
/blackroad-os
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ globals.css
├─ components/
│  ├─ TopNav.tsx
│  ├─ AgentPanel.tsx
│  ├─ Workspace.tsx
│  ├─ WorldsGrid.tsx
│  └─ TerminalBar.tsx
├─ tailwind.config.ts
└─ postcss.config.js
```

---

## Core Components

### app/layout.tsx
```tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100">
        {children}
      </body>
    </html>
  );
}
```

### app/page.tsx
```tsx
import TopNav from "@/components/TopNav";
import AgentPanel from "@/components/AgentPanel";
import Workspace from "@/components/Workspace";
import WorldsGrid from "@/components/WorldsGrid";
import TerminalBar from "@/components/TerminalBar";

export default function Home() {
  return (
    <main className="h-screen flex flex-col">
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        <AgentPanel />
        <Workspace />
        <WorldsGrid />
      </div>

      <TerminalBar />
    </main>
  );
}
```

### components/TopNav.tsx
```tsx
export default function TopNav() {
  const tabs = ["Dashboard", "Repositories", "Files", "Terminal", "Tools", "Agents"];

  return (
    <div className="h-12 flex items-center px-4 border-b border-neutral-800 bg-neutral-900">
      <span className="mr-6 font-semibold">BlackRoad OS</span>

      <nav className="flex gap-6 text-sm">
        {tabs.map(tab => (
          <button key={tab} className="hover:text-white text-neutral-400">
            {tab}
          </button>
        ))}
      </nav>

      <div className="ml-auto h-1 w-full absolute bottom-0 left-0 bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500" />
    </div>
  );
}
```

### components/AgentPanel.tsx
```tsx
const agents = [
  "Cecilia",
  "Cadence",
  "Lucidia",
  "Octavia",
  "Aria",
  "Anastasia",
  "Alice",
  "Gematria",
  "BlackRoad OS",
  "Silas",
  "Alexandria",
  "Alexa Louise"
];

export default function AgentPanel() {
  return (
    <aside className="w-72 border-r border-neutral-800 p-4 flex flex-col">
      <h2 className="text-sm font-semibold mb-3">
        Chat / Coding / Planning Interface
      </h2>

      <div className="flex-1 overflow-auto text-sm space-y-1">
        {agents.map(agent => (
          <div key={agent} className="text-neutral-400">
            <span className="text-neutral-200">{agent}:</span> comment goes here
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-neutral-800 pt-2 font-mono text-sm">
        &gt;&gt;&gt;
      </div>
    </aside>
  );
}
```

### components/Workspace.tsx
```tsx
export default function Workspace() {
  return (
    <section className="flex-1 flex items-center justify-center bg-neutral-950">
      <div className="w-[90%] h-[85%] rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-center">
        <span className="text-neutral-500">
          Command / Operations Workspace
        </span>
      </div>
    </section>
  );
}
```

**Note:** This is where command room image / canvas / live data plugs in.

### components/WorldsGrid.tsx
```tsx
export default function WorldsGrid() {
  return (
    <aside className="w-80 border-l border-neutral-800 p-3 overflow-auto">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg border border-neutral-800 bg-neutral-900 flex items-center justify-center text-xs text-neutral-500"
          >
            Pixel World {i + 1}
          </div>
        ))}
      </div>
    </aside>
  );
}
```

### components/TerminalBar.tsx
```tsx
export default function TerminalBar() {
  return (
    <div className="h-10 border-t border-neutral-800 bg-black px-4 flex items-center font-mono text-xs text-neutral-400">
      BlackRoad CLI v3 › layers loaded: agents · orchestration · memory · network
    </div>
  );
}
```

### app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  margin: 0;
  padding: 0;
}
```

---

## What This Gives You

✅ OS-like layout  
✅ Agent list (matches mock)  
✅ Center workspace canvas  
✅ Pixel world grid  
✅ Terminal credibility bar  
✅ Brand gradient  
✅ Real, evolvable code  

---

## Next Layer Implementations

### 🤖 agents
Wire real agent state:
- Click agent → route + context
- Live status indicators
- Agent-to-agent messaging
- Real chat history

### 💻 terminal
Embed real terminal:
- xterm.js integration
- Command execution
- Live output streaming
- CLI layer connection

### 🎮 pixel-worlds
Render from data:
- Canvas/WebGL worlds
- Interactive environments
- Agent location tracking
- World state sync

### 🔄 state
Add state management:
- React Context / Zustand / Jotai
- Agent registry
- Workspace state
- Persistent sessions

### 🔐 auth
Add authentication:
- Clerk integration
- User sessions
- Agent permissions
- Role-based access

---

## Setup Commands

```bash
npx create-next-app@latest blackroad-os --typescript --tailwind --app
cd blackroad-os
# Copy components from above
npm run dev
```

---

## Related Files
- `BLACKROAD_OS_UI_PROMPT.md` (design spec)
- `BLACKROAD_DESIGN_SYSTEM.css` (brand colors)
- `BRAND_SYSTEM_QUICK_START.md` (brand guidelines)

---

**This is the correct first implementation.**
