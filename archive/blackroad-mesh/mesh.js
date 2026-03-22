/**
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
})(typeof window !== 'undefined' ? window : globalThis);
