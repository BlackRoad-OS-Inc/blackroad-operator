# 🧪 Testing Guide

## Running Tests

### All Tests
```bash
npm test
```

### Individual Test Suites
```bash
npm run test:schemas    # Schema validation tests
npm run test:states     # Progress state transition tests
npm run test:agents     # Agent configuration tests
```

## Test Coverage

### Schema Validation Tests (`tests/schema-validation.test.js`)

Validates that all content objects conform to their schemas:

✅ **Course schema** - Example course validates  
✅ **Lesson schema** - Example lesson + template validates  
✅ **Activity schema** - All activity templates validate  
✅ **Rubric schema** - All rubric templates validate  
✅ **Tutor-agent schema** - All agent configs validate  
✅ **Flow schema** - All flow definitions validate  

### Progress State Tests (`tests/progress-states.test.js`)

Ensures state transitions follow the rules:

✅ **Valid transitions allowed**
- not-started → in-progress
- in-progress → completed
- completed → mastered
- completed → in-progress (retry)
- mastered → in-progress (review)
- in-progress → not-started (reset)

✅ **Invalid transitions blocked**
- not-started → completed (no skipping)
- not-started → mastered (no skipping)
- in-progress → mastered (no skipping)
- completed → not-started (no un-completing)
- mastered → not-started (no downgrade)
- mastered → completed (no downgrade)

✅ **Transition rules configured**
- All states have transition rules
- All allowed transitions have conditions and effects
- Validation rules properly defined

### Agent Configuration Tests (`tests/agent-config.test.js`)

Validates agent configurations and guardrails:

✅ **Schema validation** - All agents validate against schema  
✅ **Guardrails present** - Required guardrails configured  
✅ **Constructive feedback** - Must provide next steps  
✅ **Data restrictions** - No PII access enforced  
✅ **Pack access** - Allowed Packs configured  
✅ **Cannot auto-pass** - All agents require rubric  
✅ **Human review** - Grader assistant requires human approval  

## Adding New Tests

### For New Content Types
1. Add schema to `/schemas/`
2. Create example instance
3. Add test case to `schema-validation.test.js`:
```javascript
testSchema(
  path.join(__dirname, '../schemas/your-new-type.schema.json'),
  path.join(__dirname, '../examples/your-instance.json'),
  'Description of what is being tested'
);
```

### For New State Transitions
1. Update `/flows/state-transitions.json`
2. Add test cases to `progress-states.test.js`:
```javascript
test('new-state → other-state is valid', () => {
  assert(
    isValidTransition('new-state', 'other-state'),
    'Should allow this transition'
  );
});
```

### For New Agent Configs
1. Create agent config in `/agents/`
2. Tests automatically run for all `.json` files in agents directory
3. Add specific tests if agent has unique requirements

## Continuous Integration

These tests should be run:
- Before committing changes
- In CI/CD pipeline
- Before releasing new course content
- When updating schemas

## Test Philosophy

Our testing approach prioritizes:

1. **Schema validation** - Catch structural errors early
2. **State machine integrity** - Prevent invalid progress states
3. **Safety guardrails** - Ensure agents are properly constrained
4. **Documentation through tests** - Tests show expected behavior

## What We Don't Test (Yet)

These would be handled by integration tests in other repos:

- Flow execution (handled by `blackroad-os-core`)
- UI rendering (handled by `blackroad-os-web`)
- Agent behavior (handled by agent runtime)
- Database persistence (handled by `blackroad-os-core`)
- API endpoints (handled by `blackroad-os-core`)

The Education Pack focuses on **content model validation**, not runtime behavior.
