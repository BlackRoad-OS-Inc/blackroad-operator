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
