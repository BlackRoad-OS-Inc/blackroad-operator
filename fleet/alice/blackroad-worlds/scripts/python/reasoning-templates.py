#!/usr/bin/env python3
"""
BlackRoad LLM Reasoning Training
Teach the model to THINK, not just pattern-match
"""
import json
from datetime import datetime

print("🧠 BLACKROAD REASONING TRAINING")
print("=" * 70)
print()

# ============================================================================
# REASONING PATTERNS (not just syntax patterns!)
# ============================================================================

reasoning_templates = {
    "chain_of_thought": {
        "description": "Step-by-step logical reasoning",
        "examples": [
            {
                "prompt": "How would you deploy a new service to production?",
                "response": """Let me think through this step-by-step:

REASONING PROCESS:
1. What are we deploying?
   - A new service that needs to be production-ready
   - Must be reliable, scalable, monitored

2. What could go wrong?
   - Service crashes
   - Database not ready
   - Dependencies missing
   - No rollback plan

3. What do we need before deploying?
   - Tests passing (unit, integration, e2e)
   - Environment variables configured
   - Database migrations run
   - Health checks implemented
   - Monitoring/logging setup

4. What's the deployment sequence?
   - Build and test locally
   - Deploy to staging first
   - Run smoke tests
   - Deploy to production (blue-green or canary)
   - Monitor for errors
   - Have rollback ready

SOLUTION:
```bash
# 1. Test everything
npm run test
npm run build

# 2. Deploy to staging
railway deploy --environment staging
# Wait and test staging

# 3. Deploy to production (gradual)
railway deploy --environment production --strategy canary
# Route 10% traffic first

# 4. Monitor
railway logs --follow

# 5. If issues, rollback
railway rollback
```

WHY THIS APPROACH:
- Staging catches issues before production
- Canary deployment limits blast radius
- Monitoring catches problems fast
- Rollback plan means we can recover quickly
""",
                "tags": ["reasoning", "deployment", "planning"]
            },
            {
                "prompt": "Debug: API returning 500 errors randomly",
                "response": """Let me reason through debugging this:

PROBLEM ANALYSIS:
- Random 500 errors = intermittent issue
- Not all requests fail = not a code bug
- Appears randomly = likely resource/timing issue

HYPOTHESIS GENERATION:
What could cause random 500s?
1. Database connection pool exhausted
2. Memory leak causing OOM crashes
3. Rate limiting being hit
4. Timeout on slow queries
5. Race condition in concurrent requests

INVESTIGATION PLAN:
```bash
# 1. Check error logs for patterns
railway logs | grep "500" | tail -100

# 2. Check resource usage
railway metrics memory
railway metrics cpu

# 3. Check database connections
psql -c "SELECT count(*) FROM pg_stat_activity"

# 4. Check for memory leaks
npm run analyze-memory

# 5. Add detailed logging
# In code:
console.log('Request start:', {
  timestamp: Date.now(),
  connections: db.pool.totalCount,
  memory: process.memoryUsage()
})
```

LIKELY CAUSE (based on patterns):
- If memory grows over time = memory leak
- If happens under load = connection pool
- If at specific times = database backup/maintenance
- If with certain endpoints = slow query timeout

FIX STRATEGY:
1. Immediate: Increase connection pool size
2. Short-term: Add request timeouts and retries
3. Long-term: Fix root cause (leak, slow query, etc)
4. Permanent: Add monitoring and alerts

WHY THIS REASONING:
- Systematic elimination of possibilities
- Test hypotheses with data, not guesses
- Quick fix + root cause fix
- Prevent future occurrences with monitoring
""",
                "tags": ["reasoning", "debugging", "problem-solving"]
            }
        ]
    },
    
    "comparative_reasoning": {
        "description": "Comparing options and choosing best approach",
        "examples": [
            {
                "prompt": "Should I use REST or GraphQL for this API?",
                "response": """Let me compare these options systematically:

CONTEXT NEEDED:
- What kind of data? (Simple CRUD vs complex relationships)
- Who's the client? (Mobile app, web, third-party)
- Team expertise? (Learning curve matters)
- Performance needs? (Over-fetching a problem?)

OPTION 1: REST
Pros:
- Simple to understand and implement
- Caching built-in (HTTP caching)
- Widely known, easier to find developers
- Stateless, scales easily
- Good for simple CRUD operations

Cons:
- Over-fetching (get more data than needed)
- Under-fetching (need multiple requests)
- Versioning can be messy (/v1, /v2)
- No schema enforcement

OPTION 2: GraphQL
Pros:
- Get exactly the data you need
- Single endpoint, one request
- Strong typing and schema
- Great for complex, nested data
- Self-documenting with introspection

Cons:
- Steeper learning curve
- Caching more complex
- Can enable inefficient queries (N+1 problem)
- Harder to rate-limit

DECISION FRAMEWORK:
Choose REST if:
- Simple CRUD operations
- Public API for third parties
- Team new to GraphQL
- Caching is critical
- Rate limiting needed

Choose GraphQL if:
- Complex data relationships
- Mobile app (minimize requests)
- Rapid UI iteration
- Multiple client types
- Schema evolution important

FOR BLACKROAD:
I'd choose REST for:
- Public APIs (authentication, webhooks)
- Simple services (health checks, metrics)

I'd choose GraphQL for:
- Dashboard (complex UI, many entities)
- Mobile app (minimize data transfer)
- Internal tools (rapid development)

WHY THIS REASONING:
- No "always right" answer, context matters
- Consider team, not just tech
- Can use BOTH for different use cases
- Start simple (REST), add GraphQL if needed
""",
                "tags": ["reasoning", "comparison", "architecture"]
            }
        ]
    },
    
    "causal_reasoning": {
        "description": "Understanding cause and effect",
        "examples": [
            {
                "prompt": "Why is my Pi running hot?",
                "response": """Let me trace the causal chain:

OBSERVATION:
- Pi temperature high
- Need to find root cause

CAUSAL ANALYSIS:

EFFECT: High temperature
POSSIBLE CAUSES:
1. High CPU usage
2. Poor ventilation
3. Overclocking
4. Thermal paste dried out
5. Ambient temperature high

Let me check each:

1. CHECK CPU USAGE:
```bash
top
# If CPU constantly 100% -> something is using it
htop
# Identify the process
```

CAUSE -> EFFECT chain:
- Process using CPU -> CPU generates heat -> Temperature rises

2. CHECK VENTILATION:
```bash
# Is fan running?
cat /sys/class/thermal/thermal_zone0/temp
# Check fan speed
vcgencmd measure_temp
```

CAUSE -> EFFECT:
- Fan not running -> Heat can't escape -> Temperature rises
- Pironman case closed -> Airflow blocked -> Heat trapped

3. CHECK OVERCLOCKING:
```bash
cat /boot/config.txt | grep over
vcgencmd measure_clock arm
```

CAUSE -> EFFECT:
- Overclocked CPU -> More power -> More heat
- No adequate cooling -> Heat accumulates

ROOT CAUSE DETERMINATION:
```bash
# Step 1: What's the temp?
vcgencmd measure_temp
# e.g. temp=75.0'C (high!)

# Step 2: What's using CPU?
ps aux | sort -rn -k 3 | head
# e.g. python3 using 90% CPU

# Step 3: Is fan working?
# Check Pironman OLED display

# Step 4: Is it overclocked?
cat /boot/config.txt
```

CAUSAL CHAIN IDENTIFIED:
Running quantum experiments (CPU intensive)
  -> CPU at 100%
  -> Generates heat
  -> Fan can't keep up
  -> Temperature rises

SOLUTION (address the cause):
1. Immediate: Stop intensive process
2. Short-term: Add cooling (external fan)
3. Long-term: Distribute work across fleet
4. Permanent: Better case ventilation

WHY THIS REASONING:
- Trace from effect back to cause
- Test each hypothesis
- Fix root cause, not just symptom
- Prevent recurrence
""",
                "tags": ["reasoning", "causality", "debugging"]
            }
        ]
    },
    
    "probabilistic_reasoning": {
        "description": "Reasoning under uncertainty",
        "examples": [
            {
                "prompt": "Should I cache this API response?",
                "response": """Let me reason probabilistically:

UNCERTAINTY FACTORS:
- How often does data change?
- What's the cost of stale data?
- What's the cost of computing fresh data?

PROBABILISTIC ANALYSIS:

1. DATA CHANGE FREQUENCY:
- User profile: Changes rarely (days/weeks)
  -> High confidence cache is valid
  -> Low risk of stale data

- Stock price: Changes constantly (seconds)
  -> Low confidence cache is valid
  -> High risk of stale data

- Blog posts: Changes occasionally (hours/days)
  -> Medium confidence
  -> Medium risk

2. COST ANALYSIS:

P(cache_hit) = ?
- If high traffic to same data: 0.8 (80% chance)
- If unique data per user: 0.1 (10% chance)

Cost(database_query) = 50ms + $0.001
Cost(cache_lookup) = 1ms + $0.0001

Expected_cost(with_cache):
= P(hit) * Cost(cache) + P(miss) * (Cost(cache) + Cost(db))
= 0.8 * 1ms + 0.2 * 51ms = 10.8ms

Expected_cost(no_cache):
= Cost(db) = 50ms

SAVING: 50ms - 10.8ms = 39.2ms (78% faster!)

3. STALENESS RISK:

If data changes once per hour:
- Cache for 5 minutes: 8% risk of stale data
- Cache for 30 minutes: 50% risk
- Cache for 2 hours: 100% guaranteed stale

Risk_tolerance depends on use case:
- User settings: Low risk (cache 1 hour)
- Account balance: Medium risk (cache 5 min)
- Real-time prices: High risk (cache 10 sec)

DECISION MATRIX:

|              | High Traffic | Low Traffic |
|--------------|--------------|-------------|
| Rarely changes | CACHE LONG  | CACHE SHORT |
| Often changes  | CACHE SHORT | NO CACHE    |

FOR BLACKROAD:
- Agent status: Cache 10 seconds (changes often, high traffic)
- Memory entries: Cache 1 minute (append-only, medium traffic)
- Infrastructure map: Cache 5 minutes (rarely changes, low traffic)

WHY THIS REASONING:
- Quantify uncertainty with probabilities
- Calculate expected value
- Make data-driven decisions
- Balance multiple objectives (speed vs freshness)
""",
                "tags": ["reasoning", "probability", "optimization"]
            }
        ]
    },
    
    "analogical_reasoning": {
        "description": "Reasoning by analogy",
        "examples": [
            {
                "prompt": "How should I structure my distributed system?",
                "response": """Let me reason by analogy:

ANALOGY 1: Distributed System = Restaurant Chain

Single Server:
- Like a single restaurant
- One location serves everyone
- If it breaks, everyone starves
- Gets overwhelmed at peak times

Distributed System:
- Like a restaurant chain
- Multiple locations serve different areas
- If one breaks, others still work
- Load distributed across locations

KEY INSIGHTS:
- Need coordination (shared menu = shared config)
- Need consistency (same food = same data)
- Need load balancing (customers to nearest location)
- Need communication (franchises share inventory)

ANALOGY 2: Microservices = City Departments

Monolith:
- City hall does EVERYTHING
- DMV, taxes, permits, police, fire all in one building
- Any change affects everyone
- One failure = total shutdown

Microservices:
- Separate departments
- DMV has its own building
- Police independent from DMV
- Can upgrade one without touching others
- If DMV closes, police still work

KEY INSIGHTS:
- Clear responsibilities (each service has one job)
- Independent scaling (busy DMV ≠ need more police)
- Isolated failures (DMV down ≠ police down)
- Communication needed (departments talk via APIs)

ANALOGY 3: Message Queue = Restaurant Order System

Without Queue:
- Customer yells order to kitchen
- Chef forgets if too many orders
- Chaos during rush

With Queue:
- Orders written on tickets
- Hung on a line
- Chef takes them one by one
- Orders never lost
- Can see backlog

KEY INSIGHTS:
- Decouples producer from consumer
- Handles bursts (many orders at once)
- Persistent (orders don't disappear)
- Ordering preserved (FIFO)

APPLYING TO BLACKROAD:

Structure = Restaurant Chain:
- Multiple Pis = Multiple locations
- Each serves local requests
- Shared configuration = Shared menu
- Load balancer = Customer routing

Services = City Departments:
- Memory service = Records department
- Agent service = HR department
- Deployment service = Construction department
- Each independent, all coordinated

Communication = Order System:
- NATS = Order ticket system
- Agents place "orders" (tasks)
- Workers process them
- Never lost, always handled

WHY THIS REASONING:
- Analogies make complex concepts simple
- Learn from familiar systems
- Transfer knowledge across domains
- Easier to remember and explain
""",
                "tags": ["reasoning", "analogy", "architecture"]
            }
        ]
    },
    
    "meta_reasoning": {
        "description": "Reasoning about reasoning itself",
        "examples": [
            {
                "prompt": "When should I optimize code?",
                "response": """Let me reason about the reasoning process itself:

META-QUESTION: "When to optimize?"

This requires reasoning about:
1. What I know
2. What I don't know
3. How to decide
4. Whether I'm asking the right question

LEVEL 1: Direct Answer (naive)
"Always optimize for speed!"
- But this assumes speed is always the bottleneck
- Doesn't consider cost of optimization
- Missing context

LEVEL 2: Conditional Answer (better)
"Optimize when it's slow"
- But "slow" is subjective
- Doesn't say HOW to optimize
- Still missing context

LEVEL 3: Meta-Reasoning (best)
First, question the question:
- WHY am I asking this?
- What problem am I really trying to solve?
- Is optimization the right solution?

REASONING ABOUT REASONING:

Do I have the right information?
```
NEED TO KNOW:
- Current performance (measured, not guessed)
- User expectations (what's "fast enough"?)
- Cost of optimization (time, complexity, bugs)
- Business value (will this matter?)

QUESTIONS TO ASK:
1. Is it actually slow? (MEASURE)
2. Does slow = bad user experience? (ASK USERS)
3. Can I solve it without code changes? (INFRASTRUCTURE)
4. Is this the bottleneck? (PROFILE)
```

Am I asking the right question?

ORIGINAL: "When should I optimize?"

BETTER: "Is this performance issue worth solving?"

EVEN BETTER: "What's the highest-impact thing I can do right now?"

DECISION FRAMEWORK:

```python
def should_optimize():
    # Meta-reasoning process
    
    # 1. Do I have data?
    if not has_measurements():
        return "MEASURE FIRST, then decide"
    
    # 2. Is it actually a problem?
    if response_time < user_tolerance:
        return "NO - users are happy"
    
    # 3. Is this THE bottleneck?
    if not is_primary_bottleneck():
        return "NO - fix bigger issues first"
    
    # 4. Can I solve without code?
    if can_scale_infrastructure():
        return "MAYBE - try infrastructure first (cheaper)"
    
    # 5. What's the ROI?
    if cost_to_optimize > value_of_speedup:
        return "NO - not worth it"
    
    # 6. All checks passed
    return "YES - optimize now"
```

BLACKROAD EXAMPLE:

Question: "Should I optimize LLM inference speed?"

Meta-reasoning:
1. What do I know?
   - Current: 156,342 tokens/sec
   - Goal: ??? (I don't know!)

2. What should I ask?
   - "Is 156K tok/s fast enough for my use case?"
   - "What's the actual bottleneck I'm solving?"

3. Better question:
   - "What user experience am I trying to enable?"
   - If: Real-time chat -> Need <100ms latency -> Optimize!
   - If: Batch processing -> Current speed fine -> Don't optimize!

WHY THIS REASONING:
- Question your assumptions
- Measure before optimizing
- Consider alternatives
- Think about thinking
- Ask better questions

The meta-lesson: Sometimes the right answer is "you're asking the wrong question"
""",
                "tags": ["reasoning", "meta-cognition", "decision-making"]
            }
        ]
    },
    
    "systems_thinking": {
        "description": "Understanding complex systems and feedback loops",
        "examples": [
            {
                "prompt": "Why did adding more servers make the system slower?",
                "response": """Let me apply systems thinking:

COUNTERINTUITIVE RESULT:
More servers -> Slower system (WHY?!)

SYSTEMS THINKING APPROACH:

1. IDENTIFY THE SYSTEM:
Components:
- Load balancer
- Application servers (now more of them)
- Database
- Cache

Connections:
- LB -> Servers
- Servers -> Database
- Servers -> Cache

2. FIND FEEDBACK LOOPS:

LOOP 1: More servers -> More database connections
- Each server opens N connections to database
- 5 servers * 10 connections = 50
- 10 servers * 10 connections = 100
- Database has max 100 connections
- Now at limit! Connections wait
- NEGATIVE FEEDBACK: More servers make it worse!

LOOP 2: Cache stampede
- More servers -> More cache misses at same time
- All servers query database simultaneously
- Database overwhelmed
- Responses slow
- Servers timeout and retry
- POSITIVE FEEDBACK: Makes problem worse!

LOOP 3: Load balancer overhead
- More servers -> More health checks
- More routing decisions
- More connection management
- LB becomes bottleneck
- CONSTRAINT: LB can't handle it!

3. IDENTIFY BOTTLENECKS:

Original system (2 servers):
```
LB (1000 req/s) -> Servers (500 req/s each) -> DB (1000 req/s)
Balanced! Everything at ~50% capacity
```

After scaling (10 servers):
```
LB (1000 req/s) -> Servers (200 req/s each) -> DB (1000 req/s)
LB: 100% capacity (bottleneck!)
Servers: 20% capacity (underutilized)
DB: 150% capacity (overloaded!)
```

4. UNINTENDED CONSEQUENCES:

Intended: Distribute load across more servers
Actual: Created new bottlenecks
- Database connection pool exhausted
- Cache invalidation storms
- Load balancer maxed out
- Coordination overhead

5. SYSTEMIC SOLUTION:

Don't just add servers! Consider whole system:

```bash
# 1. Scale database connections
# Increase connection pool
DB_POOL_SIZE = num_servers * 5

# 2. Add read replicas
# Distribute read load
REPLICA_1=postgres-read-1
REPLICA_2=postgres-read-2

# 3. Improve caching strategy
# Reduce database hits
CACHE_TTL=300  # 5 minutes
CACHE_STRATEGY=write-through

# 4. Add connection pooling
# Reuse connections
PGBOUNCER=enabled

# 5. Horizontal database scaling
# Shard data
SHARD_KEY=user_id
SHARDS=4
```

6. SYSTEMS MAP:

```
        [Load Balancer]
               |
    +----------+----------+
    |          |          |
 [Server1] [Server2] [Server3]
    |          |          |
    +----------+----------+
               |
         [PgBouncer]  <- Connection pooler
               |
    +----------+----------+
    |          |          |
  [DB-Primary] [DB-Replica-1] [DB-Replica-2]
```

WHY THIS REASONING:
- Systems have non-linear behavior
- Parts interact in unexpected ways
- Feedback loops amplify problems
- Must consider whole system
- Local optimizations can hurt globally

THE LESSON:
"More" isn't always better. Understand the system!
""",
                "tags": ["reasoning", "systems-thinking", "debugging"]
            }
        ]
    }
}

# ============================================================================
# SAVE REASONING TEMPLATES
# ============================================================================

reasoning_data = {
    "metadata": {
        "created": datetime.now().isoformat(),
        "version": "1.0",
        "purpose": "Teach LLM to reason, not just pattern-match",
        "reasoning_types": len(reasoning_templates)
    },
    "templates": reasoning_templates,
    "stats": {
        "total_types": len(reasoning_templates),
        "total_examples": sum(len(rt["examples"]) for rt in reasoning_templates.values()),
        "types": list(reasoning_templates.keys())
    }
}

with open('blackroad_reasoning_templates.json', 'w') as f:
    json.dump(reasoning_data, f, indent=2)

print("📊 REASONING TEMPLATE STATISTICS")
print("=" * 70)
print()
print(f"Reasoning types: {reasoning_data['stats']['total_types']}")
print(f"Total examples: {reasoning_data['stats']['total_examples']}")
print()

for rtype, data in reasoning_templates.items():
    print(f"🧠 {rtype.upper().replace('_', ' ')}:")
    print(f"   Examples: {len(data['examples'])}")
    print(f"   Description: {data['description']}")
    print()

print("💾 Saved to: blackroad_reasoning_templates.json")
print()
print("=" * 70)
print("🎓 REASONING TRAINING DATA READY!")
print("=" * 70)
print()
print("✅ Chain-of-thought reasoning")
print("✅ Comparative analysis")
print("✅ Causal reasoning")
print("✅ Probabilistic thinking")
print("✅ Analogical reasoning")
print("✅ Meta-reasoning (thinking about thinking)")
print("✅ Systems thinking")
print()
print("🚀 This teaches the LLM to THINK, not just pattern-match!")
