#!/usr/bin/env python3
from flask import Flask, jsonify
import subprocess
import psutil
import os

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        "service": "BlackRoad Monitoring API",
        "version": "0.1.0",
        "node": "cecilia",
        "endpoints": ["/health", "/status"]
    })

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "monitor-api", "node": "cecilia"})

@app.route('/status')
def status():
    def check_service(name):
        try:
            result = subprocess.run(['systemctl', 'is-active', name], 
                                  capture_output=True, text=True, timeout=2)
            return result.stdout.strip() == 'active'
        except:
            return False
    
    def check_user_service(name):
        try:
            result = subprocess.run(['systemctl', '--user', 'is-active', name], 
                                  capture_output=True, text=True, timeout=2)
            return result.stdout.strip() == 'active'
        except:
            return False
    
    def check_port(port):
        try:
            result = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}',
                                   f'http://localhost:{port}/health'],
                                  capture_output=True, text=True, timeout=5)
            return result.stdout.strip() == '200'
        except:
            return False
    
    cpu = psutil.cpu_percent(interval=1)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return jsonify({
        "node": "cecilia",
        "timestamp": subprocess.check_output(['date', '-u', '+%Y-%m-%dT%H:%M:%SZ']).decode().strip(),
        "services": {
            "ollama": check_service("ollama"),
            "cloudflared": check_service("cloudflared"),
            "tts-api": check_user_service("tts-api"),
            "monitor-api": check_user_service("monitor-api")
        },
        "endpoints": {
            "ollama": check_port(11434),
            "tts-api": check_port(5001),
            "monitor-api": check_port(5002)
        },
        "resources": {
            "cpu_percent": cpu,
            "memory_used_gb": round(mem.used / 1024**3, 1),
            "memory_total_gb": round(mem.total / 1024**3, 1),
            "disk_used_gb": round(disk.used / 1024**3, 1),
            "disk_total_gb": round(disk.total / 1024**3, 1)
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
