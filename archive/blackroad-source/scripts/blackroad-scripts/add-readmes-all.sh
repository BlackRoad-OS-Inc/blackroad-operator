#!/bin/bash

echo "📝 ADDING READMES TO ALL REPOS!"
echo ""

# Create README for blackroad-zapier
cd ~/blackroad-zapier
cat > README.md << 'ZAPIER_EOF'
# BlackRoad Zapier Integration 🔌

Connect BlackRoad to 5000+ apps with Zapier!

## Features

- **Triggers**
  - New Deployment Created
  - Deployment Completed
  - Analytics Threshold Reached

- **Actions**
  - Create Deployment
  - Track Event
  - Find Deployment

- **Searches**
  - Find Deployment by ID

## Installation

1. Visit [Zapier Platform](https://zapier.com/developer)
2. Create new integration
3. Import this codebase
4. Configure authentication

## Usage

```javascript
// Zapier will handle authentication
// Configure your triggers and actions in the Zapier editor
```

## Development

```bash
npm install
zapier test
zapier push
```

## Documentation

Full Zapier integration docs: https://zapier.com/developer/documentation/v2/

## License

MIT License - See LICENSE file for details

---

Part of the **BlackRoad Empire** 🚀
ZAPIER_EOF

git add README.md
git commit -m "docs: Add comprehensive README"
git push origin main
echo "✅ blackroad-zapier README added!"

# Create README for blackroad-notion
cd ~/blackroad-notion
cat > README.md << 'NOTION_EOF'
# BlackRoad Notion Integration 📝

Sync your BlackRoad deployments and analytics with Notion!

## Features

- **Bidirectional Sync**
  - Deployments → Notion database
  - Notion pages → BlackRoad deployments

- **Auto-sync**
  - Runs every hour automatically
  - Real-time analytics tracking

- **Analytics Dashboard**
  - 7-day metrics
  - Request counts
  - Uptime tracking
  - Latency monitoring

## Installation

```bash
npm install @notionhq/client axios
```

## Setup

1. Create Notion integration: https://www.notion.so/my-integrations
2. Get your API key
3. Create database for deployments
4. Set environment variables:

```bash
export NOTION_TOKEN="your-token"
export NOTION_DATABASE_ID="your-database-id"
export BLACKROAD_API_KEY="your-api-key"
```

## Usage

```typescript
import { syncDeploymentsToNotion } from './sync'

// Sync deployments to Notion
await syncDeploymentsToNotion()

// Create deployment from Notion page
await createDeploymentFromNotion('page-id')

// Sync analytics
await syncAnalyticsToNotion()
```

## Database Schema

Your Notion database should have these properties:
- Name (Title)
- Status (Select)
- URL (URL)
- Created At (Date)
- Deployment ID (Text)

## License

MIT License

---

Part of the **BlackRoad Empire** 🚀
NOTION_EOF

git add README.md
git commit -m "docs: Add comprehensive README"
git push origin main
echo "✅ blackroad-notion README added!"

# Create README for blackroad-linear
cd ~/blackroad-linear
cat > README.md << 'LINEAR_EOF'
# BlackRoad Linear Integration 🎯

Integrate BlackRoad with Linear for seamless project management!

## Features

- **Auto-issue Creation**
  - Failed deployments → Linear issues
  - Priority-based alerts
  - Complete error details

- **Deployment Tracking**
  - Sync all deployments to Linear
  - Track deployment status
  - Link to deployment dashboards

- **Bidirectional Integration**
  - Create deployments from Linear issues
  - Update issues with deployment URLs

## Installation

```bash
npm install @linear/sdk axios
```

## Setup

```bash
export LINEAR_API_KEY="your-linear-key"
export LINEAR_TEAM_ID="your-team-id"
export LINEAR_PROJECT_ID="your-project-id"
export BLACKROAD_API_KEY="your-api-key"
```

## Usage

```typescript
import { createIssueForFailedDeployment, syncDeploymentsToLinear } from './integration'

// Create issue for failed deployment
await createIssueForFailedDeployment(deployment)

// Sync all deployments
await syncDeploymentsToLinear()

// Create deployment from issue
await createDeploymentFromIssue('issue-id')
```

## Automatic Monitoring

The integration watches for failed deployments every 5 minutes and auto-creates urgent issues.

## License

MIT License

---

Part of the **BlackRoad Empire** 🚀
LINEAR_EOF

git add README.md
git commit -m "docs: Add comprehensive README"
git push origin main
echo "✅ blackroad-linear README added!"

echo ""
echo "✅ First 3 READMEs complete! Continuing..."
