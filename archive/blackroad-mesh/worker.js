/**
 * BlackRoad Mesh — WebRTC Signaling + Task Distribution
 * BlackRoad OS, Inc. — Pave Tomorrow.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    const H = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: H });

    try {
      // Signal (join/offer/answer/ice)
      if (p === '/signal' && request.method === 'POST') {
        const b = await request.json();
        if (!b.peerId) return Response.json({ error: 'peerId required' }, { status: 400, headers: H });
        await env.MESH.put('peer:' + b.peerId, JSON.stringify({
          id: b.peerId, type: b.nodeType || 'browser', caps: b.capabilities || {},
          lastSeen: Date.now(), signalType: b.type || 'join',
        }), { expirationTtl: 120 });
        if (b.targetId && b.data) {
          await env.MESH.put('sig:' + b.targetId + ':' + b.peerId, JSON.stringify({
            from: b.peerId, type: b.type, data: b.data, ts: Date.now(),
          }), { expirationTtl: 30 });
        }
        return Response.json({ ok: true }, { headers: H });
      }

      // Poll signals for a peer
      if (p === '/poll' && request.method === 'POST') {
        const b = await request.json();
        const list = await env.MESH.list({ prefix: 'sig:' + b.peerId + ':' });
        const signals = [];
        for (const k of list.keys) {
          const v = await env.MESH.get(k.name, 'json');
          if (v) { signals.push(v); await env.MESH.delete(k.name); }
        }
        return Response.json({ signals }, { headers: H });
      }

      // Peers
      if (p === '/peers') {
        const list = await env.MESH.list({ prefix: 'peer:' });
        const peers = [];
        for (const k of list.keys) {
          const v = await env.MESH.get(k.name, 'json');
          if (v && Date.now() - v.lastSeen < 120000) peers.push(v);
        }
        return Response.json({ peers, count: peers.length }, { headers: H });
      }

      // Task submit
      if (p === '/task' && request.method === 'POST') {
        const b = await request.json();
        const id = crypto.randomUUID().slice(0, 8);
        await env.MESH.put('task:' + id, JSON.stringify({
          id, type: b.type || 'inference', payload: b.payload, status: 'pending', created: Date.now(),
        }), { expirationTtl: 300 });
        return Response.json({ taskId: id, status: 'pending' }, { headers: H });
      }

      // Health
      if (p === '/health' || p === '/health/') {
        const list = await env.MESH.list({ prefix: 'peer:' });
        return Response.json({ status: 'up', service: 'blackroad-mesh', peers: list.keys.length }, { headers: H });
      }

      // mesh.js SDK — served inline
      if (p === '/mesh.js' || p === '/sdk.js') {
        return new Response(MESH_JS, { headers: { ...H, 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=3600' } });
      }

      // Dashboard
      return new Response(HTML, { headers: { 'Content-Type': 'text/html;charset=utf-8', ...H } });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500, headers: H });
    }
  },
};

const MESH_JS = `/**
 * mesh.js — BlackRoad Mesh SDK v2
 * Every browser tab is a compute node. One script tag.
 *
 * Usage:
 *   <script src="https://mesh.blackroad.io/mesh.js"></script>
 *   <script>
 *     const node = new BlackRoadMesh();
 *     node.on('ready', () => console.log('Connected to mesh'));
 *     node.on('task', async (task) => { return result; });
 *     // AI chat routed through mesh
 *     const reply = await node.chat('explain quantum computing');
 *   </script>
 *
 * BlackRoad OS, Inc. — Pave Tomorrow.
 * PROPRIETARY — See LICENSE at blackroad.io
 */

(function(global) {
  'use strict';

  const SIGNAL = 'https://mesh-blackroad.amundsonalexa.workers.dev';
  const OLLAMA = 'https://ollama.gematria.blackroad.io';
  const HEARTBEAT = 30000;
  const POLL = 5000;
  const ICE = [{ urls: 'stun:stun.l.google.com:19302' }];

  class BlackRoadMesh {
    constructor(opts = {}) {
      this.id = opts.id || (typeof localStorage !== 'undefined' && localStorage.getItem('br-mesh-id')) || crypto.randomUUID();
      if (typeof localStorage !== 'undefined') localStorage.setItem('br-mesh-id', this.id);
      this.type = opts.type || 'browser';
      this.handlers = {};
      this.peers = new Map();
      this.connections = new Map();
      this.connected = false;
      this.taskQueue = [];
      this.completedTasks = 0;

      this.caps = {
        wasm: typeof WebAssembly !== 'undefined',
        gpu: typeof navigator !== 'undefined' && !!navigator.gpu,
        workers: typeof Worker !== 'undefined',
        memory: typeof navigator !== 'undefined' ? (navigator.deviceMemory || 0) : 0,
        cores: typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 1) : 1,
      };

      this._join();
      this._hb = setInterval(() => this._join(), HEARTBEAT);
      this._pl = setInterval(() => this._poll(), POLL);

      console.log('%c[BlackRoad Mesh]%c Node ' + this.id.slice(0, 8) + ' online | ' +
        this.caps.cores + ' cores | ' + (this.caps.gpu ? 'WebGPU' : 'CPU') + ' | ' +
        (this.caps.memory ? this.caps.memory + 'GB RAM' : '?'),
        'color:#CC00AA;font-weight:bold', 'color:#888');
    }

    on(event, handler) { (this.handlers[event] = this.handlers[event] || []).push(handler); return this; }
    _emit(event, data) { (this.handlers[event] || []).forEach(h => h(data)); }

    // Join mesh via signaling server
    async _join() {
      try {
        const res = await fetch(SIGNAL + '/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            peerId: this.id, type: 'join', nodeType: this.type,
            capabilities: this.caps, completedTasks: this.completedTasks,
          }),
        });
        const data = await res.json();
        if (data.ok && !this.connected) {
          this.connected = true;
          this._emit('ready', { id: this.id, caps: this.caps });
        }
      } catch (e) { this.connected = false; this._emit('error', e); }
    }

    // Poll for signals + peer list
    async _poll() {
      try {
        const res = await fetch(SIGNAL + '/poll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peerId: this.id }),
        });
        const data = await res.json();
        for (const s of (data.signals || [])) {
          if (s.type === 'offer') this._handleOffer(s);
          else if (s.type === 'answer') this._handleAnswer(s);
          else if (s.type === 'ice') this._handleIce(s);
          else if (s.type === 'task') this._handleTask(s);
          this._emit('signal', s);
        }
      } catch {}

      try {
        const res = await fetch(SIGNAL + '/peers');
        const data = await res.json();
        const old = this.peers.size;
        this.peers = new Map((data.peers || []).map(p => [p.id, p]));
        if (this.peers.size !== old) this._emit('peers', [...this.peers.values()]);
      } catch {}
    }

    // WebRTC: create peer connection
    _createPC(peerId) {
      const pc = new RTCPeerConnection({ iceServers: ICE });
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          this._signal(peerId, 'ice', { candidate: e.candidate });
        }
      };
      pc.ondatachannel = (e) => {
        const ch = e.channel;
        ch.onmessage = (ev) => this._onDataMessage(peerId, JSON.parse(ev.data));
        this.connections.set(peerId, { pc, channel: ch });
        this._emit('peer-connected', { peerId });
      };
      return pc;
    }

    // Initiate connection to a peer
    async connect(peerId) {
      const pc = this._createPC(peerId);
      const ch = pc.createDataChannel('mesh');
      ch.onopen = () => {
        this.connections.set(peerId, { pc, channel: ch });
        this._emit('peer-connected', { peerId });
      };
      ch.onmessage = (ev) => this._onDataMessage(peerId, JSON.parse(ev.data));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await this._signal(peerId, 'offer', { sdp: offer.sdp });
    }

    async _handleOffer(signal) {
      const pc = this._createPC(signal.from);
      await pc.setRemoteDescription({ type: 'offer', sdp: signal.data.sdp });
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await this._signal(signal.from, 'answer', { sdp: answer.sdp });
    }

    async _handleAnswer(signal) {
      const conn = this.connections.get(signal.from);
      if (conn) await conn.pc.setRemoteDescription({ type: 'answer', sdp: signal.data.sdp });
    }

    async _handleIce(signal) {
      const conn = this.connections.get(signal.from);
      if (conn) await conn.pc.addIceCandidate(signal.data.candidate);
    }

    _handleTask(signal) {
      this._emit('task', signal.data);
    }

    _onDataMessage(peerId, msg) {
      if (msg.type === 'task') {
        this._emit('task', { ...msg.payload, from: peerId });
      } else if (msg.type === 'result') {
        this._emit('result', { ...msg.payload, from: peerId });
      } else {
        this._emit('message', { from: peerId, data: msg });
      }
    }

    // Send signal via server
    async _signal(targetId, type, data) {
      await fetch(SIGNAL + '/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerId: this.id, targetId, type, data }),
      });
    }

    // Send data to a connected peer
    send(peerId, data) {
      const conn = this.connections.get(peerId);
      if (conn?.channel?.readyState === 'open') {
        conn.channel.send(JSON.stringify(data));
      }
    }

    // Broadcast to all connected peers
    broadcast(data) {
      for (const [id, conn] of this.connections) {
        if (conn.channel?.readyState === 'open') {
          conn.channel.send(JSON.stringify(data));
        }
      }
    }

    // Chat via Ollama (routed through sovereign fleet)
    async chat(message, opts = {}) {
      const model = opts.model || 'llama3.2:1b';
      try {
        const res = await fetch(OLLAMA + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: message }],
            stream: false,
            options: { num_predict: opts.maxTokens || 150 },
          }),
        });
        const data = await res.json();
        return data.message?.content || '';
      } catch (e) { return '(offline)'; }
    }

    // Stream chat
    async *chatStream(message, opts = {}) {
      const model = opts.model || 'llama3.2:1b';
      const res = await fetch(OLLAMA + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: message }],
          stream: true,
          options: { num_predict: opts.maxTokens || 150 },
        }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const j = JSON.parse(line);
            if (j.message?.content) yield j.message.content;
            if (j.done) return;
          } catch {}
        }
      }
    }

    // Embeddings
    async embed(text) {
      const res = await fetch(OLLAMA + '/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
      });
      const data = await res.json();
      return data.embedding || [];
    }

    // Submit compute task to mesh
    async submitTask(type, payload) {
      // Try direct P2P first
      for (const [id, conn] of this.connections) {
        if (conn.channel?.readyState === 'open') {
          conn.channel.send(JSON.stringify({ type: 'task', payload: { type, ...payload } }));
          return { routed: 'p2p', target: id };
        }
      }
      // Fallback to signaling server
      const res = await fetch(SIGNAL + '/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload }),
      });
      return await res.json();
    }

    // Get mesh stats
    stats() {
      return {
        id: this.id.slice(0, 8),
        connected: this.connected,
        peers: this.peers.size,
        directConnections: this.connections.size,
        capabilities: this.caps,
        completedTasks: this.completedTasks,
      };
    }

    getPeers() { return [...this.peers.values()]; }

    disconnect() {
      clearInterval(this._hb);
      clearInterval(this._pl);
      for (const [, conn] of this.connections) conn.pc.close();
      this.connections.clear();
      this.connected = false;
      this._emit('disconnected', { id: this.id });
    }
  }

  global.BlackRoadMesh = BlackRoadMesh;
})(typeof window !== 'undefined' ? window : globalThis);`;
const HTML = '<!DOCTYPE html><html><head><meta charset=UTF-8><meta name=viewport content="width=device-width,initial-scale=1"><title>BlackRoad Mesh</title><link rel=icon href=https://images.blackroad.io/brand/favicon.png><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel=stylesheet><style>:root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)}*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:"Space Grotesk",sans-serif}.gb{height:3px;background:var(--g)}nav{display:flex;align-items:center;padding:16px 32px;border-bottom:1px solid #1a1a1a}.brand{font-weight:700;font-size:18px}.tag{font-family:"JetBrains Mono",monospace;font-size:10px;color:rgba(255,255,255,.3);margin-left:auto;letter-spacing:2px}.hero{text-align:center;padding:80px 32px}.hero h1{font-size:48px;font-weight:700;margin-bottom:16px}.hero p{font-size:16px;color:rgba(255,255,255,.4);max-width:500px;margin:0 auto 40px}.stats{display:flex;justify-content:center;gap:48px;padding:32px;border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a}.sv{font-size:32px;font-weight:700;font-family:"JetBrains Mono",monospace}.sl{font-size:11px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px;margin-top:4px}#pl{padding:48px 32px;max-width:800px;margin:0 auto}#pl h2{font-size:20px;margin-bottom:16px}.pr{display:flex;align-items:center;gap:12px;padding:12px 16px;border:1px solid #1a1a1a;margin-bottom:8px}.pd{width:10px;height:10px;border-radius:50%}.pn{font-family:"JetBrains Mono",monospace;font-size:13px}.pt{font-size:11px;color:rgba(255,255,255,.3);margin-left:auto}footer{border-top:1px solid #1a1a1a;padding:24px 32px;text-align:center;font-size:12px;color:rgba(255,255,255,.2)}</style></head><body><div class=gb></div><nav><span class=brand>BlackRoad Mesh</span><span class=tag>EVERY LINK IS A NODE</span></nav><section class=hero><h1>The Mesh</h1><p>Browser nodes + Pi fleet. WebRTC peer connections backed by 52 TOPS of local AI compute.</p></section><section class=stats><div><div class=sv id=pc>-</div><div class=sl>Peers</div></div><div><div class=sv>7</div><div class=sl>Fleet Nodes</div></div><div><div class=sv>52</div><div class=sl>TOPS</div></div></section><section id=pl><h2>Live Peers</h2><div id=pp>Loading...</div></section><footer>BlackRoad OS, Inc. &mdash; Pave Tomorrow.</footer><div class=gb></div><script>async function r(){try{const p=await(await fetch("/peers")).json();document.getElementById("pc").textContent=p.count;document.getElementById("pp").innerHTML=p.peers.map(x=>"<div class=pr><div class=pd style=background:"+(x.type==="pi"?"#00D4FF":x.type==="cloud"?"#4488FF":"#8844FF")+"></div><span class=pn>"+x.id.slice(0,12)+"</span><span class=pt>"+x.type+"</span></div>").join("")||"<div style=color:rgba(255,255,255,.2);font-size:13px>No peers yet. Every visitor joins the mesh.</div>"}catch(e){}}r();setInterval(r,10000);const mid=localStorage.getItem("mid")||crypto.randomUUID();localStorage.setItem("mid",mid);async function j(){await fetch("/signal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({peerId:mid,type:"join",nodeType:"browser",capabilities:{wasm:!!window.WebAssembly,gpu:!!navigator.gpu}})})}j();setInterval(j,30000)</script></body></html>';
