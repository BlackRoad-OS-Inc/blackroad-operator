# BlackRoad_Copy_Implementation

**Source:** br-drive

---

BlackRoad Copy & Implementation Guide

Microcopy, Error Messages, Emails, and Build Checklist

PART 1: MICROCOPY LIBRARY

Consistent copy for buttons, labels, and UI elements across all products.

1.1 Button Labels

1.2 Form Labels & Placeholders

1.3 Empty States

1.4 Success Messages

1.5 Error Messages

1.6 Loading & Progress States

PART 2: EMAIL TEMPLATES

2.1 Welcome Email

Subject: Welcome to BlackRoad!

Body:

Hi [Name],

Welcome to BlackRoad! You're now part of a community building the future of AI.

Here's what you can do next:

1. Start chatting with Lucidia — Your AI that never forgets
2. Explore the Prism Console — Orchestrate AI agents at scale
3. Check out our docs — Learn how to build with BlackRoad

Questions? Reply to this email or check out our docs.

Happy building,
The BlackRoad Team

2.2 Email Verification

Subject: Verify your email address

Body:

Hi [Name],

Please verify your email address to complete your signup.

[Verify Email Button]

Or copy and paste this link: [verification-url]

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

— BlackRoad

2.3 Password Reset

Subject: Reset your password

Body:

Hi [Name],

We received a request to reset your password.

[Reset Password Button]

Or copy and paste this link: [reset-url]

This link expires in 1 hour.

If you didn't request this, you can safely ignore this email. Your password won't change.

— BlackRoad

2.4 Payment Receipt

Subject: Receipt for your BlackRoad subscription

Body:

Hi [Name],

Thank you for your payment. Here's your receipt:

Plan: [Plan Name]
Amount: $[Amount]
Date: [Date]
Invoice #: [Invoice Number]

[View Invoice Button]

Manage your subscription anytime in your account settings.

Thank you for being a BlackRoad customer!

— BlackRoad

2.5 Trial Ending

Subject: Your trial ends in 3 days

Body:

Hi [Name],

Your BlackRoad trial ends in 3 days. After that, you'll be moved to the free plan.

During your trial, you've:
- Had [X] conversations with Lucidia
- Created [Y] agents
- Used [Z] tokens

Upgrade now to keep access to:
- Unlimited conversations
- Full memory persistence
- Advanced features

[Upgrade Now Button]

Questions? Reply to this email.

— BlackRoad

2.6 Consulting Booking Confirmation

Subject: Your call is confirmed: [Date] at [Time]

Body:

Hi [Name],

Your call is confirmed!

Date: [Date]
Time: [Time] [Timezone]
Duration: [Duration]
Type: [Session Type]

Meeting Link: [Link]

To prepare, think about:
- Your current AI challenges
- What you're hoping to achieve
- Any specific questions you have

Need to reschedule? [Reschedule Link]

Looking forward to speaking with you!

— Alice

PART 3: IMPLEMENTATION CHECKLIST

3.1 Phase 1: Week 1-2 (Foundation)

Infrastructure

Set up Supabase project (database, auth, storage)

Configure Cloudflare DNS for all domains

Set up Vercel project for frontend deployment

Set up Railway project for backend services

Configure environment variables in all environments

Set up Stripe account and test keys

Configure email provider (Resend or Postmark)

blackroad.io

Create Next.js project with App Router

Install and configure Tailwind CSS

Install and configure shadcn/ui

Build Navbar component

Build Footer component

Build Homepage (/, all sections)

Build /pricing page

Build /about page

Set up analytics (Plausible or PostHog)

Configure SEO meta tags

Deploy to Vercel

lucidia.earth

Create Next.js project (or monorepo with blackroad.io)

Build Homepage

Build /pricing page

Build AuthModal component

Implement auth flow (signup, login, OAuth)

Build /chat interface (MVP)

Implement chat API with streaming

Connect to at least one LLM (OpenAI or Anthropic)

Implement conversation persistence

Deploy to Vercel

aliceqi.com

Create simple Next.js site

Build Homepage

Build /consulting page

Embed Calendly widget

Set up Calendly with Stripe integration for paid sessions

Build /portfolio page (placeholder content ok)

Deploy to Vercel

3.2 Phase 2: Week 3-4 (Core Product)

blackroad.io Extensions

Build /create portal page

Build /build portal page

Build /learn portal page

Link portals to appropriate product pages

lucidia.earth Extensions

Implement model selector (multi-model support)

Build conversation sidebar

Implement conversation search

Build /studio code editor (Monaco integration)

Implement file attachment uploads

Build context panel (related memories preview)

Implement message actions (copy, regenerate, edit)

Build /docs documentation site

Billing Integration

Set up Stripe products and prices

Implement checkout flow

Set up Stripe webhooks

Implement subscription management

Build customer portal link

Implement usage tracking and limits

Email System

Create email templates (welcome, verification, reset)

Implement email sending service

Set up transactional email triggers

3.3 Phase 3: Month 2 (Expansion)

Memory System

Implement PS-SHA∞ hashing for memories

Build memory extraction from conversations

Set up vector embeddings (OpenAI or local)

Implement semantic memory search

Build /memory browser interface

Implement memory context injection into prompts

Prism Console (MVP)

Build /console dashboard

Implement agent CRUD

Build agent configuration interface

Implement agent invocation API

Build agent logs viewer

Implement basic orchestration (event bus)

API Portal

Build /api portal interface

Implement API key generation

Build usage dashboard

Implement rate limiting

Create API documentation (OpenAPI spec)

3.4 Phase 4: Quarter 2 (Platform)

RoadView (roadview.tv)

Create Next.js project for roadview.tv

Build Homepage with content feed

Build /for-creators landing page

Implement video upload (S3 or R2)

Build video player (/watch/[id])

Build Creator Studio

Implement auto-transcription

Build semantic search for videos

Implement creator monetization tracking

Build channel pages (/c/[creator])

RoadWork (roadwork.edu)

Create Next.js project for roadwork.edu

Build Homepage with audience selector

Build /student dashboard

Build lesson content system

Build /homework AI tutor interface

Implement XP and streak system

Build /teacher dashboard

Build /school landing page

Implement progress tracking

RoadChain (roadchain.io)

Create Next.js project for roadchain.io

Build Homepage with network stats

Build /whitepaper page

Build /wallet interface

Implement browser mining (/mine)

Build block explorer (/explorer)

Deploy testnet

3.5 Ongoing Tasks

Monitor error rates and uptime

Review analytics weekly

Collect and act on user feedback

Update dependencies monthly

Security audit quarterly

Performance optimization (Core Web Vitals)

Content updates (blog, docs)

A/B testing for conversion optimization

End of Copy & Implementation Guide
