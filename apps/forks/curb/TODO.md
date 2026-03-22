# TODO — curb

> BlackRoad OS fork of MinIO
> MinIO fork — S3-compatible object storage for BlackRoad assets

## Priority Tasks

- [ ] [RC] Integrate curb with RoundTrip hub (roundtrip.blackroad.io) for agent coordination
- [ ] [RC] Register Curb Agent in the BlackRoad Agent OS roster (~/.blackroad-agents/)
- [ ] [RC] Deploy curb to Pi fleet node: Cecilia (.96)
- [ ] [RC] Connect to blackroad-operator deploy scripts (~/blackroad-operator/scripts/deploy/)
- [ ] [RC] Add uptime monitoring via GuardRail (Uptime Kuma on Alice)
- [ ] [RC] Wire pub/sub events to NATS (CarPool on Octavia :4222)
- [ ] [RC] Add NLP intent triggers: 'store file' / 'get asset'
- [ ] [RC] Create systemd service file for auto-start on Cecilia (.96)
- [ ] [RC] Add health check endpoint for GuardRail polling
- [ ] [RC] Write backup strategy using Local (encrypted sync across fleet)
- [ ] [RC] Add to blackroad-operator fleet-coordinator.sh manifest
- [ ] [RC] Integrate with memory-system.sh for action logging
- [ ] [RC] Add TIL broadcasts on deploy/config changes via memory-til-broadcast.sh
- [ ] [RC] Create Gitea CI pipeline (act_runner on Octavia) for automated testing
- [ ] [RC] Document in blackroad-operator/BLACKROAD-REPO-INDEX.md

## Upstream Sync
- [ ] Track upstream MinIO releases
- [ ] Cherry-pick security patches within 24h
- [ ] Maintain BlackRoad customizations in separate commits for clean rebases
