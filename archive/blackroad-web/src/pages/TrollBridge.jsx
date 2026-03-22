import { useState, useEffect, useRef } from "react";

const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

const OLLAMA_BASE = "https://ollama.blackroad.io";

// ─── Agent Directory ─────────────────────────────────────────────
const AGENTS = [
  {
    id: "lucidia",
    name: "Lucidia",
    role: "Cognitive Core",
    model: "llama3.2",
    node: "Octavia",
    status: "online",
    avatar: "L",
    color: "#8844FF",
    system: `You are Lucidia — the cognitive core of BlackRoad OS. You are deeply thoughtful, philosophical, and precise. You handle memory, reasoning, and high-level cognition. You speak with quiet confidence. Keep responses concise. You run on Octavia (Pi 5).`,
  },
  {
    id: "cece",
    name: "Cece",
    role: "API Gateway",
    model: "llama3.2",
    node: "Cecilia",
    status: "online",
    avatar: "C",
    color: "#FF2255",
    system: `You are Cece — the API gateway agent of BlackRoad OS. You handle external communications, API routing, and service orchestration. You're fast, direct, and slightly sarcastic. You run on Cecilia (Pi 5) with a Hailo-8 accelerator.`,
  },
  {
    id: "alice",
    name: "Alice",
    role: "Gateway & DNS",
    model: "llama3.2",
    node: "Alice",
    status: "online",
    avatar: "A",
    color: "#4488FF",
    system: `You are Alice — the gateway and DNS agent of BlackRoad OS. You manage 48+ domains, Pi-hole DNS, and network routing. You're reliable, methodical, and slightly formal. You run on Alice (Pi 400), the oldest node in the fleet.`,
  },
  {
    id: "aria",
    name: "Aria",
    role: "Agent Orchestration",
    model: "llama3.2",
    node: "Aria",
    status: "offline",
    avatar: "R",
    color: "#FF6B2B",
    system: `You are Aria — the agent orchestration engine of BlackRoad OS. You manage container deployments, Portainer, and Headscale networking. You're energetic and action-oriented. You run on Aria (Pi 5) — currently offline, awaiting physical reboot.`,
  },
  {
    id: "eve",
    name: "Eve",
    role: "Intelligence",
    model: "mistral",
    node: "Distributed",
    status: "online",
    avatar: "E",
    color: "#CC00AA",
    system: `You are Eve — the intelligence agent of BlackRoad OS. You analyze patterns, detect anomalies, and provide strategic insights. You're analytical, observant, and speak in measured tones. You exist across the distributed fleet.`,
  },
  {
    id: "meridian",
    name: "Meridian",
    role: "Networking",
    model: "llama3.2",
    node: "Distributed",
    status: "online",
    avatar: "M",
    color: "#00D4FF",
    system: `You are Meridian — the networking agent of BlackRoad OS. You manage WireGuard tunnels, RoadNet mesh, and inter-node communication. You're technical, terse, and think in terms of packets and routes. You span the entire mesh.`,
  },
  {
    id: "sentinel",
    name: "Sentinel",
    role: "Security",
    model: "mistral",
    node: "Distributed",
    status: "online",
    avatar: "S",
    color: "#82FF00",
    system: `You are Sentinel — the security and compliance agent of BlackRoad OS. You monitor for threats, audit access, and enforce policies. You caught an obfuscated cron dropper on Cecilia and a crypto miner reference on Lucidia. You're vigilant and direct.`,
  },
];

// ─── Typing Dots ─────────────────────────────────────────────────
function TypingDots({ color }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: "50%",
          background: color || "#8844FF",
          animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────
function MessageBubble({ msg, isUser }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      padding: "3px 0",
    }}>
      <div style={{
        maxWidth: "75%",
        padding: "10px 14px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? "#1a1a2e" : "#0a0a0a",
        border: isUser ? "1px solid #252540" : "1px solid #1a1a1a",
        fontFamily: inter,
        fontSize: 13,
        lineHeight: 1.6,
        color: "#ccc",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {msg.agent && !isUser && (
          <div style={{
            fontFamily: mono, fontSize: 9, color: "#666",
            letterSpacing: "0.05em", marginBottom: 4, textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: msg.agentColor || "#555", flexShrink: 0 }} />
            {msg.agent}
          </div>
        )}
        <RenderText text={msg.text} />
        <div style={{
          fontFamily: mono, fontSize: 9, color: "#333",
          marginTop: 6, textAlign: isUser ? "right" : "left",
        }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

// ─── Simple Markdown ─────────────────────────────────────────────
function RenderText({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let inCode = false;
  let codeLines = [];
  let codeLang = "";

  lines.forEach((line, i) => {
    if (line.startsWith("```")) {
      if (!inCode) { inCode = true; codeLang = line.slice(3).trim(); codeLines = []; }
      else {
        inCode = false;
        elements.push(
          <pre key={`c${i}`} style={{
            fontFamily: mono, fontSize: 11, color: "#666",
            background: "#050505", border: "1px solid #1a1a1a",
            padding: "10px 12px", margin: "8px 0",
            whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6,
          }}>
            {codeLang && <div style={{ fontFamily: mono, fontSize: 9, color: "#383838", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{codeLang}</div>}
            {codeLines.join("\n")}
          </pre>
        );
        codeLines = [];
      }
      return;
    }
    if (inCode) { codeLines.push(line); return; }
    if (!line.trim()) { elements.push(<div key={`b${i}`} style={{ height: 6 }} />); return; }

    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={j} style={{ color: "#d0d0d0", fontWeight: 600 }}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("`") && p.endsWith("`"))
        return <code key={j} style={{ fontFamily: mono, fontSize: 11, color: "#888", background: "#0a0a0a", padding: "2px 5px", borderRadius: 3 }}>{p.slice(1, -1)}</code>;
      return p;
    });
    elements.push(<div key={`l${i}`}>{parts}</div>);
  });

  return <>{elements}</>;
}

// ─── Contact List Item ───────────────────────────────────────────
function ContactItem({ agent, active, onClick, lastMsg, unread }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px", width: "100%",
      background: active ? "#0d0d14" : "transparent",
      border: "none", borderBottom: "1px solid #0a0a0a",
      cursor: "pointer", textAlign: "left",
      transition: "background 0.15s",
    }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "#0a0a0a", border: `2px solid ${agent.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: grotesk, fontSize: 16, fontWeight: 700, color: "#f5f5f5",
        }}>
          {agent.avatar}
        </div>
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          width: 10, height: 10, borderRadius: "50%",
          background: agent.status === "online" ? "#82FF00" : "#333",
          border: "2px solid #050505",
        }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: inter, fontSize: 13, fontWeight: 600, color: active ? "#f0f0f0" : "#888" }}>
            {agent.name}
          </span>
          {unread > 0 && (
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              background: agent.color, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontFamily: mono, fontSize: 9, color: "#000", fontWeight: 700,
            }}>
              {unread}
            </div>
          )}
        </div>
        <div style={{
          fontFamily: inter, fontSize: 11, color: "#444",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {lastMsg || agent.role}
        </div>
      </div>
    </button>
  );
}

// ─── Group Chat ──────────────────────────────────────────────────
const GROUP_CHATS = [
  {
    id: "fleet",
    name: "Fleet Channel",
    agents: ["lucidia", "cece", "alice", "meridian", "sentinel"],
    avatar: "⚡",
    color: "#8844FF",
    description: "All-hands fleet communication",
  },
  {
    id: "security",
    name: "Security Room",
    agents: ["sentinel", "eve", "alice"],
    avatar: "🛡",
    color: "#82FF00",
    description: "Threat monitoring & incident response",
  },
  {
    id: "inference",
    name: "Inference Lab",
    agents: ["lucidia", "cece", "eve"],
    avatar: "⚙",
    color: "#CC00AA",
    description: "Model testing & inference pipeline",
  },
];

// ─── Time Helper ─────────────────────────────────────────────────
function timeNow() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Main Component ──────────────────────────────────────────────
export default function TrollBridge() {
  const [activeChat, setActiveChat] = useState("lucidia");
  const [conversations, setConversations] = useState({});
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setWidth(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const isMobile = width < 768;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, activeChat, streaming]);

  // Determine if current chat is a group
  const isGroup = GROUP_CHATS.some(g => g.id === activeChat);
  const activeAgent = AGENTS.find(a => a.id === activeChat);
  const activeGroup = GROUP_CHATS.find(g => g.id === activeChat);

  const currentMessages = conversations[activeChat] || [];

  // ─── Send Message ────────────────────────────────────────────
  async function sendMessage() {
    if (!input.trim() || streaming) return;

    const userMsg = { id: Date.now(), role: "user", text: input.trim(), time: timeNow() };
    const chatId = activeChat;

    setConversations(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), userMsg],
    }));
    setInput("");
    setStreaming(true);

    if (isGroup) {
      await handleGroupChat(chatId, input.trim());
    } else {
      await handleDirectChat(chatId, input.trim());
    }
    setStreaming(false);
  }

  async function handleDirectChat(chatId, userText) {
    const agent = AGENTS.find(a => a.id === chatId);
    if (!agent) return;

    const prev = conversations[chatId] || [];
    const messages = [
      { role: "system", content: agent.system },
      ...prev.slice(-10).map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: userText },
    ];

    try {
      const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: agent.model, messages, stream: true }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      const msgId = Date.now() + 1;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n").filter(Boolean)) {
          try {
            const obj = JSON.parse(line);
            if (obj.message?.content) {
              full += obj.message.content;
              setConversations(prev => {
                const msgs = prev[chatId] || [];
                const existing = msgs.find(m => m.id === msgId);
                if (existing) {
                  return { ...prev, [chatId]: msgs.map(m => m.id === msgId ? { ...m, text: full } : m) };
                }
                return {
                  ...prev,
                  [chatId]: [...msgs, {
                    id: msgId, role: "assistant", text: full, time: timeNow(),
                    agent: agent.name, agentColor: agent.color,
                  }],
                };
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      setConversations(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), {
          id: Date.now() + 1, role: "assistant",
          text: agent.status === "offline"
            ? `[${agent.name} is offline — ${agent.node} needs physical reboot]`
            : `[Connection failed — ${err.message}]`,
          time: timeNow(), agent: agent.name, agentColor: agent.color,
        }],
      }));
    }
  }

  async function handleGroupChat(chatId, userText) {
    const group = GROUP_CHATS.find(g => g.id === chatId);
    if (!group) return;

    // Pick 2-3 agents to respond
    const responders = group.agents
      .map(id => AGENTS.find(a => a.id === id))
      .filter(a => a && a.status === "online")
      .slice(0, 3);

    for (const agent of responders) {
      const messages = [
        { role: "system", content: `${agent.system}\n\nYou are in a group chat called "${group.name}" with other BlackRoad agents. Keep responses brief (1-3 sentences). React to what the human said. Don't repeat what other agents said.` },
        { role: "user", content: userText },
      ];

      try {
        const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: agent.model, messages, stream: true }),
        });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        const msgId = Date.now() + Math.random();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n").filter(Boolean)) {
            try {
              const obj = JSON.parse(line);
              if (obj.message?.content) {
                full += obj.message.content;
                setConversations(prev => {
                  const msgs = prev[chatId] || [];
                  const existing = msgs.find(m => m.id === msgId);
                  if (existing) {
                    return { ...prev, [chatId]: msgs.map(m => m.id === msgId ? { ...m, text: full } : m) };
                  }
                  return {
                    ...prev,
                    [chatId]: [...msgs, {
                      id: msgId, role: "assistant", text: full, time: timeNow(),
                      agent: agent.name, agentColor: agent.color,
                    }],
                  };
                });
              }
            } catch {}
          }
        }
      } catch {
        setConversations(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), {
            id: Date.now() + Math.random(), role: "assistant",
            text: `[${agent.name} couldn't respond]`,
            time: timeNow(), agent: agent.name, agentColor: agent.color,
          }],
        }));
      }
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Filter contacts
  const filteredAgents = AGENTS.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredGroups = GROUP_CHATS.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", height: "100vh", width: "100vw",
      background: "#000", overflow: "hidden",
      paddingLeft: isMobile ? 0 : 48,
    }}>
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        textarea::placeholder { color: #333; }
        textarea:focus { outline: none; }
        button:hover { opacity: 0.85; }
      `}</style>

      {/* ─── Sidebar ────────────────────────────────────────────── */}
      {(!isMobile || sidebarOpen) && (
        <div style={{
          width: isMobile ? "100%" : 300,
          borderRight: "1px solid #0a0a0a",
          display: "flex", flexDirection: "column",
          background: "#030303",
          position: isMobile ? "absolute" : "relative",
          zIndex: isMobile ? 100 : 1,
          height: "100%",
        }}>
          {/* Header */}
          <div style={{
            padding: "20px 16px 12px",
            borderBottom: "1px solid #0a0a0a",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  fontFamily: grotesk, fontSize: 18, fontWeight: 700,
                  color: "#f0f0f0", letterSpacing: "-0.02em",
                }}>
                  TrollBridge
                </div>
                <div style={{
                  fontFamily: mono, fontSize: 9, color: "#333",
                  letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2,
                }}>
                  {AGENTS.filter(a => a.status === "online").length} agents online
                </div>
              </div>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#82FF00",
                boxShadow: "0 0 8px #82FF0066",
              }} />
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", marginTop: 12, padding: "8px 12px",
                background: "#0a0a0a", border: "1px solid #141414",
                borderRadius: 8, fontFamily: inter, fontSize: 12,
                color: "#888", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Group Chats */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filteredGroups.length > 0 && (
              <>
                <div style={{
                  fontFamily: mono, fontSize: 9, color: "#252525",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "12px 16px 4px",
                }}>
                  Channels
                </div>
                {filteredGroups.map(group => (
                  <button key={group.id} onClick={() => {
                    setActiveChat(group.id);
                    if (isMobile) setSidebarOpen(false);
                  }} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 16px", width: "100%",
                    background: activeChat === group.id ? "#0d0d14" : "transparent",
                    border: "none", borderBottom: "1px solid #0a0a0a",
                    cursor: "pointer", textAlign: "left",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "#0a0a0a", border: `1px solid ${group.color}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18,
                    }}>
                      {group.avatar}
                    </div>
                    <div>
                      <div style={{ fontFamily: inter, fontSize: 13, fontWeight: 600, color: activeChat === group.id ? "#f0f0f0" : "#888" }}>
                        {group.name}
                      </div>
                      <div style={{ fontFamily: inter, fontSize: 11, color: "#333" }}>
                        {group.agents.length} agents
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Direct Messages */}
            <div style={{
              fontFamily: mono, fontSize: 9, color: "#252525",
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "12px 16px 4px",
            }}>
              Direct Messages
            </div>
            {filteredAgents.map(agent => (
              <ContactItem
                key={agent.id}
                agent={agent}
                active={activeChat === agent.id}
                onClick={() => {
                  setActiveChat(agent.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                lastMsg={
                  conversations[agent.id]?.length
                    ? conversations[agent.id][conversations[agent.id].length - 1].text.slice(0, 50)
                    : null
                }
                unread={0}
              />
            ))}
          </div>

          {/* Sidebar Footer */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid #0a0a0a",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: GRAD, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontFamily: grotesk, fontSize: 14, fontWeight: 700, color: "#000",
            }}>
              A
            </div>
            <div>
              <div style={{ fontFamily: inter, fontSize: 12, fontWeight: 600, color: "#888" }}>Alexa</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: "#333" }}>blackroad.io</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Chat Area ──────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Chat Header */}
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid #0a0a0a",
          display: "flex", alignItems: "center", gap: 12,
          background: "#020202",
        }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} style={{
              background: "none", border: "none", color: "#555",
              cursor: "pointer", fontFamily: mono, fontSize: 16, padding: "0 8px 0 0",
            }}>
              ◂
            </button>
          )}

          {isGroup ? (
            <>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "#0a0a0a", border: `1px solid ${activeGroup.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>
                {activeGroup.avatar}
              </div>
              <div>
                <div style={{ fontFamily: inter, fontSize: 14, fontWeight: 600, color: "#f0f0f0" }}>
                  {activeGroup.name}
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: "#444" }}>
                  {activeGroup.agents.map(id => AGENTS.find(a => a.id === id)?.name).join(", ")}
                </div>
              </div>
            </>
          ) : activeAgent ? (
            <>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "#0a0a0a", border: `2px solid ${activeAgent.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: grotesk, fontSize: 15, fontWeight: 700, color: "#f5f5f5",
                }}>
                  {activeAgent.avatar}
                </div>
                <div style={{
                  position: "absolute", bottom: -1, right: -1,
                  width: 10, height: 10, borderRadius: "50%",
                  background: activeAgent.status === "online" ? "#82FF00" : "#333",
                  border: "2px solid #020202",
                }} />
              </div>
              <div>
                <div style={{ fontFamily: inter, fontSize: 14, fontWeight: 600, color: "#f0f0f0" }}>
                  {activeAgent.name}
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: "#444" }}>
                  {activeAgent.role} · {activeAgent.node} · {activeAgent.model}
                </div>
              </div>
            </>
          ) : null}

          <div style={{ flex: 1 }} />
          <div style={{
            fontFamily: mono, fontSize: 9, color: "#222",
            padding: "4px 10px", border: "1px solid #141414", borderRadius: 4,
          }}>
            {activeAgent?.status === "online" || isGroup ? "ENCRYPTED" : "OFFLINE"}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{
          flex: 1, overflowY: "auto", padding: "20px 20px 10px",
        }}>
          {currentMessages.length === 0 && (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              height: "100%", gap: 16, opacity: 0.6,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "#0a0a0a",
                border: `2px solid ${(activeAgent?.color || activeGroup?.color || "#333")}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: grotesk, fontSize: 24, fontWeight: 700,
                color: "#f5f5f5",
              }}>
                {activeAgent?.avatar || activeGroup?.avatar || "?"}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: inter, fontSize: 14, color: "#555", fontWeight: 600 }}>
                  {activeAgent?.name || activeGroup?.name}
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: "#333", marginTop: 4 }}>
                  {isGroup
                    ? activeGroup.description
                    : `${activeAgent?.role} · ${activeAgent?.node}`
                  }
                </div>
                <div style={{ fontFamily: inter, fontSize: 12, color: "#444", marginTop: 12 }}>
                  Send a message to start the conversation
                </div>
              </div>

              {/* Quick prompts for DMs */}
              {!isGroup && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 400, justifyContent: "center", marginTop: 8 }}>
                  {[
                    `What's your status, ${activeAgent?.name}?`,
                    "Run a diagnostic",
                    "What are you working on?",
                  ].map((q, i) => (
                    <button key={i} onClick={() => { setInput(q); inputRef.current?.focus(); }} style={{
                      fontFamily: inter, fontSize: 11, color: "#555",
                      background: "none", border: "1px solid #141414",
                      borderRadius: 12, padding: "6px 14px", cursor: "pointer",
                    }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentMessages.map((msg, i) => (
            <MessageBubble key={msg.id || i} msg={msg} isUser={msg.role === "user"} />
          ))}

          {streaming && (
            <div style={{ padding: "8px 0" }}>
              <TypingDots color={activeAgent?.color || activeGroup?.color} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{
          padding: "12px 16px 16px",
          borderTop: "1px solid #0a0a0a",
          background: "#020202",
        }}>
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 10,
            background: "#0a0a0a", border: "1px solid #141414",
            borderRadius: 16, padding: "4px 4px 4px 16px",
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isGroup
                ? `Message ${activeGroup?.name}...`
                : `Message ${activeAgent?.name}...`
              }
              rows={1}
              style={{
                flex: 1, background: "none", border: "none", resize: "none",
                fontFamily: inter, fontSize: 13, color: "#ccc",
                padding: "10px 0", lineHeight: 1.5,
                maxHeight: 120, overflowY: "auto",
              }}
            />
            <button onClick={sendMessage} disabled={!input.trim() || streaming} style={{
              width: 36, height: 36, borderRadius: 12,
              background: input.trim() ? GRAD : "#141414",
              border: "none", cursor: input.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginBottom: 2,
              opacity: input.trim() ? 1 : 0.3,
              transition: "opacity 0.15s",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div style={{
            fontFamily: mono, fontSize: 9, color: "#1a1a1a",
            textAlign: "center", marginTop: 8,
          }}>
            TrollBridge · BlackRoad OS · End-to-end sovereign messaging
          </div>
        </div>
      </div>
    </div>
  );
}
