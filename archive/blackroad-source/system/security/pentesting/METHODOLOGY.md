# BlackRoad Penetration Testing Methodology

## Phases

### Phase 1: Passive Recon
- DNS enumeration
- OSINT (GitHub, LinkedIn, Shodan)
- Certificate transparency logs
- `scripts/recon.sh <target>`

### Phase 2: Active Scanning  
- Port scanning (nmap)
- Service fingerprinting
- Web crawling (gospider)

### Phase 3: Vulnerability Assessment
- Web app scanning (ZAP via `BlackRoad-Security/blackroad-zap`)
- Secret scanning (TruffleHog via `BlackRoad-Security/blackroad-trufflehog`)
- Container scanning (Trivy via `BlackRoad-Security/blackroad-trivy`)
- API testing: `scripts/api-security-test.sh <target>`

### Phase 4: Exploitation (Authorized Only)
> **⚠ Only run on BlackRoad-owned infrastructure with explicit written authorization**
- Document all findings in `templates/pentest-report.md`
- CVSS scoring for each finding
- Remediation recommendations

### Phase 5: Reporting
- Executive summary
- Technical findings (Critical → Low)
- Remediation roadmap
- Retest schedule

## Authorized Targets
- `127.0.0.1:8787` — Local BlackRoad gateway
- `192.168.4.*` — Pi fleet (local network only)
- Staging environments only — never production without approval

## Tools
| Tool | Purpose | Location |
|------|---------|----------|
| nmap | Port scanning | `apt install nmap` |
| ZAP | Web app scanning | `BlackRoad-Security/blackroad-zap` |
| TruffleHog | Secret scanning | `BlackRoad-Security/blackroad-trufflehog` |
| Trivy | Vuln scanning | `BlackRoad-Security/blackroad-trivy` |
| Custom | API tests | `scripts/api-security-test.sh` |
