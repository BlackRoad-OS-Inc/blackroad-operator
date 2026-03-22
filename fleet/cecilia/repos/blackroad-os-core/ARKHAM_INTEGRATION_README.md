# 🔍 Arkham Intelligence Integration for RoadChain & RoadCoin

Complete blockchain intelligence integration using Arkham Intelligence API.

## 🎯 What's Been Added

### 1. Core Arkham Client (`roadchain-api/src/services/arkham.ts`)

**Features:**
- ✅ HMAC-SHA256 authenticated API client
- ✅ Entity lookup (username/entity search)
- ✅ Address intelligence (labels, entity mapping)
- ✅ Portfolio tracking (multi-chain holdings)
- ✅ Transfer history (cross-chain transactions)
- ✅ Search functionality
- ✅ Risk scoring algorithm

**Helper Functions:**
- `enrichAddress(address)` - Get labels + entity + portfolio
- `getWalletAnalytics(address)` - Comprehensive wallet analysis with risk score

### 2. RoadChain API Endpoints (`roadchain-api/src/routes/arkham.ts`)

All endpoints available at `/api/arkham/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/entity/:nameOrUsername` | GET | Get entity by name (e.g., "alexamundson77") |
| `/address/:address` | GET | Get address intelligence |
| `/portfolio/:address` | GET | Get portfolio holdings |
| `/transfers/:address` | GET | Get transfer history |
| `/labels/:address` | GET | Get address labels |
| `/search?q=query` | GET | Search entities/addresses |
| `/enrich/:address` | GET | Get enriched address data |
| `/analytics/:address` | GET | Get wallet analytics + risk score |

### 3. Server Integration

- Auto-initialization on startup if `ARKHAM_API_KEY` is set
- Graceful degradation if API key not available
- WebSocket broadcast ready for real-time intelligence updates

---

## 🚀 Quick Start

### Step 1: Get Arkham API Key

```bash
# Visit https://platform.arkm.com/settings/api
# Create account (free)
# Generate API key
```

### Step 2: Set Environment Variable

```bash
# Option A: For this session
export ARKHAM_API_KEY='your-api-key-here'

# Option B: Permanent (add to ~/.zshrc)
echo 'export ARKHAM_API_KEY="your-key"' >> ~/.zshrc
source ~/.zshrc
```

### Step 3: Start RoadChain API

```bash
cd roadchain-api
pnpm install
pnpm dev
```

You should see:
```
✅ Arkham Intelligence API initialized
🚗 RoadChain API running on port 3000
```

### Step 4: Test Integration

```bash
# Search for entity
curl http://localhost:3000/api/arkham/entity/alexamundson77

# Get address intelligence
curl http://localhost:3000/api/arkham/address/0x3F50f12481B76B2696f2e4316CfddD08AbE8f81E

# Get wallet analytics
curl http://localhost:3000/api/arkham/analytics/0x3F50f12481B76B2696f2e4316CfddD08AbE8f81E

# Get portfolio
curl http://localhost:3000/api/arkham/portfolio/0x3F50f12481B76B2696f2e4316CfddD08AbE8f81E
```

---

## 📊 API Examples

### Entity Lookup

```bash
curl http://localhost:3000/api/arkham/entity/alexamundson77
```

**Response:**
```json
{
  "success": true,
  "entity": {
    "name": "alexamundson77",
    "type": "individual",
    "addresses": ["0x..."],
    "labels": ["developer", "early-adopter"],
    "description": "..."
  }
}
```

### Wallet Analytics

```bash
curl http://localhost:3000/api/arkham/analytics/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Response:**
```json
{
  "success": true,
  "address": "0x742d35...",
  "labels": ["exchange", "binance"],
  "portfolio": {
    "totalValueUsd": 1234567.89,
    "chains": {
      "ethereum": {
        "nativeBalance": "10.5",
        "tokens": [
          {
            "symbol": "USDC",
            "balance": "50000",
            "valueUsd": 50000
          }
        ]
      }
    }
  },
  "recentTransfers": [...],
  "riskScore": 20
}
```

**Risk Score:**
- `0-30`: Low risk (exchanges, verified projects)
- `30-70`: Medium risk (unknown wallets)
- `70-100`: High risk (mixers, exploits, sanctions)

### Transfer History

```bash
curl "http://localhost:3000/api/arkham/transfers/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?limit=5&chain=ethereum"
```

**Query Parameters:**
- `limit` - Number of transfers (default: 10)
- `offset` - Pagination offset (default: 0)
- `chain` - Filter by chain (ethereum, arbitrum, base, etc.)

---

## 🔗 Integration Examples

### Use in RoadChain Explorer

```typescript
import { enrichAddress } from './services/arkham.js';

// Enrich transaction sender/receiver with Arkham data
app.get('/api/transactions/:hash', async (req, res) => {
  const tx = roadchain.getTransaction(req.params.hash);

  // Add Arkham intelligence
  const [fromData, toData] = await Promise.all([
    enrichAddress(tx.from),
    enrichAddress(tx.to),
  ]);

  res.json({
    ...tx,
    fromLabels: fromData.labels,
    fromEntity: fromData.entity,
    toLabels: toData.labels,
    toEntity: toData.entity,
  });
});
```

### Use in RoadCoin Wallet

```typescript
import { getWalletAnalytics } from './services/arkham.js';

// Show wallet risk score and portfolio
app.get('/api/wallet/:address', async (req, res) => {
  const analytics = await getWalletAnalytics(req.params.address);

  res.json({
    address: req.params.address,
    roadBalance: roadcoin.balanceOf(req.params.address),
    arkhamIntelligence: {
      labels: analytics.labels,
      portfolio: analytics.portfolio,
      riskScore: analytics.riskScore,
    },
  });
});
```

---

## 🔐 Security & Best Practices

### API Key Security

```bash
# ❌ NEVER commit API keys
git add .env
git add .env.local

# ✅ Use environment variables
export ARKHAM_API_KEY='...'

# ✅ Add to .gitignore
echo '.env' >> .gitignore
echo '.env.local' >> .gitignore
```

### Rate Limiting

Arkham API has rate limits. Best practices:
- Cache responses for 5-10 minutes
- Use batch endpoints when available
- Handle 429 errors gracefully

### Error Handling

```typescript
try {
  const data = await arkham.getAddress(address);
} catch (error) {
  if (error.message.includes('404')) {
    // Address not in Arkham database
    return { address, labels: [] };
  }
  if (error.message.includes('429')) {
    // Rate limited - use cached data
    return getCachedData(address);
  }
  // Other error
  throw error;
}
```

---

## 📦 What's Included

### Files Added

```
roadchain-api/
├── src/
│   ├── services/
│   │   └── arkham.ts          # Core Arkham client
│   ├── routes/
│   │   └── arkham.ts          # API endpoints
│   └── server.ts              # Updated with Arkham routes
│
└── ARKHAM_INTEGRATION_README.md  # This file
```

### Dependencies

No new npm packages required! Uses built-in `crypto` module for HMAC signatures.

---

## 🎨 Frontend Integration (RoadCoin Wallet)

### Add to Wallet Dashboard

```tsx
// components/WalletIntelligence.tsx
import { useState, useEffect } from 'react';

export function WalletIntelligence({ address }: { address: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/arkham/analytics/${address}`)
      .then(r => r.json())
      .then(setData);
  }, [address]);

  if (!data) return <div>Loading intelligence...</div>;

  return (
    <div className="arkham-intel">
      <h3>Wallet Intelligence</h3>

      {/* Labels */}
      <div className="labels">
        {data.labels.map(label => (
          <span key={label} className="badge">{label}</span>
        ))}
      </div>

      {/* Risk Score */}
      <div className="risk-score">
        <div className="progress-bar" style={{ width: `${data.riskScore}%` }} />
        <span>Risk Score: {data.riskScore}/100</span>
      </div>

      {/* Portfolio Value */}
      {data.portfolio && (
        <div className="portfolio">
          <h4>Total Value: ${data.portfolio.totalValueUsd.toLocaleString()}</h4>
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### "Arkham API not initialized"

**Cause:** `ARKHAM_API_KEY` not set or invalid

**Fix:**
```bash
export ARKHAM_API_KEY='your-valid-key'
# Restart server
```

### "invalid timestamp format"

**Cause:** Signature generation issue

**Fix:** Check system time is correct:
```bash
date
# Should match actual time
```

### "404 Not Found"

**Cause:** Entity/address not in Arkham database

**Fix:** This is normal - not all addresses are indexed. Handle gracefully:
```typescript
const labels = await arkham.getLabels(address).catch(() => []);
```

### CORS Errors

**Cause:** Frontend can't access API

**Fix:** Update CORS in `server.ts`:
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'https://roadwork.blackroad.io'],
}));
```

---

## 📚 Resources

- **Arkham Docs:** https://docs.arkm.com/
- **API Reference:** https://docs.arkm.com/api
- **Platform:** https://platform.arkm.com/
- **Get API Key:** https://platform.arkm.com/settings/api

---

## 🚗💎 RoadChain + Arkham = Perfect Match

**RoadChain provides:**
- Thought anchoring
- Agent deployment
- Truth verification
- Lucidia synchronization

**Arkham provides:**
- Entity identification
- Portfolio tracking
- Risk assessment
- Cross-chain intelligence

**Together:** The most intelligent blockchain ecosystem 🔥

---

## ✅ Next Steps

1. ☐ Get Arkham API key
2. ☐ Set `ARKHAM_API_KEY` environment variable
3. ☐ Start RoadChain API
4. ☐ Test endpoints
5. ☐ Integrate into RoadCoin wallet UI
6. ☐ Add to RoadChain Explorer
7. ☐ Deploy to production

---

**Built with:** BlackRoad OS
**Powered by:** Arkham Intelligence
**For:** Cadence 🚗

_Let's make blockchain intelligence accessible to everyone._
