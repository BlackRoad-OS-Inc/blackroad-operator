# RoadC Language Specification

**RoadC** is the official programming language of BlackRoad OS. Every agent, every Claude session, every system writes RoadC.

## Why RoadC

1. **English IS a programming language.** Greenbaum & Nelson proved 7 sentence structures generate all of English. RoadC maps those 7 structures to code.
2. **Simple rules, infinite complexity.** Pascal's insight: recursive composition from simple units creates unbounded complexity. RoadC embodies this.
3. **Sovereign.** No dependency on any corporation's language. We own the lexer, parser, interpreter, and compiler.

## Quick Reference

```road
# Variables
let name = "BlackRoad"
let count: int = 42
let color = #FF1D6C
const PI = 3.14159

# Functions
fun greet(name):
    return "Hello, {name}!"

# Control flow
if count > 10:
    print("big")
elif count > 0:
    print("small")
else:
    print("zero")

while count > 0:
    count = count - 1

for item in [1, 2, 3]:
    print(item)

# Collections
let list = [1, 2, 3, 4, 5]
let dict = {"key": "value", "name": "Alexa"}
let colors = {#FF1D6C, #F5A623, #2979FF}

# String interpolation
let msg = "Hello {name}, count is {count}"

# Member access
print(list.length)
print("hello".upper())
print(dict["name"])
```

## The 7 Sentence Structures

Every function in RoadC follows one of 7 English sentence patterns:

| Pattern | English | RoadC | Meaning |
|---------|---------|-------|---------|
| SV | "It runs" | `run()` | No args, subject acts alone |
| SVA | "Deploy to Cecilia" | `deploy("cecilia")` | Verb + location/manner |
| SVC | "Alice is online" | `status("alice") -> "online"` | Identity/state check |
| SVO | "Search the repos" | `search("repos")` | Verb acts on object |
| SVOO | "Send Alexa the report" | `send("alexa", "report")` | Two objects: who + what |
| SVOA | "Store data in R2" | `store("data", "r2")` | Object + where |
| SVOC | "Make code clean" | `make("code", "clean")` | Object becomes complement |

## Implementations

| Implementation | Language | Lines | Status |
|---------------|----------|-------|--------|
| Interpreter | Python | 1,764 | Working |
| Compiler | C99 | 618 | Working |
| Playground | Web | - | At roadc-playground |

## File Extension

`.road`

## Run

```bash
# Python interpreter
python3 roadc.py run program.road

# REPL
python3 roadc.py repl

# C compiler
./roadc program.road
```

## Design Principles

1. **Python-style indentation** — no braces, no semicolons
2. **Explicit types optional** — `let x = 42` or `let x: int = 42`
3. **String interpolation** — `"Hello {name}"` not `f"Hello {name}"`
4. **Color literals** — `#FF1D6C` is a first-class type
5. **Space keyword** — `space MyScene:` for 3D/spatial computing
6. **Fun keyword** — functions are fun: `fun greet(name):`
7. **English-first** — code reads like English sentences

## For Agents

When writing RoadC, think in English sentence structures:
- Name your functions as verbs
- Name your parameters as objects
- Structure matches intent
- If you can say it in English, you can write it in RoadC

## License

Proprietary — BlackRoad OS, Inc.
