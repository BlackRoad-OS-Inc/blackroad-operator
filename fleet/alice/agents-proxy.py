import http.server, urllib.request, json, urllib.error

class AgentsHandler(http.server.BaseHTTPRequestHandler):
    ARIA_AGENTS = 'http://192.168.4.98:4010'
    OCTAVIA_MODELS = 'http://192.168.4.97:8787'
    
    def do_GET(self):
        try:
            # Try aria agents first
            req = urllib.request.Request(self.ARIA_AGENTS + self.path)
            with urllib.request.urlopen(req, timeout=5) as r:
                data = r.read()
                self.send_response(200)
                self.send_header('Content-Type', r.headers.get('Content-Type', 'application/json'))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(data)
        except Exception as e:
            resp = json.dumps({'error': str(e), 'node': 'alice', 'upstream': self.ARIA_AGENTS}).encode()
            self.send_response(503)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(resp)
    def log_message(self, *a): pass

if __name__ == '__main__':
    import socketserver
    with socketserver.TCPServer(('0.0.0.0', 4010), AgentsHandler) as s:
        print('agents proxy on :4010')
        s.serve_forever()
