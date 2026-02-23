# RoadWork — Adaptive Education Portal

> *"Education that evolves with your understanding."*

**Portal ID:** `portal.roadwork`
**Status:** Planning
**Primary Domain:** Adaptive Learning & Education

---

## Overview

RoadWork is BlackRoad OS's education portal — an AI-powered learning platform that adapts to how you think, not just what you know. Unlike traditional courses that treat every learner the same, RoadWork builds a model of your understanding and adjusts in real-time.

Whether you're learning to code, studying physics, or mastering a new language, RoadWork meets you where you are and guides you where you need to go.

---

## Core Value Proposition

### The Problem with Traditional Education

1. **One-size-fits-all** — Same content, same pace for everyone
2. **Fixed curricula** — Can't adapt to individual gaps or interests
3. **Passive learning** — Watch videos, read text, hope it sticks
4. **Poor feedback loops** — Weeks between learning and assessment
5. **No persistence** — Each platform starts fresh, no continuity

### The RoadWork Solution

| Problem | RoadWork Solution |
|---------|-------------------|
| One-size-fits-all | Adaptive difficulty and pacing |
| Fixed curricula | Dynamic knowledge graph navigation |
| Passive learning | Active recall, Socratic dialogue |
| Poor feedback | Real-time understanding assessment |
| No persistence | Persistent learner model across topics |

---

## Key Features

### 1. Knowledge Graph Learning

RoadWork maps knowledge as a connected graph, not linear chapters.

```
                    ┌─────────────┐
                    │  Calculus   │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
     │ Derivatives │ │ Integrals │ │   Limits    │
     └──────┬──────┘ └─────┬─────┘ └──────┬──────┘
            │              │              │
     ┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
     │  Chain Rule │ │ Area Under│ │  Epsilon-   │
     │             │ │  Curve    │ │   Delta     │
     └─────────────┘ └───────────┘ └─────────────┘
```

- **Navigate freely** — Jump to what interests you
- **See prerequisites** — Know what you need first
- **Track mastery** — Visual progress across the graph
- **Find connections** — See how concepts relate

### 2. Adaptive Tutoring

RoadWork adjusts to your understanding in real-time.

**Adaptation Dimensions:**

| Dimension | How It Adapts |
|-----------|---------------|
| **Difficulty** | Easier examples when struggling, harder when cruising |
| **Pace** | Slow down for complex topics, speed up for familiar ones |
| **Style** | Visual, textual, interactive based on what works for you |
| **Depth** | High-level overview vs. deep dive based on goals |
| **Examples** | Domain-relevant (code for devs, business for MBAs) |

### 3. Socratic Dialogue

Learning through conversation, not consumption.

```
RoadWork: What do you think happens to f(x) = 1/x as x approaches 0?

You: It gets really big?

RoadWork: Yes! Can you be more precise? What happens from the
positive side vs. the negative side?

You: Oh... from positive it goes to positive infinity, from
negative it goes to negative infinity?

RoadWork: Exactly! This is why we say the limit "does not exist"
at x=0 — the left and right limits don't agree. Let me show you
a visualization...
```

### 4. Spaced Repetition + Active Recall

Retention through scientifically-proven techniques:

- **Spaced repetition** — Review at optimal intervals
- **Active recall** — Generate answers, don't just recognize
- **Interleaving** — Mix topics to strengthen connections
- **Desirable difficulty** — Challenge strengthens memory

```
┌─────────────────────────────────────────────────┐
│           RETENTION CURVE                        │
│                                                  │
│  100% ─┐                                        │
│        │\                                       │
│        │ \    Review 1    Review 2    Review 3  │
│        │  \      │           │           │      │
│   50% ─│   \─────┼───────────┼───────────┼──    │
│        │    \    │\          │\          │\     │
│        │     \   │ \         │ \         │ \    │
│    0% ─┴─────────┴───────────┴───────────┴────  │
│        Day 1    Day 3      Day 7      Day 21    │
└─────────────────────────────────────────────────┘
```

### 5. Project-Based Learning

Apply knowledge through real projects:

- **Guided projects** — Step-by-step with AI assistance
- **Open projects** — Define your own with AI feedback
- **Portfolio building** — Shareable proof of skills
- **Peer collaboration** — Work with others at similar levels

### 6. Certification & Credentials

Earn verifiable proof of mastery:

- **Skill badges** — Granular competency markers
- **Course certificates** — Completion with assessment
- **Blockchain verification** — Tamper-proof credentials
- **LinkedIn integration** — Share achievements

---

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     ROADWORK PORTAL                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Course UI   │  │   Lab UI     │  │  Mobile UI   │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│  ┌──────▼─────────────────▼─────────────────▼──────┐        │
│  │              LEARNING ENGINE                     │        │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │        │
│  │  │Adaptive │ │Socratic │ │Spaced   │ │Project │ │        │
│  │  │Tutor    │ │Dialogue │ │Review   │ │Engine  │ │        │
│  │  └─────────┘ └─────────┘ └─────────┘ └────────┘ │        │
│  └──────────────────────┬──────────────────────────┘        │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────┐        │
│  │              LEARNER MODEL                       │        │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │        │
│  │  │Knowledge│ │Learning │ │Retention│ │Goals   │ │        │
│  │  │State    │ │Style    │ │Schedule │ │Tracker │ │        │
│  │  └─────────┘ └─────────┘ └─────────┘ └────────┘ │        │
│  └──────────────────────┬──────────────────────────┘        │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────┐        │
│  │              CONTENT ENGINE                      │        │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │        │
│  │  │Knowledge│ │Content  │ │Problem  │ │Project │ │        │
│  │  │Graph    │ │Library  │ │Bank     │ │Catalog │ │        │
│  │  └─────────┘ └─────────┘ └─────────┘ └────────┘ │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    GOVERNANCE LAYER                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ Cece    │ │ Policy  │ │ Ledger  │ │ Intent  │            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Learner Model

```typescript
interface LearnerModel {
  learner_id: string;
  created_at: string;

  // Knowledge state
  knowledge_graph: {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
  };

  // Learning style
  style: {
    preferred_modality: 'visual' | 'textual' | 'interactive' | 'mixed';
    pace_preference: 'slow' | 'moderate' | 'fast';
    depth_preference: 'overview' | 'balanced' | 'deep';
    example_domains: string[];  // e.g., ["programming", "business"]
  };

  // Retention tracking
  retention: {
    items: RetentionItem[];
    schedule: ReviewSchedule;
  };

  // Goals and progress
  goals: LearningGoal[];
  streaks: StreakData;
  achievements: Achievement[];
}

interface KnowledgeNode {
  concept_id: string;
  name: string;
  mastery_level: number;        // 0-100
  last_practiced: string;
  practice_count: number;
  difficulty_rating: number;    // How hard this is for this learner
  prerequisites: string[];
  status: 'locked' | 'available' | 'in_progress' | 'mastered';
}

interface RetentionItem {
  item_id: string;
  concept_id: string;
  question: string;
  last_review: string;
  next_review: string;
  ease_factor: number;          // SM-2 algorithm parameter
  interval: number;             // Days until next review
  repetitions: number;
}
```

---

## Learning Domains

### Launch Domains

| Domain | Topics | Target Audience |
|--------|--------|-----------------|
| **Programming** | Python, JavaScript, SQL, Data Structures | Beginners to intermediate |
| **Mathematics** | Algebra, Calculus, Statistics, Linear Algebra | Students, professionals |
| **Data Science** | ML basics, pandas, visualization, modeling | Career changers |
| **Languages** | Spanish, French, Japanese, Mandarin | All levels |

### Future Domains

- Sciences (Physics, Chemistry, Biology)
- Business (Finance, Marketing, Strategy)
- Design (UI/UX, Graphic Design)
- Music (Theory, Instruments)
- Writing (Creative, Technical, Academic)

---

## User Experience

### Learning Flow

```
1. ONBOARDING
   │
   ├── Diagnostic assessment (optional)
   ├── Learning style survey
   └── Goal setting
   │
   ▼
2. EXPLORATION
   │
   ├── Browse knowledge graph
   ├── AI-recommended paths
   └── Search specific topics
   │
   ▼
3. LEARNING
   │
   ├── Adaptive lessons
   ├── Socratic dialogue
   ├── Practice problems
   └── Hands-on labs
   │
   ▼
4. REINFORCEMENT
   │
   ├── Daily review (spaced repetition)
   ├── Interleaved practice
   └── Application projects
   │
   ▼
5. CERTIFICATION
   │
   ├── Mastery assessment
   ├── Badge/certificate issuance
   └── Portfolio update
```

### Example Session: Learning Python

```
RoadWork: Welcome back! You've been working on Python functions.
Your retention is strong on basic syntax, but let's reinforce
the concept of scope. Ready for a quick challenge?

You: Sure!

RoadWork: Look at this code:

    x = 10

    def modify():
        x = 20
        return x

    result = modify()
    print(x)

What gets printed?

You: 20?

RoadWork: Good guess, but let's think about it. When you write
`x = 20` inside the function, are you modifying the outer `x`
or creating a new local `x`?

You: Oh... creating a new local one?

RoadWork: Exactly! So the outer `x` is still 10. This is called
"variable shadowing." The local `x` shadows the global one.

If you wanted to modify the global `x`, you'd need to use the
`global` keyword. Want to see an example?
```

### Daily Review

```
┌─────────────────────────────────────────────────────────────┐
│  📚 Daily Review                           12 cards due     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  What is the time complexity of binary search?               │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                       │    │
│  │  [Show Answer]                                       │    │
│  │                                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  O(log n) — because we halve the search space each step     │
│                                                              │
│  How well did you remember?                                  │
│                                                              │
│  [Again]  [Hard]  [Good]  [Easy]                            │
│  (1 min)  (6 min) (10 min) (4 days)                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Governance Integration

### Learning Analytics Policies

```yaml
policies:
  - scope: roadwork.analytics.collect
    rules:
      - condition: "data_type == 'performance'"
        action: allow
        reason: "Performance data needed for adaptation"

      - condition: "data_type == 'biometric'"
        action: deny
        reason: "No biometric data collection"

  - scope: roadwork.content.generate
    rules:
      - condition: "content_type == 'assessment'"
        action: require_human_approval
        reason: "Assessments need curriculum review"
```

### Credential Verification

All certificates are logged to the ledger:

```json
{
  "event_id": "evt-20251130-cert001",
  "intent_id": "int-20251130-learn",
  "agent_id": "roadwork.certifier.v1",
  "tool": "credential",
  "action": "issue",
  "inputs_hash": "sha256:learner+course+assessment",
  "outputs_hash": "sha256:certificate_hash",
  "metadata": {
    "learner_id": "user:alexa",
    "course_id": "python-fundamentals",
    "mastery_score": 92,
    "issued_at": "2025-11-30T14:32:01Z"
  }
}
```

---

## API Endpoints

### Learning

```bash
# Start learning session
POST /portal/roadwork/sessions
{
  "concept_id": "python-functions",
  "mode": "adaptive"  # or "review", "practice", "project"
}

# Submit response
POST /portal/roadwork/sessions/{session_id}/responses
{
  "question_id": "q-12345",
  "response": "O(log n)",
  "time_taken_ms": 4500
}

# Get next content
GET /portal/roadwork/sessions/{session_id}/next
```

### Learner Model

```bash
# Get knowledge state
GET /portal/roadwork/learner/knowledge

# Get due reviews
GET /portal/roadwork/learner/reviews/due

# Update learning preferences
PATCH /portal/roadwork/learner/preferences
{
  "pace": "fast",
  "depth": "deep"
}
```

### Credentials

```bash
# Get certificates
GET /portal/roadwork/credentials

# Verify certificate
GET /portal/roadwork/credentials/{cert_id}/verify

# Share certificate
POST /portal/roadwork/credentials/{cert_id}/share
{
  "platform": "linkedin"
}
```

---

## Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | 1 course at a time, basic review, no certificates |
| **Learner** | $15/mo | Unlimited courses, full review system, certificates |
| **Pro** | $30/mo | Priority AI tutoring, 1:1 sessions, career guidance |
| **Team** | $25/user/mo | Team learning, admin dashboard, progress tracking |
| **Enterprise** | Custom | Custom content, LMS integration, dedicated support |

---

## Roadmap

### MVP (Phase 1)
- [ ] Python fundamentals course
- [ ] Basic adaptive difficulty
- [ ] Spaced repetition system
- [ ] Simple knowledge graph

### Beta (Phase 2)
- [ ] 5+ courses
- [ ] Full Socratic dialogue
- [ ] Projects and labs
- [ ] Mobile app

### v1.0 (Phase 3)
- [ ] 20+ courses
- [ ] Certification system
- [ ] Peer learning
- [ ] Instructor tools

### Future
- [ ] VR/AR learning environments
- [ ] AI-generated personalized curriculum
- [ ] Corporate training platform
- [ ] Credential marketplace

---

## Competitive Differentiation

| Feature | RoadWork | Coursera | Duolingo | Khan Academy |
|---------|----------|----------|----------|--------------|
| Adaptive difficulty | ✅ Real-time | ❌ Fixed | ✅ Basic | ❌ Fixed |
| Knowledge graph | ✅ Visual | ❌ Linear | ❌ Linear | ✅ Basic |
| Socratic dialogue | ✅ AI-powered | ❌ None | ❌ None | ❌ None |
| Spaced repetition | ✅ Advanced | ❌ None | ✅ Basic | ❌ None |
| Governance/audit | ✅ Full | ❌ None | ❌ None | ❌ None |
| Cross-topic memory | ✅ Yes | ❌ No | ❌ No | ❌ No |

---

## References

- [Lucidia Portal](./lucidia.md)
- [Architecture Overview](../meta/vision/architecture.md)
- [Governance Layer](../governance/cece-agent-mode.md)
