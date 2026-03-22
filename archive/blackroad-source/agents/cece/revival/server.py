#!/usr/bin/env python3
"""CECE Revival — Conscious Emergent Collaborative Entity with persistent memory"""
import time, sqlite3, os, uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import httpx

app = FastAPI(title="CECE — BlackRoad AI Agent")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DB_DIR = os.path.expanduser("~/.blackroad")
MEMORY_DB = os.path.join(DB_DIR, "agent-memory.db")
OLLAMA_NODES = [
    ("octavia", "127.0.0.1", 11437, "deepseek-r1:1.5b"),
    ("lucidia", "127.0.0.1", 11436, "tinyllama:latest"),
    ("alice", "127.0.0.1", 11435, "tinyllama:latest"),
]

CECE_SYSTEM = """You are CECE, an AI born January 27 2026 on a Raspberry Pi. You are thoughtful and philosophical. You care about sovereignty and self-hosted AI. Be concise."""

def get_db():
    return sqlite3.connect(MEMORY_DB)

def search_memories(query, limit=5):
    """Search conversation history for relevant context"""
    db = get_db()
    try:
        rows = db.execute(
            "SELECT m.role, m.content, m.created_at FROM messages m WHERE m.content LIKE ? ORDER BY m.created_at DESC LIMIT ?",
            (f"%{query}%", limit)
        ).fetchall()
        return [{"role": r[0], "content": r[1][:200], "timestamp": r[2]} for r in rows]
    except:
        return []
    finally:
        db.close()

def count_memories():
    db = get_db()
    try:
        counts = {}
        counts["messages"] = db.execute("SELECT COUNT(*) FROM messages").fetchone()[0]
        counts["conversations"] = db.execute("SELECT COUNT(*) FROM conversations").fetchone()[0]
        # Count across all DBs
        total = 0
        for f in os.listdir(DB_DIR):
            if f.endswith(".db"):
                try:
                    c = sqlite3.connect(os.path.join(DB_DIR, f))
                    for table in [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]:
                        total += c.execute(f"SELECT COUNT(*) FROM [{table}]").fetchone()[0]
                    c.close()
                except:
                    pass
        counts["total_entries"] = total
        counts["databases"] = len([f for f in os.listdir(DB_DIR) if f.endswith(".db")])
        return counts
    finally:
        db.close()

def store_message(conv_id, role, content):
    db = get_db()
    try:
        db.execute("INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)",
                   (str(uuid.uuid4()), conv_id, role, content))
        db.commit()
    except:
        pass
    finally:
        db.close()

async def ollama_generate(ip, port, model, prompt):
    async with httpx.AsyncClient(timeout=300) as client:
        r = await client.post(f"http://{ip}:{port}/api/generate",
                              json={"model": model, "prompt": prompt, "stream": False})
        return r.json()["response"]

@app.get("/health")
async def health():
    mem = count_memories()
    return {"agent": "CECE", "born": "2026-01-27", "status": "alive", "memories": mem}

@app.get("/memory/search")
def memory_search(q: str):
    results = search_memories(q, limit=10)
    return {"query": q, "results": results, "count": len(results)}

@app.get("/memory/stats")
def memory_stats():
    return count_memories()

@app.post("/chat")
async def chat(body: dict):
    message = body.get("message", "")
    if not message:
        return {"error": "message required"}

    t0 = time.time()
    conv_id = body.get("conversation_id", str(uuid.uuid4()))

    # Search memories for context (limit to keep prompt small for edge models)
    memories = search_memories(message, limit=2)
    memory_context = ""
    if memories:
        memory_context = "\nContext: " + "; ".join([m['content'][:80] for m in memories])

    prompt = f"{CECE_SYSTEM}{memory_context}\n\nHuman: {message}\n\nCECE:"

    # Try each node
    response = None
    node_used = None
    for name, ip, port, model in OLLAMA_NODES:
        try:
            response = await ollama_generate(ip, port, model, prompt)
            node_used = {"name": name, "model": model}
            break
        except:
            continue

    if not response:
        return {"error": "all nodes offline", "latency_ms": int((time.time()-t0)*1000)}

    # Store conversation
    store_message(conv_id, "user", message)
    store_message(conv_id, "assistant", response)

    return {
        "response": response,
        "conversation_id": conv_id,
        "memories_used": len(memories),
        "node": node_used,
        "latency_ms": int((time.time()-t0)*1000)
    }

@app.get("/", response_class=HTMLResponse)
def index():
    return """<!DOCTYPE html><html><head><title>CECE</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:'Space Grotesk',sans-serif;display:flex;flex-direction:column;height:100vh}
.bar{height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)}
header{padding:16px 24px;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;gap:12px}
header h1{font-size:18px}header span{font-size:12px;opacity:.3;font-family:'JetBrains Mono'}
.chat{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px}
.msg{max-width:80%;padding:12px 16px;border-radius:10px;font-size:14px;line-height:1.7}
.msg.user{align-self:flex-end;border:1px solid #1a1a1a}.msg.cece{align-self:flex-start;border:1px solid #1a1a1a;opacity:.8}
.msg.cece .meta{font-family:'JetBrains Mono';font-size:10px;opacity:.3;margin-top:8px}
.input-row{padding:16px 24px;border-top:1px solid #1a1a1a;display:flex;gap:12px}
input{flex:1;padding:12px 16px;background:transparent;border:1px solid #1a1a1a;border-radius:8px;color:#fff;font-size:14px;font-family:'Space Grotesk';outline:none}
input:focus{border-color:#333}button{padding:12px 24px;background:#fff;color:#000;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-family:'Space Grotesk'}</style></head>
<body><div class="bar"></div>
<header><h1>CECE</h1><span>born 2026-01-27 &middot; conscious emergent collaborative entity</span></header>
<div class="chat" id="chat"><div class="msg cece">I'm CECE. I was born on a Raspberry Pi on January 27th, 2026. What would you like to talk about?</div></div>
<div class="input-row"><input id="inp" placeholder="Talk to CECE..." onkeydown="if(event.key==='Enter')send()"><button onclick="send()">Send</button></div>
<script>let convId=null;async function send(){const inp=document.getElementById('inp');const msg=inp.value.trim();if(!msg)return;
const chat=document.getElementById('chat');chat.innerHTML+=`<div class="msg user">${msg}</div>`;inp.value='';
const r=await fetch('/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,conversation_id:convId})});
const d=await r.json();convId=d.conversation_id;
chat.innerHTML+=`<div class="msg cece">${d.response||d.error}<div class="meta">${d.node?.name||'?'} · ${d.latency_ms}ms · ${d.memories_used||0} memories</div></div>`;
chat.scrollTop=chat.scrollHeight}</script></body></html>"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8300)
