# Secret Rotation Policy

> **Policy:** BlackRoad-Security | **Version:** 1.0 | **Owner:** CIPHER

---

## Overview

All secrets used by BlackRoad OS must be rotated on a schedule.
CIPHER is the designated guardian for secret lifecycle management.

---

## Rotation Schedule

| Secret Type | Rotation Interval | Method | Automated |
|-------------|-------------------|--------|-----------|
| API Keys (AI providers) | 90 days | Manual via vault CLI | ❌ |
| Cloudflare API Token | 180 days | CF dashboard → update GitHub Secret | ❌ |
| Railway Token | 180 days | Railway dashboard | ❌ |
| ADMIN_TOKEN (console worker) | 30 days | `openssl rand -hex 32` | ✅ |
| SSH Keys (Pi fleet) | Annual | `ssh-keygen -t ed25519` + Ansible | ❌ |
| Vault Master Key | Annual | Manual + DR backup | ❌ |
| JWT Secrets | 90 days | Auto-rotate via cron | ✅ |

---

## Automated Rotation (ADMIN_TOKEN + JWT)

```bash
#!/usr/bin/env bash
# Run monthly via cron: 0 0 1 * * /opt/blackroad/rotate-secrets.sh

set -euo pipefail

VAULT_DIR="$HOME/.blackroad/vault"
LOG="$HOME/.blackroad/audit/rotation.log"

rotate_admin_token() {
    local new_token
    new_token=$(openssl rand -hex 32)
    
    # Update Cloudflare Worker secret
    echo "$new_token" | wrangler secret put ADMIN_TOKEN --name blackroad-console
    
    # Log to PS-SHA∞ audit chain
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ROTATION admin_token SUCCESS" >> "$LOG"
    echo "✓ ADMIN_TOKEN rotated"
}

rotate_jwt_secret() {
    local new_secret
    new_secret=$(openssl rand -base64 48)
    echo "$new_secret" > "$VAULT_DIR/jwt.secret"
    chmod 400 "$VAULT_DIR/jwt.secret"
    
    # Restart API to pick up new secret
    systemctl --user restart blackroad-api 2>/dev/null || true
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ROTATION jwt_secret SUCCESS" >> "$LOG"
    echo "✓ JWT secret rotated"
}

rotate_admin_token
rotate_jwt_secret
```

---

## Manual Rotation Procedure

### AI Provider Keys

1. Generate new key in provider dashboard
2. Test new key: `curl -H "Authorization: Bearer $NEW_KEY" https://api.anthropic.com/v1/models`
3. Update GitHub Secret: `gh secret set BLACKROAD_ANTHROPIC_API_KEY --body "$NEW_KEY"`
4. Trigger deploy: `gh workflow run "Deploy All Services"`
5. Verify health: `curl https://gateway.blackroad.ai/health`
6. Revoke old key in provider dashboard
7. Log in PS-SHA∞ audit chain

### SSH Keys (Pi Fleet)

```bash
# Generate new key
ssh-keygen -t ed25519 -C "blackroad-pi-$(date +%Y)" -f ~/.ssh/blackroad_pi_new

# Distribute via Ansible
ansible-playbook ansible/pi-fleet.yaml --tags ssh-key-rotation \
  -e new_pubkey="$(cat ~/.ssh/blackroad_pi_new.pub)"

# Remove old key
ansible all -m authorized_key -a "key='OLD_KEY_HERE' state=absent"
```

---

## Emergency Revocation

If a secret is compromised, follow **immediate** revocation:

```bash
# 1. Revoke immediately at the source (provider/dashboard)
# 2. Remove from all environments
gh secret delete BLACKROAD_ANTHROPIC_API_KEY
# 3. Re-generate and re-deploy
gh secret set BLACKROAD_ANTHROPIC_API_KEY --body "$NEW_KEY"
gh workflow run "Deploy All Services"
# 4. Audit who had access (check GitHub audit log)
gh api orgs/BlackRoad-OS-Inc/audit-log --paginate -q '.[] | select(.action | startswith("secret"))'
```

---

## Vault Locations

| Secret | Location |
|--------|----------|
| Master key | `~/.blackroad/vault/.master.key` (chmod 400) |
| API keys | `~/.blackroad/vault/api-keys.enc` (AES-256-CBC) |
| SSH keys | `~/.ssh/blackroad_*` (chmod 600) |
| JWT secrets | `~/.blackroad/vault/jwt.secret` (chmod 400) |
