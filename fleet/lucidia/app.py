#!/usr/bin/env python3
from flask import Flask, request, send_file, jsonify
import subprocess
import os
import tempfile
from datetime import datetime

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "tts-api", "timestamp": datetime.now().isoformat()})

@app.route('/tts', methods=['POST'])
def tts():
    data = request.get_json()
    text = data.get('text', 'Hello')
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
        output = tmp.name
    # Note: Will work after piper is installed
    return jsonify({"message": "TTS API ready", "text": text, "note": "Install piper-tts to generate audio"})

@app.route('/')
def index():
    return jsonify({"service": "BlackRoad TTS API", "version": "0.1.0", "endpoints": {"/health": "GET", "/tts": "POST"}})

if __name__ == '__main__':
    print("🔊 TTS API starting on port 5001...")
    app.run(host='0.0.0.0', port=5001)
