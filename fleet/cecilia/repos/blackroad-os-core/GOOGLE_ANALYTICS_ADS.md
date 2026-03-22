# Google Analytics & Ads Configuration

**Owner**: Alexa Amundson (blackroad.systems@gmail.com)
**Last Updated**: 2025-12-13

---

## Google Ads Account

**Account ID**: `375382585`
**Associated Domain**: blackroad.systems

**Access**: https://ads.google.com/aw/overview?ocid=375382585

---

## Google Analytics 4 (GA4)

**Property ID**: `513405672`
**Associated Domain**: blackroad.systems

**Access**: https://analytics.google.com/analytics/web/#/p513405672

---

## Integration with BlackRoad OS

### For Website Tracking

Add to `blackroad.io` and all BlackRoad properties:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-513405672"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-513405672');
</script>
```

**Measurement ID**: `G-513405672`

### Google Ads Conversion Tracking

```html
<!-- Google Ads Conversion -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-375382585"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-375382585');
</script>
```

---

## Tracking Events

### Agent Spawns
```javascript
gtag('event', 'agent_spawn', {
  'event_category': 'agents',
  'event_label': 'financial-analyst',
  'value': 1
});
```

### API Calls
```javascript
gtag('event', 'api_call', {
  'event_category': 'api',
  'event_label': '/chat',
  'value': 1
});
```

### User Signups
```javascript
gtag('event', 'sign_up', {
  'method': 'email'
});
```

### Payments (for BTCPay Server integration)
```javascript
gtag('event', 'purchase', {
  'transaction_id': 'tx_123',
  'value': 0.001,
  'currency': 'BTC',
  'items': [{
    'item_id': 'pack-finance',
    'item_name': 'Finance Pack',
    'price': 0.001
  }]
});
```

---

## Google Tag Manager (Recommended)

**Why GTM**: Instead of hardcoding tracking, use Google Tag Manager:
- Single container for all tags
- No code changes for new tracking
- Better performance
- A/B testing support

**Setup**:
1. Create GTM account at https://tagmanager.google.com
2. Add GTM container to all pages
3. Configure GA4 and Ads tags in GTM
4. Deploy via GTM instead of hardcoded scripts

---

## Analytics Goals

**Current Tracking**:
- Page views
- User sessions
- Bounce rate
- Geographic data

**Recommended Custom Events**:
- Agent spawns (by pack type)
- API endpoint usage
- Feature adoption
- Error rates
- Performance metrics

---

## Privacy Compliance

**GDPR/CCPA Considerations**:
- Cookie consent banner required for EU/CA users
- Anonymize IP addresses
- Allow opt-out
- Data retention policy

### Anonymize IPs (GDPR)
```javascript
gtag('config', 'G-513405672', {
  'anonymize_ip': true
});
```

### Cookie Consent Implementation
```javascript
// Only load analytics after consent
if (getCookieConsent()) {
  loadGoogleAnalytics();
}
```

---

## Ads Campaign Structure

**Recommended Campaigns**:
1. **Brand** - BlackRoad OS branded terms
2. **Agents** - AI agent keywords
3. **Developers** - Developer tools, APIs
4. **Enterprise** - Enterprise AI solutions

**Budget Allocation**:
- Start: $10/day
- Test: Different ad copy for agent packs
- Optimize: Based on conversion data

---

## Conversion Tracking Setup

### Agent Pack Purchase
```javascript
gtag('event', 'conversion', {
  'send_to': 'AW-375382585/CONVERSION_ID',
  'value': 0.001,
  'currency': 'BTC',
  'transaction_id': 'tx_123'
});
```

### API Signup
```javascript
gtag('event', 'conversion', {
  'send_to': 'AW-375382585/SIGNUP_CONVERSION_ID'
});
```

---

## Dashboard Links

**Google Analytics 4**: https://analytics.google.com/analytics/web/#/p513405672/reports/dashboard

**Google Ads**: https://ads.google.com/aw/overview?ocid=375382585

**Google Tag Manager** (if setup): https://tagmanager.google.com

---

## Integration with FastAPI Backend

Add to `main.py`:

```python
from fastapi import Request
import httpx

async def track_event(event_name: str, params: dict):
    """Send event to Google Analytics via Measurement Protocol"""
    url = "https://www.google-analytics.com/mp/collect"

    payload = {
        "client_id": "server-side-client",
        "events": [{
            "name": event_name,
            "params": params
        }]
    }

    async with httpx.AsyncClient() as client:
        await client.post(
            f"{url}?measurement_id=G-513405672&api_secret=YOUR_API_SECRET",
            json=payload
        )

# Usage
@app.post("/api/agents/spawn")
async def spawn_agent(request: Request):
    # ... spawn logic ...

    await track_event("agent_spawn", {
        "agent_type": "financial-analyst",
        "pack": "pack-finance",
        "user_id": user.id
    })
```

**Get API Secret**: Analytics > Admin > Data Streams > Measurement Protocol API secrets

---

## Reporting

### Weekly Dashboard
- Active users
- Agent spawns by type
- API usage trends
- Conversion rate
- Ad spend vs revenue

### Monthly Review
- User growth
- Feature adoption
- Performance trends
- ROI on ad spend
- Geographic expansion

---

## For K3s Deployment

When you deploy analytics tracking on K3s:

1. **Server-side tracking** via Measurement Protocol
2. **No client-side cookies** for API-only traffic
3. **Custom dimensions** for agent metadata
4. **Event streaming** to GA4 from FastAPI

**Environment Variables**:
```bash
GA4_MEASUREMENT_ID=G-513405672
GA4_API_SECRET=<your-secret>
GOOGLE_ADS_ACCOUNT=375382585
```

---

## Privacy Policy Update Required

Add to blackroad.io/privacy:

> **Analytics & Advertising**
>
> We use Google Analytics (Property ID: 513405672) to understand how our services are used. We use Google Ads (Account ID: 375382585) to reach potential users.
>
> Data collected:
> - Page views and user interactions
> - Device and browser information
> - Geographic location (anonymized)
> - Agent usage patterns
>
> You can opt out via:
> - Browser Do Not Track settings
> - Cookie preferences
> - Google Analytics Opt-out: https://tools.google.com/dlpage/gaoptout

---

**Maintained by**: Alexa Amundson
**Created**: 2025-12-13
**Source of Truth**: This file + Google Analytics/Ads dashboards
