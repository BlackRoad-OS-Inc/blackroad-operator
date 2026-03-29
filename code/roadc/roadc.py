#!/usr/bin/env python3
"""
RoadC — The BlackRoad Language

Usage:
    roadc.py run <file.road>       Run a RoadC source file
    roadc.py repl                  Interactive REPL
    roadc.py parse <file.road>     Parse and dump AST
    roadc.py check <file.road>     Type-check without running
    roadc.py fmt <file.road>       Format source code
    roadc.py test <dir>            Run .road test files
    roadc.py version               Show version

English is a programming language. 7 sentence structures generate all of it.
RoadC makes this explicit. BlackRoad OS, Inc.
"""

import sys
import os
import time
import glob

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lexer import Lexer
from parser import Parser
from interpreter import Interpreter
from ast_nodes import *

VERSION = "0.2.0"
BANNER = f"""\033[38;5;205mRoadC\033[0m v{VERSION} — The BlackRoad Language
7 sentence structures. Ternary routing. Sovereign compute.
Type \033[38;5;214mhelp\033[0m, \033[38;5;214mexit\033[0m, or any RoadC expression.\n"""


def run_code(code, interp=None):
    """Parse and execute RoadC code."""
    tokens = Lexer(code).tokenize()
    ast = Parser(tokens).parse_program()
    if interp is None:
        interp = Interpreter()
    interp.run(ast)
    return interp


def run_file(path):
    """Run a .road source file."""
    if not os.path.isfile(path):
        print(f"Error: file not found: {path}")
        sys.exit(1)
    with open(path) as f:
        code = f.read()
    try:
        run_code(code)
    except Exception as e:
        print(f"\033[31mError\033[0m in {path}: {e}")
        sys.exit(1)


def parse_file(path):
    """Parse a file and dump the AST."""
    with open(path) as f:
        code = f.read()
    tokens = Lexer(code).tokenize()
    ast = Parser(tokens).parse_program()
    print(f"Program: {len(ast.statements)} statements\n")
    for i, stmt in enumerate(ast.statements):
        print(f"  {i+1}. {stmt.__class__.__name__}", end="")
        if hasattr(stmt, 'name'):
            print(f" '{stmt.name}'", end="")
        print()


def check_file(path):
    """Parse a file without executing — catch syntax errors."""
    with open(path) as f:
        code = f.read()
    try:
        tokens = Lexer(code).tokenize()
        ast = Parser(tokens).parse_program()
        print(f"\033[32mOK\033[0m {path}: {len(ast.statements)} statements")
    except SyntaxError as e:
        print(f"\033[31mERROR\033[0m {path}: {e}")
        return False
    return True


def run_tests(test_dir):
    """Run all .road files in a directory as tests."""
    pattern = os.path.join(test_dir, "*.road")
    files = sorted(glob.glob(pattern))
    if not files:
        print(f"No .road files found in {test_dir}")
        sys.exit(1)

    passed = 0
    failed = 0
    start = time.time()

    for path in files:
        name = os.path.basename(path)
        try:
            with open(path) as f:
                code = f.read()
            tokens = Lexer(code).tokenize()
            ast = Parser(tokens).parse_program()
            interp = Interpreter()
            interp.run(ast)
            print(f"  \033[32mPASS\033[0m {name}")
            passed += 1
        except Exception as e:
            print(f"  \033[31mFAIL\033[0m {name}: {e}")
            failed += 1

    elapsed = round((time.time() - start) * 1000)
    total = passed + failed
    color = "\033[32m" if failed == 0 else "\033[31m"
    print(f"\n{color}{passed}/{total} passed\033[0m in {elapsed}ms")
    if failed:
        sys.exit(1)


REPL_HELP = """
\033[38;5;214mRoadC REPL Commands:\033[0m
  help          Show this help
  exit / quit   Exit the REPL
  .env          Show all variables in scope
  .ast <expr>   Parse and show AST
  .load <file>  Load and run a .road file
  .clear        Clear the environment
  .version      Show version

\033[38;5;214mMulti-line input:\033[0m
  End a line with : to start a block.
  Use 4 spaces for indentation.
  Enter a blank line to execute.

\033[38;5;214mGrammar → Code (7 structures):\033[0m
  SV    talk()                    Subject + Verb (intransitive)
  SVA   deploy("Cecilia")         Subject + Verb + Adverbial
  SVC   is_status("Alice","up")   Subject + Linking Verb + Complement
  SVO   search("query")           Subject + Transitive Verb + Object
  SVOO  send("chan","msg")         Subject + Verb + Indirect + Direct Object
  SVOA  store("data","bucket")    Subject + Verb + Object + Adverbial
  SVOC  promote("agent","lead")   Subject + Verb + Object + Complement
"""


def repl():
    """Interactive REPL with multi-line support and state inspection."""
    print(BANNER)
    interp = Interpreter()
    buffer = []
    in_block = False

    while True:
        prompt = ".... " if in_block else "road> "
        try:
            line = input(prompt)
        except (EOFError, KeyboardInterrupt):
            print()
            break

        stripped = line.strip()

        # Exit
        if not in_block and stripped in ('exit', 'quit'):
            break

        # Help
        if not in_block and stripped == 'help':
            print(REPL_HELP)
            continue

        # Meta commands
        if not in_block and stripped.startswith('.'):
            handle_meta(stripped, interp)
            continue

        # Multi-line block support
        if stripped.endswith(':') and not in_block:
            buffer = [line]
            in_block = True
            continue

        if in_block:
            if stripped == '':
                # Empty line = execute block
                in_block = False
                code = '\n'.join(buffer)
                buffer = []
                try:
                    run_code(code, interp)
                except Exception as e:
                    print(f"\033[31mError:\033[0m {e}")
                continue
            else:
                buffer.append(line)
                continue

        # Single-line execution
        if not stripped:
            continue

        try:
            tokens = Lexer(stripped).tokenize()
            ast = Parser(tokens).parse_program()

            # If it's a single expression, print its value
            if (len(ast.statements) == 1 and
                isinstance(ast.statements[0], ExpressionStatement)):
                result = interp.eval_expr(ast.statements[0].expression, interp.global_env)
                if result is not None:
                    print(f"\033[38;5;245m=> {result}\033[0m")
            else:
                interp.run(ast)
        except Exception as e:
            print(f"\033[31mError:\033[0m {e}")


def handle_meta(cmd, interp):
    """Handle REPL meta-commands."""
    if cmd == '.env':
        env = interp.global_env
        user_vars = {k: v for k, v in env.vars.items()
                     if not callable(v) or isinstance(v, FunctionDefinition)}
        if not user_vars:
            print("  (empty)")
        for name, val in sorted(user_vars.items()):
            if isinstance(val, FunctionDefinition):
                params = ', '.join(p.name for p in val.parameters)
                print(f"  \033[38;5;69mfun\033[0m {name}({params})")
            else:
                print(f"  {name} = {val!r}")

    elif cmd == '.clear':
        interp.__init__()
        print("  Environment cleared.")

    elif cmd == '.version':
        print(f"  RoadC {VERSION}")

    elif cmd.startswith('.load '):
        path = cmd[6:].strip()
        if os.path.isfile(path):
            with open(path) as f:
                code = f.read()
            try:
                run_code(code, interp)
                print(f"  Loaded {path}")
            except Exception as e:
                print(f"  \033[31mError:\033[0m {e}")
        else:
            print(f"  File not found: {path}")

    elif cmd.startswith('.ast '):
        expr = cmd[5:].strip()
        try:
            tokens = Lexer(expr).tokenize()
            ast = Parser(tokens).parse_program()
            for stmt in ast.statements:
                print(f"  {stmt}")
        except Exception as e:
            print(f"  \033[31mError:\033[0m {e}")

    else:
        print(f"  Unknown command: {cmd}")


def main():
    if len(sys.argv) < 2:
        # Default to REPL if no args
        repl()
        return

    cmd = sys.argv[1]

    if cmd == 'version':
        print(f"RoadC {VERSION}")
    elif cmd == 'run' and len(sys.argv) > 2:
        run_file(sys.argv[2])
    elif cmd == 'parse' and len(sys.argv) > 2:
        parse_file(sys.argv[2])
    elif cmd == 'check' and len(sys.argv) > 2:
        check_file(sys.argv[2])
    elif cmd == 'test' and len(sys.argv) > 2:
        run_tests(sys.argv[2])
    elif cmd == 'fmt' and len(sys.argv) > 2:
        # Stub for formatter
        print(f"Format not yet implemented. File: {sys.argv[2]}")
    elif cmd == 'repl':
        repl()
    elif cmd.endswith('.road'):
        # Allow `roadc.py file.road` as shorthand for `roadc.py run file.road`
        run_file(cmd)
    else:
        print(__doc__.strip())
        sys.exit(1)


if __name__ == '__main__':
    main()
