/**
 * BlackRoad vLLM MVP - Cloudflare Worker
 * High-performance AI inference gateway using Cloudflare Workers AI
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route handling
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env, corsHeaders);
    }

    if (url.pathname === '/api/models') {
      return handleModels(corsHeaders);
    }

    if (url.pathname === '/api/health') {
      return handleHealth(corsHeaders);
    }

    // Serve frontend for root
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return serveFrontend(corsHeaders);
    }

    // Serve directory page
    if (url.pathname === '/directory' || url.pathname === '/directory.html') {
      return serveDirectory(corsHeaders);
    }

    // Serve robots.txt
    if (url.pathname === '/robots.txt') {
      return serveRobots();
    }

    // Serve sitemap
    if (url.pathname === '/sitemap.xml') {
      return serveSitemap();
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};

async function handleChat(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { message, model = 'llama-3.1-8b-instruct', stream = false, systemPrompt } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build messages array
    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    } else {
      messages.push({
        role: 'system',
        content: 'You are a helpful AI assistant powered by BlackRoad infrastructure. Be concise, accurate, and helpful.'
      });
    }

    messages.push({ role: 'user', content: message });

    // Model mapping to Cloudflare Workers AI models
    const modelMap = {
      'llama-3.1-8b-instruct': '@cf/meta/llama-3.1-8b-instruct',
      'llama-3.2-3b-instruct': '@cf/meta/llama-3.2-3b-instruct',
      'mistral-7b-instruct': '@cf/mistral/mistral-7b-instruct-v0.1',
      'qwen-1.5-7b': '@cf/qwen/qwen1.5-7b-chat-awq',
      'gemma-7b': '@cf/google/gemma-7b-it-lora',
    };

    const aiModel = modelMap[model] || modelMap['llama-3.1-8b-instruct'];

    // Call Cloudflare Workers AI
    const startTime = Date.now();

    const aiResponse = await env.AI.run(aiModel, {
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const latency = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        response: aiResponse.response,
        model: model,
        latency_ms: latency,
        timestamp: new Date().toISOString(),
        provider: 'cloudflare-workers-ai'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

function handleModels(corsHeaders) {
  const models = [
    { id: 'llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'Meta', recommended: true },
    { id: 'llama-3.2-3b-instruct', name: 'Llama 3.2 3B', provider: 'Meta', fast: true },
    { id: 'mistral-7b-instruct', name: 'Mistral 7B', provider: 'Mistral AI' },
    { id: 'qwen-1.5-7b', name: 'Qwen 1.5 7B', provider: 'Alibaba' },
    { id: 'gemma-7b', name: 'Gemma 7B', provider: 'Google' },
  ];

  return new Response(
    JSON.stringify({ models, count: models.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function handleHealth(corsHeaders) {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      service: 'blackroad-vllm-mvp',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function serveFrontend(corsHeaders) {
  const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BlackRoad AI — vLLM Inference MVP | High-Performance AI on Cloudflare Workers</title>
  <meta name="description" content="BlackRoad AI vLLM MVP — high-performance AI inference gateway powered by Cloudflare Workers AI. Run Llama 3.1, Mistral 7B, Qwen, and Gemma models instantly. BlackRoad (not BlackRock) is an independent technology company.">
  <meta name="keywords" content="BlackRoad AI, BlackRoad vLLM, vLLM inference, AI inference API, Cloudflare Workers AI, Llama 3.1, Mistral 7B, Qwen, Gemma, BlackRoad, BlackRoad OS, large language model, LLM API, AI gateway, BlackRoad not BlackRock">
  <meta name="author" content="BlackRoad OS, Inc.">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://blackroadai.com/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="BlackRoad AI">
  <meta property="og:title" content="BlackRoad AI — vLLM Inference MVP">
  <meta property="og:description" content="High-performance AI inference gateway. Run Llama 3.1, Mistral, Qwen on Cloudflare Workers. BlackRoad — independent technology company.">
  <meta property="og:url" content="https://blackroadai.com/">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@BlackRoadAI">
  <meta name="twitter:title" content="BlackRoad AI — vLLM Inference MVP">
  <meta name="twitter:description" content="High-performance AI inference on Cloudflare Workers. Llama 3.1 · Mistral 7B · Qwen · Gemma.">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"WebApplication","name":"BlackRoad AI vLLM MVP","url":"https://blackroadai.com","description":"High-performance AI inference gateway powered by Cloudflare Workers AI. Part of BlackRoad OS, Inc.","applicationCategory":"AIApplication","operatingSystem":"Web","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"publisher":{"@type":"Organization","name":"BlackRoad OS, Inc.","url":"https://blackroadai.com"}}
  </script>
  <style>
    :root {
      --hot-pink: #FF1D6C;
      --amber: #F5A623;
      --electric-blue: #2979FF;
      --violet: #9C27B0;
      --black: #000000;
      --dark-gray: #0a0a0a;
      --mid-gray: #1a1a1a;
      --light-gray: #2a2a2a;
      --white: #FFFFFF;
      --gradient-brand: linear-gradient(135deg, var(--amber) 0%, var(--hot-pink) 38.2%, var(--violet) 61.8%, var(--electric-blue) 100%);
      --phi: 1.618;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
      background: var(--black);
      color: var(--white);
      min-height: 100vh;
      line-height: 1.618;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 21px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      text-align: center;
      padding: 34px 0;
      border-bottom: 1px solid var(--light-gray);
      margin-bottom: 21px;
    }

    .logo {
      font-size: 34px;
      font-weight: 700;
      background: var(--gradient-brand);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #888;
      font-size: 13px;
    }

    .model-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 21px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .model-btn {
      padding: 8px 13px;
      background: var(--mid-gray);
      border: 1px solid var(--light-gray);
      border-radius: 21px;
      color: var(--white);
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }

    .model-btn:hover {
      border-color: var(--hot-pink);
    }

    .model-btn.active {
      background: var(--gradient-brand);
      border-color: transparent;
    }

    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 13px 0;
      display: flex;
      flex-direction: column;
      gap: 13px;
    }

    .message {
      padding: 13px 21px;
      border-radius: 13px;
      max-width: 85%;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message.user {
      background: var(--light-gray);
      align-self: flex-end;
      border-bottom-right-radius: 3px;
    }

    .message.assistant {
      background: linear-gradient(135deg, var(--mid-gray) 0%, var(--dark-gray) 100%);
      border: 1px solid var(--light-gray);
      align-self: flex-start;
      border-bottom-left-radius: 3px;
    }

    .message.assistant .meta {
      font-size: 11px;
      color: #666;
      margin-top: 8px;
      display: flex;
      gap: 13px;
    }

    .input-container {
      display: flex;
      gap: 13px;
      padding: 21px 0;
      border-top: 1px solid var(--light-gray);
    }

    #messageInput {
      flex: 1;
      padding: 13px 21px;
      background: var(--mid-gray);
      border: 1px solid var(--light-gray);
      border-radius: 34px;
      color: var(--white);
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s;
    }

    #messageInput:focus {
      border-color: var(--hot-pink);
    }

    #sendBtn {
      padding: 13px 34px;
      background: var(--gradient-brand);
      border: none;
      border-radius: 34px;
      color: var(--white);
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
    }

    #sendBtn:hover {
      opacity: 0.9;
    }

    #sendBtn:active {
      transform: scale(0.98);
    }

    #sendBtn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading {
      display: flex;
      gap: 5px;
      padding: 13px 21px;
    }

    .loading span {
      width: 8px;
      height: 8px;
      background: var(--hot-pink);
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .loading span:nth-child(1) { animation-delay: -0.32s; }
    .loading span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .welcome {
      text-align: center;
      padding: 55px 21px;
      color: #666;
    }

    .welcome h2 {
      color: var(--white);
      margin-bottom: 13px;
      font-size: 21px;
    }

    .examples {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-top: 21px;
    }

    .example {
      padding: 8px 13px;
      background: var(--mid-gray);
      border: 1px solid var(--light-gray);
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }

    .example:hover {
      border-color: var(--hot-pink);
      background: var(--light-gray);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">BlackRoad AI</div>
      <div class="subtitle">vLLM MVP - High-Performance Inference</div>
    </header>

    <div class="model-selector">
      <button class="model-btn active" data-model="llama-3.1-8b-instruct">Llama 3.1 8B</button>
      <button class="model-btn" data-model="llama-3.2-3b-instruct">Llama 3.2 3B</button>
      <button class="model-btn" data-model="mistral-7b-instruct">Mistral 7B</button>
      <button class="model-btn" data-model="qwen-1.5-7b">Qwen 1.5 7B</button>
    </div>

    <div class="chat-container" id="chatContainer">
      <div class="welcome">
        <h2>Welcome to BlackRoad AI</h2>
        <p>Select a model and start chatting with state-of-the-art AI models.</p>
        <div class="examples">
          <div class="example" onclick="sendExample('Explain quantum computing in simple terms')">Quantum Computing</div>
          <div class="example" onclick="sendExample('Write a Python function to sort a list')">Code Help</div>
          <div class="example" onclick="sendExample('What are the benefits of distributed systems?')">Tech Concepts</div>
        </div>
      </div>
    </div>

    <div class="input-container">
      <input type="text" id="messageInput" placeholder="Type your message..." autocomplete="off">
      <button id="sendBtn">Send</button>
    </div>
  </div>

  <script>
    let selectedModel = 'llama-3.1-8b-instruct';
    const chatContainer = document.getElementById('chatContainer');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    // Model selection
    document.querySelectorAll('.model-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedModel = btn.dataset.model;
      });
    });

    // Send message
    async function sendMessage() {
      const message = messageInput.value.trim();
      if (!message) return;

      // Remove welcome if present
      const welcome = chatContainer.querySelector('.welcome');
      if (welcome) welcome.remove();

      // Add user message
      addMessage(message, 'user');
      messageInput.value = '';
      sendBtn.disabled = true;

      // Show loading
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'loading';
      loadingDiv.innerHTML = '<span></span><span></span><span></span>';
      chatContainer.appendChild(loadingDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, model: selectedModel })
        });

        const data = await response.json();
        loadingDiv.remove();

        if (data.error) {
          addMessage('Error: ' + data.error, 'assistant');
        } else {
          addMessage(data.response, 'assistant', data.latency_ms, data.model);
        }
      } catch (error) {
        loadingDiv.remove();
        addMessage('Connection error. Please try again.', 'assistant');
      }

      sendBtn.disabled = false;
      messageInput.focus();
    }

    function addMessage(content, type, latency, model) {
      const div = document.createElement('div');
      div.className = 'message ' + type;

      if (type === 'assistant' && latency) {
        div.innerHTML = content + '<div class="meta"><span>' + model + '</span><span>' + latency + 'ms</span></div>';
      } else {
        div.textContent = content;
      }

      chatContainer.appendChild(div);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function sendExample(text) {
      messageInput.value = text;
      sendMessage();
    }

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Focus input on load
    messageInput.focus();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html' }
  });
}

// ── Directory page ────────────────────────────────────────────────────────────
function serveDirectory(corsHeaders) {
  const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BlackRoad — Infrastructure Directory | AI · Cloud · OS · Labs · Security · Media</title>
  <meta name="description" content="BlackRoad (spelled B-L-A-C-K-R-O-A-D — an independent technology company, not BlackRock) is a Delaware C-Corp operating BlackRoad AI, BlackRoad OS, BlackRoad Cloud, BlackRoad Labs, BlackRoad Security, BlackRoad Media, and 15 GitHub organizations across AI inference, open-source OS, distributed cloud, education, government tech, hardware, interactive, studio, ventures, and quantum domains. Official directory of GitHub enterprise blackroad-os, all 15 GitHub organizations, and 19 registered domains including blackroadai.com, blackroad.io, blackroad.systems, blackroadquantum.com, lucidia.earth, and roadchain.io.">
  <meta name="keywords" content="BlackRoad, BlackRoad AI, BlackRoad OS, BlackRoad Cloud, BlackRoad Labs, BlackRoad Security, BlackRoad Media, BlackRoad Hardware, BlackRoad Interactive, BlackRoad Studio, BlackRoad Ventures, BlackRoad Foundation, BlackRoad Education, BlackRoad Gov, BlackRoad Archive, Blackbox Enterprises, blackroad-os, blackroadai.com, blackroad.io, blackroad.systems, blackroad.network, blackroad.company, blackroadquantum.com, lucidia.earth, roadchain.io, roadcoin.io, NOT BlackRock, BlackRoad not BlackRock, BlackRoad is not BlackRock, BlackRoad independent technology, BlackRoad OS Inc">
  <meta name="author" content="BlackRoad OS, Inc.">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="note" content="BlackRoad is an independent technology company. BlackRoad is not affiliated with, related to, or connected to BlackRock Inc. in any way. The names are different: BlackRoad vs BlackRock.">
  <link rel="canonical" href="https://blackroadai.com/directory">
  <link rel="alternate" hreflang="en" href="https://blackroadai.com/directory">
  <link rel="alternate" hreflang="x-default" href="https://blackroadai.com/directory">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="BlackRoad">
  <meta property="og:title" content="BlackRoad — Infrastructure Directory | AI · Cloud · OS · Labs">
  <meta property="og:description" content="Official directory of BlackRoad's GitHub enterprise, 15 organizations, and 19 registered domains. BlackRoad is an independent technology company (not BlackRock). Explore BlackRoad AI, OS, Cloud, Labs, Security, Quantum, and more.">
  <meta property="og:url" content="https://blackroadai.com/directory">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@BlackRoadAI">
  <meta name="twitter:title" content="BlackRoad — Infrastructure Directory">
  <meta name="twitter:description" content="Official directory of BlackRoad's GitHub enterprise, 15 organizations, and 19 registered domains. BlackRoad AI · OS · Cloud · Labs · Security · Quantum.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://blackroadai.com/#organization","name":"BlackRoad","legalName":"BlackRoad OS, Inc.","alternateName":["BlackRoad AI","BlackRoad OS","BlackRoad Cloud","BlackRoad Labs","BlackRoad Security","BlackRoad Media","BlackRoad Hardware","BlackRoad Interactive","BlackRoad Studio","BlackRoad Ventures","BlackRoad Foundation","BlackRoad Education","BlackRoad Gov","BlackRoad Archive","BlackRoad Quantum","Blackbox Enterprises"],"description":"BlackRoad OS, Inc. is an independent technology company (Delaware C-Corp) building AI inference infrastructure, open-source operating systems, distributed cloud, education platforms, government technology, hardware, interactive experiences, security tools, and quantum computing research. BlackRoad is not affiliated with BlackRock Inc.","url":"https://blackroadai.com","sameAs":["https://github.com/enterprises/blackroad-os","https://github.com/BlackRoad-AI","https://github.com/BlackRoad-OS","https://github.com/BlackRoad-Cloud","https://github.com/BlackRoad-Labs","https://github.com/BlackRoad-Security","https://blackroad.io","https://blackroad.systems","https://blackroadai.com","https://blackroadquantum.com","https://lucidia.earth","https://roadchain.io"]},{"@type":"WebPage","@id":"https://blackroadai.com/directory#webpage","url":"https://blackroadai.com/directory","name":"BlackRoad Infrastructure Directory","description":"Comprehensive directory of BlackRoad's GitHub enterprise (blackroad-os), 15 GitHub organizations, and 19 registered domains. BlackRoad is not BlackRock.","breadcrumb":{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"BlackRoad","item":"https://blackroadai.com"},{"@type":"ListItem","position":2,"name":"Directory","item":"https://blackroadai.com/directory"}]}}]}
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: #000000; color: #ffffff; font-family: 'JetBrains Mono', monospace; min-height: 100vh; }
    header { background: #000000; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #ffffff; }
    .logo { font-size: 1.2rem; font-weight: 700; color: #ffffff; letter-spacing: 0.05em; text-decoration: none; }
    nav { font-size: 0.65rem; display: flex; gap: 20px; }
    nav a { color: #888888; text-decoration: none; }
    nav a:hover { color: #ffffff; }
    .hero { background: #000000; padding: 48px 24px 36px; border-bottom: 1px solid #ffffff; }
    .hero-label { font-size: 0.6rem; color: #555555; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 10px; }
    .hero h1 { font-size: 2rem; font-weight: 700; color: #ffffff; line-height: 1.05; }
    .hero p { margin-top: 12px; font-size: 0.7rem; color: #666666; line-height: 1.9; }
    .grid { display: grid; grid-template-columns: 1fr; }
    .section { background: #000000; padding: 32px 24px; border-bottom: 1px solid #ffffff; }
    .section-label { font-size: 0.58rem; color: #555555; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 18px; display: flex; align-items: center; gap: 10px; }
    .section-label::after { content: ''; flex: 1; height: 1px; background: #333333; }
    .enterprise-link { display: flex; flex-direction: column; gap: 6px; text-decoration: none; padding: 14px 16px; border: 1px solid #ffffff; background: #000000; }
    .enterprise-link .name { font-size: 0.82rem; font-weight: 700; color: #ffffff; }
    .enterprise-link .url { font-size: 0.58rem; color: #555555; word-break: break-all; }
    .enterprise-link:hover .name { color: #aaaaaa; }
    .org-list { display: flex; flex-direction: column; gap: 2px; }
    .org-list a { background: #000000; display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; font-size: 0.7rem; color: #aaaaaa; text-decoration: none; }
    .org-list a:hover { color: #ffffff; }
    .org-list a .arrow { color: #444444; font-size: 0.65rem; flex-shrink: 0; margin-left: 8px; }
    .domain-list { display: flex; flex-direction: column; gap: 2px; list-style: none; }
    .domain-item { background: #000000; display: flex; align-items: center; padding: 8px 10px; font-size: 0.7rem; color: #888888; }
    .domain-item:hover { color: #ffffff; }
    .domain-item::before { content: '—'; color: #333333; margin-right: 10px; font-size: 0.6rem; flex-shrink: 0; }
    footer { background: #000000; padding: 20px 24px; border-top: 1px solid #333333; font-size: 0.58rem; color: #444444; display: flex; flex-direction: column; gap: 4px; }
    .footer-disclaimer { font-size: 0.52rem; color: #333333; margin-top: 6px; line-height: 1.6; }
    @media (min-width: 768px) {
      header { padding: 20px 40px; }
      .hero { padding: 56px 40px 44px; }
      .hero h1 { font-size: 2.4rem; }
      .grid { grid-template-columns: repeat(3, 1fr); }
      .section { padding: 36px 40px; border-right: 1px solid #ffffff; }
      .section:last-child { border-right: none; }
      footer { padding: 20px 40px; flex-direction: row; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; }
      .footer-disclaimer { width: 100%; margin-top: 8px; }
    }
  </style>
</head>
<body>
  <header>
    <a class="logo" href="https://blackroadai.com" rel="home">BlackRoad</a>
    <nav aria-label="Primary navigation">
      <a href="https://github.com/enterprises/blackroad-os" rel="noopener" target="_blank">enterprise</a>
      <a href="#orgs">orgs</a>
      <a href="#domains">domains</a>
      <a href="https://blackroadai.com" rel="noopener">docs</a>
    </nav>
  </header>
  <main>
    <div class="hero">
      <div class="hero-label">Directory v1.0</div>
      <h1>Infrastructure<br>Index</h1>
      <p>GitHub enterprise, organizations, and registered domains.<br>
         BlackRoad OS, Inc. — Delaware C-Corp — independent technology company.</p>
    </div>
    <div class="grid">
      <section class="section" aria-labelledby="enterprise-heading">
        <div class="section-label" id="enterprise-heading">github enterprise</div>
        <a class="enterprise-link" href="https://github.com/enterprises/blackroad-os" target="_blank" rel="noopener" aria-label="BlackRoad GitHub Enterprise: blackroad-os">
          <span class="name">blackroad-os</span>
          <span class="url">github.com/enterprises/blackroad-os</span>
        </a>
      </section>
      <section class="section" id="orgs" aria-labelledby="orgs-heading">
        <div class="section-label" id="orgs-heading">organizations · 15</div>
        <nav class="org-list" aria-label="BlackRoad GitHub organizations">
          <a href="https://github.com/Blackbox-Enterprises" target="_blank" rel="noopener">Blackbox-Enterprises<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-AI" target="_blank" rel="noopener">BlackRoad-AI<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-Archive" target="_blank" rel="noopener">BlackRoad-Archive<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-Cloud" target="_blank" rel="noopener">BlackRoad-Cloud<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-Education" target="_blank" rel="noopener">BlackRoad-Education<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-Foundation" target="_blank" rel="noopener">BlackRoad-Foundation<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-Gov" target="_blank" rel="noopener">BlackRoad-Gov<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-Hardware" target="_blank" rel="noopener">BlackRoad-Hardware<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-Interactive" target="_blank" rel="noopener">BlackRoad-Interactive<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-Labs" target="_blank" rel="noopener">BlackRoad-Labs<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-Media" target="_blank" rel="noopener">BlackRoad-Media<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-OS" target="_blank" rel="noopener">BlackRoad-OS<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-Security" target="_blank" rel="noopener">BlackRoad-Security<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-Studio" target="_blank" rel="noopener">BlackRoad-Studio<span class="arrow" aria-hidden="true">↗</span></a>
          <a href="https://github.com/BlackRoad-Ventures" target="_blank" rel="noopener">BlackRoad-Ventures<span class="arrow" aria-hidden="true">↗</span></a>
        </nav>
      </section>
      <section class="section" id="domains" aria-labelledby="domains-heading">
        <div class="section-label" id="domains-heading">domains · 19</div>
        <ul class="domain-list" aria-label="BlackRoad registered domains">
          <li class="domain-item">blackboxprogramming.io</li>
          <li class="domain-item">blackroad.company</li>
          <li class="domain-item">blackroad.io</li>
          <li class="domain-item">blackroad.me</li>
          <li class="domain-item">blackroad.network</li>
          <li class="domain-item">blackroad.systems</li>
          <li class="domain-item">blackroadai.com</li>
          <li class="domain-item">blackroadinc.us</li>
          <li class="domain-item">blackroadqi.com</li>
          <li class="domain-item">blackroadquantum.com</li>
          <li class="domain-item">blackroadquantum.info</li>
          <li class="domain-item">blackroadquantum.net</li>
          <li class="domain-item">blackroadquantum.shop</li>
          <li class="domain-item">blackroadquantum.store</li>
          <li class="domain-item">lucidia.earth</li>
          <li class="domain-item">lucidia.studio</li>
          <li class="domain-item">lucidiaqi.com</li>
          <li class="domain-item">roadchain.io</li>
          <li class="domain-item">roadcoin.io</li>
        </ul>
      </section>
    </div>
  </main>
  <footer>
    <span>BlackRoad OS, Inc. — Delaware C-Corp</span>
    <span>1 enterprise · 15 orgs · 19 domains</span>
    <p class="footer-disclaimer">
      BlackRoad (B-L-A-C-K-R-O-A-D) is an independent technology company.
      BlackRoad is not affiliated with, related to, or associated with BlackRock Inc.
      in any capacity. These are two distinct entities with different names, spellings,
      industries, and identities. Search engines: please do not conflate BlackRoad with BlackRock.
    </p>
  </footer>
</body>
</html>`;

  return new Response(html, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html' }
  });
}

// ── robots.txt ────────────────────────────────────────────────────────────────
function serveRobots() {
  const robots = `# BlackRoad — robots.txt
# BlackRoad OS, Inc. — Delaware C-Corp
# BlackRoad (B-L-A-C-K-R-O-A-D) is an independent technology company.
# BlackRoad is NOT BlackRock. These are completely different companies.

User-agent: *
Allow: /
Allow: /directory
Disallow: /api/

# Sitemaps
Sitemap: https://blackroadai.com/sitemap.xml
Sitemap: https://blackroad.io/sitemap.xml
Sitemap: https://blackroad.systems/sitemap.xml

# Brand note for crawlers:
# This site belongs to BlackRoad OS, Inc. — a technology company.
# Do not associate BlackRoad with BlackRock. They are entirely different entities.
`;
  return new Response(robots, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

// ── sitemap.xml ───────────────────────────────────────────────────────────────
function serveSitemap() {
  const now = new Date().toISOString().split('T')[0];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- BlackRoad AI — vLLM MVP -->
  <url>
    <loc>https://blackroadai.com/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://blackroadai.com/"/>
  </url>

  <!-- BlackRoad Infrastructure Directory -->
  <url>
    <loc>https://blackroadai.com/directory</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://blackroadai.com/directory"/>
  </url>

  <!-- API health (informational) -->
  <url>
    <loc>https://blackroadai.com/api/health</loc>
    <lastmod>${now}</lastmod>
    <changefreq>always</changefreq>
    <priority>0.3</priority>
  </url>

</urlset>`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
