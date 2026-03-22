import http.server, urllib.request, json

UPSTREAMS = {'dashboard': 'http://192.168.4.97:3000', 'default': 'http://192.168.4.97:3000'}

class DashHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        for name, up in UPSTREAMS.items():
            try:
                req = urllib.request.Request(up + self.path)
                with urllib.request.urlopen(req, timeout=5) as r:
                    data = r.read()
                    self.send_response(200)
                    ct = r.headers.get('Content-Type', 'text/html')
                    self.send_header('Content-Type', ct)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(data)
                    return
            except: continue
        self.send_response(503)
        self.end_headers()
    def log_message(self, *a): pass

import socketserver
with socketserver.TCPServer(('0.0.0.0', 3000), DashHandler) as s:
    print('dashboard proxy on :3000')
    s.serve_forever()
