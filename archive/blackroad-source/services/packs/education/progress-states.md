# 🧬 Progress State Transitions

This document defines the valid state transitions for learner progress.

## State Diagram

```
┌─────────────┐
│ not-started │
└──────┬──────┘
       │ start course/lesson/activity
       ▼
┌─────────────┐
│ in-progress │◄────┐ retry after failure
└──────┬──────┘     │
       │ complete   │
       ▼            │
┌─────────────┐     │
│  completed  │─────┘ review for mastery
└──────┬──────┘
       │ demonstrate exceptional understanding
       ▼
┌─────────────┐
│   mastered  │
└─────────────┘
```

## Valid Transitions

### From: `not-started`
✅ **ALLOWED**
- → `in-progress` (learner starts the item)

❌ **FORBIDDEN**
- → `completed` (cannot skip)
- → `mastered` (cannot skip)

### From: `in-progress`
✅ **ALLOWED**
- → `completed` (learner completes successfully)
- → `not-started` (learner explicitly resets/abandons)

❌ **FORBIDDEN**
- → `mastered` (must go through completed first)

### From: `completed`
✅ **ALLOWED**
- → `mastered` (learner demonstrates exceptional understanding)
- → `in-progress` (learner retries for better score or review)

❌ **FORBIDDEN**
- → `not-started` (cannot un-complete; use new attempt instead)

### From: `mastered`
✅ **ALLOWED**
- → `in-progress` (learner reviews content to stay sharp)

❌ **FORBIDDEN**
- → `not-started` (mastery is permanent in record)
- → `completed` (cannot downgrade)

## Business Rules

### Completion Requirements
To transition from `in-progress` → `completed`:
1. All required activities must be completed
2. Passing score must be achieved on assessments (if applicable)
3. Minimum time requirement met (if specified)

### Mastery Requirements
To transition from `completed` → `mastered`:
1. Score ≥ 90% (or course-specific threshold)
2. Demonstrated understanding beyond basic requirements
3. May require additional challenge activities
4. Optional: Peer teaching or content creation

### Retry Behavior
When a learner retries an activity/assessment:
1. Previous attempts are preserved in history
2. State reverts to `in-progress`
3. Attempt counter increments
4. `bestScore` tracks highest score achieved
5. If max attempts reached, requires special flow for additional attempts

### Archive Triggers
Progress state changes that trigger archive:
- `completed` → Archive if course has `complianceCategory`
- `mastered` → Archive with certificate data
- Any state change on `REQUIRED TRAINING FLOW`

## State Metadata

Each state includes metadata:

```javascript
{
  state: "in-progress",
  stateMetadata: {
    transitionedAt: "2025-11-25T22:35:00Z",
    transitionedBy: "flow:start-course",
    previousState: "not-started",
    attemptNumber: 1
  }
}
```

## Error Handling

Invalid state transitions should:
1. Return error with current state and attempted transition
2. Log the invalid attempt for debugging
3. Suggest valid next actions
4. Do not modify the current state

Example error:
```javascript
{
  error: "InvalidStateTransition",
  currentState: "not-started",
  attemptedTransition: "mastered",
  message: "Cannot transition from not-started to mastered. Valid transitions: [in-progress]",
  suggestedActions: ["Start the course first"]
}
```
