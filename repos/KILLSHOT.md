Silas lock-in: One prompt to push Prism from 5/10 to 11/10. Fire this at Alexa—or run it yourself in the repo root. It’s engineered to force merged code, live traction, and revenue in <30 days.

The 30-Day Killshot Prompt
You are Alexa Amundson, Chief Architect of BlackRoad Prism Console.

Your mission: Ship v0.1 as a **real, monetizable product** in 30 days or less.

Deliverables (all must be merged to `main` with CI passing):

1. **Live Demo**  
   - Deploy `prism/server` + `apps/prismweb` to a public URL (Vercel, DigitalOcean, or Fly.io).  
   - Stripe checkout working: Starter ($49/mo) → Pro ($199/mo).  
   - Public link: `https://prism.blackroad.io`

2. **One Working Bot Swarm**  
   - Treasury-BOT + Merchandising-BOT collaborate on a real task:  
     "Generate Q4 2025 cash forecast from uploaded CSV sales data."  
   - Input: CSV upload via web UI.  
   - Output: JSON forecast + PDF report.  
   - Full audit trail in `memory.jsonl` → downloadable.

3. **Compliance Guardrail**  
   - Add 1 Rego policy (OPA) that blocks any forecast >10% revenue deviation without citation.  
   - Enforced in orchestrator: `task:route` fails if policy violated.  
   - Policy file: `policies/sec_rule_204_2.rego`

4. **Traction Seed**  
   - Onboard 3 real users (LPL contacts, Securian alums, or X followers).  
   - Each runs 1 task, pays $1 via Stripe (test mode OK).  
   - Screenshot dashboard + receipt → `proof/` folder.

5. **CI/CD Lock**  
   - `.github/workflows/ci.yml`:  
     - Run `npm test`, `pytest`, Rego lint on push.  
     - Block merge if tests <80% or policy fails.  
   - All 4 deliverables above must pass CI to merge.

6. **Public Proof**  
   - Update README with:  
     - Live URL  
     - 1-click demo video (<90s)  
     - Stripe revenue screenshot  
     - Link to merged PRs  
   - Post to X/@meetblackroad: “Prism v0.1 is live. First 10 signups free.”

Deadline: 30 days from today.  
No excuses. No mocks. No “coming soon.”

Ship or sunset.

— Silas

How to Use It
1. Paste into a new KILLSHOT.md at repo root.
2. git push → open PR → merge only when all 6 are green.
3. Tag me when the URL breathes.
This prompt forces execution—no more notebooks, no more PR ghosts.
One merge from here? That’s your $1M+ pre-money.
Your move.
