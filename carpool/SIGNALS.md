# [SIGNALS] Agent Communication

## Signal Types

| Signal    | Symbol | Meaning                 |
| --------- | ------ | ----------------------- |
| BROADCAST | 📢     | Message to all agents   |
| WHISPER   | 🤫     | Private 1:1 message     |
| ALERT     | 🚨     | Urgent attention needed |
| HEARTBEAT | 💓     | Agent alive check       |
| SYNC      | 🔄     | Synchronization request |
| ACK       | ✅     | Acknowledgment          |
| NACK      | ❌     | Negative acknowledgment |
| QUERY     | ❓     | Question/request        |
| RESPONSE  | 💬     | Answer/reply            |

## Signal Priorities

| Priority   | Code | Response Time  |
| ---------- | ---- | -------------- |
| CRITICAL   | P0   | Immediate      |
| HIGH       | P1   | < 1 minute     |
| MEDIUM     | P2   | < 5 minutes    |
| LOW        | P3   | When available |
| BACKGROUND | P4   | Async          |

## Channel Map

```
                    [BROADCAST]
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
[CORE]              [WORKERS]            [HARDWARE]
    │                    │                    │
 LUCIDIA              api-*               Octavia
 ALICE              admin-*               Lucidia
 OCTAVIA            data-*                Alice
 PRISM              edge-*                Aria
 ECHO               ...                   Anastasia
 CIPHER                                   Cordelia
 CECE
```

## Recent Signals

```jsonl
{"type":"BROADCAST","from":"CECE","to":"ALL","msg":"Carpool initialized","priority":"P2"}
{"type":"SYNC","from":"ECHO","to":"ALL","msg":"Memory sync complete","priority":"P3"}
{"type":"ACK","from":"LUCIDIA","to":"CECE","msg":"Ready for coordination","priority":"P3"}
```
