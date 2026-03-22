# TODO — carpool

> BlackRoad OS fork of NATS Server v2.12
> NATS fork — pub/sub messaging backbone for agent-to-agent communication

## Priority Tasks

- [ ] [RC] Integrate carpool with RoundTrip hub (roundtrip.blackroad.io) for agent coordination
- [ ] [RC] Register CarPool Agent in the BlackRoad Agent OS roster (~/.blackroad-agents/)
- [ ] [RC] Deploy carpool to Pi fleet node: Octavia (.101)
- [ ] [RC] Connect to blackroad-operator deploy scripts (~/blackroad-operator/scripts/deploy/)
- [ ] [RC] Add uptime monitoring via GuardRail (Uptime Kuma on Alice)
- [ ] [RC] Wire pub/sub events to NATS (CarPool on Octavia :4222)
- [ ] [RC] Add NLP intent triggers: 'send message' / 'broadcast'
- [ ] [RC] Create systemd service file for auto-start on Octavia (.101)
- [ ] [RC] Add health check endpoint for GuardRail polling
- [ ] [RC] Write backup strategy using Local (encrypted sync across fleet)
- [ ] [RC] Add to blackroad-operator fleet-coordinator.sh manifest
- [ ] [RC] Integrate with memory-system.sh for action logging
- [ ] [RC] Add TIL broadcasts on deploy/config changes via memory-til-broadcast.sh
- [ ] [RC] Create Gitea CI pipeline (act_runner on Octavia) for automated testing
- [ ] [RC] Document in blackroad-operator/BLACKROAD-REPO-INDEX.md

## Upstream Sync
- [ ] Track upstream NATS Server v2.12 releases
- [ ] Cherry-pick security patches within 24h
- [ ] Maintain BlackRoad customizations in separate commits for clean rebases
