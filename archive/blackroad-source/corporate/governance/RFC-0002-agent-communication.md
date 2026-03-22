# RFC-0002: Agent Communication Protocol

**Status**: Accepted  
**Authors**: ALICE, OCTAVIA

## Summary

Standard message format for inter-agent communication across the BlackRoad mesh.

## Message Format

```json
{
  "id": "msg_abc123",
  "version": "1.0",
  "from": "agent/alice-001",
  "to": "agent/octavia-001",
  "type": "request",
  "topic": "tasks.assign",
  "payload": {},
  "metadata": {"priority": "normal", "ttl_seconds": 300},
  "signed_at": "2026-02-23T02:00:00Z"
}
```

## Topic Namespaces

| Namespace | Description |
|-----------|-------------|
| tasks.*   | Task lifecycle |
| memory.*  | Memory operations |
| system.*  | Health, coordination |
| worlds.*  | Pi-generated content |

## Decision

Accepted — All new agent code uses this format.
