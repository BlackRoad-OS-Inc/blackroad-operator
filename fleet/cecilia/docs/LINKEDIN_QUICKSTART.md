# LinkedIn CLI - Quickstart for Admins

**You're already a company admin** ✓  
This will take 3 minutes.

---

## Step 1: Create Developer App (60 sec)

1. Open: https://www.linkedin.com/developers/apps
2. Click: **Create app**
3. Fill in:
   - App name: `BlackRoad OS CLI`
   - LinkedIn Page: `BlackRoad OS, Inc.` (auto-fills)
   - Logo: Skip for now
4. Click: **Create app**
5. Go to **Auth** tab → Copy **Client ID** and **Client Secret**
6. Go to **Products** tab → Click **Request access** on "Share on LinkedIn"
7. Go back to **Auth** tab → Add redirect URL: `http://localhost:8080`

---

## Step 2: Run OAuth Setup (60 sec)

```bash
./br-linkedin setup
```

When prompted:
- Paste **Client ID**
- Paste **Client Secret**
- Browser opens → Click **Allow**
- Copy the `code` from URL (the part after `?code=`)
- Paste code in terminal

Done! Token saved to `~/.blackroad/.env.linkedin`

---

## Step 3: Verify (10 sec)

```bash
./br-linkedin verify
```

Should show:
```
✓ Token valid
✓ Access to BlackRoad OS, Inc. confirmed
```

---

## Step 4: First Post (20 sec)

```bash
./br-linkedin post "Testing LinkedIn CLI 🚀

This is a test post from terminal.
Will delete shortly."
```

Check: https://www.linkedin.com/company/111783522/

Delete test post manually from web UI.

---

## ✓ Done!

Now post anytime:
```bash
br-linkedin post "Your content here"
```

---

## Next Steps

### Add to PATH
```bash
ln -s ~/br-linkedin ~/bin/br-linkedin
```

### Post Templates
See `LINKEDIN_CLI_QUICK_REF.md` for ready-to-use post templates

### Automate
See `LINKEDIN_CLI_SETUP.md` for GitHub Actions, cron, etc.

---

**Need help?** Full docs in `LINKEDIN_CLI_SETUP.md`

**Your company:** https://www.linkedin.com/company/111783522/admin/dashboard/
