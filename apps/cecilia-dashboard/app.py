#!/usr/bin/env python3
"""
BlackRoad Control Dashboard
Unified control plane for all BlackRoad infrastructure
Runs on cecilia, accessible from anywhere via Tailscale
"""

from flask import Flask, render_template_string, jsonify, request
import subprocess
import json
import os
from datetime import datetime

app = Flask(__name__)

# Infrastructure Configuration
NODES = {
    "pis": [
        {"name": "cecilia", "ip": "192.168.4.89", "ts": "100.72.180.98", "role": "Primary AI (Hailo-8)"},
        {"name": "lucidia", "ip": "192.168.4.81", "ts": "100.83.149.86", "role": "AI Inference"},
        {"name": "octavia", "ip": "192.168.4.38", "ts": "100.66.235.47", "role": "Multi-arm"},
        {"name": "alice", "ip": "192.168.4.49", "ts": "100.77.210.18", "role": "Worker"},
        {"name": "aria", "ip": "192.168.4.82", "ts": "100.109.14.17", "role": "Harmony"},
    ],
    "droplets": [
        {"name": "shellfish", "ip": "174.138.44.45", "ts": "100.94.33.37", "role": "Edge Compute"},
        {"name": "blackroad-infinity", "ip": "159.65.43.12", "ts": "100.108.132.8", "role": "Cloud Oracle"},
    ]
}

DASHBOARD_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>BlackRoad Control</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        :root {
            --hot-pink: #FF1D6C;
            --amber: #F5A623;
            --electric-blue: #2979FF;
            --violet: #9C27B0;
            --black: #000000;
            --dark: #0a0a0a;
            --gray: #1a1a1a;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background: var(--black);
            color: #fff;
            font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
            padding: 21px;
        }
        h1 {
            background: linear-gradient(135deg, var(--amber) 0%, var(--hot-pink) 38.2%, var(--violet) 61.8%, var(--electric-blue) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 34px;
            margin-bottom: 21px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 21px;
        }
        .card {
            background: var(--gray);
            border: 1px solid #333;
            border-radius: 8px;
            padding: 21px;
        }
        .card h2 {
            color: var(--hot-pink);
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 13px;
        }
        .node {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #222;
        }
        .node:last-child { border-bottom: none; }
        .node-name { color: var(--amber); font-weight: bold; }
        .node-role { color: #666; font-size: 11px; }
        .status {
            width: 10px; height: 10px;
            border-radius: 50%;
            background: #333;
        }
        .status.online { background: #00ff00; box-shadow: 0 0 8px #00ff00; }
        .status.offline { background: #ff0000; }
        .btn {
            background: linear-gradient(135deg, var(--hot-pink), var(--violet));
            border: none;
            color: white;
            padding: 8px 13px;
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            font-size: 12px;
            margin: 4px;
        }
        .btn:hover { opacity: 0.8; }
        .btn-sm { padding: 4px 8px; font-size: 11px; }
        .output {
            background: #000;
            border: 1px solid #333;
            padding: 13px;
            margin-top: 13px;
            font-size: 11px;
            max-height: 300px;
            overflow-y: auto;
            white-space: pre-wrap;
            word-break: break-all;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 13px;
            margin-bottom: 21px;
        }
        .stat {
            background: var(--gray);
            padding: 13px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-value {
            font-size: 34px;
            background: linear-gradient(135deg, var(--amber), var(--hot-pink));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .stat-label { color: #666; font-size: 11px; text-transform: uppercase; }
        .command-bar {
            display: flex;
            gap: 8px;
            margin-top: 21px;
        }
        .command-bar input {
            flex: 1;
            background: #000;
            border: 1px solid #333;
            color: #fff;
            padding: 13px;
            font-family: inherit;
            border-radius: 4px;
        }
        .services { display: flex; flex-wrap: wrap; gap: 8px; }
        .service-badge {
            background: var(--dark);
            border: 1px solid var(--violet);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <h1>BLACKROAD CONTROL</h1>

    <div class="stats">
        <div class="stat">
            <div class="stat-value" id="pi-count">5</div>
            <div class="stat-label">Pi Nodes</div>
        </div>
        <div class="stat">
            <div class="stat-value" id="droplet-count">2</div>
            <div class="stat-label">Droplets</div>
        </div>
        <div class="stat">
            <div class="stat-value" id="cf-count">-</div>
            <div class="stat-label">CF Projects</div>
        </div>
        <div class="stat">
            <div class="stat-value" id="online-count">-</div>
            <div class="stat-label">Online</div>
        </div>
    </div>

    <div class="grid">
        <div class="card">
            <h2>Pi Fleet</h2>
            <div id="pi-nodes"></div>
        </div>

        <div class="card">
            <h2>Droplets</h2>
            <div id="droplet-nodes"></div>
        </div>

        <div class="card">
            <h2>Cloudflare</h2>
            <div class="services" id="cf-services">
                <button class="btn btn-sm" onclick="cfAction('list')">List Projects</button>
                <button class="btn btn-sm" onclick="cfAction('kv')">KV Namespaces</button>
                <button class="btn btn-sm" onclick="cfAction('workers')">Workers</button>
            </div>
            <div class="output" id="cf-output"></div>
        </div>

        <div class="card">
            <h2>Quick Actions</h2>
            <button class="btn" onclick="broadcast('uptime')">All Uptime</button>
            <button class="btn" onclick="broadcast('df -h | head -3')">Disk Usage</button>
            <button class="btn" onclick="broadcast('free -h')">Memory</button>
            <button class="btn" onclick="runOrchestrator('status')">Full Status</button>
            <div class="output" id="action-output"></div>
        </div>
    </div>

    <div class="command-bar">
        <input type="text" id="cmd" placeholder="Broadcast command to all nodes..." onkeypress="if(event.key==='Enter')broadcastCmd()">
        <button class="btn" onclick="broadcastCmd()">Execute</button>
    </div>

    <div class="card" style="margin-top: 21px;">
        <h2>Command Output</h2>
        <div class="output" id="main-output">Ready. Control all BlackRoad infrastructure from here.</div>
    </div>

<script>
const nodes = {{ nodes | tojson }};

function renderNodes() {
    const piContainer = document.getElementById('pi-nodes');
    const dropletContainer = document.getElementById('droplet-nodes');

    piContainer.innerHTML = nodes.pis.map(n => `
        <div class="node">
            <div>
                <span class="node-name">${n.name}</span>
                <div class="node-role">${n.role}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                <button class="btn btn-sm" onclick="sshCmd('${n.name}', 'uptime')">ping</button>
                <button class="btn btn-sm" onclick="sshCmd('${n.name}', 'htop -n1 | head -20')">htop</button>
                <div class="status" id="status-${n.name}"></div>
            </div>
        </div>
    `).join('');

    dropletContainer.innerHTML = nodes.droplets.map(n => `
        <div class="node">
            <div>
                <span class="node-name">${n.name}</span>
                <div class="node-role">${n.role}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                <button class="btn btn-sm" onclick="sshCmd('${n.name}', 'uptime')">ping</button>
                <div class="status" id="status-${n.name}"></div>
            </div>
        </div>
    `).join('');
}

async function checkStatus() {
    try {
        const resp = await fetch('/api/status');
        const data = await resp.json();
        let online = 0;
        for (const [name, status] of Object.entries(data.nodes)) {
            const el = document.getElementById(`status-${name}`);
            if (el) {
                el.className = 'status ' + (status ? 'online' : 'offline');
                if (status) online++;
            }
        }
        document.getElementById('online-count').textContent = online;
        if (data.cf_projects) {
            document.getElementById('cf-count').textContent = data.cf_projects;
        }
    } catch(e) { console.error(e); }
}

async function sshCmd(host, cmd) {
    document.getElementById('main-output').textContent = `Running on ${host}: ${cmd}...`;
    try {
        const resp = await fetch('/api/ssh', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({host, cmd})
        });
        const data = await resp.json();
        document.getElementById('main-output').textContent = `=== ${host} ===\n${data.output}`;
    } catch(e) {
        document.getElementById('main-output').textContent = 'Error: ' + e;
    }
}

async function broadcast(cmd) {
    document.getElementById('action-output').textContent = 'Broadcasting...';
    try {
        const resp = await fetch('/api/broadcast', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({cmd})
        });
        const data = await resp.json();
        document.getElementById('action-output').textContent = data.output;
    } catch(e) {
        document.getElementById('action-output').textContent = 'Error: ' + e;
    }
}

function broadcastCmd() {
    const cmd = document.getElementById('cmd').value;
    if (cmd) broadcast(cmd);
}

async function cfAction(action) {
    document.getElementById('cf-output').textContent = 'Loading...';
    try {
        const resp = await fetch('/api/cloudflare/' + action);
        const data = await resp.json();
        document.getElementById('cf-output').textContent = data.output;
    } catch(e) {
        document.getElementById('cf-output').textContent = 'Error: ' + e;
    }
}

async function runOrchestrator(action) {
    document.getElementById('action-output').textContent = 'Running orchestrator...';
    try {
        const resp = await fetch('/api/orchestrator/' + action);
        const data = await resp.json();
        document.getElementById('action-output').textContent = data.output;
    } catch(e) {
        document.getElementById('action-output').textContent = 'Error: ' + e;
    }
}

renderNodes();
checkStatus();
setInterval(checkStatus, 30000);
</script>
</body>
</html>
"""

def run_cmd(cmd, timeout=30):
    """Run a shell command and return output"""
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=timeout
        )
        return result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return "Command timed out"
    except Exception as e:
        return f"Error: {str(e)}"

@app.route('/')
def dashboard():
    return render_template_string(DASHBOARD_HTML, nodes=NODES)

@app.route('/api/status')
def status():
    """Check status of all nodes"""
    results = {"nodes": {}, "cf_projects": None}

    # Check each node via ping
    all_nodes = NODES["pis"] + NODES["droplets"]
    for node in all_nodes:
        # Use Tailscale IP for reliability
        ip = node.get("ts") or node.get("ip")
        result = subprocess.run(
            f"ping -c 1 -W 2 {ip}", shell=True, capture_output=True
        )
        results["nodes"][node["name"]] = result.returncode == 0

    # Get Cloudflare project count
    cf_output = run_cmd("wrangler pages project list 2>/dev/null | wc -l", timeout=10)
    try:
        results["cf_projects"] = int(cf_output.strip()) - 1  # subtract header
    except:
        pass

    return jsonify(results)

@app.route('/api/ssh', methods=['POST'])
def ssh_command():
    """Run SSH command on a specific host"""
    data = request.json
    host = data.get('host', '')
    cmd = data.get('cmd', 'uptime')

    # Sanitize host name
    if host not in [n['name'] for n in NODES['pis'] + NODES['droplets']]:
        return jsonify({"output": "Invalid host"})

    output = run_cmd(f"ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no {host} '{cmd}'")
    return jsonify({"output": output})

@app.route('/api/broadcast', methods=['POST'])
def broadcast():
    """Broadcast command to all nodes"""
    data = request.json
    cmd = data.get('cmd', 'uptime')

    outputs = []
    all_nodes = NODES["pis"] + NODES["droplets"]
    for node in all_nodes:
        output = run_cmd(f"ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no {node['name']} '{cmd}'", timeout=15)
        outputs.append(f"=== {node['name']} ===\n{output}")

    return jsonify({"output": "\n".join(outputs)})

@app.route('/api/cloudflare/<action>')
def cloudflare(action):
    """Cloudflare operations"""
    if action == 'list':
        output = run_cmd("wrangler pages project list 2>/dev/null | head -30")
    elif action == 'kv':
        output = run_cmd("wrangler kv namespace list 2>/dev/null")
    elif action == 'workers':
        output = run_cmd("wrangler deployments list 2>/dev/null | head -20")
    else:
        output = "Unknown action"
    return jsonify({"output": output})

@app.route('/api/orchestrator/<action>')
def orchestrator(action):
    """Run orchestrator commands"""
    output = run_cmd(f"~/blackroad-orchestrator.sh {action}", timeout=60)
    return jsonify({"output": output})

@app.route('/api/github/<action>')
def github(action):
    """GitHub operations"""
    if action == 'repos':
        output = run_cmd("gh repo list BlackRoad-OS --limit 20")
    elif action == 'prs':
        output = run_cmd("gh pr list --repo BlackRoad-OS/blackroad-os-infra")
    else:
        output = "Unknown action"
    return jsonify({"output": output})

if __name__ == '__main__':
    # Run on all interfaces so it's accessible via Tailscale
    app.run(host='0.0.0.0', port=8888, debug=False)
