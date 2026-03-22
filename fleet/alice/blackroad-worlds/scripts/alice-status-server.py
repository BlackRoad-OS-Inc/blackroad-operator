#!/usr/bin/env python3
"""BlackRoad Status Server - stdlib only, zero dependencies"""
import json, os, time
from http.server import HTTPServer, BaseHTTPRequestHandler

def disk_free_gb():
    st = os.statvfs('/')
    return round(st.f_frsize * st.f_bavail / (1024**3), 2)

def ram_free_gb():
    try:
        with open('/proc/meminfo') as f:
            for line in f:
                if 'MemAvailable' in line:
                    return round(int(line.split()[1]) / (1024**2), 2)
    except:
        return 0.0

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        if self.path == '/status':
            worlds = len([f for f in os.listdir(os.path.expanduser('~/.blackroad/worlds')) if f.endswith('.md')])
            data = {
                'host': os.uname().nodename,
                'user': os.environ.get('USER', 'blackroad'),
                'disk_free_gb': disk_free_gb(),
                'ram_free_gb': ram_free_gb(),
                'worlds_created': worlds,
                'mode': 'relay',
                'relay_to': '192.168.4.38:11434',
            }
            body = json.dumps(data).encode()
            code = 200
        else:
            body = b'{"error":"not found"}'
            code = 404
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(body)

if __name__ == '__main__':
    os.makedirs(os.path.expanduser('~/.blackroad/worlds'), exist_ok=True)
    print('Starting BlackRoad status server on :8183')
    HTTPServer(('0.0.0.0', 8183), Handler).serve_forever()
