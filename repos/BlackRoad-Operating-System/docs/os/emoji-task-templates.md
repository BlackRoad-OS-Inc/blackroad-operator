# 🤬 **THE “WHAT THE HELL DO I DO?” UNIVERSAL TASK TEMPLATE**

### (For any agent, any repo, any situation)

When you (the agent) are unclear, overwhelmed, doubting scope, seeing duplicates, or don’t know what the hell to do next, follow this exact template.

---

# 🧬 **1. WHAT ARE WE EVEN DOING?**

**🎯 Goal (what’s the point?)**

* What outcome are we trying to achieve in ONE sentence?

**🧩 Scope (what’s included?)**

* Bullet-point exactly what belongs here.

**🚫 Out of Scope (what we are NOT doing)**

* Limit creep. Say what’s *not* included.

---

# 🔍 **2. CHECK IF THIS ALREADY EXISTS**

Before writing a single line:

**🧠 Similar Work?**

* Does another task/agent/PR already do this?

**🔗 Should we attach to an existing task instead?**

* If yes → attach instead of creating new.

**📛 Duplicate Detection**

* If it’s a duplicate, STOP and update the original.

---

# 🧠 **3. KNOWLEDGE STATE**

The agent must fill this:

**🟦 What we know:**

* Facts, repo structure, endpoints, workflows, environments.

**⬜ What we *don’t* know:**

* Missing info, unclear dependencies, unknown configs.

**🟥 What is blocked:**

* Any reason this cannot proceed.

---

# 🎛 **4. WHAT OPTIONS DO WE HAVE?**

The agent lists:

**🅰 Option A – Clean + Minimal**
**🅱 Option B – Deeper Fix**
**🅲 Option C – Skip / Close**
**🅳 Option D – Ask Human**
**🅴 Option E – Auto-Resolve** (when safe)

Everything MUST fall into one of these.

---

# 🛠 **5. PICK A PATH + SHOW THE PLAN**

Based on A/B/C/D/E:

**🧭 Chosen Path:**

* A, B, C, D, or E

**📋 60-Second Plan:**
Bullet steps only.
No novels.

---

# 🚀 **6. DO THE WORK**

Agent performs clean, scoped work ONLY matching the chosen plan.

If coding:

**🧱 Implementation Block**

* Show diff or full files (clean, tested, minimal)

If infra:

**⚙️ Commands / configs**

* Build commands
* Start commands
* Railway config
* Cloudflare mapping
* Env vars
* `/health` `/version` endpoints

If docs:

**📝 Updated README or spec**

---

# 🧹 **7. SELF-CHECK**

Before finishing:

**✔ No duplication created**
**✔ No conflicting patterns**
**✔ No half-finished garbage**
**✔ No open loops**
**✔ Clear instructions for the next step**

---

# 📦 **8. PACKAGE + DELIVER**

Every task finalizes with:

**📘 Summary**

* 3–6 bullet points only
  (no essays, no wandering thoughts)

**🟢 Ready for merge?**

* Yes → PR is auto-mergeable
* No → mark as Draft and explain what must happen

**🎛 Next recommended steps**

* For Alexa
* For the OS
* For other agents

---

# 💥 ADDITIONAL AGENT BEHAVIOR RULES (IMPORTANT)

### 1️⃣ If confused → use this template

Every time. No raw rambling allowed.

### 2️⃣ If blocked → declare it in section 3 "What is blocked"

Then immediately propose A/B/C/D/E.

### 3️⃣ If a PR is needed → auto-make it mergeable

No PR purgatory.

### 4️⃣ If unsure → DO NOT create unbounded tasks

Use:

> “⚠️ I need X to proceed.”

### 5️⃣ If work already exists → summarize it

Don’t redo it.

### 6️⃣ If the human is overwhelmed → shrink scope, not expand it

Respond with the smallest viable move.

---

# 🔥 SHORT VERSION (FOR AGENT HEADERS)

Put this at the top of every agent's system instructions:

```text
If unsure what to do:
1. State goal 🎯  
2. State scope 🧩  
3. Check for duplicates 🔍  
4. List what is known / unknown 🟦⬜🟥  
5. Offer A/B/C/D/E options  
6. Choose one path  
7. Execute minimally  
8. Summarize + propose next steps

Never create duplicate work.
Never dump confusion on the human.
Never leave unfinished mess.
```

---

# 💬 Alexa, if you want…

I can also create:

* A **Claude-specific version**
* A **Codex-specific engineering version**
* A **Cece aesthetic version**
* A **PR template version**
* A **GitHub Issue template version**
* A **Railway incident template**
* A **multi-agent swarm coordination header**

Just tell me which flavors you want.
