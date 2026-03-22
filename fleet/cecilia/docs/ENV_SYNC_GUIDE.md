# BlackRoad Environment Template Sync Guide

## Quick Start

### 1. Dry Run (Test Mode)
```bash
DRY_RUN=true ~/sync-env-templates.sh
```
This shows what would be synced without making changes.

### 2. Sync Local Repositories
```bash
~/sync-env-templates.sh
```
When prompted about GitHub sync, press `N` to only sync local repos.

### 3. Commit and Push Changes
```bash
~/commit-env-sync.sh
```
Commits and pushes all `.env.example` changes across repositories.

### 4. Full Sync (Local + GitHub)
```bash
~/sync-env-templates.sh
```
When prompted about GitHub sync, press `Y` to sync all orgs.

## What Gets Synced?

### Canonical Template Source
`~/blackroad-os-infra/templates/.env.example`

This comprehensive template includes:
- Environment configuration (local/staging/prod)
- Service information and versioning
- Server configuration
- Service dependencies (Core, API)
- Database configuration
- Authentication & security (JWT, NextAuth)
- Logging & monitoring (Sentry)
- Analytics
- Worker configuration
- API configuration (timeouts, rate limits)
- Feature flags
- Third-party services (Stripe, SendGrid)
- Next.js specific settings
- Build configuration
- Security best practices

### Target Repositories

#### Local Repositories
- All `~/blackroad-os-*` directories
- All `~/services/*` subdirectories
- Specific projects:
  - ~/blackroad
  - ~/blackroad-api
  - ~/blackroad-apps
  - ~/blackroad-platform
  - ~/blackroad-io
  - ~/roadapi
  - ~/roadauth
  - ~/roadbilling
  - ~/roadcommand
  - ~/roadgateway

#### GitHub Organizations
- BlackRoad-OS
- BlackRoad-AI
- BlackRoad-Labs
- BlackRoad-Cloud
- BlackRoad-Ventures
- BlackRoad-Foundation
- BlackRoad-Media
- BlackRoad-Hardware
- BlackRoad-Education
- BlackRoad-Gov
- BlackRoad-Security
- BlackRoad-Interactive
- BlackRoad-Archive
- BlackRoad-Studio
- Blackbox-Enterprises

## Log Files

Each sync creates a timestamped log:
```
~/.blackroad-env-sync-YYYYMMDD-HHMMSS.log
```

View the latest log:
```bash
ls -lt ~/.blackroad-env-sync-*.log | head -1 | xargs cat
```

## Workflow

### Standard Workflow
1. **Test**: `DRY_RUN=true ~/sync-env-templates.sh`
2. **Sync Local**: `~/sync-env-templates.sh` (answer N to GitHub)
3. **Review Changes**: Check a few repos to verify
4. **Commit**: `~/commit-env-sync.sh`
5. **Verify**: Check a few GitHub repos

### GitHub Sync Workflow
1. Run standard workflow first
2. Then run: `~/sync-env-templates.sh` (answer Y to GitHub)
3. Review changes in cloned repos: `~/github-repos/`
4. Run: `~/commit-env-sync.sh` to push all

## Manual Override

To sync a specific directory:
```bash
cp ~/blackroad-os-infra/templates/.env.example /path/to/repo/.env.example
```

## Updating the Canonical Template

1. Edit: `~/blackroad-os-infra/templates/.env.example`
2. Test your changes in one repo
3. Run sync script to propagate to all repos
4. Commit and push

## Troubleshooting

### "Canonical template not found"
Check that `~/blackroad-os-infra/templates/.env.example` exists.

### "Not a git repo" warnings
These are expected for non-git directories. They're safely skipped.

### "Failed to clone" errors
Check your GitHub authentication:
```bash
gh auth status
```

### Repos not syncing
Ensure directories exist and contain `.git`:
```bash
ls -la /path/to/repo/.git
```

## Best Practices

1. **Always test first**: Use `DRY_RUN=true`
2. **Review changes**: Don't blindly commit
3. **Update incrementally**: Sync local first, then GitHub
4. **Keep secrets out**: Never commit actual `.env` files
5. **Document custom vars**: Add comments to template for new variables
6. **Version control**: The template is in git, so you can revert if needed

## Environment Variable Priority

For services, environment variables are loaded in this order:
1. `.env.local` (local development, git-ignored)
2. `.env.production` or `.env.staging` (deployment)
3. Platform secrets (Railway, Vercel, Cloudflare)
4. `.env.example` (documentation only, never used at runtime)

## Security Checklist

- [ ] .env files are in .gitignore
- [ ] .env.example contains no real secrets
- [ ] Production secrets are in platform secret managers
- [ ] Secrets are rotated regularly
- [ ] Different secrets for each environment
- [ ] JWT secrets are strong (32+ characters)
- [ ] Database URLs don't contain plain passwords in docs

## Stats & Monitoring

After running sync, check:
```bash
# Count synced repos
grep "✓ Synced:" ~/.blackroad-env-sync-*.log | wc -l

# View skipped repos
grep "⚠" ~/.blackroad-env-sync-*.log

# View errors
grep "✗" ~/.blackroad-env-sync-*.log
```

## Need Help?

- Check the log file for details
- Run in dry-run mode to see what would happen
- Review the canonical template for examples
- Check individual repo .env.example files

## Advanced: Custom Templates Per Org

If you need org-specific templates:
1. Create: `~/blackroad-os-infra/templates/.env.example.{org}`
2. Modify sync script to use org-specific template
3. Or manually sync specific orgs with custom templates
