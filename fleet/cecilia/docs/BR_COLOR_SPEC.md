# BR COLOR SPECIFICATION v0.1
## Visual Programming Language for BlackRoad Operating System

**Date:** 2026-02-02  
**Status:** Canonical  
**License:** BlackRoad Proprietary

---

## CORE PRINCIPLE

**Colors are operators, not decoration.**

Every xterm-256 color index `[0-255]` maps to a semantic token in the BR visual language. Colors compose like code: sequences execute, patterns branch, repetition loops.

---

## SYNTAX ZONES

The 256-color space is partitioned into 8 semantic zones:

```
┌─────────────────────────────────────────────────────────────┐
│ ZONE          RANGE       PURPOSE                           │
├─────────────────────────────────────────────────────────────┤
│ OS_LAYER      0–15        Core system primitives            │
│ PERCEPTION    16–51       Input, sensors, listeners         │
│ EXECUTION     52–87       Actions, mutations, writes        │
│ MEMORY        88–123      State, cache, persistence         │
│ AUTONOMY      124–159     Agents, decision, delegation      │
│ TENSION       160–195     Warnings, drift, uncertainty      │
│ PARADOX       196–231     Errors, contradiction, halt       │
│ META          232–255     Null, silence, void, escape       │
└─────────────────────────────────────────────────────────────┘
```

---

## ZONE DEFINITIONS

### 0–15: OS_LAYER (System Colors)
**Semantic:** Core operating system primitives and kernel operations.

| Color | Token              | Meaning                          |
|-------|--------------------|----------------------------------|
| 0     | `NULL`             | Void, uninitialized              |
| 1     | `ERROR`            | System error, panic              |
| 2     | `SUCCESS`          | Kernel success, ACK              |
| 3     | `WARN`             | System warning                   |
| 4     | `INFO`             | Kernel info, log                 |
| 5     | `DEBUG`            | Debug trace                      |
| 6     | `SYSCALL`          | System call boundary             |
| 7     | `NEUTRAL`          | Default, idle                    |
| 8     | `NULL_BRIGHT`      | Explicit null (bright)           |
| 9     | `ERROR_BRIGHT`     | Fatal error (bright)             |
| 10    | `SUCCESS_BRIGHT`   | Critical success (bright)        |
| 11    | `WARN_BRIGHT`      | Critical warning (bright)        |
| 12    | `INFO_BRIGHT`      | High-priority info (bright)      |
| 13    | `DEBUG_BRIGHT`     | Verbose debug (bright)           |
| 14    | `SYSCALL_BRIGHT`   | Privileged syscall (bright)      |
| 15    | `NEUTRAL_BRIGHT`   | Active idle (bright)             |

---

### 16–51: PERCEPTION (Input Layer)
**Semantic:** Sensors, listeners, stdin, API ingress, perception pipelines.

**Micro-zones:**
- **16–21:** Raw input (sensor data)
- **22–27:** Parsed input (structured)
- **28–33:** Validated input (clean)
- **34–39:** Buffered input (queued)
- **40–45:** Streaming input (live)
- **46–51:** Feedback input (echo)

**Example Operators:**
- `16` = `RAW_SENSOR` — Unprocessed sensor data
- `28` = `VALID_INPUT` — Input passed validation
- `40` = `STREAM_LIVE` — Live data stream active

---

### 52–87: EXECUTION (Action Layer)
**Semantic:** Writes, mutations, actions, commands, stdout, API egress.

**Micro-zones:**
- **52–57:** Low-priority execution
- **58–63:** Normal execution
- **64–69:** High-priority execution
- **70–75:** Critical execution
- **76–81:** Atomic execution (transactions)
- **82–87:** Destructive execution (deletes, resets)

**Example Operators:**
- `64` = `EXEC_HIGH` — High-priority action
- `76` = `EXEC_ATOMIC` — Transactional write
- `202` = `EXEC_FORCE` — (cross-zone: max force)

---

### 88–123: MEMORY (State Layer)
**Semantic:** Cache, persistence, databases, filesystems, state machines.

**Micro-zones:**
- **88–93:** Volatile memory (RAM)
- **94–99:** Cache layer
- **100–105:** Persistent storage (disk)
- **106–111:** Database state
- **112–117:** Snapshot/checkpoint
- **118–123:** Archive (cold storage)

**Example Operators:**
- `88` = `MEM_VOLATILE` — Temporary in-memory state
- `100` = `MEM_PERSIST` — Written to disk
- `118` = `MEM_ARCHIVE` — Cold storage, immutable

---

### 124–159: AUTONOMY (Agent Layer)
**Semantic:** Agents, AI, autonomous systems, decision trees, delegation.

**Micro-zones:**
- **124–129:** Agent idle/waiting
- **130–135:** Agent thinking/planning
- **136–141:** Agent executing
- **142–147:** Agent delegating
- **148–153:** Agent learning
- **154–159:** Agent meta (self-modification)

**Example Operators:**
- `130` = `AGENT_THINK` — Agent in planning phase
- `136` = `AGENT_EXEC` — Agent executing action
- `154` = `AGENT_META` — Agent modifying itself

---

### 160–195: TENSION (Warning Layer)
**Semantic:** Warnings, drift, uncertainty, retries, degraded states.

**Micro-zones:**
- **160–165:** Soft warnings
- **166–171:** Resource warnings (memory, CPU)
- **172–177:** Timeout warnings
- **178–183:** Drift warnings (out of bounds)
- **184–189:** Retry warnings
- **190–195:** Degraded mode

**Example Operators:**
- `166` = `WARN_MEMORY` — Memory pressure
- `178` = `WARN_DRIFT` — Metric out of normal range
- `190` = `WARN_DEGRADE` — System in degraded mode

---

### 196–231: PARADOX (Error Layer)
**Semantic:** Errors, contradictions, halts, exceptions, fatal conditions.

**Micro-zones:**
- **196–201:** Fatal errors (process death)
- **202–207:** Logic errors (contradiction)
- **208–213:** Data errors (corruption)
- **214–219:** Network errors (connection failure)
- **220–225:** Auth errors (permission denied)
- **226–231:** Cascade errors (system-wide failure)

**Example Operators:**
- `196` = `ERROR_FATAL` — Fatal error, process must die
- `202` = `ERROR_LOGIC` — Logical contradiction detected
- `208` = `ERROR_DATA` — Data corruption detected
- `226` = `ERROR_CASCADE` — Multiple cascading failures

---

### 232–255: META (Escape Layer)
**Semantic:** Null, silence, void, escape hatches, commentary, introspection.

The 24-step grayscale ramp represents meta-operations outside normal flow.

**Micro-zones:**
- **232–237:** Deep null (uninitialized)
- **238–243:** Silence (no-op)
- **244–249:** Escape (break out of context)
- **250–255:** Meta-commentary (about the system itself)

**Example Operators:**
- `232` = `META_NULL` — Absolute null
- `244` = `META_ESCAPE` — Break out of current context
- `250` = `META_COMMENT` — Comment about the system
- `255` = `META_BRIGHT` — Maximum meta (full introspection)

---

## COMPOSITION RULES

Colors compose like code. Patterns have syntax.

### Sequential Composition (Adjacent Colors)
```
[64][65][66] = Execute sequence at high priority
```

### Conditional Composition (Alternating Colors)
```
[2][1][2] = Success → Error → Success (retry pattern)
```

### Loop Composition (Repeating Color)
```
[130][130][130] = Agent thinking loop (polling)
```

### Meta-Commentary (Grayscale)
```
[64][245][64] = Execute → (comment: cold memory) → Execute
```

### Nesting (Zone Crossing)
```
[16][64][88] = Perception → Execution → Memory (full pipeline)
```

---

## PRACTICAL EXAMPLES

### Example 1: HTTP Request Pipeline
```
16  = RAW_SENSOR       (receive HTTP request)
28  = VALID_INPUT      (parse and validate)
64  = EXEC_HIGH        (route to handler)
100 = MEM_PERSIST      (write to database)
2   = SUCCESS          (return 200 OK)
```

**Display:** `16 → 28 → 64 → 100 → 2`

---

### Example 2: Agent Decision Loop
```
130 = AGENT_THINK      (analyze situation)
136 = AGENT_EXEC       (take action)
88  = MEM_VOLATILE     (update internal state)
178 = WARN_DRIFT       (detected anomaly)
130 = AGENT_THINK      (re-evaluate)
```

**Display:** `130 → 136 → 88 → 178 → 130`

---

### Example 3: Error Recovery
```
196 = ERROR_FATAL      (critical failure)
190 = WARN_DEGRADE     (enter degraded mode)
184 = WARN_RETRY       (attempt recovery)
2   = SUCCESS          (recovery succeeded)
```

**Display:** `196 → 190 → 184 → 2`

---

## SHAPE GRAMMAR (Future Extension)

Colors can also be rendered as **shapes** instead of numbers:

| Shape | Meaning              |
|-------|----------------------|
| `█`   | Solid block (active) |
| `▓`   | Medium block (busy)  |
| `▒`   | Light block (idle)   |
| `░`   | Minimal block (null) |
| `▬`   | Bar (sequence)       |
| `◆`   | Diamond (decision)   |
| `●`   | Circle (agent)       |
| `▲`   | Triangle (warning)   |
| `■`   | Square (state)       |

**Example:**
```
[64][64][64] rendered as █ █ █  (three execution blocks)
[130]        rendered as ●      (agent thinking)
[178]        rendered as ▲      (drift warning)
```

---

## CLI TOOLS

### `br-color`
**Purpose:** Query and display BR color semantics.

```bash
br-color 64           # Show semantic info for color 64
br-color zone memory  # Show all colors in MEMORY zone
br-color show         # Display full 256-color palette
```

### `br-palette`
**Purpose:** Interactive palette viewer with navigation.

```bash
br-palette            # Launch TUI palette browser
```

### `br-encode`
**Purpose:** Encode sequences into BR color language.

```bash
br-encode "read validate write"
# Output: 16 28 64
```

### `br-decode`
**Purpose:** Decode BR color sequences into English.

```bash
br-decode "16 28 64 100 2"
# Output: RAW_SENSOR → VALID_INPUT → EXEC_HIGH → MEM_PERSIST → SUCCESS
```

---

## AGENT → COLOR MAPPINGS

Each of the 314+ BlackRoad agents can be assigned a primary color:

| Agent                  | Color | Zone     | Rationale                |
|------------------------|-------|----------|--------------------------|
| `blackroad-analyst`    | 130   | AUTONOMY | Thinking/analysis        |
| `blackroad-executor`   | 64    | EXECUTION| High-priority execution  |
| `blackroad-memory`     | 100   | MEMORY   | Persistent state         |
| `blackroad-sentinel`   | 178   | TENSION  | Drift detection          |
| `blackroad-validator`  | 28    | PERCEPTION| Input validation        |
| `blackroad-archivist`  | 118   | MEMORY   | Cold storage/archive     |

*(Full mapping in `BR_AGENT_COLORS.md`)*

---

## TRINARY LOGIC ENCODING

BlackRoad uses trinary logic: `{-1, 0, 1}` (negative, null, positive).

**Color Triplets:**
```
[-1, 0, 1] = [1, 0, 2]  (red, black, green)
[1, 1, 1]  = [2, 2, 2]  (all positive, full green)
[-1,-1,-1] = [1, 1, 1]  (all negative, full red)
```

Trinary sequences can be visualized as color patterns:
```
[1][0][1][0] = red null red null (oscillating failure)
[2][2][2][2] = green green green green (sustained success)
```

---

## COPILOT ENFORCEMENT

When working with BR color grammar, Copilot should:

1. **Use color indices, not color names** (e.g., `64` not "blue")
2. **Map semantic tokens to colors** (e.g., "execute" → `64`)
3. **Compose colors in sequences** (pipelines, not isolated calls)
4. **Annotate with zone names** (e.g., `64 (EXECUTION)`)
5. **Render shapes when appropriate** (e.g., `█` for active blocks)

**Example Copilot prompt:**
```
"Display the HTTP request pipeline using BR color grammar.
Show color indices, semantic tokens, and zone names.
Use arrows to show flow."
```

**Expected output:**
```
16 (PERCEPTION/RAW_SENSOR) → 
28 (PERCEPTION/VALID_INPUT) → 
64 (EXECUTION/EXEC_HIGH) → 
100 (MEMORY/MEM_PERSIST) → 
2 (OS_LAYER/SUCCESS)
```

---

## NEXT STEPS

1. **Implement CLI tools** (`br-color`, `br-palette`, `br-encode`, `br-decode`)
2. **Map all 314+ agents to colors** (`BR_AGENT_COLORS.md`)
3. **Create shape renderer** (blocks, bars, diamonds, circles)
4. **Build dashboard integrations** (agent status in color)
5. **Extend to trinary logic encoding** (full formal system)

---

## REVISION HISTORY

- **v0.1** (2026-02-02): Initial specification, 8 zones, 256 operators

---

**End of Specification**

This is a living document. Colors are operators. This is a language, not a theme.
