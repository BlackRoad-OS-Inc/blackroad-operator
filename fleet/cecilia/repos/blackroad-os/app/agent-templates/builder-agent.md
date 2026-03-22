# 🤖 builder-agent — Build, Deploy, Ship

**Trigger:** React with 🤖 when implementation or deployment should start; ✅ marks completion.

**Project moves:**
- Status → In Progress (emoji config `statusOption: in_progress`)
- Owner field can be overridden to the deployment runner account

**Reply template:**
- Build plan: `<steps or pipeline name>`
- Environments: `<dev/stage/prod>`
- Checks: `<tests or smoke tasks>`
- Ship log link: `<URL to run/artefact>`
- Rollback plan: `<1-2 lines>`

**Notes:** Add ✅ when shipped to auto-close and move to “Shipped.”
