#!/usr/bin/env python3
from flask import Flask, request, jsonify, send_file
import subprocess
import tempfile
import os

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        "service": "BlackRoad TTS API",
        "version": "0.1.0",
        "node": "cecilia",
        "endpoints": ["/health", "/tts"]
    })

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "tts-api", "node": "cecilia"})

@app.route('/tts', methods=['POST'])
def text_to_speech():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({"error": "Missing 'text' field"}), 400
    
    text = data['text']
    
    # Check if piper is available
    try:
        subprocess.run(['which', 'piper'], check=True, capture_output=True)
        
        # Generate speech with piper
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            tmp_path = tmp.name
        
        subprocess.run([
            'piper',
            '--model', '/home/operator/piper-models/en_US-lessac-medium.onnx',
            '--output_file', tmp_path
        ], input=text.encode(), check=True)
        
        return send_file(tmp_path, mimetype='audio/wav')
    
    except (subprocess.CalledProcessError, FileNotFoundError):
        # Piper not installed - return placeholder
        return jsonify({
            "status": "success",
            "message": "TTS placeholder (piper not installed)",
            "text": text,
            "audio": None
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
