# BlackRoad OS — Slack Channels

Create these channels in blackroadosinc.slack.com:

## Required
- **#kpis** — Daily KPI reports, weekly digests (slack-notify, slack-weekly)
- **#alerts** — Fleet alerts, deploy status (slack-alert, git-agent)

## Optional
- **#git** — Git agent patrol reports, sync status
- **#deploys** — Deploy pipeline notifications
- **#fleet** — Fleet health, node status changes

## Webhook Setup
Each channel needs its own Incoming Webhook:
1. Go to api.slack.com/apps → Your App → Incoming Webhooks
2. Add New Webhook to Workspace → Select channel
3. Save URLs to ~/.blackroad/slack-webhook.env:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../...     # #kpis
SLACK_ALERTS_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../... # #alerts
```
