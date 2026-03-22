#!/usr/bin/env python3
from flask import Flask, jsonify
import subprocess
import json
from datetime import datetime

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "monitor-api"})

@app.route('/status')
def status():
    """Get all service statuses"""
    services = {}
    
    # Check systemd services
    for svc in ['nginx', 'ollama', 'cloudflared']:
        try:
            result = subprocess.run(['systemctl', 'is-active', svc], 
                                  capture_output=True, text=True, timeout=2)
            services[svc] = result.stdout.strip() == 'active'
        except:
            services[svc] = False
    
    # Check user services
    try:
        result = subprocess.run(['systemctl', '--user', 'is-active', 'tts-api'], 
                              capture_output=True, text=True, timeout=2)
        services['tts-api'] = result.stdout.strip() == 'active'
    except:
        services['tts-api'] = False
    
    # System metrics
    try:
        uptime_result = subprocess.run(['uptime'], capture_output=True, text=True)
        load = uptime_result.stdout.split('load average:')[1].strip()
    except:
        load = "unknown"
    
    return jsonify({
        "timestamp": datetime.now().isoformat(),
        "services": services,
        "system": {
            "load": load,
            "hostname": subprocess.run(['hostname'], capture_output=True, text=True).stdout.strip()
        }
    })

@app.route('/dashboard')
def dashboard():
    """HTML dashboard"""
    return """
<!DOCTYPE html>
<html><head><title>BlackRoad Monitoring</title>
<meta http-equiv="refresh" content="5">
<style>
body{background:#0a0a0a;color:#fff;font-family:monospace;padding:2rem}
.service{padding:1rem;margin:0.5rem 0;border:1px solid #333;border-radius:8px}
.active{border-color:#52FFA8;background:rgba(82,255,168,0.1)}
.inactive{border-color:#FF1D6C;background:rgba(255,29,108,0.1)}
h1{color:#FF1D6C}
</style></head><body>
<h1>🌌 BlackRoad Monitoring</h1>
<div id="status">Loading...</div>
<script>
fetch('/status').then(r=>r.json()).then(data=>{
    let html = '<h2>Services</h2>';
    for(let [name, active] of Object.entries(data.services)){
        html += `<div class="service ${active?'active':'inactive'}">
            ${active?'✅':'❌'} ${name}
        </div>`;
    }
    html += `<h2>System</h2><div class="service active">
        Load: ${data.system.load}<br>
        Hostname: ${data.system.hostname}<br>
        Updated: ${new Date(data.timestamp).toLocaleString()}
    </div>`;
    document.getElementById('status').innerHTML = html;
});
</script></body></html>
"""

if __name__ == '__main__':
    print("📊 Monitor API starting on port 5002...")
    app.run(host='0.0.0.0', port=5002)
