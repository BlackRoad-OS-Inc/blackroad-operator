# LinkedIn CLI Setup - RIGHT NOW

✓ **Admin Access Confirmed**  
https://www.linkedin.com/company/111783522/admin/dashboard/

Let's get you posting in 3 minutes.

---

## Step 1: Create LinkedIn Developer App (90 sec)

### 1a. Go to Developer Portal
🔗 **https://www.linkedin.com/developers/apps**

Click **"Create app"** (blue button, top right)

**Already have an app?** Skip to Step 2

### 1b. Fill in App Details
```
App name:         BlackRoad OS CLI
LinkedIn Page:    BlackRoad OS, Inc.  
                  (should auto-populate since you're admin)
App logo:         (skip for now, or upload any square image)
Legal agreement:  ✓ Check the box
```

Click **"Create app"**

### 1c. Note Your Credentials
You'll see your app dashboard. Go to **"Auth"** tab:

```
Client ID:     [copy this - looks like: 86abc123xyz789]
Client Secret: [click "Show" then copy - looks like: AbC123XyZ789...]
```

**Save these somewhere temporarily** (we'll use them in Step 2)

---

## Step 2: Enable Required Products (30 sec)

Still in your app dashboard:

### 2a. Click "Products" Tab
You'll see a list of available products

### 2b. Request Access
Find and click **"Request access"** on:
- ✅ **Share on LinkedIn** (required - instant approval for company admins)
- ✅ **Sign In with LinkedIn using OpenID Connect** (optional)

**Since you're a company admin, approval is instant** ✓

### 2c. Add Redirect URL
Go back to **"Auth"** tab, scroll to **"Redirect URLs"**

Click **"Add redirect URL"** and enter:
```
http://localhost:8080
```

Click **"Update"** or **"Save"**

---

## Step 3: Run OAuth Setup (90 sec)

Open terminal and run:

```bash
./br-linkedin setup
```

### 3a. Enter Credentials
When prompted:
```
Client ID: [paste the Client ID from Step 1c]
Client Secret: [paste the Client Secret from Step 1c]
```

### 3b. Authorize in Browser
- Browser will open to LinkedIn authorization page
- Review the permissions:
  - "Share content on your behalf"
  - "Access organization posts"
- Click **"Allow"**

### 3c. Get Auth Code
After clicking "Allow", LinkedIn redirects to:
```
http://localhost:8080/?code=AQT...very-long-code...xyz&state=...
```

**Your browser will show "Can't connect"** — that's OK!

Copy the `code` parameter from the URL. It's the long string after `code=` and before `&state`

Example:
```
http://localhost:8080/?code=AQTABCxyz123...&state=...
                            ^^^^^^^^^^^^^^^^
                            Copy this part
```

### 3d. Paste Code
Go back to terminal, paste the code when prompted

The script will:
1. Exchange code for access token
2. Save to `~/.blackroad/.env.linkedin`
3. Show success message

---

## Step 4: Verify (30 sec)

```bash
./br-linkedin verify
```

You should see:
```
✓ Token valid
✓ Access to BlackRoad OS, Inc. confirmed
```

---

## Step 5: First Post (30 sec)

```bash
./br-linkedin post "Testing LinkedIn CLI 🚀

Posting to BlackRoad OS company page from terminal.

This is a test post - will delete shortly."
```

Check your company page:
🔗 **https://www.linkedin.com/company/111783522/**

You should see your post appear instantly!

---

## Step 6: Delete Test Post

Go to your company page, find the test post, click "..." → "Delete"

---

## ✓ You're Live!

Now you can post anytime:

```bash
br-linkedin post "Your content here"
```

---

## Quick Examples

### Launch Announcement
```bash
br-linkedin post "🚀 BlackRoad OS v1.0 is live!

The compliant AI operating system for regulated industries.

• Sovereign infrastructure
• 30k+ agent orchestration  
• Zero-trust compliance

Learn more: blackroad.systems

#AI #Enterprise #RegTech"
```

### Product Update
```bash
br-linkedin post "New: Prism Console now supports real-time agent coordination.

Deploy, monitor, and govern AI agents at scale.

See it in action → blackroad.systems/prism"
```

### Thought Leadership
```bash
br-linkedin post "Why enterprises struggle with AI deployment ⚡

It's not about power—it's about governance.

BlackRoad OS provides:
✅ Deterministic orchestration
✅ Cryptographic audit trails
✅ Policy-driven compliance

Scale safely. Build confidently.

#AIGovernance #EnterpriseTech"
```

---

## Troubleshooting

### "Products not available"
→ Make sure you're logged in as admin of BlackRoad OS, Inc.  
→ Some products require LinkedIn review (wait 1-2 days)

### "Invalid redirect URI"
→ Must be exactly: `http://localhost:8080` (no trailing slash)

### "Can't open browser"
→ Copy the authorization URL and paste in browser manually

### "Code expired"
→ Auth codes expire in 30 seconds  
→ Re-run `./br-linkedin setup` and paste code faster

### "Organization not found"
→ Verify you clicked "Allow" for company posting permissions  
→ Check app has "Share on LinkedIn" product approved

---

## What's Next?

### Add to PATH
```bash
ln -s ~/br-linkedin ~/bin/br-linkedin

# Now use anywhere:
cd ~/projects
br-linkedin post "Shipping updates!"
```

### Automate with GitHub Actions
See `LINKEDIN_CLI_SETUP.md` for GitHub Actions workflow examples

### Schedule Posts
Use cron or other scheduling tools to automate posting

---

## Support

Need help? Check:
- `LINKEDIN_CLI_SETUP.md` — Full documentation
- `LINKEDIN_CLI_QUICK_REF.md` — Quick reference
- `./br-linkedin help` — Built-in help

---

**Let's go!**

Since you're already an admin, this will be fast:
1. 🔗 https://www.linkedin.com/developers/apps — Create app
2. ✅ Enable "Share on LinkedIn" product  
3. 💻 `./br-linkedin setup` — Run OAuth
4. 🚀 `./br-linkedin post "Test"` — Post!

⏱️ **3 minutes to your first post**
