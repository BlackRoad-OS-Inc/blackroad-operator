# BlackRoad Advanced Security Automation Suite

## 📦 What's Included

### 1. 🔔 Notification System
**File:** `~/security-notifications.sh`

Monitors for critical security alerts and sends notifications.

**Setup:**
```bash
# Configure Slack webhook (optional)
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Configure email (optional)
export SECURITY_EMAIL="security@blackroad.io"

# Run manually
~/security-notifications.sh

# Or schedule with cron (daily at 9 AM)
crontab -e
# Add: 0 9 * * * ~/security-notifications.sh
```

### 2. 🤖 Automated Triage Workflow
**File:** `~/security-triage-workflow.yml`

Automatically manages security alerts:
- Dismisses low-severity alerts after 90 days
- Creates GitHub issues for critical/high alerts
- Labels and categorizes alerts

**Deployment:**
```bash
# Copy to a critical repo's .github/workflows/
cp ~/security-triage-workflow.yml /path/to/repo/.github/workflows/security-triage.yml
git add .github/workflows/security-triage.yml
git commit -m "Add automated security triage workflow"
git push
```

### 3. 📊 Monthly Report Generator
**File:** `~/generate-security-report.sh`

Creates comprehensive monthly security reports.

**Usage:**
```bash
# Generate report
~/generate-security-report.sh

# Schedule monthly (1st of each month at 8 AM)
crontab -e
# Add: 0 8 1 * * ~/generate-security-report.sh
```

### 4. 🔍 Custom CodeQL Queries
**Directory:** `~/blackroad-codeql-queries/`

Custom security queries for BlackRoad-specific patterns.

**Files:**
- `codeql-config.yml` - Configuration
- `hardcoded-credentials.ql` - Detects secrets in code
- `sql-injection.ql` - Finds SQL injection risks

**Deployment:**
```bash
# Copy to critical repos
cp ~/blackroad-codeql-queries/* /path/to/repo/.github/codeql/

# Update CodeQL workflow to use custom config
# Add to .github/workflows/codeql-analysis.yml:
#   - name: Initialize CodeQL
#     uses: github/codeql-action/init@v3
#     with:
#       config-file: ./.github/codeql/codeql-config.yml
```

## 🎯 Quick Start

1. **Set up notifications:**
   ```bash
   export SLACK_WEBHOOK_URL="your-webhook-url"
   ~/security-notifications.sh
   ```

2. **Generate your first report:**
   ```bash
   ~/generate-security-report.sh
   ```

3. **Deploy triage to a repo:**
   ```bash
   cp ~/security-triage-workflow.yml BlackRoad-OS/blackroad-os/.github/workflows/
   ```

4. **Enable custom CodeQL:**
   ```bash
   cp -r ~/blackroad-codeql-queries BlackRoad-OS/blackroad-os/.github/codeql
   ```

## 📈 Monitoring

- **Dashboard:** `open ~/blackroad-security-dashboard.html`
- **Alert Scanner:** `~/check-security-alerts.sh`
- **Notifications:** `~/security-notifications.sh`
- **Reports:** `~/generate-security-report.sh`

## 🔐 Best Practices

1. Run notification scanner daily
2. Generate reports monthly
3. Review dashboard weekly
4. Triage critical alerts within 24 hours
5. Update dependencies monthly

## �� Support

For security incidents: **security@blackroad.io**

---
**BlackRoad Security Operations** | Built with ❤️ for security
