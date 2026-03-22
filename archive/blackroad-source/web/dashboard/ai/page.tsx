'use client'

import { useState } from 'react'

const agents = [
  { name: 'Lucidia', emoji: '🖤', role: 'Systems Lead', device: 'lucidia', model: 'tinyllama', team: 'Infrastructure' },
  { name: 'Marcus', emoji: '👔', role: 'Product Manager', device: 'lucidia', model: 'llama3.2:3b', team: 'Infrastructure' },
  { name: 'Viktor', emoji: '💪', role: 'Senior Developer', device: 'lucidia', model: 'codellama:7b', team: 'Infrastructure' },
  { name: 'Sophia', emoji: '📊', role: 'Data Analyst', device: 'lucidia', model: 'gemma2:2b', team: 'Infrastructure' },
  { name: 'CECE', emoji: '💜', role: 'Creative Lead', device: 'cecilia', model: 'cece', team: 'Creative' },
  { name: 'Luna', emoji: '🌙', role: 'UX Designer', device: 'cecilia', model: 'llama3.2:3b', team: 'Creative' },
  { name: 'Dante', emoji: '⚡', role: 'Backend Engineer', device: 'cecilia', model: 'codellama:7b', team: 'Creative' },
  { name: 'Aria-Prime', emoji: '🎯', role: 'Code Specialist', device: 'aria', model: 'qwen2.5-coder:3b', team: 'Coding' },
  { name: 'Aria-Tiny', emoji: '⚡', role: 'Quick Responder', device: 'aria', model: 'tinyllama', team: 'Coding' },
]

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0])
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{agent: string, content: string}>>([])

  const handleSend = async () => {
    if (!message.trim()) return
    
    // Add user message
    const newMessages = [...messages, { agent: 'You', content: message }]
    setMessages(newMessages)
    
    // Simulate agent response (in production, this would call your backend API)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, device: selectedAgent.device, model: selectedAgent.model }),
      })
      const data = await res.json()
      setMessages([...newMessages, { agent: selectedAgent.name, content: data.response }])
    } catch {
      setMessages([...newMessages, { agent: selectedAgent.name, content: "Connection failed — node may be offline" }])
    }    
    setMessage('')
  }

  const teamAgents = {
    Infrastructure: agents.filter(a => a.team === 'Infrastructure'),
    Creative: agents.filter(a => a.team === 'Creative'),
    Coding: agents.filter(a => a.team === 'Coding'),
  }

  return (
    <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}>
      <div style={{textAlign: 'center', marginBottom: '3rem'}}>
        <h1 style={{fontSize: '3rem', marginBottom: '1rem',  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
          BlackRoad AI Network
        </h1>
        <p style={{color: '#888', fontSize: '1.2rem'}}>9 AI Agents • 3 Devices • Fully Operational</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem'}}>
        <div style={{background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem', textAlign: 'center'}}>
          <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea'}}>9</div>
          <div style={{color: '#888', fontSize: '0.9rem'}}>AGENTS</div>
        </div>
        <div style={{background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem', textAlign: 'center'}}>
          <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea'}}>3</div>
          <div style={{color: '#888', fontSize: '0.9rem'}}>DEVICES</div>
        </div>
        <div style={{background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem', textAlign: 'center'}}>
          <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#00ff00'}}>100%</div>
          <div style={{color: '#888', fontSize: '0.9rem'}}>OPERATIONAL</div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem'}}>
        {Object.entries(teamAgents).map(([teamName, teamMembers]) => (
          <div key={teamName} style={{background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '2rem'}}>
            <h2 style={{fontSize: '1.5rem', color: '#667eea', marginBottom: '1.5rem'}}>
              {teamName === 'Infrastructure' && '🏢'} {teamName === 'Creative' && '🎨'} {teamName === 'Coding' && '💻'} {teamName} Team
            </h2>
            {teamMembers.map(agent => (
              <div 
                key={agent.name}
                onClick={() => setSelectedAgent(agent)}
                style={{
                  background: selectedAgent.name === agent.name ? '#667eea20' : '#0a0a0a',
                  border: selectedAgent.name === agent.name ? '1px solid #667eea' : '1px solid #222',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <span style={{fontSize: '1.5rem'}}>{agent.emoji}</span>
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: 'bold', marginBottom: '0.25rem'}}>{agent.name}</div>
                    <div style={{color: '#888', fontSize: '0.9rem'}}>{agent.role}</div>
                    <div style={{color: '#666', fontSize: '0.75rem', marginTop: '0.25rem'}}>{agent.model}</div>
                  </div>
                  <div style={{width: '8px', height: '8px', borderRadius: '50%', background: '#00ff00'}}></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '2rem'}}>
        <h2 style={{fontSize: '1.5rem', marginBottom: '1.5rem', color: '#667eea'}}>
          Chat with {selectedAgent.emoji} {selectedAgent.name}
        </h2>
        
        <div style={{marginBottom: '1.5rem', padding: '1rem', background: '#0a0a0a', borderRadius: '8px'}}>
          <div style={{color: '#888', marginBottom: '0.5rem'}}>Currently selected:</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <span style={{fontSize: '1.5rem'}}>{selectedAgent.emoji}</span>
            <span style={{fontWeight: 'bold'}}>{selectedAgent.name}</span>
            <span style={{color: '#666'}}>•</span>
            <span style={{color: '#888'}}>{selectedAgent.role}</span>
            <span style={{color: '#666'}}>•</span>
            <span style={{color: '#666', fontSize: '0.9rem'}}>{selectedAgent.device}</span>
          </div>
        </div>

        <div style={{maxHeight: '300px', overflowY: 'auto', padding: '1rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', marginBottom: '1.5rem'}}>
          {messages.length === 0 ? (
            <div style={{color: '#666', textAlign: 'center', padding: '2rem'}}>
              Send a message to start chatting with {selectedAgent.name}!
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: '#1a1a1a'}}>
                <div style={{color: '#667eea', fontWeight: 'bold', marginBottom: '0.5rem'}}>{msg.agent}</div>
                <div style={{color: '#ddd'}}>{msg.content}</div>
              </div>
            ))
          )}
        </div>

        <div style={{display: 'flex', gap: '1rem'}}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            style={{
              flex: 1,
              background: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '1rem',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          <button
            onClick={handleSend}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '1rem 2rem',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>

      <div style={{textAlign: 'center', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #333', color: '#666'}}>
        <p>BlackRoad AI Network • Powered by Raspberry Pi Mesh</p>
        <p style={{fontSize: '0.9rem', marginTop: '0.5rem'}}>Lucidia • Cecilia • Aria</p>
      </div>
    </div>
  )
}
