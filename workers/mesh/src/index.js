// BlackRoad Mesh — Distributed Browser Compute Network
// "Every link is a node. Every visitor is compute."
//
// Architecture:
//   mesh.js (browser) → WebRTC peers + WebGPU inference
//   This worker = signaling server + node registry + task router
//
// Endpoints:
//   GET  /mesh.js         — the beacon that turns browsers into nodes
//   WS   /ws/signal       — WebRTC signaling (via Durable Object)
//   POST /api/register    — node registers capacity
//   POST /api/heartbeat   — node heartbeat
//   GET  /api/peers       — get peer list for connection
//   GET  /api/stats       — mesh statistics
//   POST /api/task        — submit inference task to mesh
//   GET  /api/task/:id    — get task result
//
// (c) 2026 BlackRoad OS, Inc.

export { SignalRoom }

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Upgrade',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    try {
      // ─── Mesh JS beacon ───
      if (path === '/mesh.js' || path === '/m.js') {
        return new Response(MESH_JS, {
          headers: { ...cors, 'content-type': 'application/javascript', 'cache-control': 'public, max-age=300' }
        })
      }

      // ─── WebSocket signaling ───
      if (path === '/ws/signal') {
        const roomId = url.searchParams.get('room') || 'global'
        const id = env.SIGNAL.idFromName(roomId)
        const stub = env.SIGNAL.get(id)
        return stub.fetch(request)
      }

      // ─── Node registration ───
      if (path === '/api/register' && request.method === 'POST') {
        return await handleRegister(request, env, cors)
      }

      // ─── Heartbeat ───
      if (path === '/api/heartbeat' && request.method === 'POST') {
        return await handleHeartbeat(request, env, cors)
      }

      // ─── Get peers ───
      if (path === '/api/peers') {
        return await handleGetPeers(url, env, cors)
      }

      // ─── Submit task ───
      if (path === '/api/task' && request.method === 'POST') {
        return await handleSubmitTask(request, env, cors)
      }

      // ─── Get task result ───
      if (path.startsWith('/api/task/') && request.method === 'GET') {
        const taskId = path.split('/').pop()
        return await handleGetTask(taskId, env, cors)
      }

      // ─── Mesh stats ───
      if (path === '/api/stats') {
        return await handleMeshStats(env, cors)
      }

      // ─── OpenAI-compatible API ───
      if (path === '/v1/chat/completions' && request.method === 'POST') {
        return await handleCompletions(request, env, cors)
      }

      // ─── Dashboard ───
      return env.ASSETS.fetch(request)
    } catch (err) {
      return json({ error: err.message }, 500, cors)
    }
  }
}

// ═══════════════════════════════════════════
// NODE REGISTRATION
// ═══════════════════════════════════════════
async function handleRegister(request, env, cors) {
  const data = await request.json()
  const cf = request.cf || {}

  const node = {
    id: data.id || 'n_' + randomHex(8),
    type: data.type || 'browser',  // browser, pi, server
    // Capabilities
    webgpu: data.webgpu || false,
    wasm: data.wasm !== false,
    gpu_name: data.gpu_name || '',
    cores: data.cores || navigator?.hardwareConcurrency || 0,
    memory_gb: data.memory_gb || 0,
    tops: data.tops || 0,  // estimated TOPS
    // Models loaded
    models: data.models || [],
    // Geo
    country: cf.country || '',
    region: cf.region || '',
    city: cf.city || '',
    colo: cf.colo || '',  // Cloudflare colo (nearest edge)
    // Status
    status: 'online',
    capacity: data.capacity || 1.0,  // 0-1 available capacity
    last_seen: Date.now()
  }

  // Store in KV with 5-minute TTL (auto-expires if no heartbeat)
  await env.MESH_STATE.put(`node:${node.id}`, JSON.stringify(node), { expirationTtl: 300 })

  // Increment mesh counter
  const meshCount = parseInt(await env.MESH_STATE.get('mesh:node_count') || '0') + 1
  await env.MESH_STATE.put('mesh:node_count', String(meshCount), { expirationTtl: 600 })

  // Track in D1 for analytics
  await env.DB.prepare(`
    INSERT INTO events (type, vid, country, browser, site, ts, props)
    VALUES ('mesh_join', ?, ?, ?, 'mesh', ?, ?)
  `).bind(node.id, node.country, node.type, Date.now(), JSON.stringify({
    webgpu: node.webgpu, tops: node.tops, gpu: node.gpu_name
  })).run()

  return json({ ok: true, node_id: node.id, mesh_nodes: meshCount }, 200, cors)
}

// ═══════════════════════════════════════════
// HEARTBEAT
// ═══════════════════════════════════════════
async function handleHeartbeat(request, env, cors) {
  const data = await request.json()
  if (!data.id) return json({ error: 'node id required' }, 400, cors)

  const existing = await env.MESH_STATE.get(`node:${data.id}`, 'json')
  if (!existing) return json({ error: 'node not registered' }, 404, cors)

  existing.last_seen = Date.now()
  existing.capacity = data.capacity ?? existing.capacity
  existing.status = 'online'

  await env.MESH_STATE.put(`node:${data.id}`, JSON.stringify(existing), { expirationTtl: 300 })
  return json({ ok: true }, 200, cors)
}

// ═══════════════════════════════════════════
// PEER DISCOVERY
// ═══════════════════════════════════════════
async function handleGetPeers(url, env, cors) {
  const requesterId = url.searchParams.get('id') || ''
  const limit = parseInt(url.searchParams.get('limit') || '10')

  // List all nodes from KV (prefix scan)
  const list = await env.MESH_STATE.list({ prefix: 'node:', limit: 50 })
  const peers = []

  for (const key of list.keys) {
    const node = await env.MESH_STATE.get(key.name, 'json')
    if (node && node.id !== requesterId && node.status === 'online') {
      peers.push({
        id: node.id,
        type: node.type,
        webgpu: node.webgpu,
        tops: node.tops,
        capacity: node.capacity,
        colo: node.colo,
        country: node.country
      })
    }
    if (peers.length >= limit) break
  }

  // Sort by capacity (highest first)
  peers.sort((a, b) => b.capacity - a.capacity)

  return json({ peers, total: list.keys.length }, 200, cors)
}

// ═══════════════════════════════════════════
// TASK ROUTING
// ═══════════════════════════════════════════
async function handleSubmitTask(request, env, cors) {
  const data = await request.json()
  const taskId = 't_' + randomHex(8)

  const task = {
    id: taskId,
    type: data.type || 'inference',  // inference, embedding, classify
    model: data.model || 'default',
    prompt: data.prompt || '',
    params: data.params || {},
    status: 'queued',
    assigned_to: null,
    result: null,
    created_at: Date.now(),
    completed_at: null
  }

  // Store task in KV
  await env.MESH_STATE.put(`task:${taskId}`, JSON.stringify(task), { expirationTtl: 3600 })

  // Find best available node
  const list = await env.MESH_STATE.list({ prefix: 'node:', limit: 20 })
  let bestNode = null
  let bestCapacity = 0

  for (const key of list.keys) {
    const node = await env.MESH_STATE.get(key.name, 'json')
    if (node && node.status === 'online' && node.capacity > bestCapacity) {
      if (data.require_webgpu && !node.webgpu) continue
      bestNode = node
      bestCapacity = node.capacity
    }
  }

  if (bestNode) {
    task.status = 'assigned'
    task.assigned_to = bestNode.id
    await env.MESH_STATE.put(`task:${taskId}`, JSON.stringify(task), { expirationTtl: 3600 })
  }

  return json({
    ok: true,
    task_id: taskId,
    status: task.status,
    assigned_to: task.assigned_to,
    poll: `/api/task/${taskId}`
  }, 202, cors)
}

async function handleGetTask(taskId, env, cors) {
  const task = await env.MESH_STATE.get(`task:${taskId}`, 'json')
  if (!task) return json({ error: 'task not found' }, 404, cors)
  return json(task, 200, cors)
}

// ═══════════════════════════════════════════
// MESH STATS
// ═══════════════════════════════════════════
async function handleMeshStats(env, cors) {
  const list = await env.MESH_STATE.list({ prefix: 'node:', limit: 100 })
  let totalTOPS = 0
  let browserNodes = 0
  let piNodes = 0
  let webgpuNodes = 0
  const countries = new Set()

  for (const key of list.keys) {
    const node = await env.MESH_STATE.get(key.name, 'json')
    if (node) {
      totalTOPS += node.tops || 0
      if (node.type === 'browser') browserNodes++
      if (node.type === 'pi') piNodes++
      if (node.webgpu) webgpuNodes++
      if (node.country) countries.add(node.country)
    }
  }

  return json({
    total_nodes: list.keys.length,
    browser_nodes: browserNodes,
    pi_nodes: piNodes,
    webgpu_nodes: webgpuNodes,
    total_tops: totalTOPS,
    countries: countries.size,
    country_list: [...countries]
  }, 200, cors)
}

// ═══════════════════════════════════════════
// OPENAI-COMPATIBLE API (route inference through mesh)
// ═══════════════════════════════════════════
async function handleCompletions(request, env, cors) {
  const body = await request.json()
  const messages = body.messages || []
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n')
  const model = body.model || 'default'

  // Submit to mesh as a task
  const taskId = 't_' + randomHex(8)
  const task = {
    id: taskId,
    type: 'inference',
    model,
    prompt,
    params: { max_tokens: body.max_tokens || 256, temperature: body.temperature || 0.7 },
    status: 'queued',
    assigned_to: null,
    result: null,
    created_at: Date.now()
  }

  // Find best node
  const list = await env.MESH_STATE.list({ prefix: 'node:', limit: 20 })
  let bestNode = null, bestCap = 0

  for (const key of list.keys) {
    const node = await env.MESH_STATE.get(key.name, 'json')
    if (node && node.status === 'online' && node.capacity > bestCap) {
      bestNode = node
      bestCap = node.capacity
    }
  }

  // If no mesh nodes, fallback to Pi fleet Ollama
  if (!bestNode) {
    try {
      const ollamaRes = await fetch('https://ollama.blackroad.io/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model === 'default' ? 'llama3.2:1b' : model,
          messages: messages,
          stream: false
        })
      })
      const ollamaData = await ollamaRes.json()
      return json({
        id: 'chatcmpl-' + taskId,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: ollamaData.model || model,
        choices: [{
          index: 0,
          message: { role: 'assistant', content: ollamaData.message?.content || '' },
          finish_reason: 'stop'
        }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        source: 'pi-fleet'
      }, 200, cors)
    } catch (e) {
      return json({ error: { message: 'no mesh nodes available and Pi fleet unreachable', type: 'server_error' } }, 503, cors)
    }
  }

  // Store task for mesh processing
  task.status = 'assigned'
  task.assigned_to = bestNode.id
  await env.MESH_STATE.put(`task:${taskId}`, JSON.stringify(task), { expirationTtl: 300 })

  // Poll for result (up to 30s)
  const deadline = Date.now() + 67
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 500))
    const result = await env.MESH_STATE.get(`task:${taskId}`, 'json')
    if (result && result.status === 'completed') {
      return json({
        id: 'chatcmpl-' + taskId,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: result.model || model,
        choices: [{
          index: 0,
          message: { role: 'assistant', content: result.result || result.output || '' },
          finish_reason: 'stop'
        }],
        usage: { prompt_tokens: 0, completion_tokens: result.tokens || 0, total_tokens: result.tokens || 0 },
        source: 'mesh-' + (result.node || 'unknown')
      }, 200, cors)
    }
  }

  return json({
    id: 'chatcmpl-' + taskId,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, message: { role: 'assistant', content: '' }, finish_reason: 'timeout' }],
    source: 'timeout'
  }, 200, cors)
}

// ═══════════════════════════════════════════
// SIGNALING DURABLE OBJECT (WebRTC peer coordination)
// ═══════════════════════════════════════════
class SignalRoom {
  constructor(state) {
    this.state = state
    this.sessions = new Map() // ws -> { id, ... }
  }

  async fetch(request) {
    const url = new URL(request.url)

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 })
    }

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)

    const nodeId = url.searchParams.get('id') || 'n_' + Math.random().toString(36).slice(2, 10)

    server.accept()
    this.sessions.set(server, { id: nodeId, joinedAt: Date.now() })

    // Announce to all peers that a new node joined
    this.broadcast({ type: 'peer_joined', id: nodeId, total: this.sessions.size }, server)

    // Send the new node a list of existing peers
    const peers = []
    for (const [, info] of this.sessions) {
      if (info.id !== nodeId) peers.push(info.id)
    }
    server.send(JSON.stringify({ type: 'peers', peers, total: this.sessions.size }))

    server.addEventListener('message', (event) => {
      let msg
      try { msg = JSON.parse(event.data) } catch { return }

      // Relay signaling messages (offer, answer, ice-candidate) to target peer
      if (msg.to) {
        for (const [ws, info] of this.sessions) {
          if (info.id === msg.to) {
            ws.send(JSON.stringify({ ...msg, from: nodeId }))
            break
          }
        }
      }

      // Task result relay
      if (msg.type === 'task_result') {
        // Could store result in KV here
        this.broadcast({ type: 'task_result', task_id: msg.task_id, result: msg.result, from: nodeId })
      }
    })

    server.addEventListener('close', () => {
      this.sessions.delete(server)
      this.broadcast({ type: 'peer_left', id: nodeId, total: this.sessions.size })
    })

    server.addEventListener('error', () => {
      this.sessions.delete(server)
    })

    return new Response(null, { status: 101, webSocket: client })
  }

  broadcast(msg, exclude = null) {
    const data = JSON.stringify(msg)
    for (const [ws] of this.sessions) {
      if (ws !== exclude) {
        try { ws.send(data) } catch {}
      }
    }
  }
}

// ═══════════════════════════════════════════
// MESH.JS — Browser compute beacon
// ═══════════════════════════════════════════
const MESH_JS = `(function(){
'use strict';
var SIGNAL_URL=document.currentScript&&document.currentScript.src?document.currentScript.src.replace(/\\/m(?:esh)?\\.js$/,''):'https://mesh.blackroad.io';
var WS_URL=SIGNAL_URL.replace('https://','wss://').replace('http://','ws://');
var nodeId='n_'+Math.random().toString(36).slice(2,10);
var ws,peers={},capacity=1.0;

// ─── Detect capabilities ───
var caps={
  webgpu:!!navigator.gpu,
  wasm:typeof WebAssembly==='object',
  cores:navigator.hardwareConcurrency||1,
  memory_gb:navigator.deviceMemory||0,
  gpu_name:'',
  tops:0
};

// Estimate TOPS based on device
if(caps.webgpu) caps.tops=caps.cores*0.5; // rough: 0.5 TOPS per core with WebGPU
else if(caps.wasm) caps.tops=caps.cores*0.1; // WASM fallback

// ─── Register with mesh ───
function register(){
  fetch(SIGNAL_URL+'/api/register',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id:nodeId,...caps,type:'browser',capacity:capacity})
  }).catch(function(){});
}

// ─── Heartbeat (every 60s) ───
function heartbeat(){
  fetch(SIGNAL_URL+'/api/heartbeat',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id:nodeId,capacity:capacity})
  }).catch(function(){});
}

// ─── WebSocket signaling ───
function connectSignal(){
  try{
    ws=new WebSocket(WS_URL+'/ws/signal?room=global&id='+nodeId);
  }catch(e){return}

  ws.onopen=function(){
    console.log('[mesh] connected to signal server, node: '+nodeId);
  };

  ws.onmessage=function(e){
    var msg;
    try{msg=JSON.parse(e.data)}catch{return}

    if(msg.type==='peers'){
      // Got peer list — initiate WebRTC connections
      msg.peers.forEach(function(peerId){
        if(!peers[peerId]) createPeerConnection(peerId,true);
      });
    }
    else if(msg.type==='peer_joined'){
      console.log('[mesh] peer joined: '+msg.id+' (total: '+msg.total+')');
    }
    else if(msg.type==='peer_left'){
      if(peers[msg.id]){
        peers[msg.id].close();
        delete peers[msg.id];
      }
    }
    // WebRTC signaling relay
    else if(msg.type==='offer'){
      handleOffer(msg);
    }
    else if(msg.type==='answer'){
      handleAnswer(msg);
    }
    else if(msg.type==='ice-candidate'){
      handleICE(msg);
    }
    // Task assignment
    else if(msg.type==='task'){
      handleTask(msg);
    }
  };

  ws.onclose=function(){
    setTimeout(connectSignal,5000); // reconnect
  };
}

// ─── WebRTC peer connections ───
var rtcConfig={iceServers:[{urls:'stun:stun.l.google.com:19302'}]};

function createPeerConnection(peerId,initiator){
  var pc=new RTCPeerConnection(rtcConfig);
  peers[peerId]={pc:pc,dc:null};

  // Data channel for task relay
  if(initiator){
    var dc=pc.createDataChannel('mesh');
    setupDataChannel(dc,peerId);
    peers[peerId].dc=dc;
  }else{
    pc.ondatachannel=function(e){
      setupDataChannel(e.channel,peerId);
      peers[peerId].dc=e.channel;
    };
  }

  pc.onicecandidate=function(e){
    if(e.candidate&&ws&&ws.readyState===1){
      ws.send(JSON.stringify({type:'ice-candidate',to:peerId,candidate:e.candidate}));
    }
  };

  pc.onconnectionstatechange=function(){
    if(pc.connectionState==='disconnected'||pc.connectionState==='failed'){
      delete peers[peerId];
    }
  };

  if(initiator){
    pc.createOffer().then(function(offer){
      return pc.setLocalDescription(offer);
    }).then(function(){
      if(ws&&ws.readyState===1){
        ws.send(JSON.stringify({type:'offer',to:peerId,sdp:pc.localDescription}));
      }
    });
  }

  return pc;
}

function setupDataChannel(dc,peerId){
  dc.onopen=function(){
    console.log('[mesh] P2P connected to '+peerId);
  };
  dc.onmessage=function(e){
    var msg;
    try{msg=JSON.parse(e.data)}catch{return}
    if(msg.type==='task') handleTask(msg);
    if(msg.type==='task_result'&&window._meshCallbacks&&window._meshCallbacks[msg.task_id]){
      window._meshCallbacks[msg.task_id](msg.result);
      delete window._meshCallbacks[msg.task_id];
    }
  };
}

function handleOffer(msg){
  var pc=createPeerConnection(msg.from,false);
  pc.setRemoteDescription(new RTCSessionDescription(msg.sdp)).then(function(){
    return pc.createAnswer();
  }).then(function(answer){
    return pc.setLocalDescription(answer);
  }).then(function(){
    if(ws&&ws.readyState===1){
      ws.send(JSON.stringify({type:'answer',to:msg.from,sdp:pc.localDescription}));
    }
  });
}

function handleAnswer(msg){
  if(peers[msg.from]){
    peers[msg.from].pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
  }
}

function handleICE(msg){
  if(peers[msg.from]){
    peers[msg.from].pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
  }
}

// ─── WASM Inference Engine ───
var wasmModel=null;
var modelLoading=false;
var MODEL_URLS={
  'tinyllama':'https://huggingface.co/nicksmd/tinyllama-1.1b-q4_0-gguf/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_0.gguf',
  'phi-2':'https://huggingface.co/nicksmd/phi-2-q4_0-gguf/resolve/main/phi-2.Q4_0.gguf',
  'default':'https://huggingface.co/nicksmd/tinyllama-1.1b-q4_0-gguf/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_0.gguf'
};

async function loadWasmModel(modelName){
  if(wasmModel&&wasmModel.name===modelName) return wasmModel;
  if(modelLoading) return null;
  modelLoading=true;
  try{
    // Check for web-llm (preferred — runs real LLMs in browser via WebGPU)
    if(caps.webgpu&&window.webllm){
      var engine=await window.webllm.CreateMLCEngine(modelName||'TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC',{
        initProgressCallback:function(p){console.log('[mesh] model loading: '+Math.round(p.progress*100)+'%')}
      });
      wasmModel={name:modelName,type:'webllm',engine:engine};
      capacity=0.3; // reduce capacity while model loaded
      console.log('[mesh] WebLLM model loaded: '+modelName);
    }
    // Fallback: WASM transformer (lighter, less capable)
    else if(caps.wasm){
      // Use @xenova/transformers for WASM-only inference
      wasmModel={name:modelName||'wasm-fallback',type:'wasm-simple',engine:null};
      console.log('[mesh] WASM fallback mode (no WebGPU)');
    }
  }catch(e){
    console.error('[mesh] model load failed:',e);
    wasmModel=null;
  }
  modelLoading=false;
  return wasmModel;
}

// ─── Task execution (v2 — real inference) ───
async function handleTask(msg){
  var result;
  var startTime=Date.now();

  try{
    var model=await loadWasmModel(msg.model||'default');

    if(model&&model.type==='webllm'&&model.engine){
      // Real WebGPU inference via web-llm
      var response=await model.engine.chat.completions.create({
        messages:[{role:'user',content:msg.prompt}],
        max_tokens:parseInt(msg.params&&msg.params.max_tokens||256),
        temperature:parseFloat(msg.params&&msg.params.temperature||0.7)
      });
      result={
        task_id:msg.task_id,
        status:'completed',
        output:response.choices[0].message.content,
        node:nodeId,
        model:model.name,
        type:'webgpu',
        latency_ms:Date.now()-startTime,
        tokens:response.usage?response.usage.total_tokens:0
      };
    }else{
      // WASM fallback — simple text processing
      result={
        task_id:msg.task_id,
        status:'completed',
        output:'[node '+nodeId+'] Echo: '+msg.prompt.slice(0,200),
        node:nodeId,
        model:'echo',
        type:'wasm-echo',
        latency_ms:Date.now()-startTime,
        tokens:0
      };
    }
  }catch(e){
    result={
      task_id:msg.task_id,
      status:'error',
      error:e.message||'inference failed',
      node:nodeId,
      latency_ms:Date.now()-startTime
    };
  }

  // Return result via data channel or signaling
  var payload=JSON.stringify({type:'task_result',...result});
  if(msg.from&&peers[msg.from]&&peers[msg.from].dc&&peers[msg.from].dc.readyState==='open'){
    peers[msg.from].dc.send(payload);
  }else if(ws&&ws.readyState===1){
    ws.send(payload);
  }
}

// ─── Public API ───
window.mesh={
  id:nodeId,
  caps:caps,
  peers:function(){return Object.keys(peers)},
  stats:function(){return fetch(SIGNAL_URL+'/api/stats').then(function(r){return r.json()})},
  // Load a model for local inference
  loadModel:function(name){return loadWasmModel(name||'default')},
  // Chat — tries local first, then P2P, then server
  chat:function(prompt,opts){
    opts=opts||{};
    return new Promise(async function(resolve){
      // Try local inference first
      if(wasmModel&&wasmModel.engine&&wasmModel.type==='webllm'){
        try{
          var r=await wasmModel.engine.chat.completions.create({
            messages:[{role:'user',content:prompt}],
            max_tokens:opts.max_tokens||256,
            temperature:opts.temperature||0.7
          });
          resolve({source:'local',output:r.choices[0].message.content,model:wasmModel.name,tokens:r.usage?r.usage.total_tokens:0});
          return;
        }catch(e){}
      }
      // Fall through to P2P/server via submit
      var result=await window.mesh.submit(prompt,opts);
      resolve({source:'mesh',...result});
    });
  },
  // OpenAI-compatible completions endpoint
  completions:function(body){
    return fetch(SIGNAL_URL+'/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    }).then(function(r){return r.json()});
  },
  submit:function(prompt,opts){
    opts=opts||{};
    var taskId='t_'+Math.random().toString(36).slice(2,10);
    return new Promise(function(resolve){
      window._meshCallbacks=window._meshCallbacks||{};
      window._meshCallbacks[taskId]=resolve;
      // Try P2P first
      var sent=false;
      Object.keys(peers).forEach(function(pid){
        if(!sent&&peers[pid].dc&&peers[pid].dc.readyState==='open'){
          peers[pid].dc.send(JSON.stringify({type:'task',task_id:taskId,prompt:prompt,model:opts.model||'default'}));
          sent=true;
        }
      });
      // Fallback to server
      if(!sent){
        fetch(SIGNAL_URL+'/api/task',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({prompt:prompt,model:opts.model||'default'})
        }).then(function(r){return r.json()}).then(function(d){
          resolve({task_id:d.task_id,status:'queued_server'});
        });
      }
      // Timeout after 30s
      setTimeout(function(){
        if(window._meshCallbacks[taskId]){
          resolve({task_id:taskId,status:'timeout'});
          delete window._meshCallbacks[taskId];
        }
      },67);
    });
  }
};

// ─── Boot ───
register();
setInterval(heartbeat,60000);
connectSignal();

console.log('[mesh] BlackRoad Mesh node '+nodeId+' | WebGPU:'+caps.webgpu+' | WASM:'+caps.wasm+' | Cores:'+caps.cores+' | ~'+caps.tops+' TOPS');
})();`

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════
function randomHex(bytes) {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...headers, 'content-type': 'application/json' }
  })
}
