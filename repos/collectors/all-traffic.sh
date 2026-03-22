#!/bin/bash
# ALL TRAFFIC TRACKING — every endpoint, every hit, every Pi
# Added 2026-03-17 by Alexa's request: "i want all traffic tracked"

source "$(dirname "$0")/../lib/common.sh"
log "Collecting ALL traffic metrics..."

OUT=$(snapshot_file all-traffic)

python3 << 'PYEOF'
import json, subprocess, os, sys
from datetime import datetime

data = {
    'source': 'all-traffic',
    'date': os.environ.get('TODAY', datetime.now().strftime('%Y-%m-%d')),
    'collected_at': datetime.now().isoformat(),
    'nginx': {},
    'roundtrip': {},
    'fleet_endpoints': {},
    'self_hosted': {},
}

def ssh_cmd(host, cmd, timeout=10):
    try:
        r = subprocess.run(['ssh', '-o', 'ConnectTimeout=5', host, cmd],
            capture_output=True, text=True, timeout=timeout)
        return r.stdout.strip()
    except:
        return ''

def curl_json(url, timeout=5):
    try:
        r = subprocess.run(['curl', '-sf', '--max-time', str(timeout), url],
            capture_output=True, text=True, timeout=timeout+2)
        return json.loads(r.stdout) if r.stdout else {}
    except:
        return {}

# === 1. NGINX ACCESS LOGS (Alice — main gateway) ===
print("  Checking nginx access logs on Alice...")
# Count requests today from nginx access log
nginx_today = ssh_cmd('pi@192.168.4.49',
    "cat /var/log/nginx/access.log 2>/dev/null | grep -c \"$(date +%d/%b/%Y)\" || echo 0")
nginx_total = ssh_cmd('pi@192.168.4.49',
    "wc -l < /var/log/nginx/access.log 2>/dev/null || echo 0")
nginx_unique_ips = ssh_cmd('pi@192.168.4.49',
    "awk '{print $1}' /var/log/nginx/access.log 2>/dev/null | sort -u | wc -l || echo 0")
nginx_top_paths = ssh_cmd('pi@192.168.4.49',
    "awk '{print $7}' /var/log/nginx/access.log 2>/dev/null | sort | uniq -c | sort -rn | head -10 || echo ''")
nginx_status = ssh_cmd('pi@192.168.4.49',
    "awk '{print $9}' /var/log/nginx/access.log 2>/dev/null | sort | uniq -c | sort -rn | head -5 || echo ''")

data['nginx']['requests_today'] = int(nginx_today) if nginx_today.isdigit() else 0
data['nginx']['requests_total'] = int(nginx_total.strip()) if nginx_total.strip().isdigit() else 0
data['nginx']['unique_ips'] = int(nginx_unique_ips.strip()) if nginx_unique_ips.strip().isdigit() else 0
data['nginx']['top_paths'] = nginx_top_paths
data['nginx']['status_codes'] = nginx_status
print(f"  \033[38;5;82m✓\033[0m nginx: {data['nginx']['requests_today']} today, {data['nginx']['requests_total']} total, {data['nginx']['unique_ips']} unique IPs")

# === 2. ROUNDTRIP AGENT CHAT ===
print("  Checking RoundTrip metrics...")
rt_health = curl_json('https://roundtrip.blackroad.io/api/health')
rt_messages = curl_json('https://roundtrip.blackroad.io/api/messages?channel=general&limit=1000')
data['roundtrip']['agents'] = rt_health.get('agents', 0)
data['roundtrip']['version'] = rt_health.get('version', '?')
data['roundtrip']['messages_general'] = len(rt_messages) if isinstance(rt_messages, list) else 0
# Check all channels
for ch in ['general', 'fleet', 'ops', 'security', 'creative', 'research', 'ceo', 'iot']:
    msgs = curl_json(f'https://roundtrip.blackroad.io/api/messages?channel={ch}&limit=1000')
    data['roundtrip'][f'msgs_{ch}'] = len(msgs) if isinstance(msgs, list) else 0
print(f"  \033[38;5;82m✓\033[0m RoundTrip: {data['roundtrip']['agents']} agents, {data['roundtrip']['messages_general']} msgs in #general")

# === 3. ALL SELF-HOSTED ENDPOINTS ===
print("  Probing all endpoints...")
endpoints = {
    'roundtrip': 'https://roundtrip.blackroad.io/api/health',
    'search': 'https://search.blackroad.io/search?q=test',
    'auth': 'https://auth.blackroad.io/health',
    'chat': 'https://chat.blackroad.io/',
    'hq': 'https://hq.blackroad.io/',
    'ai': 'https://ai.blackroad.io/',
    'blackroad': 'https://blackroad.io/',
    'pay': 'https://pay.blackroad.io/',
    'prism': 'https://prism.blackroad.io/',
    'cloud': 'https://cloud.blackroad.io/',
    'apps': 'https://apps.blackroad.io/',
    'docs': 'https://docs.blackroad.io/',
    'brand': 'https://brand.blackroad.io/',
    'chain': 'https://chain.blackroad.io/',
    'console': 'https://console.blackroad.io/',
    'ollama': 'https://ollama.gematria.blackroad.io/api/tags',
}
up_count = 0
for name, url in endpoints.items():
    try:
        r = subprocess.run(['curl', '-sf', '-o', '/dev/null', '-w', '%{http_code}:%{time_total}', '--max-time', '5', url],
            capture_output=True, text=True, timeout=8)
        parts = r.stdout.split(':')
        status = int(parts[0]) if parts[0].isdigit() else 0
        latency = float(parts[1]) if len(parts) > 1 else 0
        is_up = 200 <= status < 400
        if is_up: up_count += 1
        data['fleet_endpoints'][name] = {'status': status, 'latency_ms': round(latency*1000), 'up': is_up}
    except:
        data['fleet_endpoints'][name] = {'status': 0, 'latency_ms': 0, 'up': False}

data['fleet_endpoints']['total_up'] = up_count
data['fleet_endpoints']['total_checked'] = len(endpoints)
print(f"  \033[38;5;82m✓\033[0m Endpoints: {up_count}/{len(endpoints)} up")

# === 4. PI FLEET TRAFFIC ===
print("  Checking Pi fleet traffic...")
pis = [('alice', 'pi@192.168.4.49'), ('cecilia', 'blackroad@192.168.4.96'),
       ('octavia', 'pi@192.168.4.101'), ('lucidia', 'blackroad@192.168.4.38')]
for name, host in pis:
    # Network traffic bytes
    rx = ssh_cmd(host, "cat /sys/class/net/eth0/statistics/rx_bytes 2>/dev/null || echo 0")
    tx = ssh_cmd(host, "cat /sys/class/net/eth0/statistics/tx_bytes 2>/dev/null || echo 0")
    conns = ssh_cmd(host, "ss -s 2>/dev/null | grep 'TCP:' | head -1 || echo ''")
    data['self_hosted'][name] = {
        'rx_gb': round(int(rx)/(1024**3), 2) if rx.isdigit() else 0,
        'tx_gb': round(int(tx)/(1024**3), 2) if tx.isdigit() else 0,
        'connections': conns,
    }
    print(f"  \033[38;5;82m✓\033[0m {name}: rx={data['self_hosted'][name]['rx_gb']}GB tx={data['self_hosted'][name]['tx_gb']}GB")

# === 5. GEMATRIA (edge) ===
gematria_rx = ssh_cmd('pi@192.168.4.49',
    "ssh -o ConnectTimeout=3 root@10.8.0.1 'cat /sys/class/net/eth0/statistics/rx_bytes 2>/dev/null || echo 0'")
gematria_tx = ssh_cmd('pi@192.168.4.49',
    "ssh -o ConnectTimeout=3 root@10.8.0.1 'cat /sys/class/net/eth0/statistics/tx_bytes 2>/dev/null || echo 0'")
data['self_hosted']['gematria'] = {
    'rx_gb': round(int(gematria_rx)/(1024**3), 2) if gematria_rx.isdigit() else 0,
    'tx_gb': round(int(gematria_tx)/(1024**3), 2) if gematria_tx.isdigit() else 0,
}
print(f"  \033[38;5;82m✓\033[0m gematria: rx={data['self_hosted']['gematria']['rx_gb']}GB tx={data['self_hosted']['gematria']['tx_gb']}GB")

# Write
out_file = os.environ.get('OUT', '/tmp/kpi-all-traffic.json')
with open(out_file, 'w') as f:
    json.dump(data, f, indent=2)

print(f"\n  \033[38;5;205m✓ ALL TRAFFIC LOCKED DOWN\033[0m")
PYEOF

ok "All traffic collected"
