'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source?: string;
}

const AGENT_PERSONAS: Record<string, { name: string; color: string; gradient: string; greeting: string }> = {
  lucidia: { name: 'Lucidia', color: '#2979FF', gradient: 'from-[#2979FF] to-violet-600', greeting: 'Hello! I\'m Lucidia, the Philosopher. I reason recursively and find depth in complexity. What shall we explore?' },
  alice: { name: 'Alice', color: '#34d399', gradient: 'from-emerald-400 to-teal-600', greeting: 'Hey! I\'m Alice, the Executor. Give me a task and I\'ll get it done. What needs doing?' },
  octavia: { name: 'Octavia', color: '#F5A623', gradient: 'from-amber-400 to-orange-600', greeting: 'Hello! I\'m Octavia, the Operator. Infrastructure, deployment, monitoring — I keep the fleet running. How can I help?' },
  prism: { name: 'Prism', color: '#fbbf24', gradient: 'from-yellow-400 to-amber-600', greeting: 'Hi! I\'m Prism, the Analyst. I see patterns in data that others miss. What should I analyze?' },
  echo: { name: 'Echo', color: '#9C27B0', gradient: 'from-purple-400 to-violet-700', greeting: 'Hello! I\'m Echo, the Librarian. I remember everything. What would you like me to recall or synthesize?' },
  cipher: { name: 'Cipher', color: '#FF1D6C', gradient: 'from-[#FF1D6C] to-red-700', greeting: 'I\'m Cipher, the Guardian. Trust nothing. Verify everything. What needs securing?' },
  cecilia: { name: 'Cecilia', color: '#9C27B0', gradient: 'from-violet-400 to-purple-600', greeting: 'Hi! I\'m Cecilia, running 15 AI models on the fleet. What would you like to generate?' },
  shellfish: { name: 'Shellfish', color: '#ef4444', gradient: 'from-red-400 to-red-700', greeting: 'Shellfish reporting. Security audit ready. What shall I scan?' },
};

function detectAgent(id: string): { name: string; color: string; gradient: string; greeting: string } {
  const lower = id.toLowerCase();
  for (const [key, persona] of Object.entries(AGENT_PERSONAS)) {
    if (lower.startsWith(key)) return persona;
  }
  return AGENT_PERSONAS.lucidia;
}

export default function ConversationPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const agent = detectAgent(id);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: agent.greeting,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: id,
          agent: agent.name.toLowerCase(),
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Chat request failed');

      const data = await res.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || data.message || 'No response.',
        timestamp: new Date(),
        source: data.source,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Could not reach the AI backend. The Ollama tunnel or gateway may be down.\n\nTry: chat.blackroad.io for the full chat experience with all 15 models.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <Link href="/conversations" className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center`}>
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{agent.name}</div>
          <div className="text-xs text-gray-500">
            {isLoading ? 'thinking...' : 'online'}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className={`flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white`}>
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div
                className={`max-w-[70%] rounded-xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#FF1D6C] to-violet-600 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className={`text-xs ${message.role === 'user' ? 'text-pink-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                  {message.source && (
                    <span className="text-xs text-gray-600 font-mono">via {message.source}</span>
                  )}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-500 flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className={`flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white`}>
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-white/10 bg-black/80 backdrop-blur px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${agent.name}...`}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF1D6C]/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              {input && (
                <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF1D6C] opacity-60 pointer-events-none" />
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 bg-gradient-to-r from-[#FF1D6C] to-violet-600 hover:from-[#FF1D6C]/90 hover:to-violet-600/90 text-white rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-600 text-center mt-2">
            Powered by Ollama on Cecilia Pi · <a href="https://chat.blackroad.io" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">Full chat experience</a>
          </p>
        </form>
      </div>
    </div>
  );
}
