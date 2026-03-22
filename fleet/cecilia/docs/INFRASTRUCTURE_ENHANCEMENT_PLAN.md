# BlackRoad Infrastructure Enhancement Plan

**Date**: 2026-02-16  
**Scope**: Pi Fleet + Web Infrastructure + Security + Email + TTS  
**Status**: Phase 1 - Discovery

---

## 🎯 Objectives

1. **Security Hardening** - SSH, firewall, SSL, monitoring
2. **Web Infrastructure** - nginx, www.blackroad.io, HTTPS
3. **Cloudflare Tunnels** - Better routing, failover, health checks
4. **Email System** - SMTP relay for all Pis
5. **TTS Integration** - piper-tts on Pi fleet
6. **Monitoring** - Grafana/Prometheus stack

---

## 📋 Phase 1: Discovery & Assessment

### Current Pi Fleet
```
- cecilia (Pi 5, Hailo-8, Pironman 5)
- lucidia (Pi 5, Hailo-8L, Pironman 5) 
- alice (Pi 4, standard case)
- octavia (Jetson Orin Nano, NVME)
- Others: pironman devices via Tailscale
```

### Tasks
- [ ] SSH to each Pi and gather status
- [ ] Check running services (systemctl)
- [ ] Review nginx configs (if any)
- [ ] Check cloudflared status
- [ ] List open ports
- [ ] Review security (ssh config, firewall)
- [ ] Check available resources (CPU, RAM, disk)

### Commands to Run
```bash
# On each Pi:
uname -a
systemctl list-units --type=service --state=running
ss -tulpn  # Open ports
df -h      # Disk usage
free -h    # Memory
uptime     # Load
nginx -v   # Check if installed
cloudflared --version
```

---

## 🔒 Phase 2: Security Hardening

### SSH Hardening
- [ ] Disable password auth (keys only)
- [ ] Change default port from 22
- [ ] Install fail2ban
- [ ] Set up SSH CA (optional)

### Firewall
- [ ] Install ufw
- [ ] Default deny incoming
- [ ] Allow SSH, HTTP, HTTPS
- [ ] Rate limiting

### SSL/TLS
- [ ] Let's Encrypt certificates
- [ ] Auto-renewal with certbot
- [ ] HTTPS redirect
- [ ] HSTS headers

### Monitoring
- [ ] Install osquery (endpoint security)
- [ ] Set up audit logs
- [ ] Security event alerts

---

## 🌐 Phase 3: Web Infrastructure

### nginx Setup
```nginx
# Standard config for each Pi
server {
    listen 80;
    listen [::]:80;
    server_name *.blackroad.io;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.blackroad.io;
    
    ssl_certificate /etc/letsencrypt/live/blackroad.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/blackroad.io/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Tasks
- [ ] Install nginx on all Pis
- [ ] Configure reverse proxy
- [ ] Set up SSL certificates
- [ ] Deploy www.blackroad.io content
- [ ] Configure caching
- [ ] Set up log rotation

---

## 🌉 Phase 4: Cloudflare Tunnels

### Better Tunnel Architecture
```
Internet → Cloudflare Edge → cloudflared tunnels → nginx → services
```

### Per-Pi Tunnels
- [ ] `cecilia-tunnel` (primary AI services)
- [ ] `lucidia-tunnel` (inference, simulation)
- [ ] `alice-tunnel` (worker node)
- [ ] `octavia-tunnel` (GPU workloads)

### Configuration
```yaml
# /etc/cloudflared/config.yml
tunnel: <tunnel-id>
credentials-file: /etc/cloudflared/<tunnel-id>.json

ingress:
  - hostname: cecilia.blackroad.io
    service: http://localhost:80
  - hostname: api.blackroad.io
    service: http://localhost:3000
  - service: http_status:404
```

### Tasks
- [ ] Create tunnels for each Pi
- [ ] Configure DNS CNAME records
- [ ] Set up health checks
- [ ] Enable load balancing
- [ ] Configure failover

---

## 📧 Phase 5: Email System

### Architecture
```
Services → Postfix (relay) → External SMTP → Recipients
```

### Setup on Each Pi
```bash
# Install postfix
sudo apt install postfix mailutils

# Configure as relay
sudo postconf -e 'relayhost = [smtp.gmail.com]:587'
sudo postconf -e 'smtp_use_tls = yes'
sudo postconf -e 'smtp_sasl_auth_enable = yes'
```

### Tasks
- [ ] Install postfix on all Pis
- [ ] Configure SMTP relay (Gmail/SendGrid)
- [ ] Set up SASL authentication
- [ ] Configure email aliases
- [ ] Test email sending
- [ ] Set up SPF/DKIM/DMARC (if sending domain)

---

## 🔊 Phase 6: TTS Integration

### piper-tts Setup
```bash
# Install on each Pi
wget https://github.com/rhasspy/piper/releases/latest/download/piper_arm64.tar.gz
tar -xzf piper_arm64.tar.gz
sudo mv piper /usr/local/bin/

# Download voice model
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx
```

### API Endpoint
```python
# /usr/local/bin/tts-api.py
from flask import Flask, request, send_file
import subprocess
import os

app = Flask(__name__)

@app.route('/tts', methods=['POST'])
def tts():
    text = request.json.get('text')
    output = '/tmp/speech.wav'
    subprocess.run(['piper', '--model', 'model.onnx', '--output_file', output], 
                   input=text.encode(), check=True)
    return send_file(output, mimetype='audio/wav')
```

### Tasks
- [ ] Install piper-tts on all Pis
- [ ] Download voice models
- [ ] Create TTS API service
- [ ] Set up systemd service
- [ ] Configure audio output
- [ ] Test on each device

---

## 📊 Phase 7: Monitoring & Maintenance

### Prometheus + Grafana Stack
```yaml
# docker-compose.yml on monitoring Pi
version: '3'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=secure_password
```

### Node Exporters
```bash
# On each Pi
wget https://github.com/prometheus/node_exporter/releases/latest/download/node_exporter-*-linux-arm64.tar.gz
tar -xzf node_exporter-*.tar.gz
sudo mv node_exporter /usr/local/bin/
```

### Tasks
- [ ] Deploy Prometheus on monitoring host
- [ ] Install node_exporter on all Pis
- [ ] Configure scrape targets
- [ ] Set up Grafana dashboards
- [ ] Create alert rules
- [ ] Set up notification channels (email, Slack)

---

## 🚀 Execution Strategy

### Week 1: Discovery + Security
- Days 1-2: Discovery and audit
- Days 3-5: Security hardening
- Days 6-7: Testing and documentation

### Week 2: Web + Tunnels
- Days 1-3: nginx + SSL setup
- Days 4-5: Cloudflare tunnels
- Days 6-7: www.blackroad.io deployment

### Week 3: Email + TTS + Monitoring
- Days 1-2: Email system setup
- Days 3-4: TTS integration
- Days 5-7: Monitoring stack deployment

---

## 📝 Prerequisites

### Access
- [ ] SSH access to all Pis
- [ ] sudo privileges
- [ ] Cloudflare account access
- [ ] DNS management access

### Accounts
- [ ] Cloudflare API token
- [ ] Email relay credentials (Gmail/SendGrid)
- [ ] GitHub for git operations
- [ ] Docker Hub (optional)

### Tools
- [ ] Ansible (for automation)
- [ ] Terraform (for IaC)
- [ ] kubectl (for K3s if deployed)

---

## �� Success Criteria

- [ ] All Pis hardened with SSH keys, firewall, fail2ban
- [ ] www.blackroad.io serving HTTPS traffic
- [ ] Cloudflare tunnels routing to all devices
- [ ] Email sending from all Pis working
- [ ] TTS API responding on all Pis
- [ ] Monitoring dashboards showing all services
- [ ] <5 minute mean time to detect issues
- [ ] <15 minute mean time to recovery

---

**Ready to begin Phase 1: Discovery!**
