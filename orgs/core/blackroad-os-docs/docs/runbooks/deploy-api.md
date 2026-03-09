---
id: runbooks-deploy-api
title: "Deploy API Service"
slug: /runbooks/deploy-api
description: "Runbook for deploying the BlackRoad OS API service"
tags: ["runbooks", "deployment", "api"]
status: planned
---

# Deploy API Service

> 📋 **Status:** This runbook is planned and will be developed.

Step-by-step procedures for deploying the BlackRoad OS API service.

## Planned Content

This runbook will include:
- Pre-deployment checklist
- Deployment steps for Railway
- Environment variable verification
- Health check validation
- Rollback procedures
- Post-deployment verification

## Current Deployment

Currently, API deployment is handled via:
- Railway automatic deployments from main branch
- Manual deployments via Railway dashboard

## Quick Reference

### Deploy via Railway Dashboard
1. Go to Railway project
2. Select `blackroad-os-api` service
3. Navigate to Deployments tab
4. Click "Deploy Latest"

### Environment Variables
See [Service: API](../services/service-api.md) for required environment variables.

## See Also

- [Service: API](../services/service-api.md)
- [Infra Guide](../ops/INFRA_GUIDE.md)
- [Incident Playbook](./incident-playbook.md)
