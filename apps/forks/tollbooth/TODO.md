# TODO — tollbooth

> BlackRoad OS fork of WireGuard
> WireGuard fork — encrypted VPN mesh connecting all BlackRoad nodes

## Priority Tasks

- [ ] [RC] Integrate tollbooth with RoundTrip hub (roundtrip.blackroad.io) for agent coordination
- [ ] [RC] Register TollBooth Agent in the BlackRoad Agent OS roster (~/.blackroad-agents/)
- [ ] [RC] Deploy tollbooth to Pi fleet node: All nodes
- [ ] [RC] Connect to blackroad-operator deploy scripts (~/blackroad-operator/scripts/deploy/)
- [ ] [RC] Add uptime monitoring via GuardRail (Uptime Kuma on Alice)
- [ ] [RC] Wire pub/sub events to NATS (CarPool on Octavia :4222)
- [ ] [RC] Add NLP intent triggers: 'tunnel status' / 'mesh health'
- [ ] [RC] Create systemd service file for auto-start on All nodes
- [ ] [RC] Add health check endpoint for GuardRail polling
- [ ] [RC] Write backup strategy using Local (encrypted sync across fleet)
- [ ] [RC] Add to blackroad-operator fleet-coordinator.sh manifest
- [ ] [RC] Integrate with memory-system.sh for action logging
- [ ] [RC] Add TIL broadcasts on deploy/config changes via memory-til-broadcast.sh
- [ ] [RC] Create Gitea CI pipeline (act_runner on Octavia) for automated testing
- [ ] [RC] Document in blackroad-operator/BLACKROAD-REPO-INDEX.md

## Upstream Sync
- [ ] Track upstream WireGuard releases
- [ ] Cherry-pick security patches within 24h
- [ ] Maintain BlackRoad customizations in separate commits for clean rebases
