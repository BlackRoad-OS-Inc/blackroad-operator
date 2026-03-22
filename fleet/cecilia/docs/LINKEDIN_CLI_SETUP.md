# BlackRoad OS LinkedIn CLI

**Post to your LinkedIn company page from terminal**

```bash
br-linkedin post "Shipping v1.0 today 🚀"
```

---

## Quick Start

### 1. Setup (One Time)
```bash
./br-linkedin setup
```

Follow the prompts:
1. Create LinkedIn Developer App
2. Get Client ID/Secret
3. Authorize via OAuth
4. Save access token

### 2. Verify
```bash
./br-linkedin verify
```

### 3. Post
```bash
./br-linkedin post "Your content here"
```

---

## Installation

### Option 1: Add to PATH (Recommended)
```bash
# Copy to bin
cp br-linkedin ~/bin/br-linkedin
chmod +x ~/bin/br-linkedin

# Or symlink
ln -s ~/br-linkedin ~/bin/br-linkedin

# Now use anywhere:
br-linkedin post "Hello world!"
```

### Option 2: Use Directly
```bash
./br-linkedin post "Hello world!"
```

---

## Detailed Setup Guide

### Step 1: Create LinkedIn Developer App

1. Go to https://www.linkedin.com/developers/apps
2. Click **Create app**
3. Fill in:
   - **App name:** BlackRoad OS CLI
   - **LinkedIn Page:** BlackRoad OS, Inc.
   - **App logo:** (optional for now)
4. Click **Create app**

### Step 2: Enable Products

In your app dashboard → **Products** tab:
- ✅ Request: **Share on LinkedIn**
- ✅ Request: **Sign In with LinkedIn**

**Required Scopes:**
- `w_organization_social` (post to company page)
- `r_organization_social` (read company page data)

### Step 3: Get Credentials

In app dashboard → **Auth** tab:
- Copy **Client ID**
- Copy **Client Secret**

Add redirect URL:
- `http://localhost:8080`

### Step 4: Run Setup
```bash
./br-linkedin setup
```

The script will:
1. Ask for Client ID/Secret
2. Open OAuth authorization URL
3. Exchange code for access token
4. Save to `~/.blackroad/.env.linkedin`

---

## Usage Examples

### Basic Post
```bash
br-linkedin post "BlackRoad OS now supports 30k+ agents"
```

### Multi-line Post
```bash
br-linkedin post "Introducing BlackRoad OS v1.0 🚀

• Sovereign AI infrastructure
• 30k+ agent orchestration
• Zero-trust compliance

Learn more: blackroad.systems"
```

### Release Announcement
```bash
br-linkedin post "🎉 BlackRoad OS v1.0 is live!

We're building the compliant AI operating system for regulated industries.

✅ Deterministic orchestration
✅ Cryptographic identity
✅ Complete audit trails

From lab to boardroom—AI that scales safely.

blackroad.systems #AICompliance #RegTech"
```

### Thought Leadership
```bash
br-linkedin post "The AI Orchestration Paradox ⚡

More agents ≠ More productivity

Without orchestration, 1,000 agents = chaos
With BlackRoad OS, they operate as a team

The difference?
• Unified identity graph
• Policy-driven governance
• Real-time coordination
• Explainable workflows

Scale without chaos. That's the promise.

#AIOrchestration #EnterpriseAI"
```

---

## Advanced Usage

### Check Token Expiry
```bash
cat ~/.blackroad/.env.linkedin | grep EXPIRES_IN
```

### Verify Permissions
```bash
br-linkedin verify
```

### Re-authenticate
```bash
br-linkedin setup
```

### Post from Script
```bash
#!/bin/bash
MESSAGE="Daily update: All systems operational ✓"
br-linkedin post "$MESSAGE"
```

### CI/CD Integration
```yaml
# .github/workflows/linkedin-post.yml
name: Post Release to LinkedIn

on:
  release:
    types: [published]

jobs:
  post:
    runs-on: ubuntu-latest
    steps:
      - name: Post to LinkedIn
        env:
          LINKEDIN_ACCESS_TOKEN: ${{ secrets.LINKEDIN_ACCESS_TOKEN }}
        run: |
          echo "LINKEDIN_ACCESS_TOKEN=$LINKEDIN_ACCESS_TOKEN" > ~/.blackroad/.env.linkedin
          ./br-linkedin post "🚀 ${{ github.event.release.name }} is live! ${{ github.event.release.html_url }}"
```

---

## Token Management

### Token Lifespan
- Access tokens expire in **60 days** (5,184,000 seconds)
- No automatic refresh (LinkedIn API limitation)
- Must re-authenticate after expiration

### Security
- Token stored in: `~/.blackroad/.env.linkedin`
- Permissions: `600` (owner read/write only)
- **Never commit** this file to git

### Token Refresh
```bash
# Re-run setup to get new token
br-linkedin setup
```

---

## Troubleshooting

### "Not configured" error
```bash
# Run setup first
br-linkedin setup
```

### "Token invalid" error
```bash
# Token expired or missing permissions
# Re-authenticate:
br-linkedin setup
```

### "Organization not found" error
- Verify you have admin access to BlackRoad OS, Inc. page
- Check that app has `w_organization_social` permission
- Re-verify: `br-linkedin verify`

### OAuth fails
- Check redirect URI is exactly: `http://localhost:8080`
- Verify app is approved for "Share on LinkedIn" product
- Try using different browser

### Post fails with 403
- Token expired → re-run `br-linkedin setup`
- Missing permissions → check app Products tab
- Not an admin → verify page admin access

---

## Architecture

### Files
```
~/br-linkedin                    # CLI script
~/.blackroad/.env.linkedin       # OAuth token (gitignored)
```

### API Endpoints
- **OAuth:** `https://www.linkedin.com/oauth/v2/authorization`
- **Token:** `https://www.linkedin.com/oauth/v2/accessToken`
- **Verify:** `https://api.linkedin.com/v2/organizationalEntityAcls`
- **Post:** `https://api.linkedin.com/v2/ugcPosts`

### Company Info
- **Name:** BlackRoad OS, Inc.
- **URN:** `urn:li:organization:111783522`
- **Page:** https://www.linkedin.com/company/blackroad-os-inc/

---

## Automation Ideas

### 1. Daily Status Update
```bash
# Add to cron
0 9 * * * /Users/alexa/br-linkedin post "Good morning! All systems operational ✓"
```

### 2. GitHub Release → LinkedIn
```bash
# On every release tag
git tag -l | tail -1 | xargs -I {} \
  br-linkedin post "🚀 Released {}: https://github.com/BlackRoad-OS/repo/releases"
```

### 3. Blog Post Mirror
```bash
# Post when new blog published
TITLE=$(grep "^# " blog/latest.md | head -1 | sed 's/# //')
LINK="https://blackroad.systems/blog/latest"
br-linkedin post "$TITLE\n\nRead more: $LINK"
```

### 4. Weekly Summary
```bash
# Friday 4pm
0 16 * * 5 /Users/alexa/scripts/weekly-linkedin-summary.sh
```

---

## Compliance Notes

### LinkedIn API Terms
- ✅ OAuth 2.0 flow (official)
- ✅ Company page posting (authorized)
- ✅ Automated posting (within limits)
- ❌ No scraping
- ❌ No follower automation
- ❌ No DM automation

### Rate Limits
- **Not officially documented**
- Recommended: Max 1 post per hour
- Avoid burst posting
- Use responsibly

### Best Practices
- **Human review:** Preview before posting
- **Engagement:** Monitor post performance manually
- **Frequency:** 1-3 posts per day max
- **Quality:** Well-written, valuable content

---

## What's Next

Once this works, we can build:

### Phase 2: Token Refresh
- Auto-refresh before expiry
- Background token rotation
- Email alerts on expiry

### Phase 3: GitHub Actions
- Post releases automatically
- Mirror blog posts
- Weekly summaries

### Phase 4: Media Support
- Upload images with posts
- Link previews
- Article sharing

### Phase 5: Advanced Features
- Schedule posts
- Draft queue
- Analytics integration
- Multi-account support

---

## Support

### Issues?
```bash
br-linkedin help
br-linkedin verify
```

### Enhancement Ideas?
File an issue or submit PR to:
https://github.com/BlackRoad-OS/blackroad-cli

---

**Built by BlackRoad OS, Inc.**  
Sovereign infrastructure for the modern enterprise.

https://blackroad.systems
