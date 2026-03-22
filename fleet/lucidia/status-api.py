#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import json, subprocess, socket

class StatusHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        status = {
            "status": "online",
            "hostname": socket.gethostname(),
            "timestamp": subprocess.check_output(['date', '-u', '+%Y-%m-%dT%H:%M:%SZ']).decode().strip()
        }
        self.wfile.write(json.dumps(status).encode())
    def log_message(self, *args): pass

HTTPServer(('0.0.0.0', 8080), StatusHandler).serve_forever()
