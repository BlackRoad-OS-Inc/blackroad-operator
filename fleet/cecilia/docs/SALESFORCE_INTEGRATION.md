# Salesforce Integration

## Connected App Details

| Field | Value |
|-------|-------|
| **App Name** | BlackRoad Integration |
| **API Name** | BlackRoad_Integration |
| **Org** | securianfinancial-4e-dev-ed |
| **Org URL** | https://securianfinancial-4e-dev-ed.develop.my.salesforce.com |
| **Distribution** | Local (State) |

## OAuth Configuration

| Setting | Value |
|---------|-------|
| Callback URL | `https://localhost/callback` |
| Authorization Code Flow | ✅ Enabled |
| Refresh Token Rotation | ✅ Enabled |

### OAuth Scopes
- `full` - Full access
- `refresh_token, offline_access` - Perform requests at any time
- `api` - Manage user data via APIs
- `openid` - Access unique user identifiers

## Credential Storage

**⚠️ CREDENTIALS ARE NOT STORED IN THIS FILE**

| Secret | Location |
|--------|----------|
| Consumer Key | Cloudflare Worker: `blackroad-deploy-dispatcher` → `SALESFORCE_CONSUMER_KEY` |
| Consumer Secret | Cloudflare Worker: `blackroad-deploy-dispatcher` → `SALESFORCE_CONSUMER_SECRET` |

### Accessing Credentials

```bash
# View secret names (not values)
wrangler secret list

# Secrets are available in Worker code as:
# env.SALESFORCE_CONSUMER_KEY
# env.SALESFORCE_CONSUMER_SECRET
```

## Usage

### OAuth Authorization URL
```
https://securianfinancial-4e-dev-ed.develop.my.salesforce.com/services/oauth2/authorize?
  response_type=code&
  client_id={SALESFORCE_CONSUMER_KEY}&
  redirect_uri=https://localhost/callback&
  scope=full+refresh_token+api+openid
```

### Token Endpoint
```
POST https://securianfinancial-4e-dev-ed.develop.my.salesforce.com/services/oauth2/token
```

### API Base URL
```
https://securianfinancial-4e-dev-ed.develop.my.salesforce.com/services/data/v59.0/
```

## Created
- **Date:** $(date +%Y-%m-%d)
- **By:** Alexa
- **Memory Hash:** f0b1bcf1
