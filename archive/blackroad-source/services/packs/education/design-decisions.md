# 🎓 Education Pack Design Decisions

This document captures key design decisions and their rationale.

## State Machine Design

### Decision: Four-State Model
We chose `not-started → in-progress → completed → mastered` over simpler models.

**Rationale:**
- **not-started** - Explicit enrollment/intention to learn
- **in-progress** - Active learning (most time spent here)
- **completed** - Met basic requirements
- **mastered** - Exceptional understanding (optional but aspirational)

**Alternatives considered:**
- Two-state (incomplete/complete) - Too simple, no retry/mastery
- Three-state (not-started/in-progress/completed) - Missing mastery aspiration
- Five-state (adding "failed") - Negative framing, conflicts with retry philosophy

### Decision: Mastery is Permanent
Once achieved, mastery status persists in history even if learner reviews.

**Rationale:**
- Recognizes significant achievement
- Motivates excellence
- Simplifies compliance (mastery = high-quality completion)
- Allows review without losing status

## Agent Guardrails

### Decision: No Agent Auto-Passing
All agents have `cannotPass: true` - they cannot mark learners as passed without rubric.

**Rationale:**
- Maintains educational integrity
- Ensures consistent evaluation standards
- Prevents gaming or shortcuts
- Human accountability for high-stakes decisions

### Decision: Grader Assistant Requires Human Review
Even though it uses rubrics, final grades need human approval.

**Rationale:**
- Education is high-stakes (affects careers, compliance)
- Rubrics may not capture all nuances
- Builds trust with learners
- Legal/ethical responsibility

### Decision: All Agents Must Provide Next Steps
`mustProvideNextSteps: true` for all agent feedback.

**Rationale:**
- Feedback without action items is frustrating
- Supports growth mindset
- Makes learning path clear
- Reduces learner confusion/dropout

## Schema Design

### Decision: JSON Schema Over Custom DSL
Used standard JSON Schema instead of creating custom course definition language.

**Rationale:**
- Mature ecosystem (validators, editors, generators)
- Well-documented standard
- Tooling already exists
- Easy to extend
- Familiar to developers

### Decision: Separate Schemas for Each Content Type
Instead of one mega-schema, separate schemas for course/lesson/activity/etc.

**Rationale:**
- Single responsibility principle
- Easier to validate
- Reusable across contexts
- Clearer documentation
- Simpler to extend

## Integration Design

### Decision: Event-Driven Integration
Using events (course-started, lesson-completed) instead of polling.

**Rationale:**
- Real-time updates
- Reduces load
- Decouples systems
- Easier to add new integrations
- Clear audit trail

### Decision: Archive for Compliance, Not Primary Storage
Progress data lives in core; Archive is for immutable audit trail.

**Rationale:**
- Archive optimized for long-term retention
- Education Pack optimized for active learning
- Separation of concerns
- Compliance requirements met without slowing learning

## Content Model Design

### Decision: Activities Reference Rubrics
Activities link to rubrics by ID rather than embedding them.

**Rationale:**
- Rubrics are reusable across activities
- Easier to update evaluation criteria
- Clearer separation: what vs. how-to-grade
- Supports rubric libraries

### Decision: Lessons Reference Activities
Lessons link to activities rather than embedding them.

**Rationale:**
- Activities can be reused across lessons
- Easier to remix/customize courses
- Supports activity libraries
- Cleaner lesson structure

## Template Strategy

### Decision: Provide Templates, Not Generators
Templates are examples to copy/modify, not code generators.

**Rationale:**
- Educational content is creative work
- Templates show best practices without constraining
- Easier to customize than generated code
- Teaches the schema structure
- No additional tooling needed

### Decision: Course Playbook as Markdown
Instead of interactive wizard, provide written playbook.

**Rationale:**
- Works with any editor
- Easy to customize for specific needs
- Can be used as checklist
- No additional UI needed
- Accessible to all skill levels

## Testing Strategy

### Decision: Schema Validation as Primary Test
Focus on validating content against schemas.

**Rationale:**
- Catches most errors
- Fast to run
- Clear error messages
- Aligns with "structured content" principle
- Easy to extend

### Decision: State Transition Logic Tests
Separate test suite for state machine validation.

**Rationale:**
- Critical for data integrity
- Complex logic needs dedicated tests
- Prevents invalid progress states
- Documents expected behavior

### Decision: Agent Config Tests
Verify agent guardrails are properly configured.

**Rationale:**
- Safety-critical (prevents unauthorized actions)
- Easy to misconfigure
- Documents requirements clearly
- Catches missing guardrails

## Future Considerations

### Potential Future States
If needed, could add:
- `failed` - Explicit failure state (vs. in-progress with low score)
- `archived` - Historical courses no longer active
- `suspended` - Paused enrollment

Currently avoiding these to keep model simple.

### Potential Future Agent Roles
- `peer-mentor` - Learner helping other learners
- `content-curator` - Suggests related content
- `progress-coach` - Helps with study habits/motivation

### Potential Future Content Types
- `simulation` - Interactive scenarios
- `peer-review` - Learner-to-learner feedback activities
- `capstone` - Multi-module final project
- `certification-exam` - High-stakes assessment

## Non-Goals

What we explicitly chose NOT to do:

❌ **Live video instruction** - Out of scope; integrate with existing tools  
❌ **Social features** - Discussion forums, chat belong in separate Pack  
❌ **Content authoring UI** - Web Pack handles UI; this is content model  
❌ **LMS features** - Gradebook, attendance, etc. are in Prism/Core  
❌ **Payment/enrollment** - Commerce Pack handles transactions  

Keep Education Pack focused on **learning content and flows**.
