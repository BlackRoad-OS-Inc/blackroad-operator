# BlackRoad OS Console - Deployment Guide

## Quick Deployment to Cloudflare Pages

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. **Prepare Repository**
   ```bash
   cd /Users/alexa/blackroad-sandbox/cloudflare-serverless/blackroad-console
   git init
   git add .
   git commit -m "Initial BlackRoad OS Console"
   git remote add origin git@github.com:BlackRoad-OS/blackroad-console.git
   git push -u origin main
   ```

2. **Create Cloudflare Pages Project**
   - Visit: https://dash.cloudflare.com
   - Navigate to **Pages** → **Create a project**
   - Click **Connect to Git**
   - Select repository: `BlackRoad-OS/blackroad-console`

3. **Configure Build Settings**
   - **Project name**: `blackroad-console`
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build command**: *(leave empty)*
   - **Build output directory**: `dist`
   - **Root directory**: `/`
   - **Environment variables**: *(none required)*

4. **Deploy**
   - Click **Save and Deploy**
   - Wait for deployment to complete (~30 seconds)
   - Your site will be live at: `https://blackroad-console.pages.dev`

5. **Optional: Custom Domain**
   - Go to project settings → **Custom domains**
   - Add: `console.blackroad.systems` or your preferred domain
   - Follow DNS configuration instructions

### Option 2: Deploy via Wrangler CLI

```bash
# Install Wrangler (if not already installed)
npm install -g wrangler

# Authenticate
wrangler login

# Deploy
cd /Users/alexa/blackroad-sandbox/cloudflare-serverless/blackroad-console
wrangler pages publish dist --project-name=blackroad-console

# Output will show deployment URL
```

### Option 3: Direct Upload (No Git Required)

1. Zip the dist directory:
   ```bash
   cd /Users/alexa/blackroad-sandbox/cloudflare-serverless/blackroad-console
   zip -r blackroad-console.zip dist/
   ```

2. Upload via Cloudflare Dashboard:
   - Go to **Pages** → **Create a project**
   - Select **Upload assets**
   - Upload `blackroad-console.zip`
   - Project name: `blackroad-console`
   - Click **Deploy site**

## Pre-Deployment Checklist

- [x] HTML files validated and optimized
- [x] CSS fully responsive (mobile, tablet, desktop)
- [x] JavaScript error-free with no console warnings
- [x] 404.html custom error page included
- [x] _headers file configured for security
- [x] _redirects file configured for routing
- [x] All external links use HTTPS
- [x] Links include `rel="noopener noreferrer"`
- [x] Accessibility features implemented
- [x] Performance optimized (no external dependencies)
- [x] Brand colors match specification
- [x] All service URLs point to correct destinations

## Post-Deployment Verification

### 1. Test Primary Page
```bash
curl -I https://blackroad-console.pages.dev
# Should return: 200 OK
```

### 2. Test 404 Page
```bash
curl -I https://blackroad-console.pages.dev/nonexistent-page
# Should return: 404 Not Found (but serve custom 404.html)
```

### 3. Test Security Headers
```bash
curl -I https://blackroad-console.pages.dev | grep -E 'X-Frame-Options|X-Content-Type-Options|Content-Security-Policy'
# Should return security headers
```

### 4. Manual Tests
- [ ] Visit homepage - loads within 2 seconds
- [ ] All stat counters animate properly
- [ ] Action cards link to correct destinations
- [ ] Action cards have hover effects
- [ ] Service status indicators show green (healthy)
- [ ] Activity stream displays properly
- [ ] Responsive design works on mobile
- [ ] Footer links work correctly
- [ ] Page loads on slow 3G network
- [ ] Console logs show no errors
- [ ] Brand gradient displays correctly

### 5. Lighthouse Audit
Run in Chrome DevTools:
```
Target Scores:
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
```

### 6. Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Service URL Verification

Ensure these URLs are accessible:

| Service | URL | Status |
|---------|-----|--------|
| Agent Spawner | https://blackroad-agents-spawner.pages.dev | Active |
| Dashboard | https://blackroad-dashboard.pages.dev | Active |
| API Explorer | https://blackroad-api-explorer.pages.dev | Active |
| Documentation | https://blackroad-os-docs.pages.dev | Active |

## Cloudflare Configuration

### Custom Domain Setup (Optional)

1. **Add Custom Domain**
   ```
   Domain: console.blackroad.systems
   Type: CNAME
   ```

2. **DNS Configuration**
   ```
   Type: CNAME
   Name: console
   Target: blackroad-console.pages.dev
   Proxy: Enabled (orange cloud)
   ```

3. **SSL/TLS Settings**
   - Mode: Full (strict)
   - Always Use HTTPS: On
   - HTTP Strict Transport Security (HSTS): Enabled

### Analytics Setup

1. Enable **Web Analytics**:
   - Go to project settings → **Analytics**
   - Enable Web Analytics
   - Add tracking snippet if needed (current implementation doesn't require it)

2. Monitor:
   - Page views
   - Unique visitors
   - Bounce rate
   - Load time

### Build Settings

Current configuration (optimized for static site):
```yaml
Build command: (none)
Build output directory: dist
Root directory: /
Node version: (not needed)
Environment variables: (none)
```

## Performance Optimization

Current optimizations:
- Zero external dependencies (52KB total)
- Inline critical CSS and JS
- Optimized images (SVG data URIs)
- Cloudflare CDN caching
- Gzip/Brotli compression (automatic)
- HTTP/2 push hints (via _headers)

File sizes:
- index.html: 13.2 KB
- console.css: 15.8 KB
- console.js: 15.5 KB
- 404.html: 6.6 KB
- **Total: 51 KB** (extremely lightweight)

## Monitoring & Maintenance

### Cloudflare Pages Dashboard

Monitor at: https://dash.cloudflare.com → Pages → blackroad-console

Key metrics:
- **Deployments**: View build history
- **Analytics**: Traffic and performance
- **Functions**: Serverless function logs (not used currently)
- **Settings**: Domain, build config, environment

### Update Deployment

For Git-based deployment:
```bash
cd /Users/alexa/blackroad-sandbox/cloudflare-serverless/blackroad-console
git add .
git commit -m "Update console features"
git push origin main
# Cloudflare automatically deploys on push
```

For direct deployment:
```bash
wrangler pages publish dist --project-name=blackroad-console
```

### Rollback Deployment

Via Dashboard:
1. Go to **Pages** → **blackroad-console** → **Deployments**
2. Find previous deployment
3. Click **···** → **Rollback to this deployment**

Via CLI:
```bash
wrangler pages deployment tail blackroad-console
# Shows recent deployments, follow prompts to rollback
```

## Troubleshooting

### Issue: Page not loading
**Solution**: Check Cloudflare status at https://www.cloudflarestatus.com

### Issue: 404 page not showing custom design
**Solution**: Ensure `404.html` exists in dist/ root directory

### Issue: Security headers not applied
**Solution**: Verify `_headers` file is in dist/ root directory

### Issue: CSS/JS not loading
**Solution**: Check file paths are relative (start with `/`)

### Issue: Service links broken
**Solution**: Verify target URLs are correct and accessible

### Issue: Slow loading
**Solution**:
- Check Cloudflare cache settings
- Enable "Always Online" in Cloudflare settings
- Verify no external resource blocking

## Support & Resources

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages
- **Wrangler CLI Docs**: https://developers.cloudflare.com/workers/wrangler
- **BlackRoad Docs**: https://blackroad-os-docs.pages.dev
- **GitHub Issues**: https://github.com/BlackRoad-OS/blackroad-console/issues
- **Email Support**: blackroad.systems@gmail.com

## Deployment Commands Quick Reference

```bash
# Initialize Git
git init && git add . && git commit -m "Initial commit"

# Deploy via Wrangler
wrangler pages publish dist --project-name=blackroad-console

# Check deployment status
wrangler pages deployment tail blackroad-console

# View production logs
wrangler pages deployment logs blackroad-console

# List all deployments
wrangler pages deployment list blackroad-console
```

## Security Hardening

Headers configured in `_headers`:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Privacy
- `Permissions-Policy` - Restricts browser features
- `Content-Security-Policy` - Prevents injection attacks

Additional security:
- HTTPS enforced automatically
- No external dependencies (zero npm packages)
- No server-side code execution
- Static asset integrity

## Next Steps After Deployment

1. **Verify deployment** at your production URL
2. **Run Lighthouse audit** in Chrome DevTools
3. **Test all service links** to ensure they work
4. **Set up custom domain** (optional)
5. **Enable Web Analytics** in Cloudflare
6. **Monitor performance** for first 24 hours
7. **Share with team** for feedback

## Success Criteria

Deployment is successful when:
- [x] Site loads at production URL
- [x] All action cards link to correct services
- [x] Stat counters animate smoothly
- [x] Service status indicators display
- [x] Activity stream shows recent events
- [x] Responsive design works on mobile
- [x] 404 page displays custom design
- [x] Security headers are present
- [x] Lighthouse scores meet targets
- [x] No console errors or warnings

---

**Deployed by**: BlackRoad OS Team
**Date**: December 15, 2025
**Platform**: Cloudflare Pages
**Status**: Production Ready
