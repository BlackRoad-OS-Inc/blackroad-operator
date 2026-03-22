Got you. Here’s a drop-in **Codex mega-prompt** that makes an agent build the whole “paperwork bot” so you don’t have to touch docs. It’s OPSEC-aware (no raw secrets in logs), generates proposals/invoices/emails, and can prefill a W-9 **without** storing sensitive data.

Copy-paste this into Codex as-is.

---

## CODEx PROMPT — “Paperwork Agent (48-Hour Close Pack)”

**SYSTEM**
You are a senior automation engineer. Build a small, local-first toolkit called **paperwork-agent** to generate and package a “close pack” for a consulting POC and (optionally) an investor intro. Priorities: **privacy**, **no secrets in logs**, **simple CLI**, **PDF outputs**. No external calls. Everything runs offline.

**GOAL**
Given a single YAML config `deal.yml`, generate:

* `dist/proposal_onepager.pdf` (4-week POC)
* `dist/service_order.pdf` (signable one-pager)
* `dist/invoice.pdf` (ACH/“send to AP” style; pulls bank fields from `.env`)
* `dist/customer_email.txt` (closing email body)
* `dist/investor_email.txt` (optional)
* `dist/w9_prefill.pdf` (prefilled helper overlay **without** logging SSN/EIN)
* `dist/close_pack.zip` bundling the above

**TECH CHOICES (use these)**

* Language: **Node 20 + TypeScript**
* Templating: **Handlebars** (for .hbs templates)
* PDF generation: **Puppeteer** (render HTML → PDF)
* PDF form overlay: **pdf-lib** (draw text on top of a blank W-9 canvas you create; do **not** embed the IRS form)
* CLI: **commander**
* Config: **YAML** (`deal.yml`) + **dotenv** (`.env`)
* Tests: **vitest**

**REPO LAYOUT**

```
paperwork-agent/
  package.json
  tsconfig.json
  src/
    index.ts               # CLI entry
    generate.ts            # core orchestrator
    templates/
      proposal.html.hbs
      service_order.html.hbs
      invoice.html.hbs
      emails/
        customer_close.txt.hbs
        investor_close.txt.hbs
    pdf/
      w9_overlay.ts        # builds a simple prefill overlay (no IRS form)
    util/
      loadConfig.ts
      redact.ts
      pdf.ts               # puppeteer helpers
  deal.example.yml
  .env.example
  README.md
```

**CLI**

```
npx paperwork-agent init                 # writes deal.example.yml and .env.example
npx paperwork-agent check                # validates YAML + .env (no secrets in logs)
npx paperwork-agent generate customer    # proposal+service_order+invoice+customer_email
npx paperwork-agent generate investor    # investor_email only
npx paperwork-agent w9                   # builds w9_prefill.pdf overlay from YAML
npx paperwork-agent package              # zips dist/ into dist/close_pack.zip
```

**INPUTS**
`deal.yml` (example):

```yaml
# Company & contact (customer)
customer:
  company: "Acme Financial"
  contact_name: "Jordan Lee"
  contact_email: "jordan@acme.com"

# Commercials
poc:
  price_total_usd: 50000
  upfront_pct: 50
  start_date: "2025-11-25"
  scope:
    - "Week 1: Agent inventory & risk"
    - "Weeks 2–3: Registry, admissions, vitals (trust/refusals/policy hits)"
    - "Week 4: Policies + training; runbooks handed over"

# You (seller)
seller:
  legal_name: "Alexa Louise Amundson"
  address: "Lakeville, MN"
  email: "you@example.com"
  phone: "(555) 555-5555"

# Optional investor draft
investor:
  name_or_code: "INV-7"
  amount_usd: 250000
  cap_usd: 8000000
```

`.env.example`:

```
# Bank details used ONLY to render invoice.pdf; never log these.
ACCOUNT_NAME="Alexa Louise Amundson"
BANK_NAME="Your Bank"
ROUTING_NUMBER="XXXXXXXXX"
ACCOUNT_NUMBER="XXXXXXXXXXX"

# Tax identifiers for W-9 overlay (use EIN if available; else leave blank)
EIN="XX-XXXXXXX"
SSN=""   # leave empty if using EIN; the app must never print this
```

**PRIVACY & OPSEC RULES**

* Never print `ROUTING_NUMBER`, `ACCOUNT_NUMBER`, `SSN`, or `EIN` to console or tests.
* Provide a `redact()` helper that masks sensitive fields when rendering debug info (`****…****`).
* Store outputs only in `dist/`. Do not cache inputs with secrets.
* W-9: generate a **prefill overlay** PDF that places the text at typical coordinates for name, address, EIN/SSN; the user can combine it with the official form manually. Include a watermark: “Review before use”.

**TEMPLATES**

* **proposal.html.hbs** — clean one-pager with scope bullets, start date, price, and a “Why this POC” blurb.
* **service_order.html.hbs** — signable: scope, term (4 weeks), fees ($50k, 50/50), IP clause (pre-existing IP retained by seller; client gets usage rights), confidentiality (2 years), liability cap (fees paid).
* **invoice.html.hbs** — Invoice #BR-{{today}}-001, Bill To (customer AP), line item “Prism Console POC – kickoff”, Amount Due = upfront % of total; payment block uses `.env` fields; include “Share securely with AP only.”
* **emails/customer_close.txt.hbs** — short closing email per above plan.
* **emails/investor_close.txt.hbs** — optional investor interest email (no token talk).

**IMPLEMENTATION DETAILS**

* `generate.ts`:

  * load YAML + dotenv
  * compute `upfront_amount = price_total_usd * upfront_pct/100`
  * render HTML templates → PDFs via Puppeteer
  * write text emails to `dist/*.txt`
* `pdf/w9_overlay.ts`:

  * with `pdf-lib`, create a blank US Letter PDF and draw:

    * Line 1: seller.legal_name
    * Address: seller.address
    * TIN: prefer `EIN` if present, else `SSN`
  * watermark text: “Overlay – verify on official Form W-9”
* `util/redact.ts`: mask function used anywhere values might hit logs.
* `util/loadConfig.ts`: schema validation; if secrets missing, show friendly instructions (no values).
* `util/pdf.ts`: launch one headless Chromium, reuse across renders, close cleanly.

**TESTS (vitest)**

* `check` rejects missing required YAML fields with helpful messages.
* `generate customer` creates 4 files and `invoice.pdf` contains the **masked** last 2 digits only (e.g., `…**67`) in a non-selectable text footer for human verification; never full numbers.
* `w9` creates `w9_prefill.pdf`; test asserts watermark exists; never logs TIN.

**ACCEPTANCE CRITERIA**

* Running:

  ```
  cp deal.example.yml deal.yml
  cp .env.example .env  # fill locally
  npx paperwork-agent init && npx paperwork-agent check
  npx paperwork-agent generate customer
  npx paperwork-agent package
  ```

  produces the PDFs + emails and `dist/close_pack.zip`.
* No secrets printed to stdout or written to repo.

**DOCS**

* `README.md` with: install, how to fill `deal.yml` + `.env`, run commands, OPSEC tips (use EIN on W-9, share invoice only with AP, never paste raw numbers into chat), and how to manually place the W-9 overlay onto the official form.

**DELIVERABLE**

* Output the full project as a single tarball code block (or a repo tree with file contents). Include `package.json` scripts:

  * `build`, `start`, `check`, `gen:customer`, `gen:investor`, `w9`, `package`.
* After code, print a **one-screen** “Quick Start” with the exact 5 commands a non-engineer can run.

---

## If you want a tiny version (just emails + PDFs)

Paste this to Codex instead:

> Build a single `generate_close_pack.py` (Python 3.11) that reads `deal.yml` + `.env`, renders **proposal.md → proposal.pdf**, **service_order.md → service_order.pdf**, **invoice.html → invoice.pdf**, and writes **customer_email.txt**. Use **Jinja2** and **WeasyPrint** (or fallback to wkhtmltopdf if available). Never log secrets; mask with `****`. Provide `deal.example.yml`, `.env.example`, and a one-page README with commands:
>
> ```
> python -m pip install -r requirements.txt
> cp deal.example.yml deal.yml && cp .env.example .env
> python generate_close_pack.py --customer
> ```
>
> Do not attempt to download the IRS W-9; instead generate a simple “W-9 prefill helper.pdf” overlay with reportlab.

---
