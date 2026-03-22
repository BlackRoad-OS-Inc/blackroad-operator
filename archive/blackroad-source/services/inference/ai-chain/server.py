#!/usr/bin/env python3
"""BlackRoad AI Chain — Multi-node distributed inference"""
import time, json, asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI(title="BlackRoad AI Chain")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

NODES = {
    "octavia": {"ip": "127.0.0.1", "port": 11437, "model": "deepseek-r1:1.5b",   "role": "reasoning"},
    "aria":    {"ip": "127.0.0.1", "port": 11438, "model": "qwen2.5-coder:3b",   "role": "code"},
    "lucidia": {"ip": "127.0.0.1", "port": 11436, "model": "tinyllama:latest",    "role": "personality"},
    "alice":   {"ip": "127.0.0.1", "port": 11435, "model": "tinyllama:latest",    "role": "fallback"},
}

async def ollama_generate(ip, port, model, prompt, timeout=60, max_tokens=150):
    url = f"http://{ip}:{port}/api/generate"
    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.post(url, json={
            "model": model, "prompt": prompt, "stream": False,
            "options": {"num_predict": max_tokens, "temperature": 0.7}
        })
        return r.json()["response"]

async def probe_node(ip, port):
    """Quick check if Ollama is reachable."""
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            r = await client.get(f"http://{ip}:{port}/api/tags")
            return r.status_code == 200
    except:
        return False

async def node_health(name, node):
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            r = await client.get(f"http://{node['ip']}:{node['port']}/api/tags")
            models = [m["name"] for m in r.json().get("models", [])]
            return {"name": name, "status": "online", "role": node["role"], "models": models}
    except:
        return {"name": name, "status": "offline", "role": node["role"], "models": []}

@app.get("/health")
async def health():
    results = await asyncio.gather(*[node_health(n, v) for n, v in NODES.items()])
    return {"nodes": results, "online": sum(1 for r in results if r["status"] == "online")}

@app.post("/chain")
async def chain(body: dict):
    prompt = body.get("prompt", "")
    mode = body.get("mode", "fast")  # "fast" = 1 node, "full" = 2-node chain
    if not prompt:
        return {"error": "prompt required"}

    t0 = time.time()
    nodes_used = []

    # Probe all nodes in parallel to find which are alive
    node_names = list(NODES.keys())
    probes = await asyncio.gather(*[probe_node(NODES[n]["ip"], NODES[n]["port"]) for n in node_names])
    alive = [n for n, ok in zip(node_names, probes) if ok]
    # Preferred order: octavia, aria, lucidia, alice — but only alive ones
    preferred = [n for n in ["octavia", "aria", "lucidia", "alice"] if n in alive]

    # Step 1: Reasoning
    reasoning = None
    for name in preferred:
        node = NODES[name]
        try:
            reasoning = await ollama_generate(node["ip"], node["port"], node["model"],
                f"Answer concisely in 1-2 sentences.\n\n{prompt}", max_tokens=100)
            nodes_used.append({"node": name, "model": node["model"], "role": "reasoning"})
            break
        except:
            continue

    if not reasoning:
        return {"error": "all reasoning nodes down", "latency_ms": int((time.time()-t0)*1000)}

    response = reasoning

    # Step 2: Refinement (only in full mode)
    if mode == "full":
        step1_node = nodes_used[0]["node"]
        for name in [n for n in preferred if n != step1_node]:
            node = NODES[name]
            try:
                response = await ollama_generate(node["ip"], node["port"], node["model"],
                    f"Improve this answer. Be concise.\n\nQ: {prompt}\nDraft: {reasoning}\n\nFinal:",
                    max_tokens=100)
                nodes_used.append({"node": name, "model": node["model"], "role": "refiner"})
                break
            except:
                continue

    return {
        "prompt": prompt,
        "mode": mode,
        "reasoning": reasoning,
        "response": response,
        "nodes_used": nodes_used,
        "latency_ms": int((time.time()-t0)*1000)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8100)
