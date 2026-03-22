# START HERE - LinkedIn Setup in 3 Steps

## Right Now - Do These 3 Things

### STEP 1: Open LinkedIn Developers (2 minutes)

**Open this URL in your browser:**
```
https://www.linkedin.com/developers/apps
```

**Then:**
1. Click the blue "Create app" button
2. Fill in:
   - **App name:** BlackRoad OS CLI
   - **LinkedIn Page:** Type "BlackRoad OS" and select your company
   - **App logo:** Upload any image (can change later)
   - **Privacy policy:** https://blackroad.io/privacy
   - Check: "I agree to LinkedIn API Terms"
3. Click "Create app"

---

### STEP 2: Get Your Credentials (1 minute)

After creating the app, you'll see the dashboard.

**Click "Auth" tab** (left side)

**Copy these 2 values:**

1. **Client ID** 
   - Shows on screen (looks like: `78abc123456`)
   - Copy it

2. **Client Secret**
   - Click "View" to reveal
   - Copy it

**Keep browser open - you need to request products next**

---

### STEP 3: Request Products (1 minute)

**Click "Products" tab** (left side)

**Find and request these 2 products:**

1. "Share on LinkedIn"
   - Click "Request access"
   - Should say "Access granted" immediately

2. "Sign In with LinkedIn using OpenID Connect"  
   - Click "Request access"
   - Should say "Access granted" immediately

**If they say "Pending review"** - wait 5 minutes and refresh

---

## Done with Browser? Now Terminal

Open your terminal and run:

```bash
# Step 1: Configure with your credentials
./linkedin-post.sh setup

# It will ask for:
# Client ID: [paste the ID you copied]
# Client Secret: [paste the secret you copied]

# Step 2: Authenticate (opens browser)
./linkedin-post.sh auth

# Follow the browser prompts:
# 1. Click "Allow" to approve
# 2. You'll see: http://localhost:8080/?code=...
# 3. Copy the "code" part after ?code=
# 4. Paste it in terminal

# Step 3: Verify it worked
./linkedin-post.sh verify

# Should say: ✓ Access verified for BlackRoad OS, Inc.
```

---

## If It Works - Post Your First Update

```bash
./linkedin-post.sh post "🛣️ BlackRoad OS is live. 

Building privacy-first AI infrastructure that empowers organizations to deploy intelligent agents with full auditability and control.

Learn more: https://blackroad.io"
```

---

## Stuck? Check These

### "Can't create app"
- Make sure you're logged into LinkedIn
- Make sure you're an admin of "BlackRoad OS, Inc." page
- Go to: https://www.linkedin.com/company/blackroad-os-inc/admin/

### "Can't find my company page"
- Type full name: "BlackRoad OS, Inc."
- If still not showing, you might not be an admin
- Need to be added as admin first

### "Products say pending"
- Wait 5-10 minutes
- Refresh the page
- If still pending after 1 hour, contact LinkedIn support

### "Auth failed"
- Go back to app → Auth tab
- Make sure redirect URL is: http://localhost:8080
- Click "Update" to save
- Try ./linkedin-post.sh auth again

### "No access to organization"
- Verify you're admin of the company page
- Check "Products" are approved (not pending)
- Re-run: ./linkedin-post.sh auth

---

## Need More Help?

**View detailed guides:**
```bash
cat LINKEDIN_APP_SETUP_GUIDE.md    # Detailed setup
cat LINKEDIN_FIRST_POST.md          # Post options
cat LINKEDIN_CONTENT_CALENDAR.md   # 30-day plan
```

**Test each step:**
```bash
./linkedin-post.sh help             # Show all commands
```

---

## Quick Test (Without Posting)

Want to verify everything works before posting?

```bash
# 1. Check config exists
ls -la ~/.blackroad/linkedin-config

# 2. Check token exists
ls -la ~/.blackroad/linkedin-token

# 3. Verify access (read-only, safe)
./linkedin-post.sh verify
```

If all 3 work, you're ready to post!

---

## The Absolute Minimum Path

Too much info? Here's the shortest path:

1. **Open:** https://www.linkedin.com/developers/apps
2. **Click:** Create app → Fill form → Get Client ID + Secret
3. **Click:** Products tab → Request "Share on LinkedIn"
4. **Run:** `./linkedin-post.sh setup` (paste credentials)
5. **Run:** `./linkedin-post.sh auth` (approve in browser)
6. **Run:** `./linkedin-post.sh post "Test message"`

Done.

---

**Where are you stuck? Tell me:**
- "Can't create app" 
- "Don't have credentials"
- "Auth failed"
- "Need to verify company page access"
- "Ready to post but want to review text first"

I'll help with exactly what you need next.
