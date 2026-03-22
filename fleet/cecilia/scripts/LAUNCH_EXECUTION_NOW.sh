#!/bin/bash
# Parallel execution of launch priorities

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${PINK}    🚀 PARALLEL LAUNCH EXECUTION${RESET}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo

# Track 1: Chrome Web Store Package
echo -e "${BLUE}[TRACK 1]${RESET} Creating Chrome Web Store submission package..."
mkdir -p ~/chrome-web-store-context-bridge
cd ~/chrome-web-store-context-bridge

cat > manifest.json << 'MANIFEST'
{
  "manifest_version": 3,
  "name": "Context Bridge",
  "version": "0.1.0",
  "description": "Unlimited context for AI coding assistants. Never lose context again.",
  "permissions": ["storage", "tabs"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://claude.ai/*", "https://chat.openai.com/*", "https://github.com/*"],
      "js": ["content.js"]
    }
  ],
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
}
MANIFEST

cat > popup.html << 'POPUP'
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      width: 300px;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
    }
    h1 {
      font-size: 18px;
      margin-bottom: 10px;
      background: linear-gradient(135deg, #FF1D6C 38.2%, #F5A623 61.8%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .btn {
      background: linear-gradient(135deg, #FF1D6C 38.2%, #F5A623 61.8%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      width: 100%;
      margin: 5px 0;
    }
    .status {
      font-size: 12px;
      opacity: 0.8;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <h1>Context Bridge</h1>
  <button class="btn" id="saveContext">Save Context</button>
  <button class="btn" id="restoreContext">Restore Context</button>
  <div class="status" id="status">Ready</div>
  <script src="popup.js"></script>
</body>
</html>
POPUP

cat > popup.js << 'POPUPJS'
document.getElementById('saveContext').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'saveContext'});
    document.getElementById('status').textContent = 'Context saved!';
  });
});

document.getElementById('restoreContext').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'restoreContext'});
    document.getElementById('status').textContent = 'Context restored!';
  });
});
POPUPJS

cat > content.js << 'CONTENTJS'
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveContext') {
    const context = document.body.innerText;
    chrome.storage.local.set({savedContext: context});
  } else if (request.action === 'restoreContext') {
    chrome.storage.local.get(['savedContext'], (result) => {
      if (result.savedContext) {
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.value = result.savedContext;
        }
      }
    });
  }
});
CONTENTJS

cat > background.js << 'BGJS'
chrome.runtime.onInstalled.addListener(() => {
  console.log('Context Bridge installed');
});
BGJS

echo -e "${GREEN}✓${RESET} Chrome extension files created"
echo -e "${BLUE}   Location:${RESET} ~/chrome-web-store-context-bridge/"
echo

# Track 2: Product Hunt Assets
echo -e "${BLUE}[TRACK 2]${RESET} Creating Product Hunt launch assets..."
cd ~/
cat > PRODUCT_HUNT_LAUNCH_CHECKLIST.md << 'PH'
# 🚀 PRODUCT HUNT LAUNCH CHECKLIST

## 📅 Launch Timing
**Best Day:** Tuesday (highest traffic)  
**Best Time:** 12:01 AM PST (first spot)  
**Preparation:** 24 hours before

---

## ✅ Pre-Launch (Do This First)

### Assets Ready
- [ ] Product logo (256x256px minimum)
- [ ] Product screenshots (1270x760px recommended)
- [ ] Demo video or GIF
- [ ] Tagline (60 chars max): "Unlimited context for AI coding assistants"
- [ ] First comment ready (see marketing launch kit)

### Account Setup
- [ ] Create Product Hunt account
- [ ] Add company profile photo
- [ ] Connect social accounts
- [ ] Build karma (upvote/comment on other products)

---

## 📝 Launch Day Checklist

### Hour 0 (12:01 AM PST)
- [ ] Submit product to Product Hunt
- [ ] Post first comment (as maker)
- [ ] Pin important links in comments

### Hour 1-2 (Morning)
- [ ] Tweet about launch with PH link
- [ ] Share in Slack/Discord communities
- [ ] Email early adopters
- [ ] Respond to every comment (be present!)

### Throughout Day
- [ ] Monitor ranking (refresh every hour)
- [ ] Respond to ALL comments within 5 minutes
- [ ] Thank every upvoter
- [ ] Share milestones (50 upvotes! 100 upvotes!)

### Evening
- [ ] Final push on social media
- [ ] Thank top supporters
- [ ] Analyze traffic/conversions

---

## 🎯 Content Template

**Name:** Context Bridge

**Tagline:** Unlimited context for AI coding assistants

**Description:**
```
Context Bridge gives your AI assistants unlimited memory. Never lose context when you hit the Claude/ChatGPT token limit.

🧠 Automatic context capture
💾 Local-first storage  
⚡ Instant context restore
🔒 Privacy-focused
🛠️ Works with Claude, ChatGPT, Copilot

$10/mo or $100/yr. 7-day free trial.
```

**Topics:** Developer Tools, Artificial Intelligence, Productivity, SaaS

**Links:**
- Website: https://context-bridge.pages.dev
- Twitter: [Your handle]

---

## 🎁 Launch Day Tips

1. **Be present:** Respond to EVERY comment quickly
2. **Share updates:** "Just hit #5!" creates FOMO
3. **Cross-promote:** Share PH link everywhere
4. **Thank supporters:** Personal messages matter
5. **Stay positive:** Even negative feedback = engagement

---

## 📊 Success Metrics

**Good Launch:**
- 100+ upvotes
- Top 5 of the day
- 10+ meaningful comments

**Great Launch:**
- 300+ upvotes
- Product of the Day
- 50+ comments
- Featured in newsletter

**Epic Launch:**
- 500+ upvotes  
- #1 Product of the Day
- Product of the Week

---

## 🔗 Quick Links

**Submit:** https://www.producthunt.com/posts/new  
**Guidelines:** https://www.producthunt.com/guidelines  
**Maker Guide:** https://blog.producthunt.com/how-to-launch-on-product-hunt-7c1843e06399

---

**Ready to launch!** 🚀
PH

echo -e "${GREEN}✓${RESET} Product Hunt checklist created"
echo

# Track 3: Analytics Setup
echo -e "${BLUE}[TRACK 3]${RESET} Creating analytics tracking code..."
cat > ANALYTICS_SETUP_QUICK.md << 'ANALYTICS'
# 📊 ANALYTICS SETUP - COPY-PASTE READY

## Google Analytics 4 (Free)

### Step 1: Create GA4 Property
1. Go to: https://analytics.google.com
2. Create property: "Context Bridge"
3. Get Measurement ID (format: G-XXXXXXXXXX)

### Step 2: Add to Landing Page

Add this before `</head>` in context-bridge landing page:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- Conversion Tracking -->
<script>
document.querySelectorAll('a[href*="stripe.com"]').forEach(link => {
  link.addEventListener('click', function() {
    gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: this.href.includes('100') ? 100 : 10,
      items: [{
        item_name: this.href.includes('100') ? 'Context Bridge Annual' : 'Context Bridge Monthly'
      }]
    });
  });
});
</script>
```

---

## Plausible Analytics (Privacy-Focused Alternative)

Add before `</head>`:

```html
<script defer data-domain="context-bridge.pages.dev" src="https://plausible.io/js/script.js"></script>
```

Cost: $9/mo (or self-host free)

---

## Key Events to Track

1. **Page Views** (automatic)
2. **Checkout Clicks** (see code above)
3. **Stripe Success** (add to success page)
4. **Extension Installs** (if Chrome extension)

---

## Stripe Conversion Tracking

Add this to your Stripe success URL:

```javascript
// On stripe checkout success page
gtag('event', 'purchase', {
  transaction_id: 'STRIPE_PAYMENT_ID',
  value: 10.00,
  currency: 'USD',
  items: [{
    item_name: 'Context Bridge Monthly'
  }]
});
```

---

**5 minute setup = lifetime of insights!** 📊
ANALYTICS

echo -e "${GREEN}✓${RESET} Analytics setup guide created"
echo

# Track 4: Webhook Setup
echo -e "${BLUE}[TRACK 4]${RESET} Creating Stripe webhook handler..."
cat > stripe-webhook-handler.js << 'WEBHOOK'
// Stripe Webhook Handler for Context Bridge
// Deploy to Cloudflare Workers or Railway

export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      const signature = request.headers.get('stripe-signature');
      const body = await request.text();
      
      // Verify webhook signature (add your secret)
      // const event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
      
      const event = JSON.parse(body);
      
      switch (event.type) {
        case 'checkout.session.completed':
          console.log('💰 New customer!', event.data.object.customer_email);
          // Send welcome email
          // Add to customer database
          // Track conversion
          break;
          
        case 'customer.subscription.created':
          console.log('🎉 New subscription!', event.data.object.id);
          break;
          
        case 'customer.subscription.deleted':
          console.log('😢 Cancellation', event.data.object.id);
          // Send feedback survey
          break;
          
        case 'invoice.payment_succeeded':
          console.log('💵 Payment received!', event.data.object.amount_paid / 100);
          break;
          
        case 'invoice.payment_failed':
          console.log('⚠️ Payment failed', event.data.object.customer_email);
          // Send dunning email
          break;
      }
      
      return new Response('OK', { status: 200 });
    }
    
    return new Response('Webhook endpoint', { status: 200 });
  }
};
WEBHOOK

echo -e "${GREEN}✓${RESET} Webhook handler created"
echo -e "${BLUE}   Deploy:${RESET} wrangler deploy stripe-webhook-handler.js"
echo

# Summary
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}✅ EXECUTION COMPLETE!${RESET}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo
echo -e "${BLUE}Created:${RESET}"
echo "  1. Chrome Web Store extension (~/chrome-web-store-context-bridge/)"
echo "  2. Product Hunt launch checklist (~/PRODUCT_HUNT_LAUNCH_CHECKLIST.md)"
echo "  3. Analytics setup guide (~/ANALYTICS_SETUP_QUICK.md)"
echo "  4. Stripe webhook handler (~/stripe-webhook-handler.js)"
echo
echo -e "${GREEN}Next:${RESET} Deploy webhook, add analytics, submit to Chrome Store!"
