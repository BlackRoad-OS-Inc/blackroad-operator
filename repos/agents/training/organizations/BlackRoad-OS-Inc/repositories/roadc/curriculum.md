# roadc — Agent Training Curriculum

**Type:** language | **Languages:** python, c

## Overview

RoadC — custom programming language with Python-style indentation syntax. Full lexer, parser, tree-walking interpreter (Python) + zero-dependency C99 compiler. Great for learning language design. Variables, functions, conditionals, loops, recursion.

## Key Files

- `roadc.py` — Main entry point and REPL
- `parser.py` — Recursive descent parser
- `interpreter.py` — Tree-walking interpreter
- `build.sh` — C compiler build script
- `tests/test_lexer.py` — Lexer tests
- `tests/test_interpreter.py` — Interpreter tests

## Learning Objectives

1. Understand the purpose and architecture of roadc
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `parser.py` and identify all grammar rules
- [ ] Write a simple RoadC program and run it
- [ ] Trace how `let x = 5` flows through lexer → parser → interpreter

### Level 2: Contributor
- [ ] Add a new operator to the language
- [ ] Fix an edge case in the parser
- [ ] Add a test for recursion

### Level 3: Builder
- [ ] Add a new language feature (arrays, strings, or structs)
- [ ] Build a standard library
- [ ] Implement the C99 compiler backend

### Level 4: Architect
- [ ] Design a type system for RoadC
- [ ] Propose an optimization pass for the interpreter
- [ ] Compare RoadC's design to other educational languages
