import http.server
import socketserver

PORT = 3333
Handler = http.server.SimpleHTTPRequestHandler

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("SUCCESS: Server running at http://localhost:3333")
        httpd.serve_forever()
except OSError as e:
    print(f"ERROR: {e}")
    print("Try changing the PORT number to 8080 in the script.")
except Exception as e:
    print(f"CRASH: {e}")
