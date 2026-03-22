// BlackRoad Voice Chat Widget — voice-first, beautiful, sovereign
// Embed on any domain: <script src="https://cdn.blackroad.io/widget.js"></script>

(function() {
  const CHAT_API = 'https://roundtrip.blackroad.io';
  const ROOM = 'general';

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500&display=swap');

    #br-voice-widget { position:fixed; bottom:24px; right:24px; z-index:99999; font-family:'Inter',sans-serif; }

    /* Floating button */
    #br-voice-btn {
      width:64px; height:64px; border-radius:50%; border:none; cursor:pointer;
      background:linear-gradient(135deg,#FF1D6C,#9C27B0);
      box-shadow:0 4px 24px rgba(255,29,108,0.4);
      display:flex; align-items:center; justify-content:center;
      transition:transform 0.2s, box-shadow 0.2s;
    }
    #br-voice-btn:hover { transform:scale(1.1); box-shadow:0 6px 32px rgba(255,29,108,0.5); }
    #br-voice-btn svg { width:28px; height:28px; fill:#fff; }
    #br-voice-btn.listening { animation:br-pulse 1.5s ease-in-out infinite; }
    @keyframes br-pulse {
      0%,100% { box-shadow:0 4px 24px rgba(255,29,108,0.4); }
      50% { box-shadow:0 4px 40px rgba(255,29,108,0.7), 0 0 60px rgba(156,39,176,0.3); }
    }

    /* Chat panel */
    #br-voice-panel {
      display:none; position:absolute; bottom:76px; right:0;
      width:380px; max-height:560px; background:#0a0a0a;
      border:1px solid #1a1a1a; border-radius:16px;
      box-shadow:0 12px 48px rgba(0,0,0,0.6);
      flex-direction:column; overflow:hidden;
    }
    #br-voice-panel.open { display:flex; }

    /* Header */
    .br-panel-header {
      padding:16px 20px; border-bottom:1px solid #1a1a1a;
      display:flex; align-items:center; justify-content:space-between;
    }
    .br-panel-title { font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:700; color:#fff; }
    .br-panel-sub { font-size:11px; color:#666; margin-top:2px; }
    .br-close-btn { background:none; border:none; color:#555; font-size:20px; cursor:pointer; padding:4px 8px; }
    .br-close-btn:hover { color:#fff; }

    /* Messages */
    .br-messages {
      flex:1; overflow-y:auto; padding:16px 20px; min-height:300px; max-height:380px;
      scrollbar-width:thin; scrollbar-color:#222 transparent;
    }
    .br-msg { margin-bottom:16px; animation:br-fadein 0.3s ease; }
    @keyframes br-fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    .br-msg-user { text-align:right; }
    .br-msg-bubble {
      display:inline-block; max-width:85%; padding:10px 14px;
      border-radius:12px; font-size:14px; line-height:1.5; word-wrap:break-word;
    }
    .br-msg-user .br-msg-bubble { background:linear-gradient(135deg,#FF1D6C,#9C27B0); color:#fff; border-bottom-right-radius:4px; }
    .br-msg-agent .br-msg-bubble { background:#151515; color:#e0e0e0; border:1px solid #222; border-bottom-left-radius:4px; }
    .br-msg-agent-name { font-size:11px; color:#FF1D6C; font-weight:600; margin-bottom:4px; font-family:'Space Grotesk',sans-serif; }
    .br-msg-time { font-size:10px; color:#444; margin-top:4px; }

    /* Agent selector */
    .br-agent-bar { padding:8px 16px; border-bottom:1px solid #1a1a1a; display:flex; align-items:center; gap:8px; overflow-x:auto; }
    .br-agent-bar::-webkit-scrollbar { height:0; }
    .br-agent-chip {
      flex-shrink:0; padding:4px 10px; border-radius:16px; font-size:11px; cursor:pointer;
      background:#111; border:1px solid #222; color:#888; transition:all 0.2s; white-space:nowrap;
    }
    .br-agent-chip:hover { border-color:#444; color:#fff; }
    .br-agent-chip.active { background:linear-gradient(135deg,#FF1D6C,#9C27B0); border-color:transparent; color:#fff; font-weight:600; }

    /* Typing indicator */
    .br-typing { padding:8px 20px; font-size:12px; color:#555; font-style:italic; display:none; }
    .br-typing.active { display:block; }

    /* Voice indicator */
    .br-voice-indicator {
      padding:12px 20px; border-top:1px solid #1a1a1a; text-align:center;
      font-size:12px; color:#FF1D6C; display:none; align-items:center; justify-content:center; gap:8px;
    }
    .br-voice-indicator.active { display:flex; }
    .br-voice-dots span {
      display:inline-block; width:6px; height:6px; background:#FF1D6C; border-radius:50%;
      animation:br-dot 1.4s ease-in-out infinite;
    }
    .br-voice-dots span:nth-child(2) { animation-delay:0.2s; }
    .br-voice-dots span:nth-child(3) { animation-delay:0.4s; }
    @keyframes br-dot { 0%,80%,100% { transform:scale(0.6); opacity:0.4; } 40% { transform:scale(1); opacity:1; } }

    /* Input */
    .br-input-area {
      padding:12px 16px; border-top:1px solid #1a1a1a;
      display:flex; align-items:center; gap:8px;
    }
    .br-input {
      flex:1; background:#111; border:1px solid #222; border-radius:8px;
      padding:10px 14px; color:#fff; font-size:14px; font-family:'Inter',sans-serif;
      outline:none; resize:none;
    }
    .br-input:focus { border-color:#FF1D6C; }
    .br-input::placeholder { color:#444; }
    .br-mic-btn {
      width:40px; height:40px; border-radius:50%; border:none; cursor:pointer;
      background:#111; display:flex; align-items:center; justify-content:center;
      transition:background 0.2s;
    }
    .br-mic-btn:hover { background:#1a1a1a; }
    .br-mic-btn.recording { background:#FF1D6C; }
    .br-mic-btn svg { width:18px; height:18px; fill:#888; }
    .br-mic-btn.recording svg { fill:#fff; }
    .br-send-btn {
      width:40px; height:40px; border-radius:50%; border:none; cursor:pointer;
      background:linear-gradient(135deg,#FF1D6C,#9C27B0);
      display:flex; align-items:center; justify-content:center;
    }
    .br-send-btn svg { width:18px; height:18px; fill:#fff; }

    @media (max-width:480px) {
      #br-voice-panel { width:calc(100vw - 32px); right:-8px; bottom:72px; max-height:70vh; }
    }
  `;
  document.head.appendChild(style);

  // Build widget HTML
  const widget = document.createElement('div');
  widget.id = 'br-voice-widget';
  widget.innerHTML = `
    <div id="br-voice-panel">
      <div class="br-panel-header">
        <div>
          <div class="br-panel-title">BlackRoad</div>
          <div class="br-panel-sub">Voice-first sovereign chat</div>
        </div>
        <button class="br-close-btn" onclick="document.getElementById('br-voice-panel').classList.remove('open')">&times;</button>
      </div>
      <div class="br-agent-bar" id="br-agent-bar">
        <span class="br-agent-chip active" data-agent="road">🛣️ Road</span>
        <span class="br-agent-chip" data-agent="alice">🌐 Alice</span>
        <span class="br-agent-chip" data-agent="cecilia">🧠 Cecilia</span>
        <span class="br-agent-chip" data-agent="octavia">🐙 Octavia</span>
        <span class="br-agent-chip" data-agent="lucidia">💡 Lucidia</span>
        <span class="br-agent-chip" data-agent="cipher">🔐 Cipher</span>
        <span class="br-agent-chip" data-agent="calliope">✨ Calliope</span>
        <span class="br-agent-chip" data-agent="athena">🦉 Athena</span>
        <span class="br-agent-chip" data-agent="silas">📊 Silas</span>
        <span class="br-agent-chip" data-agent="mercury">☿️ Mercury</span>
      </div>
      <div class="br-typing" id="br-typing">Road is thinking...</div>
      <div class="br-messages" id="br-messages">
        <div class="br-msg br-msg-agent">
          <div class="br-msg-agent-name">Road</div>
          <div class="br-msg-bubble">Hey. Tap the mic and talk, or type. I'm BlackRoad OS — sovereign AI on your hardware. How can I help?</div>
        </div>
      </div>
      <div class="br-voice-indicator" id="br-voice-ind">
        <div class="br-voice-dots"><span></span><span></span><span></span></div>
        <span id="br-voice-status">Listening...</span>
      </div>
      <div class="br-input-area">
        <input class="br-input" id="br-chat-input" placeholder="Type or tap mic..." autocomplete="off">
        <button class="br-mic-btn" id="br-mic-btn" title="Hold to talk">
          <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        </button>
        <button class="br-send-btn" id="br-send-btn" title="Send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
    <button id="br-voice-btn" title="Talk to BlackRoad">
      <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V21c0 .55.45 1 1 1s1-.45 1-1v-3.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>
    </button>
  `;
  document.body.appendChild(widget);

  // State
  let recognition = null;
  let synth = window.speechSynthesis;
  let isListening = false;
  let speaking = false;

  // Elements
  const btn = document.getElementById('br-voice-btn');
  const panel = document.getElementById('br-voice-panel');
  const messages = document.getElementById('br-messages');
  const input = document.getElementById('br-chat-input');
  const micBtn = document.getElementById('br-mic-btn');
  const sendBtn = document.getElementById('br-send-btn');
  const voiceInd = document.getElementById('br-voice-ind');
  const voiceStatus = document.getElementById('br-voice-status');

  // Toggle panel
  btn.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    if (isOpen && !isListening) startListening();
  });

  // Speech Recognition
  function initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const r = new SpeechRecognition();
    r.continuous = false;
    r.interimResults = true;
    r.lang = 'en-US';
    r.onstart = () => {
      isListening = true;
      btn.classList.add('listening');
      micBtn.classList.add('recording');
      voiceInd.classList.add('active');
      voiceStatus.textContent = 'Listening...';
    };
    r.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      input.value = transcript;
      if (e.results[0].isFinal) {
        sendMessage(transcript);
        input.value = '';
      }
    };
    r.onend = () => {
      isListening = false;
      btn.classList.remove('listening');
      micBtn.classList.remove('recording');
      voiceInd.classList.remove('active');
    };
    r.onerror = (e) => {
      if (e.error !== 'no-speech') console.log('Speech error:', e.error);
      isListening = false;
      btn.classList.remove('listening');
      micBtn.classList.remove('recording');
      voiceInd.classList.remove('active');
    };
    return r;
  }

  function startListening() {
    if (!recognition) recognition = initRecognition();
    if (!recognition) return;
    if (isListening) { recognition.stop(); return; }
    try { recognition.start(); } catch(e) {}
  }

  // Mic button
  micBtn.addEventListener('click', startListening);

  // Text-to-Speech
  function speak(text) {
    if (!synth || speaking) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1;
    // Try to find a good voice
    const voices = synth.getVoices();
    const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Moira'));
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => { speaking = true; };
    utterance.onend = () => { speaking = false; if (panel.classList.contains('open')) setTimeout(startListening, 500); };
    synth.speak(utterance);
  }

  // Send message
  async function sendMessage(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    voiceInd.classList.add('active');
    voiceStatus.textContent = 'Thinking...';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(CHAT_API + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: ROOM, message: text, author: 'visitor' }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        let reply = data.reply || data.response || data.content || '';
        // If agent timed out or empty, use local knowledge
        if (!reply || reply.includes('timeout') || reply.includes('error') || reply.length < 5) {
          reply = getLocalResponse(text);
        }
        const agentName = data.name || data.agent || 'Road';
        addMessage(reply, 'agent', agentName);
        speak(reply);
      } else {
        const fallback = getLocalResponse(text);
        addMessage(fallback, 'agent', 'Road');
        speak(fallback);
      }
    } catch(e) {
      const fallback = getLocalResponse(text);
      addMessage(fallback, 'agent', 'Road');
      speak(fallback);
    }

    voiceInd.classList.remove('active');
  }

  // Local knowledge base — comprehensive, fast, no API needed
  function getLocalResponse(text) {
    const t = text.toLowerCase();
    if (/^(hi|hey|hello|sup|yo)\b/.test(t)) return 'Hey. Welcome to BlackRoad. I am Road, the platform voice. Tap the mic and ask me anything — pricing, products, infrastructure, whatever you need.';
    if (t.includes('price') || t.includes('cost') || t.includes('plan') || t.includes('how much') || t.includes('subscription') || t.includes('sign up') || t.includes('get started') || t.includes('buy')) return 'Four plans. Operator is free — one agent, basic search. Rider is twenty nine dollars a month — five agents, AI search, priority support, RoadCode access. Paver is ninety nine a month — unlimited agents, fleet tools, analytics. Sovereign is two ninety nine — white label, on-prem, SLA. Go to pay dot blackroad dot io to start.';
    if (t.includes('alexa') || t.includes('founder') || t.includes('ceo') || t.includes('who made') || t.includes('who built')) return 'Alexa Louise Amundson. Founder, CEO, sole stockholder of BlackRoad OS Incorporated. Delaware C Corp, November seventeenth, twenty twenty five. She also created the Amundson Framework in mathematics — constant A sub G, approximately one point two four four.';
    if ((t.includes('what') && t.includes('blackroad')) || t.includes('tell me about') || t.includes('explain')) return 'BlackRoad OS is a complete sovereign technology stack. Five Raspberry Pis, two cloud servers, fifty two tera ops of AI, two thirty nine repos on RoadCode, twenty domains. We replaced every cloud service with hardware we own. No AWS, no Azure, no Google. Your code, your data, your rules. Pave Tomorrow.';
    if (t.includes('roadcode') || t.includes('source code') || t.includes('github') || t.includes('repos')) return 'RoadCode at roadcode dot blackroad dot io. Two thirty nine repos, eight orgs. Replaces GitHub — self hosted, no Microsoft, no Copilot training on your code, unlimited private repos, unlimited CI. Zero dollars.';
    if (t.includes('product') || t.includes('what do you') || t.includes('offer') || t.includes('service')) return 'RoadPay for billing. RoadSearch for AI search. RoundTrip for agent chat — that is what powers this voice. Prism Console for ops. RoadCode for source hosting. Squad Webhook for AI on GitHub. BlackRoad Auth for identity. All sovereign.';
    if (t.includes('infrastructure') || t.includes('hardware') || t.includes('raspberry') || t.includes('server') || t.includes('fleet')) return 'Five Pis: Alice does DNS and gateway. Cecilia runs heavy AI with twenty six tera ops. Octavia hosts RoadCode and fifteen workers. Lucidia serves three hundred thirty four sites. Aria handles dashboards. Gematria is TLS edge with one fifty one domains. WireGuard mesh connects everything.';
    if (t.includes(' ai ') || t.includes('artificial') || t.includes('model') || t.includes('inference') || t.includes('agent')) return 'Fifty two tera ops of local AI. Two Hailo eights plus Ollama on four nodes. Sixteen models, thirty five agents. Zero API keys, zero rate limits, no data leaves the network. Code review, search, chat, reasoning — all sovereign.';
    if (t.includes('road fleet') || t.includes('self hosted') || t.includes('sovereign')) return 'Road Fleet — self hosted replacements. RoadCode for GitHub. OneWay for Cloudflare. TollBooth for Tailscale. Passenger for OpenAI. PitStop for DNS. Curb for S three. RearView for vector search. CarPool for messaging. All on our hardware.';
    if (t.includes('open source') || t.includes('license') || t.includes('fork') || t.includes('copy')) return 'Not open source. Open access — publicly visible for transparency and collaboration. Proprietary software, BlackRoad OS Incorporated. You can read and learn from the code, but cannot fork, resell, or build commercial products from it.';
    if (t.includes('roundtrip') || t.includes('chat') || t.includes('this conversation')) return 'RoundTrip at roundtrip dot blackroad dot io. Thirty five agents, real time chat, local Ollama inference. This voice widget connects to RoundTrip. No Slack, no Discord — sovereign.';
    if (t.includes('math') || t.includes('amundson') || t.includes('framework') || t.includes('constant') || t.includes('tetration')) return 'The Amundson Framework. G of n equals n to the n plus one over n plus one to the n. Constant A sub G approximately one point two four four. Verified five hundred thirty six tests on four Pis. Original math by Alexa Amundson. Connected to tetration and asymptotic analysis.';
    if (t.includes('contact') || t.includes('email') || t.includes('support')) return 'Email amundsonalexa at gmail dot com. Main site blackroad dot io. Agent chat at roundtrip dot blackroad dot io.';
    if (t.includes('domain') || t.includes('website') || t.includes('url')) return 'Twenty domains. blackroad dot io main. blackroadai dot com for AI. lucidia dot earth for reasoning. roadcode dot blackroad dot io for source code. pay dot blackroad dot io for billing. roundtrip for chat.';
    if (t.includes('thank') || t.includes('cool') || t.includes('awesome')) return 'You got it. Anything else, just tap the mic. Pave Tomorrow.';
    if (t.includes('help') || t.includes('can you')) return 'I can help with pricing, products, infrastructure, the Amundson Framework, RoadCode, agents, or anything BlackRoad. Just ask. Or go to pay dot blackroad dot io to sign up.';
    return 'I am Road, voice of BlackRoad OS. Sovereign infrastructure — AI, source code, billing, chat, all on our hardware. Ask about pricing, products, or how it works. Or visit pay dot blackroad dot io.';
  }

  // Add message to chat
  function addMessage(text, type, agentName) {
    const div = document.createElement('div');
    div.className = `br-msg br-msg-${type}`;
    const time = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    div.innerHTML = type === 'agent'
      ? `<div class="br-msg-agent-name">${agentName || 'Road'}</div><div class="br-msg-bubble">${text}</div><div class="br-msg-time">${time}</div>`
      : `<div class="br-msg-bubble">${text}</div><div class="br-msg-time">${time}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  // Send on enter
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
      input.value = '';
    }
  });

  // Send button
  sendBtn.addEventListener('click', () => {
    sendMessage(input.value);
    input.value = '';
  });

  // Load voices
  if (synth) synth.onvoiceschanged = () => {};
})();
