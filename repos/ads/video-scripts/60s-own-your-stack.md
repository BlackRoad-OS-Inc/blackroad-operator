# Video Script: "Own Your Stack" (60 seconds)

**Principle:** Primacy/Recency + ELM (Peripheral → Central)
**Format:** Screen recording + terminal + hardware shots
**Music:** Lo-fi electronic, minimal, builds

---

## Script

```
[0-3s] HOOK — PERIPHERAL
VISUAL: Black screen. Terminal cursor blinks. Text types itself:

    $ ssh pi@cecilia
    $ ollama list
    [16 models appear]

AUDIO: Mechanical keyboard sounds. No music yet.

[3-10s] PROBLEM
VISUAL: Cut to cloud provider dashboard. Bill: $33,696.00/year.
Zoom into the line item: "1x H100 GPU — $3.90/hr"

VO: "One cloud GPU costs thirty-three thousand dollars a year."

[10-15s] THE TURN
VISUAL: Hard cut to a Raspberry Pi 5 sitting on a desk. Hand plugs in a Hailo-8 M.2 module. Click.

VO: "This costs ninety-nine dollars. Once."

TEXT ON SCREEN: "Hailo-8 — 26 TOPS neural inference"

[15-25s] SOLUTION
VISUAL: Terminal montage — fast cuts:
    $ ollama run llama3
    $ curl localhost:6333/collections  (Qdrant)
    $ nats pub agents.task '{"skill":"summarize"}'

VISUAL: Split screen showing 5 Pi terminals, all active.

VO: "BlackRoad OS runs sixteen AI models on five Raspberry Pis.
Fifty skills. Fifty-two trillion operations per second.
Zero cloud dependency."

[25-35s] PROOF
VISUAL: Browser opening blackroad.io — site loads instantly.
Cut to: Gitea dashboard showing 207 repos.
Cut to: RoadPay billing dashboard.
Cut to: analytics showing 30 websites active.

TEXT ON SCREEN:
    "30 websites"
    "207 repositories"
    "50 AI skills"
    "$0/month"

VO: "This isn't a demo. It's production. Thirty websites. A billing system.
Two hundred seven repos. All on four hundred dollars of hardware."

[35-50s] THE STAKES
VISUAL: Headline montage — real articles:
    "94% of IT Leaders Fear Vendor Lock-In"
    "Self-Hosted Market Hits $18.48 Billion"
    "Edge AI to Reach $118 Billion by 2033"

VO: "Ninety-four percent of IT leaders fear vendor lock-in.
The self-hosted market just hit eighteen billion dollars.
The shift is happening. The hardware already costs ninety-nine dollars."

[50-57s] CTA
VISUAL: Clean shot of the Pi cluster. All LEDs active.
Camera slowly pulls back to reveal: it's sitting on a shelf in a closet.

VO: "Own your stack. Own your models. Own your data."

[57-60s] END CARD
VISUAL: Black background. Logo fades in.

TEXT:
    BlackRoad OS
    Pave Tomorrow.
    blackroad.io

AUDIO: Music resolves. Silence.
```

---

## Production Notes

- **No stock footage.** Everything is real hardware, real terminals, real dashboards.
- **Terminal text must be real commands** that actually work on the infrastructure.
- **The cloud bill screenshot** should be a realistic mock-up (not a real AWS bill — we don't use AWS).
- **Music:** Something like Tycho or Boards of Canada — electronic, minimal, builds tension then resolves.
- **Aspect ratios:** Produce in 16:9 (YouTube), 9:16 (TikTok/Reels/Shorts), and 1:1 (Twitter/LinkedIn).
- **Captions required** on all versions (most social video is watched muted).

## Platforms

| Platform | Format | Length |
|----------|--------|--------|
| YouTube | 16:9 | 60s |
| Twitter/X | 16:9 or 1:1 | 60s |
| TikTok | 9:16 | 60s |
| Instagram Reels | 9:16 | 60s |
| LinkedIn | 16:9 | 60s |
| YouTube Shorts | 9:16 | 45s (cut stakes section) |
