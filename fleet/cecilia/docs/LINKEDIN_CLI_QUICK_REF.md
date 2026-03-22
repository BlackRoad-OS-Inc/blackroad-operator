# LinkedIn CLI Quick Reference

## One-Time Setup
```bash
./br-linkedin setup
```
→ Follow OAuth flow, save token to `~/.blackroad/.env.linkedin`

## Daily Usage
```bash
# Post
br-linkedin post "Your message here"

# Verify token
br-linkedin verify

# Help
br-linkedin help
```

## Post Templates

### 🚀 Launch Announcement
```bash
br-linkedin post "🚀 BlackRoad OS v1.0 is live!

Sovereign AI infrastructure for regulated industries

✅ 30k+ agent orchestration
✅ Zero-trust compliance
✅ Complete audit trails

blackroad.systems #AICompliance"
```

### 💡 Thought Leadership
```bash
br-linkedin post "The AI Orchestration Paradox ⚡

More agents ≠ More productivity

Without orchestration: chaos
With BlackRoad OS: coordinated teams

Scale safely. #EnterpriseAI"
```

### 📊 Product Update
```bash
br-linkedin post "New: Multi-agent workflows in Prism Console

• Real-time coordination
• Policy enforcement
• Complete audit trails

See it live: blackroad.systems/prism"
```

### 🎓 Educational Content
```bash
br-linkedin post "Why regulated industries need deterministic AI:

1. Identity verification
2. Explainable decisions
3. Audit compliance

BlackRoad OS solves all three ✓

#RegTech #FinTech"
```

### 🏆 Milestone
```bash
br-linkedin post "🏆 30,000 agents deployed

BlackRoad OS now orchestrating enterprise-scale AI

From lab to boardroom—compliant by design

#AIInfrastructure"
```

## Token Info
- **Expires:** 60 days
- **Location:** `~/.blackroad/.env.linkedin`
- **Refresh:** `br-linkedin setup`

## Troubleshooting
| Error | Fix |
|-------|-----|
| Not configured | `br-linkedin setup` |
| Token invalid | `br-linkedin setup` (re-auth) |
| 403 Forbidden | Check page admin access |
| Org not found | Verify `w_organization_social` scope |

## Best Practices
- ✅ 1-3 posts per day max
- ✅ Preview before posting
- ✅ Valuable, engaging content
- ❌ No automation spam
- ❌ No rate limit abuse

## Integration with br CLI
```bash
# Add to PATH
ln -s ~/br-linkedin ~/bin/br-linkedin

# Use with other br commands
br-stats && br-linkedin post "System stats: All operational ✓"
```

## Company Details
- **Name:** BlackRoad OS, Inc.
- **URN:** urn:li:organization:111783522
- **Page:** linkedin.com/company/blackroad-os-inc/

---
**Full docs:** `LINKEDIN_CLI_SETUP.md`
