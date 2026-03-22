#!/bin/bash
# Seed the BlackRoad codex database with real operational knowledge
# Usage: ./seed-codex.sh
# Idempotent: uses INSERT OR IGNORE throughout

set -e

CODEX_DB="$HOME/.blackroad/memory/codex/codex.db"
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [ ! -f "$CODEX_DB" ]; then
    echo "ERROR: Codex database not found at $CODEX_DB"
    echo "Run memory-codex.sh init first"
    exit 1
fi

echo "Seeding BlackRoad codex database..."

###############################################################################
# SOLUTIONS (30+)
###############################################################################
sqlite3 "$CODEX_DB" <<'EOF'
INSERT OR IGNORE INTO solutions (name, category, problem, solution, code_snippet, tags, created_at, updated_at) VALUES
('SSH Tunnel for Ollama', 'networking', 'Need to access Ollama running on Alice from local Mac without exposing ports', 'Create an SSH tunnel from Mac to Alice forwarding the Ollama port (11434) to localhost', 'ssh -L 11434:127.0.0.1:11434 pi@192.168.4.49 -N', 'ssh,ollama,tunnel,alice', '2026-03-01T00:00:00Z', '2026-03-13T00:00:00Z'),

('Cloudflare Tunnel for Pi Services', 'networking', 'Need to expose Raspberry Pi services to the internet securely without port forwarding', 'Install cloudflared on each Pi, create a tunnel, and configure hostname routes in Cloudflare dashboard. Tunnels handle TLS automatically.', 'cloudflared tunnel --config /etc/cloudflared/config.yml run', 'cloudflare,tunnel,pi,security', '2026-01-15T00:00:00Z', '2026-03-13T00:00:00Z'),

('WireGuard Mesh Network', 'networking', 'Inter-node connectivity across Pi fleet and cloud droplets', 'Deploy WireGuard mesh with anastasia as hub. Each node gets a 10.8.0.x address. Peers route traffic through the hub for cross-node communication.', '[Interface]
Address = 10.8.0.x/24
PrivateKey = <key>
[Peer]
PublicKey = <hub-key>
Endpoint = anastasia:51820
AllowedIPs = 10.8.0.0/24', 'wireguard,mesh,vpn,networking', '2026-01-10T00:00:00Z', '2026-03-13T00:00:00Z'),

('Pi-hole DNS Filtering', 'dns', 'Need fleet-wide DNS filtering and ad blocking', 'Run Pi-hole on Alice as the primary DNS server. All nodes point to Alice for DNS resolution. Provides ad blocking, query logging, and local DNS entries.', NULL, 'pihole,dns,alice,filtering', '2026-01-01T00:00:00Z', '2026-03-13T00:00:00Z'),

('Flock for Cron Pile-up Prevention', 'reliability', 'Rclone cron jobs pile up when previous run has not finished, causing RAM exhaustion on Cecilia', 'Wrap cron commands with flock -n to skip execution if previous instance is still running. Cecilia had 5 stacked rclone processes consuming 6.2GB RAM.', 'flock -n /tmp/rclone-gdrive.lock rclone sync ...', 'flock,cron,rclone,cecilia,ram', '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z'),

('Systemd Mask for Crash-Looping Services', 'services', 'rpi-connect-wayvnc on Cecilia crash-loops endlessly, consuming resources', 'Use systemctl mask to completely prevent the service from starting, even if other services try to activate it. Must mask both system and user instances.', 'sudo systemctl mask rpi-connect-wayvnc.service
systemctl --user mask rpi-connect-wayvnc.service', 'systemd,mask,crash-loop,cecilia', '2026-03-05T00:00:00Z', '2026-03-13T00:00:00Z'),

('GPU Memory Reduction for Headless Pi', 'performance', 'Headless Raspberry Pi nodes waste RAM on GPU memory allocation', 'Set gpu_mem=16 in /boot/firmware/config.txt to allocate minimum GPU memory on headless Pi nodes. Frees up to 240MB RAM (from default 256MB).', 'echo "gpu_mem=16" | sudo tee -a /boot/firmware/config.txt', 'gpu_mem,config.txt,ram,headless,pi', '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z'),

('Conservative CPU Governor for Power', 'performance', 'Pi nodes run at max frequency consuming excessive power and generating heat', 'Set CPU governor to conservative mode. Scales frequency based on load instead of running at max. Reduces power consumption and thermals.', 'echo conservative | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor', 'governor,power,cpu,conservative', '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z'),

('tmpfiles.d for Governor Persistence on Pi 5', 'performance', 'Pi 5 kernel ignores governor setting from cmdline.txt, resets to ondemand on boot', 'Use systemd-tmpfiles with /etc/tmpfiles.d/ to write the governor on every boot. Pi 5 kernel does not read cpu governor from cmdline.txt.', 'echo "w /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor - - - - conservative" | sudo tee /etc/tmpfiles.d/cpu-governor.conf', 'tmpfiles.d,governor,pi5,persistence', '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z'),

('Ollama Model Unloading', 'memory', 'Ollama models remain loaded in RAM after use, consuming GBs of memory (Cecilia hit 91% RAM)', 'Use ollama stop or the API to unload models when not in use. On Cecilia, 16 loaded models consumed 6.2GB. Kill the ollama process to force unload all.', 'ollama stop <model>
# or force unload all:
sudo systemctl restart ollama', 'ollama,ram,memory,unload,cecilia', '2026-03-13T00:00:00Z', '2026-03-13T00:00:00Z'),

('Journal Vacuum for Disk Cleanup', 'disk', 'Systemd journal logs accumulate and consume disk space on Pi nodes', 'Use journalctl --vacuum-size to limit journal size. Frees significant space especially on nodes with small SD cards.', 'sudo journalctl --vacuum-size=50M', 'journalctl,vacuum,disk,cleanup', '2026-03-13T00:00:00Z', '2026-03-13T00:00:00Z'),

('NPM Cache Clean for Disk', 'disk', 'NPM cache accumulates on build nodes, wasting disk space', 'Run npm cache clean --force to reclaim disk space. Found hundreds of MB on Alice.', 'npm cache clean --force', 'npm,cache,disk,cleanup', '2026-03-13T00:00:00Z', '2026-03-13T00:00:00Z'),

('Docker Container Prune', 'disk', 'Stopped Docker containers and dangling images accumulate disk space', 'Prune stopped containers and unused images. Aria had 141 dead containers removed.', 'docker container prune -f && docker image prune -f', 'docker,prune,disk,cleanup,aria', '2026-03-13T00:00:00Z', '2026-03-13T00:00:00Z'),

('DHCP Reservation for Stable Pi IPs', 'networking', 'Pi nodes get different IPs after reboot, breaking SSH configs and tunnel routes (Octavia: .97 → .100 → .101)', 'Configure DHCP reservations on the eero router for each Pi MAC address. Without this, DHCP lease changes break all IP-dependent configs.', NULL, 'dhcp,ip,eero,static,octavia', '2026-03-13T00:00:00Z', '2026-03-13T00:00:00Z'),

('Hailo-8 Driver Verification', 'hardware', 'Need to verify Hailo-8 AI accelerator is detected and functional on Pi 5 nodes', 'Check for /dev/hailo0 device and query with hailortcli. Both Cecilia and Octavia have 26 TOPS Hailo-8 units (52 TOPS total).', 'ls /dev/hailo0 && hailortcli fw-control identify', 'hailo,ai,accelerator,cecilia,octavia', '2026-03-01T00:00:00Z', '2026-03-13T00:00:00Z'),

('Git Relay for Gitea-GitHub Mirroring', 'git', 'Need to mirror Gitea repos on Octavia to GitHub automatically', 'github-relay.sh on Cecilia runs every 30 minutes via cron, pushing Gitea repos to GitHub. Credentials stored in ~/.github-relay.env (chmod 600).', NULL, 'git,gitea,github,mirror,relay,cecilia', '2026-03-01T00:00:00Z', '2026-03-13T00:00:00Z'),

('Stats Proxy for Fleet Telemetry', 'monitoring', 'Need centralized telemetry collection from all Pi nodes', 'stats-proxy runs on port 7890 on all nodes. Fleet collector (~/stats-blackroad/collect.sh) SSHes to all 5 Pis every 5 minutes and pushes data to the stats-blackroad Cloudflare Worker.', NULL, 'stats,telemetry,monitoring,proxy', '2026-03-13T00:00:00Z', '2026-03-13T00:00:00Z'),

('Cloudflare Workers + KV for API', 'cloudflare', 'Need serverless API endpoints for fleet data without managing servers', 'Deploy Cloudflare Workers with KV binding for persistent state. stats-blackroad Worker serves /fleet, /infra, /github, /analytics endpoints.', NULL, 'cloudflare,workers,kv,api,serverless', '2026-03-13T00:00:00Z', '2026-03-13T00:00:00Z'),

('D1 for Analytics Storage', 'cloudflare', 'Need structured analytics storage with SQL queries', 'Use Cloudflare D1 (SQLite at edge) for analytics. analytics-blackroad Worker stores pageviews, events, sessions in D1.', NULL, 'cloudflare,d1,analytics,sqlite', '2026-03-13T00:00:00Z', '2026-03-13T00:00:00Z'),

('R2 for Asset Storage', 'cloudflare', 'Need object storage for images and assets without egress fees', 'Use Cloudflare R2 for binary asset storage. Zero egress fees, S3-compatible API.', NULL, 'cloudflare,r2,storage,assets', '2026-03-13T00:00:00Z', '2026-03-13T00:00:00Z'),

('UFW Firewall on Exposed Nodes', 'security', 'Nodes exposed to internet need firewall beyond default nftables', 'Deploy UFW with INPUT DROP policy on internet-facing nodes. Only Lucidia currently runs UFW.', 'sudo ufw default deny incoming
sudo ufw allow 22/tcp
sudo ufw enable', 'ufw,firewall,security,lucidia', '2026-03-01T00:00:00Z', '2026-03-13T00:00:00Z'),

('Chmod 600 for Secret Files', 'security', 'Secret files readable by other users on multi-user Pi nodes', 'Always chmod 600 any file containing credentials, tokens, or API keys. Prevents other users from reading secrets.', 'chmod 600 ~/.github-relay.env /opt/blackroad/stats-push.env', 'chmod,secrets,security,permissions', '2026-03-12T00:00:00Z', '2026-03-13T00:00:00Z'),

('Env Files Instead of Plaintext Creds', 'security', 'Secrets embedded directly in crontab entries visible to any user who can read crontab', 'Move secrets from crontab lines to dedicated env files (chmod 600). Source them in cron scripts. Applied to PUSH_SECRET on all 3 stats nodes.', 'source /opt/blackroad/stats-push.env', 'env,secrets,crontab,security', '2026-03-12T00:00:00Z', '2026-03-13T00:00:00Z'),

('Power Monitor Cron', 'monitoring', 'No visibility into fleet power state, voltage, thermals', 'Deploy power-monitor.sh to all nodes via cron */5. Logs voltage, temperature, throttle status, governor to /var/log/blackroad-power.log.', '*/5 * * * * /opt/blackroad/power-monitor.sh', 'power,monitor,cron,fleet,health', '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z'),

('Heartbeat and Heal Scripts', 'reliability', 'Services crash on Pi nodes with no automatic recovery', 'Deploy heartbeat (1m) + heal (5m) cron jobs on each node. Heartbeat checks service health, heal restarts failed services. Logs to ~/.blackroad-autonomy/cron.log.', NULL, 'heartbeat,heal,autonomy,self-healing', '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z'),

('Swap Management for SD Longevity', 'storage', 'Excessive swap writes degrade SD card lifespan on Pi nodes', 'Set vm.swappiness=10 to minimize swap usage. Monitor swap growth (Lucidia at 1.3GB/8.5GB with SD card errors).', 'echo "vm.swappiness=10" | sudo tee /etc/sysctl.d/99-blackroad-power.conf', 'swap,sd-card,swappiness,longevity', '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z'),

('Undervoltage Detection', 'hardware', 'Pi nodes throttle silently due to insufficient power supply', 'Check throttle status with vcgencmd get_throttled. Value 0x50005 means undervoltage detected. Cecilia at 0.87V, Octavia at 0.75V before fix.', 'vcgencmd get_throttled
vcgencmd measure_volts', 'undervoltage,throttle,vcgencmd,power', '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z'),

('Pi 5 arm_freq cmdline.txt Workaround', 'hardware', 'Pi 5 kernel ignores arm_freq parameter in cmdline.txt for frequency control', 'Use config.txt for frequency settings and tmpfiles.d for governor. Pi 5 kernel has different boot parameter handling than Pi 4.', NULL, 'pi5,arm_freq,cmdline,kernel', '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z'),

('rc.local for vcio Persistence', 'hardware', 'udev rule for vcio device permissions does not fire reliably on boot', 'Fall back to /etc/rc.local for setting vcio permissions when udev rules fail. Applied on Cecilia after udev rule did not trigger.', 'chmod 666 /dev/vcio', 'rc.local,vcio,udev,persistence,cecilia', '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z'),

('bind-dynamic for dnsmasq', 'dns', 'dnsmasq with bind-interfaces fails on multi-interface hosts when interfaces come up after dnsmasq starts', 'Use bind-dynamic instead of bind-interfaces in dnsmasq config. Allows dnsmasq to bind to interfaces as they appear. Fixed Cecilia DNS.', 'bind-dynamic
listen-address=192.168.4.96', 'dnsmasq,bind-dynamic,dns,cecilia', '2026-03-10T00:00:00Z', '2026-03-13T00:00:00Z'),

('Dirty Ratio Tuning for Write Performance', 'performance', 'Frequent small writes to SD card cause I/O bottlenecks', 'Set vm.dirty_ratio=40 to allow more dirty pages before forcing writeout. Reduces write frequency at cost of slightly more data at risk on crash.', 'echo "vm.dirty_ratio=40" | sudo tee -a /etc/sysctl.d/99-blackroad-power.conf', 'dirty_ratio,sysctl,io,performance', '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z'),

('WiFi Power Management', 'power', 'WiFi adapters consume power even when idle', 'Enable WiFi power management on all fleet nodes to allow the adapter to sleep during idle periods.', 'sudo iw dev wlan0 set power_save on', 'wifi,power,management,fleet', '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z');
EOF

echo "  Solutions seeded."

###############################################################################
# PATTERNS (20+)
###############################################################################
sqlite3 "$CODEX_DB" <<'EOF'
INSERT OR IGNORE INTO patterns (pattern_name, pattern_type, description, when_to_use, example, confidence, first_seen, last_seen, tags) VALUES
('Fleet Health Check Workflow', 'workflow', 'SSH into each Pi node, probe services and system metrics, push aggregated stats to Cloudflare Worker API', 'Every 5 minutes via cron on Mac. Used by stats-blackroad collector.', 'for pi in alice cecilia octavia aria lucidia; do ssh $pi "uptime && df -h && vcgencmd measure_temp"; done | push_to_api', 0.95, '2026-03-13T00:00:00Z', '2026-03-13T00:00:00Z', 'fleet,health,ssh,monitoring'),

('Service Restart Cascade', 'workflow', 'Detect failed service via health check, attempt restart, verify service came back, log outcome. Escalate if restart fails.', 'When heartbeat/heal cron detects a down service on any Pi node.', 'systemctl is-active ollama || (systemctl restart ollama && sleep 2 && systemctl is-active ollama && echo OK || echo FAIL)', 0.90, '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z', 'restart,cascade,healing'),

('Cron Job Hardening', 'reliability', 'Wrap cron jobs with flock for mutual exclusion, source env files for secrets, redirect stderr to log files, add error notifications', 'All cron jobs on fleet nodes, especially rclone, collectors, and relay scripts.', '*/30 * * * * flock -n /tmp/sync.lock bash -c "source ~/.env && /opt/sync.sh" >> /var/log/sync.log 2>&1', 0.95, '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z', 'cron,flock,hardening,reliability'),

('Pi Deployment Pattern', 'workflow', 'SSH to target Pi, copy script, execute with verification, commit results to memory/git', 'Any time deploying scripts, configs, or services to fleet nodes.', 'scp script.sh pi@node:~/ && ssh pi@node "chmod +x ~/script.sh && ~/script.sh" && verify_result', 0.90, '2026-01-15T00:00:00Z', '2026-03-13T00:00:00Z', 'deploy,ssh,pi,fleet'),

('Cloudflare Deploy Pattern', 'workflow', 'Build with wrangler, deploy to Cloudflare, verify endpoint responds, update DNS if needed', 'Deploying Workers, Pages, or updating KV/D1/R2 resources.', 'npm run build && npx wrangler deploy && curl -s https://endpoint/health | jq .status', 0.95, '2026-03-13T00:00:00Z', '2026-03-13T00:00:00Z', 'cloudflare,wrangler,deploy'),

('Git Sync Pattern', 'workflow', 'Commit locally, push to Gitea on Octavia, github-relay mirrors to GitHub every 30 minutes', 'All code changes across the fleet. Gitea is source of truth, GitHub is public mirror.', 'git push gitea main  # relay cron handles GitHub push', 0.90, '2026-03-01T00:00:00Z', '2026-03-13T00:00:00Z', 'git,gitea,github,sync,relay'),

('Memory System Update', 'workflow', 'Log observation to journal, synthesize into patterns, export to MEMORY.md and codex database', 'After any significant fleet operation, incident, or discovery.', 'memory-journal.sh log "event" && memory-synthesis.sh && memory-codex.sh export', 0.85, '2026-03-01T00:00:00Z', '2026-03-13T00:00:00Z', 'memory,journal,synthesis,codex'),

('Power Optimization Workflow', 'workflow', 'Set conservative governor, reduce gpu_mem, remove overclock, tune sysctl, verify with vcgencmd, persist with tmpfiles.d', 'When deploying or optimizing any Pi node for power efficiency.', '1. config.txt: gpu_mem=16
2. sysctl: swappiness=10, dirty_ratio=40
3. governor: conservative via tmpfiles.d
4. remove over_voltage/arm_freq overclock
5. verify: vcgencmd get_throttled → 0x0', 0.95, '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z', 'power,optimization,governor,gpu_mem'),

('Disk Cleanup Workflow', 'workflow', 'Vacuum journals, clean npm cache, prune Docker, rotate/compress logs. In that priority order.', 'When any node exceeds 80% disk usage.', 'journalctl --vacuum-size=50M && npm cache clean --force && docker container prune -f && find /var/log -name "*.gz" -mtime +30 -delete', 0.95, '2026-03-13T00:00:00Z', '2026-03-13T00:00:00Z', 'disk,cleanup,journal,docker,npm'),

('Security Hardening Pattern', 'security', 'Find plaintext secrets in crontabs/services/scripts, move to env files with chmod 600, update references, verify', 'During security audit or when adding new secrets to any node.', '1. grep -r "ghp_\|gho_\|token=" /etc/cron* ~/.config/systemd/
2. Move to /opt/blackroad/*.env (chmod 600)
3. Update scripts to source env file
4. Verify: crontab -l | grep -v token', 0.95, '2026-03-12T00:00:00Z', '2026-03-13T00:00:00Z', 'security,secrets,env,chmod'),

('RoadNet AP Deployment', 'workflow', 'Deploy hostapd access point on each Pi with unique channel, configure DHCP subnet, enable NAT, set up Pi-hole forwarding', 'Setting up or reconfiguring the RoadNet mesh WiFi network across fleet.', 'Channels: Alice=1, Cecilia=6, Octavia=11, Aria=1, Lucidia=11
Subnets: 10.10.{1-5}.0/24', 0.85, '2026-03-01T00:00:00Z', '2026-03-13T00:00:00Z', 'roadnet,wifi,hostapd,mesh'),

('Node Reboot Verification', 'workflow', 'Reboot node, wait for SSH, verify services came up, check IP assignment, confirm no throttling', 'After config.txt changes, kernel updates, or power optimization.', 'ssh pi@node "sudo reboot" && sleep 60 && ssh pi@node "uptime && vcgencmd get_throttled && systemctl is-active ollama"', 0.90, '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z', 'reboot,verify,services,boot'),

('Incident Response Workflow', 'workflow', 'Detect anomaly → diagnose root cause → apply fix → verify → document in memory system', 'Any fleet incident: overheating, service crash, security finding.', NULL, 0.90, '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z', 'incident,response,diagnosis'),

('Docker Swarm Service Deploy', 'workflow', 'Create service on Swarm leader (Octavia), set replicas, configure restart policy, verify across nodes', 'Deploying distributed services across the Pi fleet.', 'docker service create --name svc --replicas 2 --restart-condition on-failure image:tag', 0.75, '2026-03-01T00:00:00Z', '2026-03-13T00:00:00Z', 'docker,swarm,deploy,octavia'),

('Tunnel Hostname Configuration', 'workflow', 'Map subdomain to local service port in cloudflared config, restart tunnel, verify DNS propagation', 'Adding new services to Cloudflare tunnel ingress on any Pi.', 'ingress:
  - hostname: svc.blackroad.io
    service: http://localhost:PORT', 0.90, '2026-01-15T00:00:00Z', '2026-03-13T00:00:00Z', 'cloudflare,tunnel,hostname,dns'),

('Ollama Model Management', 'workflow', 'Pull model, verify size fits RAM budget, test generation, add to heal script monitoring, unload when idle', 'Adding or updating Ollama models on fleet nodes.', 'ollama pull model:tag && ollama run model:tag "test" && ollama stop model:tag', 0.85, '2026-03-01T00:00:00Z', '2026-03-13T00:00:00Z', 'ollama,model,pull,management'),

('SSH Key Audit Pattern', 'security', 'List all authorized_keys entries, identify unused/unknown keys, cross-reference with known users, remove stale keys', 'During security audits. Alice and Octavia have 50+ keys each.', 'wc -l ~/.ssh/authorized_keys && cat ~/.ssh/authorized_keys | awk "{print \$3}" | sort', 0.80, '2026-03-12T00:00:00Z', '2026-03-13T00:00:00Z', 'ssh,keys,audit,security'),

('Overclock Removal Pattern', 'hardware', 'Identify overclock params in config.txt (over_voltage, arm_freq), remove them, reboot, verify voltage and throttle', 'When Pi is undervoltage throttling due to overclock. Applied on Octavia (over_voltage=6, arm_freq=2600).', '1. grep over_voltage /boot/firmware/config.txt
2. Remove over_voltage and arm_freq lines
3. sudo reboot
4. vcgencmd get_throttled → 0x0', 0.95, '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z', 'overclock,config.txt,voltage,pi5'),

('Lucidia Service Cleanup', 'workflow', 'List all user services, identify skeleton/unused microservices, disable and stop them, measure RAM freed', 'When Lucidia or any node runs too many idle services. 16 skeleton services disabled, 800MB freed.', 'systemctl --user list-units --type=service --all | grep running
systemctl --user disable --now service-name', 0.90, '2026-03-13T00:00:00Z', '2026-03-13T00:00:00Z', 'services,cleanup,lucidia,ram'),

('Fleet-Wide Command Execution', 'workflow', 'Execute same command on all Pi nodes via SSH loop, collect and compare output', 'Deploying configs, checking status, or auditing across all nodes simultaneously.', 'for node in pi@alice blackroad@cecilia pi@octavia blackroad@aria octavia@lucidia; do echo "=== $node ===" && ssh $node "command"; done', 0.90, '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z', 'fleet,ssh,loop,parallel');
EOF

echo "  Patterns seeded."

###############################################################################
# ANTI-PATTERNS (15+)
###############################################################################
sqlite3 "$CODEX_DB" <<'EOF'
INSERT OR IGNORE INTO anti_patterns (name, description, why_bad, better_approach, severity, first_detected) VALUES
('Plaintext Secrets in Crontabs', 'Embedding API tokens and passwords directly in crontab entries', 'Any user who can read crontab sees the secrets. PUSH_SECRET was exposed on 3 nodes.', 'Store secrets in env files (chmod 600), source them in cron scripts', 'CRITICAL', '2026-03-12T00:00:00Z'),

('Ollama Generate Loop', 'Calling Ollama /api/generate in a tight loop from a service (world-engine.py on Lucidia)', 'Causes CPU to peg at 100%, temperature hit 73.8°C, SD card degradation from swap thrashing', 'Add rate limiting, cooldown periods, or event-driven triggers instead of polling loops', 'CRITICAL', '2026-03-09T00:00:00Z'),

('Excessive SSH Keys', '50+ authorized_keys entries per user on Alice and Octavia', 'Impossible to audit who has access. Stale keys from old services remain valid indefinitely.', 'Audit keys quarterly, remove unused keys, use key comments for identification', 'HIGH', '2026-03-12T00:00:00Z'),

('No Flock on Cron Jobs', 'Running rclone/sync crons without flock mutual exclusion', 'Previous instances pile up if they run longer than the cron interval. Cecilia had 5 stacked rclone processes.', 'Always use flock -n on cron jobs that may overlap', 'HIGH', '2026-03-09T00:00:00Z'),

('Overclock Without Cooling', 'Setting over_voltage=6 and arm_freq=2600 on Pi 5 without active cooling upgrades', 'Causes undervoltage throttling (0x50005), reduces actual performance below stock. Octavia voltage dropped to 0.75V.', 'Use stock frequencies or ensure adequate power supply and cooling before overclocking', 'HIGH', '2026-03-09T00:00:00Z'),

('Hardcoded IPs for DHCP Hosts', 'Using hardcoded IP addresses in configs for nodes that use DHCP', 'IP changes on reboot break all references. Octavia changed from .97 to .100 to .101.', 'Configure DHCP reservations on router, or use hostnames/mDNS instead of IPs', 'HIGH', '2026-03-13T00:00:00Z'),

('Miner Services on Infrastructure', 'xmrig crypto miner service configured on Lucidia (infrastructure node)', 'Consumes CPU/power for mining instead of fleet work, potential indicator of compromise', 'Remove immediately, audit how it was installed, check other nodes', 'CRITICAL', '2026-03-12T00:00:00Z'),

('Ghost Tailscale Nodes', 'Offline Tailscale nodes (codex-infinity, shellfish, lucidia-operator) never cleaned up', 'Clutters network view, stale routes, potential security risk from forgotten authorized devices', 'Remove offline nodes after 7 days, review Tailscale admin panel regularly', 'MEDIUM', '2026-03-12T00:00:00Z'),

('Running Desktop Services on Headless Servers', 'lightdm, cups, cups-browsed running on headless Pi nodes', 'Wastes RAM and CPU on display manager and print services that will never be used', 'Disable and mask: sudo systemctl disable --now lightdm cups cups-browsed', 'MEDIUM', '2026-03-09T00:00:00Z'),

('bind-interfaces with Multi-Interface dnsmasq', 'Using bind-interfaces in dnsmasq on hosts with multiple network interfaces', 'dnsmasq fails to bind if interfaces are not up when it starts, causing DNS failures', 'Use bind-dynamic instead, which handles interfaces appearing/disappearing', 'HIGH', '2026-03-10T00:00:00Z'),

('JSON Files for High-Volume Task Storage', 'Using JSON files for storing task queues and high-volume operational data', 'JSON parsing is O(n) for reads, no indexing, file locking issues under concurrency, corruption risk', 'Use SQLite with WAL mode for concurrent access and FTS5 for searchable data', 'HIGH', '2026-03-01T00:00:00Z'),

('No Retry on Network Operations', 'Single-attempt SSH, API calls, or network syncs without retry logic', 'Transient network failures cause permanent operation failures. 36% failure rate observed.', 'Implement exponential backoff: retry 3 times with 1s, 2s, 4s delays', 'HIGH', '2026-03-01T00:00:00Z'),

('Obfuscated Cron Entries', 'Base64-encoded or obfuscated commands in crontab (Cecilia had exec from /tmp/op.py)', 'Indicates compromise: dropper script downloading and executing arbitrary code', 'Remove immediately, audit crontab contents, check /tmp for payloads, rotate credentials', 'CRITICAL', '2026-03-05T00:00:00Z'),

('Skeleton Microservices', 'Deploying placeholder/template microservices that serve no real function (16 on Lucidia)', 'Waste RAM, ports, and CPU. 16 skeleton services on Lucidia consumed ~800MB RAM total.', 'Only deploy services that are actively needed. Disable skeletons immediately.', 'MEDIUM', '2026-03-13T00:00:00Z'),

('GitHub Actions Runner Sprawl', '21 GitHub Actions runner directories consuming 19GB on Lucidia', 'Wastes disk space, stale runners may have cached credentials', 'Keep 1-2 active runners, clean up old runner directories regularly', 'MEDIUM', '2026-03-13T00:00:00Z'),

('Leaked Tokens in Service Files', 'GitHub PAT (gho_Gfu...) embedded in systemd service file on Lucidia', 'Token exposed to anyone who can read systemd unit files. Persists even after service removal.', 'Use environment files with EnvironmentFile= directive, rotate leaked tokens immediately', 'CRITICAL', '2026-03-12T00:00:00Z');
EOF

echo "  Anti-patterns seeded."

###############################################################################
# BEST PRACTICES (20+)
###############################################################################
sqlite3 "$CODEX_DB" <<'EOF'
INSERT OR IGNORE INTO best_practices (category, practice_name, description, rationale, priority, created_at) VALUES
('security', 'Use Env Files for Secrets', 'Store all secrets in dedicated env files with chmod 600, source in scripts', 'Prevents exposure via crontab -l, ps aux, or /proc. Applied fleet-wide after PUSH_SECRET leak.', 'CRITICAL', '2026-03-12T00:00:00Z'),

('power', 'Conservative CPU Governor', 'Set CPU scaling governor to conservative on all Pi fleet nodes', 'Reduces power draw and thermals. Scales frequency based on load instead of jumping to max.', 'HIGH', '2026-03-09T00:00:00Z'),

('memory', 'gpu_mem=16 for Headless Nodes', 'Set gpu_mem=16 in config.txt for all headless Raspberry Pi nodes', 'Frees up to 240MB RAM from GPU allocation that is never used on headless systems.', 'HIGH', '2026-03-09T00:00:00Z'),

('reliability', 'Flock on All Cron Jobs', 'Wrap every cron command with flock -n to prevent overlapping executions', 'Prevents resource exhaustion from piled-up processes. Critical after Cecilia rclone incident.', 'CRITICAL', '2026-03-09T00:00:00Z'),

('disk', 'Monthly Journal Vacuum', 'Run journalctl --vacuum-size=50M on all nodes monthly', 'Journals grow unbounded and are the #1 disk consumer on Pi nodes.', 'HIGH', '2026-03-13T00:00:00Z'),

('security', 'Cloudflare Tunnels Over Port Exposure', 'Use Cloudflare tunnels instead of directly exposing ports to the internet', 'Tunnels handle TLS, DDoS protection, and access control. No need to manage SSL certs.', 'CRITICAL', '2026-01-15T00:00:00Z'),

('networking', 'WireGuard for Inter-Node Traffic', 'Use WireGuard VPN for all inter-node communication in the fleet', 'Encrypted, low-overhead, kernel-level VPN. 10.8.0.x mesh connects all nodes.', 'HIGH', '2026-01-10T00:00:00Z'),

('monitoring', 'Monitor Undervoltage', 'Check vcgencmd get_throttled on every health check cycle', 'Undervoltage causes silent throttling that degrades performance. Both Cecilia and Octavia affected.', 'HIGH', '2026-03-09T00:00:00Z'),

('networking', 'Static IPs for All Pis', 'Configure DHCP reservations on eero router for every Pi MAC address', 'Prevents IP drift that breaks SSH configs, tunnel routes, and monitoring. Octavia changed 3 times.', 'HIGH', '2026-03-13T00:00:00Z'),

('monitoring', 'Power Monitor on */5 Cron', 'Run power-monitor.sh every 5 minutes on all fleet nodes', 'Catches undervoltage, overheating, and governor resets early. Logs to /var/log/blackroad-power.log.', 'HIGH', '2026-03-09T00:00:00Z'),

('reliability', 'Heartbeat and Self-Heal on All Nodes', 'Deploy heartbeat (1m) and heal (5m) cron jobs on every fleet node', 'Automatic service recovery without manual intervention. Catches ollama, stats-proxy, cloudflared failures.', 'HIGH', '2026-03-09T00:00:00Z'),

('performance', 'Disable Unused Services', 'Disable and mask lightdm, cups, cups-browsed, rpcbind, nfs-blkmap on headless nodes', 'Frees RAM and CPU. These services serve no purpose on headless Pi servers.', 'MEDIUM', '2026-03-09T00:00:00Z'),

('database', 'SQLite Transactions for Batch Ops', 'Wrap batch SQLite operations in BEGIN/COMMIT transactions', 'Without transactions, each INSERT is its own transaction with fsync. 100x slower on SD cards.', 'HIGH', '2026-03-01T00:00:00Z'),

('database', 'FTS5 for Searchable Text', 'Use FTS5 virtual tables for any text data that needs to be searched', 'Full-text search with ranking. codex_fts and memory FTS5 index (156K entries) enable fast lookups.', 'HIGH', '2026-03-01T00:00:00Z'),

('reliability', 'Atomic File Operations', 'Write to temp file first, then mv to final location', 'Prevents partial writes from corrupting config files. mv is atomic on same filesystem.', 'HIGH', '2026-03-01T00:00:00Z'),

('security', 'Audit SSH Keys Quarterly', 'Review authorized_keys on all nodes every quarter, remove unknown/unused keys', 'Alice has 53 keys, Octavia has 52. Most are likely stale from old experiments.', 'MEDIUM', '2026-03-12T00:00:00Z'),

('storage', 'SD Card Health Monitoring', 'Watch dmesg for mmc0 errors, monitor swap growth, track write amplification', 'Lucidia SD showing "Card stuck being busy!" errors. Early detection prevents data loss.', 'HIGH', '2026-03-13T00:00:00Z'),

('deployment', 'Verify After Every Deploy', 'Always curl/probe the service after deploying to confirm it is actually running', 'Silent failures are common. Services can start but crash immediately or bind to wrong port.', 'HIGH', '2026-03-01T00:00:00Z'),

('power', 'Remove Overclock Before Troubleshooting', 'First step in any Pi stability issue: remove all overclock settings from config.txt', 'Overclock + inadequate PSU = undervoltage throttling that masks the real issue.', 'HIGH', '2026-03-09T00:00:00Z'),

('networking', 'Use Node Hostnames Not IPs', 'Reference Pi nodes by hostname or .local mDNS instead of hardcoded IPs where possible', 'Survives DHCP changes. Hostnames resolve via Pi-hole or mDNS.', 'MEDIUM', '2026-03-13T00:00:00Z'),

('memory', 'Unload Ollama Models When Idle', 'Stop/unload Ollama models that are not actively being used', 'Each loaded model consumes 1-4GB RAM. Cecilia had 16 loaded models consuming 6.2GB total.', 'HIGH', '2026-03-13T00:00:00Z'),

('logging', 'Structured Logging to Files', 'Direct all cron and service output to log files with timestamps', 'Without logs, debugging fleet issues requires SSH and guesswork. Always redirect stderr.', 'MEDIUM', '2026-03-09T00:00:00Z');
EOF

echo "  Best practices seeded."

###############################################################################
# LESSONS LEARNED (10+)
###############################################################################
sqlite3 "$CODEX_DB" <<'EOF'
INSERT OR IGNORE INTO lessons_learned (title, what_happened, what_worked, what_failed, lessons, recommendations, timestamp) VALUES
('Cecilia Obfuscated Cron Dropper', 'Found base64-encoded cron entry on Cecilia that was executing code from /tmp/op.py — a dropper script', 'Removed the cron entry and /tmp/op.py payload immediately', 'Initial security audit missed it because the cron entry was obfuscated', 'Always decode and inspect obfuscated cron entries. Check /tmp for suspicious executables. Audit all cron tabs, not just root.', 'Run periodic crontab audits on all users. Block /tmp execution with noexec mount option.', '2026-03-05T00:00:00Z'),

('Lucidia Overheating from Ollama Loop', 'world-engine.py (blackroad-world.service) was calling Ollama /api/generate in a tight loop, pushing Lucidia to 73.8°C', 'Disabled the service, temperature dropped to 57.9°C within minutes', 'The service had no rate limiting or cooldown between API calls', 'Never call inference APIs in tight loops. Always add rate limiting. Monitor temperature as a proxy for runaway processes.', 'Add temperature-based throttling to all inference services. Alert at 65°C, kill at 70°C.', '2026-03-09T00:00:00Z'),

('Octavia IP Instability', 'Octavia IP changed from .97 to .100 to .101 across reboots, breaking SSH configs and tunnel routes', 'Manually updated configs each time, eventually identified need for DHCP reservation', 'No DHCP reservation was configured on eero router, static IP was never set in dhcpcd.conf', 'Always configure DHCP reservations before deploying services. IP-dependent configs are fragile.', 'Set DHCP reservations for all Pi MACs on eero. Use hostnames in configs where possible.', '2026-03-13T00:00:00Z'),

('Cecilia RAM Spike from Ollama', 'Cecilia hit 91% RAM usage. Investigation revealed 16 Ollama models stuck loaded in memory consuming 6.2GB', 'Killed 5 stacked rclone processes, stopped idle Ollama models. RAM dropped to 13%.', 'Ollama does not automatically unload models after a timeout by default. Rclone had no flock.', 'Ollama models stay loaded until explicitly stopped or Ollama is restarted. Always monitor model memory usage.', 'Set OLLAMA_KEEP_ALIVE=5m to auto-unload. Add flock to all rclone crons.', '2026-03-13T00:00:00Z'),

('Rclone Pile-up on Cecilia', 'Rclone Google Drive sync cron ran every 15 minutes but took >15 minutes to complete, causing 5 instances to pile up', 'Added flock -n to the cron entry to skip if previous run is still active', 'Original cron had no mutual exclusion mechanism', 'Any cron job that may run longer than its interval MUST use flock or similar locking.', 'Default to flock -n on all new cron jobs. Log when a lock is skipped.', '2026-03-09T00:00:00Z'),

('Alice Nginx Port 80 Conflict', 'Nginx on Alice failed to bind port 80, taking down 20+ subdomains', 'fix-nginx.sh script resolves the conflict and restarts nginx', 'Another process was binding port 80 before nginx could start', 'Have a documented recovery script for critical services. Port conflicts are common on multi-service nodes.', 'Use sudo ~/fix-nginx.sh on Alice when nginx fails. Consider systemd socket activation.', '2026-03-01T00:00:00Z'),

('Pi 5 Kernel Ignores cmdline.txt CPU Params', 'Set governor via cmdline.txt on Pi 5 but it reset to ondemand on every boot', 'Used systemd-tmpfiles (/etc/tmpfiles.d/cpu-governor.conf) to set governor on boot', 'Pi 5 kernel does not read CPU governor or arm_freq from cmdline.txt (works on Pi 4)', 'Pi 5 has different boot parameter handling than Pi 4. Always verify settings after reboot.', 'Use tmpfiles.d for Pi 5 governor persistence. Do not rely on cmdline.txt for CPU settings.', '2026-03-09T00:00:00Z'),

('Leaked GitHub PAT on Lucidia', 'GitHub Personal Access Token (gho_Gfu...) found embedded in blackroad-git-worker.service unit file', 'Removed the vault files containing the token. Service was already inactive.', 'Token was committed to a systemd service file in plaintext, token still needs rotation on GitHub', 'Never embed tokens in systemd unit files. Use EnvironmentFile= directive pointing to chmod 600 env file.', 'Rotate the leaked PAT at github.com/settings/applications. Grep fleet for any remaining plaintext tokens.', '2026-03-12T00:00:00Z'),

('xmrig Crypto Miner on Lucidia', 'xmrig.service was configured on Lucidia — a crypto mining service on an infrastructure node', 'Unit file was already gone but the configuration reference remained', 'Unknown how it was installed. Possible compromise vector or abandoned experiment.', 'Audit all systemd services on new/acquired nodes. Crypto miners indicate possible compromise.', 'Run systemctl list-unit-files | grep -i miner on all nodes. Check for suspicious CPU usage.', '2026-03-12T00:00:00Z'),

('Cecilia rpi-connect-wayvnc Crash Loop', 'rpi-connect-wayvnc service on Cecilia was crash-looping continuously, consuming CPU and filling logs', 'Masked both system and user instances of the service', 'Simply stopping or disabling was not enough — systemd kept restarting it due to dependency chain', 'Some services need to be masked (not just disabled) to truly prevent them from starting. Check both system and user service instances.', 'Use systemctl mask for services that should never run. Always check user services too.', '2026-03-05T00:00:00Z'),

('Octavia Overclock Undervoltage', 'Octavia had over_voltage=6 and arm_freq=2600 in config.txt, causing voltage to drop to 0.75V with throttle flag 0x50005', 'Removed overclock settings, voltage improved to 0.845V (+95mV), throttle cleared', 'Overclock was set without confirming PSU could deliver adequate current', 'Pi 5 at stock settings already pushes power limits. Overclocking without a beefier PSU guarantees throttling.', 'Never overclock Pi 5 on standard PSU. Check vcgencmd get_throttled after any config.txt change.', '2026-03-09T00:00:00Z'),

('Cecilia Timezone Wrong', 'Cecilia was running in wrong timezone, causing log correlation issues across fleet', 'Set timezone to America/Chicago with timedatectl', 'Timezone was never configured during initial setup', 'Always set timezone as part of node bootstrap. Mismatched timezones make log correlation impossible.', 'Add timedatectl set-timezone America/Chicago to node bootstrap scripts.', '2026-03-10T00:00:00Z');
EOF

echo "  Lessons learned seeded."

###############################################################################
# DONE
###############################################################################
echo ""
echo "Codex seeding complete. Summary:"
sqlite3 "$CODEX_DB" "SELECT 'solutions', COUNT(*) FROM solutions UNION ALL SELECT 'patterns', COUNT(*) FROM patterns UNION ALL SELECT 'best_practices', COUNT(*) FROM best_practices UNION ALL SELECT 'anti_patterns', COUNT(*) FROM anti_patterns UNION ALL SELECT 'lessons_learned', COUNT(*) FROM lessons_learned UNION ALL SELECT 'templates', COUNT(*) FROM templates;"
