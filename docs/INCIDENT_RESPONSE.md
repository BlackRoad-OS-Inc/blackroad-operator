# BlackRoad OS — Incident Response Playbook

## Severity Levels

| Level  | Description                  | Response Time | Examples                                               |
| ------ | ---------------------------- | ------------- | ------------------------------------------------------ |
| **P0** | Service down, data loss risk | Immediate     | All domains down, database corruption, credential leak |
| **P1** | Major feature broken         | 1 hour        | Chat/search down, Stripe broken, Pi node offline       |
| **P2** | Degraded performance         | 4 hours       | Slow responses, partial outage, cron failures          |
| **P3** | Minor issue                  | 24 hours      | UI bugs, non-critical cron, documentation              |

## Response Procedures

### P0 — Critical

1. **Identify**: Check `br cron-health`, ping all nodes, check CF dashboard
2. **Contain**: Isolate affected service, redirect traffic if possible
3. **Fix**: SSH to affected node, check logs, restart services
4. **Verify**: Run E2E tests: `bash ~/blackroad-operator/tools/test/e2e-test.sh`
5. **Log**: `memory-system.sh log incident <entity> "<details>"`

### Credential Leak

1. Rotate immediately: `gh auth refresh`, regenerate tokens
2. Check git history: `git log --all --oneline | head -50`
3. Make repos private if needed: `gh repo edit --visibility private`
4. Scan: `grep -rn "sk_live_\|ghp_\|AKIA" . --include="*.js" --include="*.py"`

### Node Offline

1. Ping: `ping -c3 192.168.4.X`
2. SSH: `ssh pi@192.168.4.X`
3. Check services: `systemctl status cloudflared gitea ollama nginx`
4. Check disk: `df -h`
5. Check load: `uptime`
6. Restart if needed: `sudo reboot`

### DNS/Domain Issues

1. Check: `dig +short domain.tld @8.8.8.8`
2. CF API: `curl -s "https://api.cloudflare.com/client/v4/zones/ZONE/dns_records" -H "Auth..."`
3. Local DNS may differ from internet — test with `--resolve` flag

## Key Contacts

- **Alexa Amundson** (CEO): amundsonalexa@gmail.com
- **Cloudflare**: dashboard.cloudflare.com
- **Stripe**: dashboard.stripe.com
- **GoDaddy**: godaddy.com (domain registrar)

## Fleet Nodes

| Node    | IP            | SSH        | Key Services                            |
| ------- | ------------- | ---------- | --------------------------------------- |
| Alice   | 192.168.4.49  | pi@        | nginx, cloudflared, Pi-hole, PostgreSQL |
| Cecilia | 192.168.4.96  | blackroad@ | Ollama, MinIO, InfluxDB                 |
| Octavia | 192.168.4.101 | pi@        | Gitea, Workers, NATS, Docker            |
| Aria    | 192.168.4.98  | blackroad@ | cloudflared                             |
| Lucidia | 192.168.4.38  | blackroad@ | nginx (334 apps), PowerDNS, Ollama      |

---

_Proprietary — BlackRoad OS, Inc. All rights reserved._
