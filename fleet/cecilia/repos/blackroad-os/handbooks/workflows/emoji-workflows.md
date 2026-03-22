# BlackRoad OS – Emoji Workflow Language

This file is the **source of truth** for how we use emojis across:
- GitHub Projects
- Issues / PRs
- Agents / automations
- Docs and runbooks

If you don’t know what emoji to use for a state: **pick from here.**

---

## 1. Core Status Emojis

### 1.1 Work Status

🟢 **Ready / Unblocked**  
🟡 **In Progress / Waiting** (on a person, decision, or dependency)  
🔴 **Blocked / Urgent** – can’t move until something external changes  
🤔 **Needs Clarification** – requirements / scope are unclear  
🆘 **Critical Incident** – active fire, needs immediate attention  
🛟 **Help Requested** – pairing / review / backup needed  
⚠️ **Risk / Watch** – not blocked yet, but might become a problem  
🚫 **Won’t Do / Rejected** – consciously decided not to do this  
🛑 **Stop – Exec Decision Needed**  

Use these in:
- Issue titles
- Project columns
- Checklists inside descriptions

Example:

> 🔴 [API] Payments webhook failing in production  
> 🟡 [Web] New pricing page layout  
> 🟢 [Docs] Update README with new login flow

---

## 2. Human + Agent Roles

We treat work as a **dance between people and agents**:

🧍‍♀️ **Human** – the accountable human owner  
🤖 **Agent / Bot** – automated worker (script, job, AI agent)  
🧬 **System / Pipeline** – automated validation, CI, infra  
🫸 **Hand-off** – transfer of responsibility  
🫀 **Human Review / Final Touch** – human sign-off, nuance

### 2.1 Standard “Human + Agent” Workflow

Use this block in Issues and Docs to show who does what:

```md
### Workflow

🧍‍♀️ Human Intake – capture request, clarify outcome  
🫸 Hand-off – route to the right agent / service  
🤖 Agent Execution – do the bulk of the work  
🧬 System Check – tests / CI / monitoring  
🫀 Human Review – make it nice, correct, on-brand  
✅ Ship – done, communicated, documented
```

---

## 3. Document State & Knowledge

For anything that looks like a doc, spec, or note, use:

📕 **Draft** – still being written
📗 **In Review** – someone else is currently reviewing
📘 **Approved** – can be relied on / used in production
📙 **Needs Update** – partially outdated, should be refreshed
📖 **Canon / Source of Truth** – definitive version
📓 **Notes / Scratchpad** – rough; do not depend on it
🔖 **Bookmark / Key Reference** – useful anchor for future work

Example:

> 📖 BlackRoad OS – Service Registry (Canon)
> 📙 Onboarding Guide (Needs update for 2026)

---

## 4. Progress Bars (Visual Check-ins)

We use simple 10-block progress bars so anyone can “see” status at a glance.

### 4.1 Box Progress

Pick **one line** that reflects current status:

```md
Progress:
⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0%
🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜  10%
🟩🟩⬜⬜⬜⬜⬜⬜⬜⬜  20%
🟩🟩🟩⬜⬜⬜⬜⬜⬜⬜  30%
🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜  40%
🟩🟩🟩🟩🟩⬜⬜⬜⬜⬜  50%
🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜  60%
🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜  70%
🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜  80%
🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜  90%
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩  100%
```

Then just keep the **current line**, like:

```md
Current Progress:
🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜  40%
```

### 4.2 Energy Bar (Fun)

```md
Energy:
🤖🤖🤖🤖🤖 ⚪⚪⚪⚪⚪
```

Interpretation is up to the team (“how alive is this project?”).

---

## 5. Standard Work Card Template (for Issues)

This is the **canonical work card** all repos can reuse.

```md
### 🪧 Work Card

**Title**: _clear, human-readable summary_  
**Service Line**: Core / Web / API / Operator / Prism / Infra / Docs / Brand / Packs  
**Requester**: @username / external link  

---

### 1️⃣ Triage

Status:  🟢 / 🟡 / 🔴 / 🤔  
Priority: 🔴 P0 / 🟠 P1 / 🟡 P2 / 🟢 P3  

Owner (Human): 🧍‍♀️ @owner  
Owner (Agent): 🤖 @agent-name (if applicable)  

Risk:  ⚠️ low / ⚠️⚠️ medium / ⚠️⚠️⚠️ high  

---

### 2️⃣ Definition of Done

- ✅ Clear outcome written
- ✅ Linked to any OKR / Project / Epic
- ✅ Success metric or acceptance criteria

---

### 3️⃣ Checklist

✅ Defined: Problem & Outcome  
✅ Linked: Related Issues / Docs / Services  
⬜ Assigned: Human Owner 🧍‍♀️  
⬜ Assigned: Agent / Automation 🤖  
⬜ Implemented: Change landed  
⬜ Verified: Tests / Smoke / Monitoring  
⬜ Documented: 📕 / 📖 updated  
⬜ Announced: Release note / change log

---

### 4️⃣ Links

- 📋 Related Issues: #123, #456  
- 📕 Spec / Doc: link  
- 🧬 Service / Endpoint: link  
- 📊 Dashboard / Metrics: link
```

This should become an **Issue Template** in each repo, but this file (`emoji-workflows.md`) is the spec.

---

## 6. Project-Level Emoji Patterns

Use this pattern in **GitHub Project descriptions**.

```md
### BlackRoad OS – Project Emoji Legend

🟢 Ready  
🟡 In Progress  
🔴 Blocked  
🤔 Needs Clarification  
🆘 Critical Incident  
🛟 Help Needed  
⚠️ Risk / Dependency  
🚫 Won’t Do  
🛑 Exec Decision Needed  

Document States:
📕 Draft   📗 In Review   📘 Approved   📙 Needs Update   📖 Canon   📓 Notes  

Human + Agent:
🧍‍♀️ Human  🤖 Agent  🧬 System  🫸 Hand-off  🫀 Human Review  

Progress:
🟩🟩🟩⬜⬜⬜⬜⬜⬜⬜  30%
```

Teams can copy this into:

* Project description
* Top of long epics
* Readmes for each repo

---

## 7. Incident / “Oh No” Flow

For outages / emergencies we keep a tiny, visual flow:

```md
### Incident Flow

🆕 Trigger – alert / report / “something is wrong”  
🆘 Declare – mark as incident, assign incident lead  
🔴 Contain – stop the bleeding, disable / revert if needed  
🧬 Diagnose – logs, metrics, traces, timeline  
🛟 Call in Help – extra humans / agents / services  
🧍‍♀️ Decide – human lead chooses path forward  
✅ Fix – patch, rollback or workaround applied  
📕 Record – notes, summary, follow-up tasks  
📓 Retro – what did we learn, what do we change?  
📖 Canon – update any source-of-truth docs
```

You can embed this as a section in `INCIDENT_TEMPLATE` issues.

---

## 8. Rules of Thumb

* If you invent a new emoji pattern that **others should use**, add it here.
* If you’re working in another org (AI / Labs / Media etc.), **link back** to this file instead of forking your own meanings.
* Keep it **simple and readable on mobile** – avoid giant emoji walls in a single line.

---

*Last updated: YYYY-MM-DD (edit this when you meaningfully change the spec).*
