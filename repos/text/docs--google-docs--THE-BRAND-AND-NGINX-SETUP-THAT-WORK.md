# THE BRAND AND NGINX SETUP THAT WORK

**Source:** google-docs

---

1) Open the ports and clean Nginx site links

# Firewall: make sure the ports are open

sudo ufw allow OpenSSH

sudo ufw allow 80/tcp

sudo ufw allow 443/tcp

sudo ufw --force enable || true

sudo ufw status

# Nginx: remove all dangling/conflicting site symlinks

sudo rm -f /etc/nginx/sites-enabled/*

# Optional: archive any stray old site files so they stop fighting you

sudo mkdir -p /etc/nginx/sites-available/archive

sudo find /etc/nginx/sites-available -maxdepth 1 -type f -name "blackroad*.conf" -exec mv -f {} /etc/nginx/sites-available/archive/ \; || true

2) Canonical Nginx config (HTTP only for stability first)

sudo bash -c 'cat > /etc/nginx/sites-available/blackroad.io << "NGINX"

# FILE: /etc/nginx/sites-available/blackroad.io

# Stable HTTP config for BlackRoad.io SPA + API reverse proxy.

server {

listen 80;

listen [::]:80;

server_name blackroad.io www.blackroad.io;

# Health check (always 200)

location = /health {

return 200 "OK\n";

add_header Content-Type text/plain;

}

# Static SPA root

root /var/www/blackroad;

index index.html;

# Serve files; SPA fallback for deep links like /features

location / {

try_files $uri $uri/ /index.html;

}

# Cache static assets lightly

location ~* \.(?:js|mjs|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ {

expires 7d;

add_header Cache-Control "public, max-age=604800";

try_files $uri =404;

access_log off;

}

# API proxy

location ^~ /api/ {

proxy_pass http://127.0.0.1:4000/;

proxy_http_version 1.1;

proxy_set_header Host $host;

proxy_set_header X-Real-IP $remote_addr;

proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

proxy_set_header X-Forwarded-Proto $scheme;

}

# Socket.IO / websockets

location ^~ /socket.io/ {

proxy_pass http://127.0.0.1:4000/socket.io/;

proxy_http_version 1.1;

proxy_set_header Upgrade $http_upgrade;

proxy_set_header Connection "upgrade";

proxy_set_header Host $host;

}

}

NGINX

sudo ln -sf /etc/nginx/sites-available/blackroad.io /etc/nginx/sites-enabled/blackroad.io

sudo nginx -t && sudo systemctl reload nginx

3) Branded, safe fallback SPA (prevents the black screen & 404)

sudo mkdir -p /var/www/blackroad

sudo bash -c 'cat > /var/www/blackroad/index.html << "HTML"

<!-- FILE: /var/www/blackroad/index.html -->

<!doctype html>

<html lang="en">

<head>

<meta charset="utf-8" />

<meta name="viewport" content="width=device-width, initial-scale=1" />

<title>BlackRoad.io</title>

<style>

:root{

--bg:#0B1426; --fg:#FFFFFF; --muted:#94A3B8;

--accent:#FF4FD8; --accent2:#0096FF; --accent3:#FDBA2D;

}

*{box-sizing:border-box}

body{margin:0; background:var(--bg); color:var(--fg); font:15px/1.6 Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}

.wrap{max-width:1100px; margin:0 auto; padding:48px 24px}

.badge{display:inline-block; color:#d1d5db; border:1px solid #29324a; border-radius:999px; padding:6px 12px; font-weight:600; letter-spacing:.02em}

h1{font-size:42px; line-height:1.1; margin:16px 0 12px}

.grad{background: linear-gradient(135deg, var(--accent3), var(--accent), var(--accent2));

-webkit-background-clip:text; background-clip:text; color:transparent}

p{color:var(--muted); max-width:720px}

.row{display:flex; gap:12px; flex-wrap:wrap; margin:20px 0 32px}

.btn{border:none; border-radius:12px; padding:12px 16px; font-weight:700; cursor:pointer}

.btn.primary{background:var(--accent); color:#0b0b0b}

.btn.ghost{background:#111a2f; color:#e5e7eb; border:1px solid #223154}

.cards{display:grid; gap:14px; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); margin-top:28px}

.card{background:#0f1a33; border:1px solid #1a2544; border-radius:16px; padding:18px}

.card h3{margin:0 0 8px; font-size:16px}

code, pre{font-family:"JetBrains Mono","Fira Code",ui-monospace,monospace; font-size:13px}

pre{background:#0a1324; border:1px solid #1a2544; padding:14px; border-radius:12px; overflow:auto}

a{color:var(--accent2); text-decoration:none}

a:hover{text-decoration:underline}

footer{opacity:.7; margin-top:40px; font-size:12px}

</style>

</head>

<body>

<div class="wrap">

<span class="badge">Technical co-creation platform</span>

<h1>Build, ship, and evolve — on a <span class="grad">dark, precise</span> stack.</h1>

<p>Minimal, fast, and designed for clarity with a high-contrast dark UI. This is the hardened fallback page so your domain never blinks again while the portal evolves.</p>

<div class="row">

<a class="btn primary" href="/">Launch Portal</a>

<a class="btn ghost" href="/features">Features</a>

<a class="btn ghost" href="/docs">Docs</a>

</div>

<div class="cards">

<div class="card">

<h3>Environment Setup</h3>

<p>Health: <code><a href="/health">/health</a></code> (should return OK). SPA deep links are routed via <code>try_files</code>.</p>

</div>

<div class="card">

<h3>API Quickstart</h3>

<pre><code>// client.js

import fetch from "node-fetch";

async function chat(prompt) {

const res = await fetch("https://blackroad.io/api/llm/chat", {

method: "POST",

headers: {"content-type": "application/json"},

body: JSON.stringify({ prompt })

});

if (!res.ok) throw new Error("Request failed: " + res.status);

return res.json();

}

chat("Hello, BlackRoad").then(console.log).catch(console.error);</code></pre>

</div>

</div>

<footer>© BlackRoad Inc.</footer>

</div>

</body>

</html>

HTML

4) API service (keeps

/api/*

alive)

# Create a sturdy systemd unit (uses your existing /srv/blackroad-api/server_full.js)

sudo bash -c 'cat > /etc/systemd/system/blackroad-api.service << "UNIT"

[Unit]

Description=BlackRoad API

After=network.target

[Service]

Type=simple

User=www-data

WorkingDirectory=/srv/blackroad-api

Environment=PORT=4000 NODE_ENV=production

ExecStart=/usr/bin/node /srv/blackroad-api/server_full.js

Restart=always

RestartSec=2

[Install]

WantedBy=multi-user.target

UNIT

sudo systemctl daemon-reload

sudo systemctl enable --now blackroad-api

sudo systemctl status --no-pager blackroad-api | sed -n "1,40p"

5) Quick checks (these should

all

succeed)

# Nginx is serving something:

curl -I http://localhost

curl -s http://localhost/health

# From the droplet itself, confirm your public IP and domain both answer:

PUB=$(curl -s ifconfig.me); echo $PUB

curl -I "http://$PUB"

curl -I http://blackroad.io || true

6) Turn HTTPS back on (only after HTTP is steady)

sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx

sudo certbot --nginx -d blackroad.io -d www.blackroad.io --agree-tos -m admin@blackroad.io -n

sudo systemctl reload nginx

1) Replace the Nginx site with a complete, default_server block

# Write the full config (note the closing NGINX on its own line)

sudo bash -c 'cat > /etc/nginx/sites-available/blackroad.io << "NGINX"

# FILE: /etc/nginx/sites-available/blackroad.io

# Stable HTTP config: SPA + API + health checks

server {

listen 80 default_server;

listen [::]:80 default_server;

server_name blackroad.io www.blackroad.io _;

# Static SPA

root /var/www/blackroad;

index index.html;

# Health endpoints (work even if API is down)

location = /health {

return 200 "OK\n";

add_header Content-Type text/plain;

}

location = /api/health {

return 200 "{\"ok\":true}\n";

add_header Content-Type application/json;

}

# SPA deep-link fallback (/features, /docs, etc.)

location / {

try_files $uri $uri/ /index.html;

}

# Light caching for assets

location ~* \.(?:js|mjs|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ {

expires 7d;

add_header Cache-Control "public, max-age=604800";

try_files $uri =404;

access_log off;

}

# API proxy

location ^~ /api/ {

proxy_pass http://127.0.0.1:4000/;

proxy_http_version 1.1;

proxy_set_header Host $host;

proxy_set_header X-Real-IP $remote_addr;

proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

proxy_set_header X-Forwarded-Proto $scheme;

}

# Socket.IO / websockets (if you use it)

location ^~ /socket.io/ {

proxy_pass http://127.0.0.1:4000/socket.io/;

proxy_http_version 1.1;

proxy_set_header Upgrade $http_upgrade;

proxy_set_header Connection "upgrade";

proxy_set_header Host $host;

}

}

NGINX'

# Enable only this site and reload

sudo rm -f /etc/nginx/sites-enabled/*

sudo ln -sf /etc/nginx/sites-available/blackroad.io /etc/nginx/sites-enabled/blackroad.io

sudo nginx -t && sudo systemctl reload nginx

Quick checks (these should all work now):

curl -sS -D- http://127.0.0.1/health -o /dev/null

curl -sS -D- -H "Host: blackroad.io" http://127.0.0.1/health -o /dev/null

curl -sS -D- http://blackroad.io/health -o /dev/null

2) Make sure the fallback page actually exists (your previous heredoc cut off)

sudo mkdir -p /var/www/blackroad

sudo bash -c 'cat > /var/www/blackroad/index.html << "HTML"

<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">

<title>BlackRoad.io</title>

<style>

:root{--bg:#0B1426;--fg:#fff;--muted:#94A3B8;--a:#FF4FD8;--b:#0096FF;--c:#FDBA2D}

*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}

.wrap{max-width:1100px;margin:0 auto;padding:48px 24px}

.badge{display:inline-block;color:#d1d5db;border:1px solid #29324a;border-radius:999px;padding:6px 12px;font-weight:600}

h1{font-size:42px;line-height:1.1;margin:16px 0 12px}

.grad{background:linear-gradient(135deg,var(--c),var(--a),var(--b));-webkit-background-clip:text;background-clip:text;color:transparent}

p{color:var(--muted);max-width:720px}

.row{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0 32px}

.btn{border:none;border-radius:12px;padding:12px 16px;font-weight:700;cursor:pointer}

.btn.primary{background:var(--a);color:#0b0b0b}.btn.ghost{background:#111a2f;color:#e5e7eb;border:1px solid #223154}

.card{background:#0f1a33;border:1px solid #1a2544;border-radius:16px;padding:18px;margin-top:18px}

code,pre{font-family:"JetBrains Mono","Fira Code",ui-monospace,monospace;font-size:13px}

a{color:var(--b);text-decoration:none}a:hover{text-decoration:underline}

</style>

<div class="wrap">

<span class="badge">Technical co-creation platform</span>

<h1>Build, ship, and evolve — on a <span class="grad">dark, precise</span> stack.</h1>

<p>This is the hardened fallback page so the domain never blinks while the portal evolves.</p>

<div class="row">

<a class="btn primary" href="/">Launch Portal</a>

<a class="btn ghost" href="/features">Features</a>

<a class="btn ghost" href="/docs">Docs</a>

</div>

<div class="card"><b>Health</b><br>

Nginx: <a href="/health">/health</a> &nbsp; API: <a href="/api/health">/api/health</a>

</div>

</div>

HTML'

sudo chown -R www-data:www-data /var/www/blackroad

Sanity:

curl -I http://blackroad.io

3) Quiet the flapping services (optional but recommended)

They aren’t needed to serve the site and just spam logs.

sudo systemctl disable --now lucidia-llm || true

sudo systemctl disable --now blackroad-matrix || true

4) API note

Your backend logs say RoadView routes mounted, but HEAD /api/roadview returns 404. That’s normal if the route is something like /api/roadview/list or only supports GET with params. Use a simple GET you know exists, or just rely on the Nginx /api/health we added for liveness.

Example backend health (add later, if you want JSON from Node instead of Nginx):

// in server_full.js after you create `app`

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'blackroad-api', time: new Date().toISOString() }));

5) HTTPS (after the above works)

Once /health is 200 over HTTP:

sudo certbot --nginx -d blackroad.io -d www.blackroad.io --redirect -m admin@blackroad.io --agree-tos -n
