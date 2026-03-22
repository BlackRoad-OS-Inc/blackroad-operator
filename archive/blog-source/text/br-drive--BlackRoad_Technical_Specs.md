# BlackRoad_Technical_Specs

**Source:** br-drive

---

BlackRoad Technical Specifications

User Flows, Database Schemas, API Endpoints, Components

PART 1: USER FLOWS

1.1 User Signup Flow

User lands on any BlackRoad property (blackroad.io, lucidia.earth, etc.)

Clicks "Sign Up" or "Get Started" CTA

Modal appears with options: Continue with Google, Continue with GitHub, Email signup

If OAuth: Redirect to provider, return with tokens, create/link account

If Email: Enter email, password, display name

Email verification sent

User clicks verification link

Onboarding survey: What brings you here? (Creator/Business/Student/Developer)

Based on answer, redirect to appropriate dashboard

Show quick tour overlay (skippable)

1.2 Lucidia Chat Flow

User navigates to lucidia.earth/chat

If not authenticated: Show signup prompt with 5 free sessions/day offer

If authenticated: Load last conversation or new chat

User types message in input field

System checks: Model selection, file attachments, context from memory

Message sent to API with full context

Streaming response displayed in real-time

Response saved to memory system with PS-SHA∞ hash

Context panel updates with related memories

User can: Copy, regenerate, edit, branch, rate response

1.3 Subscription Upgrade Flow

User hits usage limit or clicks "Upgrade" button

Pricing modal appears with tier comparison

User selects tier (Creator $20/mo, Team $100/seat, etc.)

Toggle for monthly/annual billing (20% discount for annual)

Click "Continue to Payment"

Stripe Checkout opens (hosted or embedded)

User enters payment details

Stripe webhook confirms payment

User record updated with new tier

Success screen with new features unlocked

Confirmation email sent

1.4 Consulting Booking Flow (aliceqi.com)

User lands on aliceqi.com or aliceqi.com/consulting

Reviews service tiers: Strategy Session, Implementation Sprint, Retainer

Clicks "Book Now" on desired tier

Calendly embed opens with available time slots

User selects date/time

Enters name, email, company, brief description of needs

If paid session: Stripe payment required

Confirmation email sent with calendar invite

Reminder emails at 24h and 1h before

Follow-up email with deliverables after session

1.5 RoadView Creator Onboarding

User clicks "Start Creating" on roadview.tv

If not signed in: Signup flow

Creator application form: Channel name, content category, sample content links

Agree to creator terms (including 80-90% revenue share)

Application submitted for review (during beta)

Approval email sent (or auto-approve post-beta)

Redirect to Creator Studio

First upload wizard: Upload video, AI generates thumbnail options, enter title/description

Video published to channel

Analytics available immediately

1.6 RoadWork Student Learning Flow

Student lands on roadwork.edu

Clicks "I'm a Student"

Signup (free, no payment required)

Onboarding: Grade level, subjects of interest, learning goals

Optional: Diagnostic assessment to determine starting level

Dashboard populated with recommended lessons

Student clicks on a lesson

Lesson content displayed with interactive elements

Practice problems interspersed

If stuck: AI tutor offers hints, explanations

Lesson completion: XP awarded, streak updated

Next lesson recommended based on performance

PART 2: DATABASE SCHEMAS

Primary database: PostgreSQL via Supabase. All tables include created_at, updated_at timestamps.

2.1 users

2.2 subscriptions

2.3 conversations (Lucidia)

2.4 messages (Lucidia)

2.5 memories (Lucidia)

2.6 agents (Prism Console)

2.7 videos (RoadView)

2.8 lessons (RoadWork)

2.9 student_progress (RoadWork)

PART 3: API ENDPOINTS

Base URL: api.blackroad.io/v1

Authentication: Bearer token in Authorization header

3.1 Authentication

3.2 Users

3.3 Chat (Lucidia)

3.4 Memory (Lucidia)

3.5 Agents (Prism Console)

3.6 Billing

PART 4: COMPONENT SPECIFICATIONS

Reusable components across all BlackRoad properties. Built with React + Tailwind + shadcn/ui.

4.1 Navbar

Logo: BlackRoad logo, links to homepage of current domain

Nav Links: Product, Pricing, Docs, Blog (configurable per domain)

Right Section (logged out): Sign In, Get Started button

Right Section (logged in): Avatar dropdown with Dashboard, Settings, Logout

Mobile: Hamburger menu, slide-out drawer

4.2 AuthModal

Modes: signup, login, forgot-password

OAuth Buttons: Continue with Google, Continue with GitHub

Divider: "or continue with email"

Email Form: Email, password, confirm password (signup only)

Toggle: "Already have an account? Sign in" / "Don't have an account? Sign up"

Validation: Email format, password strength, match confirmation

4.3 PricingTable

Props: product (lucidia, prism, etc.), billingCycle (monthly/annual)

Toggle: Monthly / Annual with savings callout

Tier Cards: Name, price, feature list, CTA button

Current Plan Badge: If user is on that tier, show "Current Plan"

Popular Badge: Highlight recommended tier

4.4 ChatMessage

Props: message object (role, content, model, timestamp)

User Message: Right-aligned, user avatar

Assistant Message: Left-aligned, model icon

Content: Markdown rendering, code syntax highlighting

Actions (on hover): Copy, Edit, Regenerate, Branch

Rating: Thumbs up/down

4.5 ChatInput

Textarea: Auto-expanding, placeholder text

Model Selector: Dropdown to choose model

Attach Button: File upload (images, documents)

Send Button: Submit message, shows loading state

Keyboard: Enter to send, Shift+Enter for newline

4.6 VideoCard (RoadView)

Thumbnail: 16:9 aspect ratio, hover preview

Duration Badge: Bottom right of thumbnail

Title: Max 2 lines, truncate with ellipsis

Creator: Avatar and name, links to channel

Stats: View count, time since published

4.7 LessonCard (RoadWork)

Icon: Subject icon

Title: Lesson title

Progress Bar: If in progress, show completion percentage

XP Badge: XP reward for completion

Time Estimate: "~15 min"

Status: Locked (prereqs not met), Available, In Progress, Completed

PART 5: SEO & ANALYTICS

5.1 SEO Requirements

Meta Tags (per page):

title: Unique, under 60 characters

description: Unique, under 160 characters

og:title, og:description, og:image for social sharing

twitter:card, twitter:title, twitter:description, twitter:image

canonical URL

Technical SEO:

Sitemap.xml generated for each domain

Robots.txt configured properly

Structured data (JSON-LD) for articles, products, FAQs

Page speed: Target 90+ on Lighthouse

Mobile-first responsive design

5.2 Analytics Requirements

Tracking (via Plausible or PostHog):

Page views

Unique visitors

Bounce rate

Session duration

Traffic sources

Geographic distribution

Custom Events:

signup_started, signup_completed

chat_message_sent

upgrade_clicked, upgrade_completed

video_uploaded, video_watched

lesson_started, lesson_completed

agent_created, agent_invoked

consulting_booked

5.3 Conversion Funnels

Signup Funnel:

Landing → Click CTA → Signup Modal → OAuth/Email → Verification → Onboarding → Dashboard

Upgrade Funnel:

Free Usage → Hit Limit → Pricing Modal → Select Tier → Checkout → Payment → Success

Consulting Funnel:

Landing → Services Page → Book CTA → Calendly → Select Time → Payment → Confirmation

End of Technical Specifications
