# LinkedIn Developer App Setup Guide
# Step-by-step instructions for creating the app

## Step 1: Access LinkedIn Developers Portal

**URL:** https://www.linkedin.com/developers/apps

**Actions:**
1. Click "Create app" button (top right)
2. You'll need to be signed in to LinkedIn
3. You'll need to be an admin of "BlackRoad OS, Inc." company page

---

## Step 2: Fill Out App Information

### Basic Information

**App name:** `BlackRoad OS CLI`

**LinkedIn Page:** 
- Search for: "BlackRoad OS, Inc."
- Select it from dropdown
- (This associates the app with your company page)

**Privacy policy URL:** `https://blackroad.io/privacy`
- (You can add this later if you don't have it yet)

**App logo:**
- Upload any 300x300px image
- Use BlackRoad logo or placeholder
- (You can change this later)

**Legal agreement:**
- ✅ Check "I have read and agree to the LinkedIn API Terms of Use"

**Click:** "Create app"

---

## Step 3: Note Your Credentials

After creation, you'll see the **Auth** tab:

**Find these two values:**

1. **Client ID**
   - Long alphanumeric string
   - Example: `78a4bc123456789`
   - Copy this

2. **Client Secret**
   - Click "View" to reveal
   - Copy immediately (you can always view it again)
   - Keep this SECRET

**Save both to a secure location temporarily**

---

## Step 4: Request Products (CRITICAL)

### Navigate to Products Tab

Click **"Products"** in left sidebar

### Request These Products:

**1. Share on LinkedIn**
- Click "Request access"
- Wait for approval (usually instant)
- Status should show: "Approved" or "Access granted"

**2. Sign In with LinkedIn using OpenID Connect**
- Click "Request access"  
- Wait for approval (usually instant)
- Status should show: "Approved" or "Access granted"

**Why these matter:**
- Without these, you won't have the necessary permissions
- These grant the `w_organization_social` and `r_organization_social` scopes

---

## Step 5: Verify OAuth Settings

### Navigate to Auth Tab

Click **"Auth"** in left sidebar

### OAuth 2.0 Settings

**Authorized redirect URLs for your app:**
Add this URL:
```
http://localhost:8080
```

**Click "Update"**

### Verify OAuth 2.0 Scopes

Scroll down to **"OAuth 2.0 scopes"**

You should see:
- ✅ `r_organization_social` - Read organization social data
- ✅ `w_organization_social` - Write organization social data
- ✅ `openid` - OpenID Connect
- ✅ `profile` - Basic profile
- ✅ `email` - Email address

**If you DON'T see these:**
- Go back to Products tab
- Make sure "Share on LinkedIn" is approved
- Wait a few minutes and refresh

---

## Step 6: Verify Company Page Admin Access

### Check Your Access

Go to: https://www.linkedin.com/company/blackroad-os-inc/admin/

You should see:
- ✅ You have admin access
- ✅ Company page is active
- ✅ You can post on behalf of the company

**If you DON'T have admin access:**
- You need to be added as an admin first
- Current admin can add you via: Company page → Admin tools → Page admins → Add admin

---

## Step 7: Test Access (Before CLI Setup)

### Manual API Test (Optional but Recommended)

**1. Generate Authorization URL:**

Replace `YOUR_CLIENT_ID` with your actual Client ID:

```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:8080&scope=w_organization_social%20r_organization_social
```

**2. Open in Browser**
- Paste URL in browser
- Click "Allow" to approve app
- You'll be redirected to `http://localhost:8080/?code=...`
- **Copy the `code` from the URL**

**3. Exchange Code for Token**

Replace placeholders:
```bash
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_AUTH_CODE" \
  -d "redirect_uri=http://localhost:8080" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

**4. You Should Get:**
```json
{
  "access_token": "LONG_TOKEN_STRING",
  "expires_in": 5184000
}
```

**If this works, your app is configured correctly!**

---

## Step 8: Use CLI Tool

Now that the app is set up, use the CLI:

```bash
# Configure CLI with your credentials
./linkedin-post.sh setup

# When prompted, enter:
# - Client ID: (from Step 3)
# - Client Secret: (from Step 3)

# Authenticate (opens browser)
./linkedin-post.sh auth

# Verify access
./linkedin-post.sh verify

# Post your first update
./linkedin-post.sh post "Your message here"
```

---

## Troubleshooting

### Issue: "No access to organization"

**Fix:**
1. Verify you're admin of BlackRoad OS, Inc. page
2. Check "Share on LinkedIn" product is approved
3. Re-authenticate: `./linkedin-post.sh auth`

### Issue: "Products not approved"

**Fix:**
1. Go to app → Products tab
2. Click "Request access" for each product
3. Wait 5-10 minutes
4. Refresh page - should show "Approved"
5. If still pending after 24 hours, contact LinkedIn support

### Issue: "Invalid redirect URI"

**Fix:**
1. Go to app → Auth tab
2. Under "Authorized redirect URLs"
3. Add exactly: `http://localhost:8080`
4. Click "Update"
5. Try auth again

### Issue: "Invalid client credentials"

**Fix:**
1. Double-check Client ID and Secret
2. Make sure you copied them correctly
3. No extra spaces or characters
4. Re-run: `./linkedin-post.sh setup`

---

## Security Checklist

Before going live, verify:

- ✅ Client Secret is NOT committed to git
- ✅ Access token is stored in `~/.blackroad/linkedin-token` with chmod 600
- ✅ Config file is in `~/.blackroad/linkedin-config` with chmod 600
- ✅ GitHub Secret is added for CI/CD (if using)
- ✅ Only you have access to these credentials
- ✅ App is associated with company page, not personal account

---

## What You Have Now

After completing these steps:

✅ LinkedIn Developer App created
✅ Credentials (Client ID + Secret) saved
✅ Required products approved
✅ OAuth configured correctly
✅ Company page admin access verified
✅ CLI tool ready to use

**Next:** Post your first announcement!

---

## Quick Reference

**App Name:** BlackRoad OS CLI
**Organization:** BlackRoad OS, Inc. (urn:li:organization:111783522)
**Required Scopes:** w_organization_social, r_organization_social
**Redirect URI:** http://localhost:8080
**Token Expiration:** 60 days

**Important URLs:**
- App Dashboard: https://www.linkedin.com/developers/apps
- Company Page: https://www.linkedin.com/company/blackroad-os-inc/
- API Docs: https://learn.microsoft.com/en-us/linkedin/

---

*Ready to post? Run: `./linkedin-post.sh setup`*
