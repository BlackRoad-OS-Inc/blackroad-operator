# All Templates

**Source:** google-docs

---

Yesss, this is the fun part: inventory the whole universe before we start drawing screens. 🖤🌈

Let’s list all the templates we’ll want across:

Website (marketing + logged-in)

Web app / Prism Console / OS

Mobile apps

Docs & dev

System / emails

I’ll name them like “Area / Template Name” so we can turn each into a design + code prompt later.

1️⃣ Marketing Website Templates

Core marketing:

Marketing / Home (Master Landing)

Marketing / Product Overview (what BlackRoad OS is, high level)

Marketing / Solutions by Persona (Ops, Dev, Compliance, Exec)

Marketing / Individual Product Landing

e.g. Prism Console, RoadChain, Lucidia, etc.

Marketing / Pricing & Plans

Marketing / Customer Stories / Case Studies

Marketing / Resources Hub

filters: blogs, whitepapers, videos, decks

Marketing / Blog Index

Marketing / Blog Article

Brand & company:

Marketing / About BlackRoad OS

Marketing / Team & Advisors

Marketing / Careers

Marketing / Press & Media Kit

Marketing / Brand Guidelines (uses that dark-rainbow kit)

Conversion & contact:

Marketing / Contact & Demo Request

Marketing / Waitlist / Early Access Signup

Marketing / Campaign Landing (One-pager)

Marketing / Event or Webinar Landing

Legal & utility:

Marketing / Legal (TOS / Privacy / Disclosures)

Marketing / Cookie & Consent Center

Marketing / 404 (Public)

Marketing / Maintenance / Down for Upgrades

2️⃣ Web App / Prism Console / OS Templates

These are the logged-in layouts for the OS, Prism Console, operator views, etc.

Shells & navigation:

App / Auth Shell

login, sign up, forgot password, SSO

App / Main Shell

top bar, side nav, workspace switcher, user menu

App / Modal Shell

centered card for create/edit flows, confirmations

App / Wizard Shell

multi-step setup (connect cloud, link GitHub, etc.)

Operator views:

App / Global Dashboard

OS health, key metrics, quick actions

App / Agents List

App / Agent Detail

config, history, logs, lineage

App / Workflows & Pipelines

App / Services & Health Grid

each service tile: status, latency, last deploy

App / Logs & Events Stream

App / Incidents & Alerts

Configuration & data:

App / Organization Settings

App / Workspace Settings

App / User Profile & Preferences

App / Billing & Usage

App / Integrations Catalog

tiles for GitHub, Railway, Cloudflare, DO, etc.

App / Integration Detail

scopes, keys, status, activity

App / API Keys & Tokens

App / Access Control & Roles

Patterns & states (reusable):

App / Table View (Standard)

searchable, filterable, paginated

App / Card Grid View

App / Empty State

App / Error State (In-App)

App / Success / Confirmation Screen

App / Side Panel Detail

slide-over for quick edit / view

3️⃣ Mobile App Templates (iOS / Android)

Think “BlackRoad OS in your pocket.”

Shell & auth:

Mobile / Auth Stack

welcome, login, sign up, reset password

Mobile / Tab Shell

bottom nav: Home · Agents · Activity · Settings

Core screens:

Mobile / Home Dashboard

Mobile / Agents List

Mobile / Agent Detail & Run

Mobile / Activity Feed & Notifications

Mobile / Service Status

Mobile / Quick Actions

run workflow, trigger deployment, acknowledge alert

Profile & settings:

Mobile / Profile & Preferences

Mobile / Workspace Switcher

Mobile / Mobile Settings (push, biometrics, etc.)

Overlays:

Mobile / Bottom Sheet (Quick Actions)

Mobile / Full-Screen Modal (Wizard)

Mobile / Error & Offline States

4️⃣ Docs, Dev, & Knowledge Base Templates

For /docs, API users, and internal runbooks.

Docs / Home

Docs / Getting Started Guide

Docs / Concept Overview Page

Docs / How-To Article

Docs / API Reference

left nav endpoints, right content, code samples

Docs / SDK Reference

Docs / Changelog & Release Notes

Docs / Search Results

Docs / Developer Onboarding (for agents/apps)

5️⃣ System, Emails, & Misc Templates

System stuff that still needs tight brand.

System / Standalone 404

System / Standalone 500 / Error

System / Standalone Maintenance

Emails (using same dark-rainbow vibe but email-safe):

Email / Verify Email & Welcome

Email / Password Reset

Email / Alert & Incident Notification

Email / Weekly Digest (Usage, incidents, wins)

Email / Billing & Invoice

Notifications & micro-UI:

UI Pattern / Toast Notifications

UI Pattern / Inline Banners (warning, info, success)

UI Pattern / Confirmation Dialogs (danger, irreversible)

If this list feels right, next step is:

Pick the first cluster you want built (e.g. “Marketing site” or “App shell + dashboards”).

I’ll turn each into a concrete template spec (sections, layout, content slots) and then into actual HTML/React/Codex prompts using our black-rainbow OS look.

Where do you want to start: marketing home + pricing, or OS app shell + global dashboard?
