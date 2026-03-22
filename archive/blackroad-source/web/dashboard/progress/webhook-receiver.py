#!/usr/bin/env python3
"""
BlackRoad GitHub Webhook Receiver
Auto-deploys on push to any BlackRoad repo
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import subprocess
import hmac
import hashlib
import os

PORT = 9000
SECRET = os.environ.get("WEBHOOK_SECRET", "blackroad-sovereign")

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        
        # Verify signature if present
        signature = self.headers.get("X-Hub-Signature-256", "")
        if signature:
            expected = "sha256=" + hmac.new(
                SECRET.encode(), body, hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(signature, expected):
                self.send_response(401)
                self.end_headers()
                return
        
        try:
            payload = json.loads(body.decode())
            event = self.headers.get("X-GitHub-Event", "unknown")
            repo = payload.get("repository", {}).get("full_name", "unknown")
            
            print(f"[WEBHOOK] Event: {event} | Repo: {repo}")
            
            if event == "push":
                ref = payload.get("ref", "")
                if "main" in ref or "master" in ref:
                    # Trigger sync
                    print(f"[DEPLOY] Auto-deploying {repo}...")
                    subprocess.Popen([
                        os.path.expanduser("~/blackroad-sovereign-mesh.sh"),
                        "broadcast", "auto-deploy", repo, 
                        f"GitHub push triggered deployment for {repo}"
                    ])
            
            response = {"status": "received", "event": event, "repo": repo}
            
        except Exception as e:
            response = {"status": "error", "message": str(e)}
        
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())
    
    def log_message(self, format, *args):
        print(f"[GITHUB] {args[0]}")

print(f"🔗 GitHub Webhook Receiver on port {PORT}")
print(f"   Endpoint: http://your-ip:{PORT}/webhook")
HTTPServer(("0.0.0.0", PORT), WebhookHandler).serve_forever()
