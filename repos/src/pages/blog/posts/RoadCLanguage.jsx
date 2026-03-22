const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";

const sectionStyle = { marginBottom: 56 };
const h2Style = { fontFamily: grotesk, fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 24 };
const bodyStyle = { fontFamily: inter, color: '#d4d4d8', lineHeight: 1.7 };
const pStyle = { marginBottom: 16 };
const strongStyle = { color: '#fff' };
const codeInline = {
  fontFamily: mono, fontSize: 14, background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
  padding: '2px 6px',
};
const preStyle = {
  background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: 16, overflowX: 'auto', marginTop: 8, marginBottom: 16,
};
const codeBlock = { fontFamily: mono, fontSize: 14, color: '#d4d4d8', whiteSpace: 'pre' };
const labelStyle = { color: '#a1a1aa', fontSize: 14, marginTop: 8, marginBottom: 4, fontWeight: 500 };
const linkStyle = { color: '#fff', textDecoration: 'underline', textUnderlineOffset: 4 };

export default function RoadCLanguage() {
  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: 64 }}>
        <p style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717a', marginBottom: 16 }}>
          March 2026 / Language Design
        </p>
        <h1 style={{ fontFamily: grotesk, fontSize: 40, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 24 }}>
          Designing a Programming Language for AI Agents
        </h1>
        <p style={{ fontFamily: inter, fontSize: 18, color: '#a1a1aa', lineHeight: 1.6 }}>
          Every infrastructure project eventually hits the same wall: the orchestration layer. You have nodes, models, services — but how do you describe what they should do together? Shell scripts work until they don't. YAML configs are not a language. Python is too general. We needed something purpose-built for coordinating AI agents across a distributed mesh. So we built one.
        </p>
      </header>

      {/* Section 1: Why Not Just Use Python? */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Why Not Just Use Python?</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            Python works for single-machine scripts. We have over 400 shell scripts in the BlackRoad home directory. They check node health, restart services, sync files, rotate secrets. Each one is fine on its own. But agent orchestration needs things that Python and bash were not designed for: concurrent task spawning across physical nodes, message passing between services on different Pis, pattern matching on model responses, and shared memory across a WireGuard mesh.
          </p>
          <p style={pStyle}>
            Shell scripts become unmaintainable past about 100 lines. We know this because we have 400 of them and half are unmaintainable. YAML and JSON configs can describe static relationships but cannot express control flow. You cannot write "if Cecilia's CPU load exceeds 80%, route this inference request to Octavia instead" in YAML. You can write it in Python, but then you are importing asyncio, writing callback chains, and fighting the GIL.
          </p>
          <p style={pStyle}>
            Existing agent frameworks like LangChain and CrewAI are libraries, not languages. They inherit Python's concurrency limitations. They impose their own abstractions for things that should be language-level primitives. Spawning a task should be a keyword, not a method call on a framework object. Matching on a model's response structure should be syntax, not a chain of <code style={codeInline}>if isinstance()</code> checks.
          </p>
          <p style={pStyle}>
            What we wanted: Python's readability, Go's concurrency model, Rust's pattern matching, and first-class awareness of the network topology. So we started writing RoadC.
          </p>
        </div>
      </section>

      {/* Section 2: The Design Decisions */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Design Decisions</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            <strong style={strongStyle}>Indentation-sensitive syntax.</strong> Colon followed by INDENT/DEDENT tokens, exactly like Python. No braces, no semicolons. The lexer tracks an indent stack and emits synthetic INDENT and DEDENT tokens when the indentation level changes. This was the single hardest part of the implementation. More on that later.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}><code style={codeInline}>fun</code> instead of <code style={codeInline}>fn</code> or <code style={codeInline}>def</code> or <code style={codeInline}>function</code>.</strong> Three characters, unambiguous, readable. Shorter than <code style={codeInline}>def</code> by zero characters but distinct from Python, which matters when you are writing a language that is explicitly not Python. Shorter than <code style={codeInline}>fn</code> by negative one character but pronounceable, which matters when you are talking about code out loud.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}><code style={codeInline}>let</code> / <code style={codeInline}>var</code> / <code style={codeInline}>const</code>.</strong> Immutability by default. <code style={codeInline}>let</code> binds a value that cannot be reassigned. <code style={codeInline}>var</code> is explicitly mutable. <code style={codeInline}>const</code> is compile-time constant. This is borrowed from Swift and Kotlin. Python's lack of immutability guarantees is a real problem in concurrent agent code — if two agents can mutate the same state without the language enforcing access patterns, bugs are inevitable.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}><code style={codeInline}>match</code> for pattern matching.</strong> Agent responses are messy. A model might return JSON, plain text, an error, or nothing. Pattern matching on the structure of a response is cleaner than nested if/elif chains. The AST includes nodes for literal patterns, range patterns, wildcard patterns, identifier patterns, and constructor patterns.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}><code style={codeInline}>spawn</code> for concurrency.</strong> First-class keyword for creating concurrent tasks. Not a library import. Not an <code style={codeInline}>asyncio.create_task()</code> call. A single word: <code style={codeInline}>spawn</code>. The language also has <code style={codeInline}>await</code>, <code style={codeInline}>chan</code> for channels, and <code style={codeInline}>select</code> for multiplexing — Go's concurrency model transplanted into Python-style syntax.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}><code style={codeInline}>space</code> for 3D spatial operations.</strong> This is the experimental one. The <code style={codeInline}>space</code> keyword defines a 3D scene with objects like <code style={codeInline}>cube</code>, <code style={codeInline}>sphere</code>, <code style={codeInline}>plane</code>, <code style={codeInline}>light</code>, and <code style={codeInline}>camera</code>. Each object has typed properties — position as <code style={codeInline}>vec3</code>, color as a hex literal like <code style={codeInline}>#FF1D6C</code>. The idea is future VR/AR agent environments where spatial relationships matter. It is not production-ready. It is in the language because we wanted to see what it felt like to write.
          </p>

          <p style={labelStyle}>RoadC syntax — variable declarations and functions</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`let x: int = 42
let name = "BlackRoad"
let color = #FF1D6C

fun greet(name: string) -> string:
    return "Hello, {name}!"

space MyScene:
    cube Box1:
        position: vec3(0, 0, 0)
        color: #F5A623`}
            </code>
          </pre>

          <p style={pStyle}>
            Color literals are first-class tokens. The lexer recognizes <code style={codeInline}>#FF1D6C</code> as a COLOR token, not a comment followed by hex characters. This matters because the language was designed for a team that thinks in hex colors — the BlackRoad brand palette is baked into how we describe the world.
          </p>
        </div>
      </section>

      {/* Section 3: The Implementation */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Implementation</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            RoadC has two implementations: a Python interpreter and a C compiler. The Python version is the one that works. The C version tokenizes source files and has a bytecode VM skeleton, but the parser and code generation are not complete. Both share the same three-stage pipeline: Lexer, Parser, Interpreter.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>The Lexer</strong> is 598 lines of Python. It transforms source code into a stream of tokens. The token type enum has 81 entries, covering everything from <code style={codeInline}>TOKEN_INTEGER</code> and <code style={codeInline}>TOKEN_STRING</code> to <code style={codeInline}>TOKEN_SPAWN</code>, <code style={codeInline}>TOKEN_SPACE</code>, <code style={codeInline}>TOKEN_CUBE</code>, and <code style={codeInline}>TOKEN_VEC3</code>. There are 56 reserved keywords. The lexer handles escape sequences in strings, scientific notation in floats, multi-line comments with <code style={codeInline}>#[ ]#</code>, and color code validation (only #RGB, #RRGGBB, and #RRGGBBAA formats are accepted).
          </p>
          <p style={pStyle}>
            The hardest part is indentation. The lexer maintains an indent stack, initialized to <code style={codeInline}>[0]</code>. When it encounters a newline, it measures the indentation of the next line by counting spaces (tabs count as 4). If the indent level increases, it pushes the new level onto the stack and emits an INDENT token. If it decreases, it pops levels off the stack and emits a DEDENT token for each level removed. If the resulting indentation level does not match any level on the stack, it raises a syntax error for inconsistent indentation.
          </p>

          <p style={labelStyle}>Indentation handling — the core of the lexer</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`def handle_indentation(self, indent_level):
    if indent_level > self.indent_stack[-1]:
        self.indent_stack.append(indent_level)
        self.tokens.append(Token(TokenType.INDENT, ...))
    elif indent_level < self.indent_stack[-1]:
        while indent_level < self.indent_stack[-1]:
            self.indent_stack.pop()
            self.tokens.append(Token(TokenType.DEDENT, ...))
        if indent_level != self.indent_stack[-1]:
            raise SyntaxError("Inconsistent indentation")`}
            </code>
          </pre>

          <p style={pStyle}>
            This looks simple. It is not. Blank lines and comment-only lines must be skipped without emitting indentation changes. The final pass must emit DEDENT tokens for any remaining indent levels. Tab/space mixing must be handled consistently. Python's PEP 8 dedicates an entire section to this, and Python's actual tokenizer handles edge cases that took us three rewrites to get right.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>The Parser</strong> is 827 lines of recursive descent. It consumes the token stream and produces an Abstract Syntax Tree. The AST node hierarchy has 46 classes defined across 463 lines in <code style={codeInline}>ast_nodes.py</code>, organized into six categories: type nodes (PrimitiveType, VectorType, ListType, DictType, CustomType), expression nodes (IntegerLiteral, StringLiteral, ColorLiteral, BinaryOp, FunctionCall, MemberAccess, IndexAccess, VectorLiteral, RangeExpression), statement nodes (VariableDeclaration, Assignment, IfStatement, ForLoop, WhileLoop, ReturnStatement), function and type definitions, 3D/spatial nodes (SpaceDefinition, CubeObject, SphereObject, Property3D), and concurrency nodes (SpawnStatement, AwaitExpression, SelectStatement).
          </p>
          <p style={pStyle}>
            Expression parsing uses operator precedence climbing: logical OR at the bottom, then AND, NOT, comparison, addition, multiplication, exponentiation (right-associative), unary, postfix (function calls, member access, indexing), and finally primary expressions. This is textbook Pratt parsing with one quirk — the <code style={codeInline}>await</code> keyword is parsed at the unary level, so <code style={codeInline}>await fetch("url") + 1</code> means <code style={codeInline}>(await fetch("url")) + 1</code>, not <code style={codeInline}>await (fetch("url") + 1)</code>.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>The Interpreter</strong> is 321 lines of tree-walking execution. It traverses the AST and evaluates nodes directly — no bytecode compilation, no intermediate representation. An <code style={codeInline}>Environment</code> class implements lexical scoping with parent pointers for closures. Function definitions capture their defining environment, so nested functions close over their enclosing scope correctly.
          </p>

          <p style={labelStyle}>Closure implementation — functions capture their environment</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`class Environment:
    def __init__(self, parent=None):
        self.vars = {}
        self.parent = parent

    def get(self, name):
        if name in self.vars:
            return self.vars[name]
        if self.parent:
            return self.parent.get(name)
        raise NameError(f"Undefined variable '{name}'")

# When defining a function, capture the environment
stmt._closure_env = env
env.set(stmt.name, stmt)

# When calling, create new scope with closure as parent
parent_env = getattr(func, '_closure_env', self.global_env)
call_env = Environment(parent=parent_env)`}
            </code>
          </pre>

          <p style={pStyle}>
            Control flow uses Python exceptions as signals. <code style={codeInline}>ReturnSignal</code>, <code style={codeInline}>BreakSignal</code>, and <code style={codeInline}>ContinueSignal</code> are exception classes that unwind the call stack to the nearest handler. This is the same pattern CPython uses internally. It is not fast, but it is correct, and correctness matters more than performance when you are still designing semantics.
          </p>
          <p style={pStyle}>
            The interpreter includes 28 built-in functions: <code style={codeInline}>print</code>, <code style={codeInline}>len</code>, <code style={codeInline}>range</code>, <code style={codeInline}>str</code>, <code style={codeInline}>int</code>, <code style={codeInline}>float</code>, <code style={codeInline}>abs</code>, <code style={codeInline}>min</code>, <code style={codeInline}>max</code>, <code style={codeInline}>sum</code>, <code style={codeInline}>sorted</code>, <code style={codeInline}>reversed</code>, <code style={codeInline}>enumerate</code>, <code style={codeInline}>zip</code>, <code style={codeInline}>map</code>, <code style={codeInline}>filter</code>, and more. String values support method calls: <code style={codeInline}>.upper()</code>, <code style={codeInline}>.lower()</code>, <code style={codeInline}>.split()</code>, <code style={codeInline}>.strip()</code>, <code style={codeInline}>.replace()</code>, <code style={codeInline}>.startswith()</code>, <code style={codeInline}>.endswith()</code>, <code style={codeInline}>.contains()</code>. Lists support <code style={codeInline}>.append()</code>, <code style={codeInline}>.pop()</code>, and <code style={codeInline}>.length</code>. Strings support <code style={codeInline}>{'{'}variable{'}'}</code> interpolation.
          </p>
          <p style={pStyle}>
            What works: functions, recursion, closures, if/elif/else, while loops, for loops, lists, dictionaries, sets, tuples, ranges, string interpolation, member access, index access, compound assignment (<code style={codeInline}>+=</code>, <code style={codeInline}>-=</code>), exponentiation, boolean logic, type annotations (parsed but not enforced), and 3D scene declarations (parsed into AST but not rendered).
          </p>
          <p style={pStyle}>
            What does not work yet: <code style={codeInline}>match</code> statements (AST nodes exist, parser stub returns None), <code style={codeInline}>spawn</code> statements (same — AST exists, parser is a stub), type definitions, imports, modules, channels, select, async/await (the keyword is parsed but execution is synchronous). The concurrency features — the whole reason we started building this language — are not implemented.
          </p>
        </div>
      </section>

      {/* Section 4: Real Examples */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Real Examples</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            These examples run today on the interpreter. The <code style={codeInline}>demo.road</code> file in the repository exercises the core language features:
          </p>

          <p style={labelStyle}>Recursive Fibonacci and Factorial — demo.road</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`fun fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

fun factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print("Fibonacci 0-12:")
let i = 0
while i <= 12:
    print(fibonacci(i))
    i = i + 1

print("10! =")
print(factorial(10))`}
            </code>
          </pre>

          <p style={labelStyle}>Closures, list operations, string methods — advanced.road</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`let fruits = ["apple", "banana", "cherry"]
print("First:", fruits[0])
print("Count:", len(fruits))

let nums = [3, 1, 4, 1, 5, 9, 2, 6]
print("Sorted:", sorted(nums))
print("Sum:", sum(nums))

for fruit in fruits:
    print("- {fruit}")

fun make_adder(n):
    fun adder(x):
        return x + n
    return adder

let add5 = make_adder(5)
print("add5(10) =", add5(10))
print("add5(20) =", add5(20))

let msg = "hello blackroad"
print("Upper:", msg.upper())
print("Contains 'road':", msg.contains("road"))`}
            </code>
          </pre>

          <p style={pStyle}>
            And here is what we want to write but cannot yet — the fleet orchestration code that RoadC was designed for:
          </p>

          <p style={labelStyle}>Future syntax — fleet orchestration (not yet implemented)</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`fun check_fleet():
    let nodes = ["alice", "cecilia", "octavia", "aria", "lucidia"]
    for node in nodes:
        let status = spawn ping(node)
        match status:
            "online" => print(node + " is up")
            "timeout" => print(node + " needs attention")
            _ => print(node + " unknown state")

fun route_inference(request):
    let load = spawn get_load("cecilia")
    match load:
        x if x < 80 => forward(request, "cecilia")
        _ => forward(request, "octavia")`}
            </code>
          </pre>

          <p style={pStyle}>
            The gap between those two code blocks is the gap between where RoadC is and where it needs to be. The first set runs. The second set parses into AST nodes that the interpreter ignores.
          </p>

          <p style={pStyle}>
            The 3D scene definitions also parse but do not render. This example from <code style={codeInline}>hello_3d.road</code> produces a valid SpaceDefinition AST node with CubeObject, PlaneObject, LightObject, and CameraObject children — all with typed vec3 positions and hex color properties:
          </p>

          <p style={labelStyle}>3D scene definition — parses to AST, no rendering backend</p>
          <pre style={preStyle}>
            <code style={codeBlock}>
{`space HelloWorld:
    cube Box:
        position: vec3(0, 0, 0)
        scale: vec3(1, 1, 1)
        color: #FF1D6C

    plane Ground:
        position: vec3(0, -2, 0)
        scale: vec3(10, 10, 1)
        color: #333333

    light Sun:
        position: vec3(3, 5, 3)
        color: #FFFFFF
        intensity: 2.0

    camera MainCamera:
        position: vec3(0, 2, 5)
        fov: 75`}
            </code>
          </pre>
        </div>
      </section>

      {/* Section 5: What We Learned */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>What We Learned Building a Language</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            <strong style={strongStyle}>Indentation-sensitive parsing is genuinely hard.</strong> Python's tokenizer has been battle-tested for 30 years and still has edge cases that trip up reimplementors. Mixing tabs and spaces, blank lines inside indented blocks, comments at various indentation levels, continuation lines — each one is a special case in the lexer. Our indentation handler went through three rewrites. The final version is 40 lines of code that took longer to write than the entire expression parser.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Tree-walking interpreters are slow but great for prototyping semantics.</strong> Fibonacci(30) takes noticeable wall time. That is fine. The interpreter exists to answer the question "does this language design make sense?" not "can this language compete with C?" The C implementation has a bytecode VM skeleton with opcode definitions — OP_CONSTANT, OP_ADD, OP_SUBTRACT, OP_MULTIPLY, OP_DIVIDE, OP_NEGATE, OP_RETURN, OP_PRINT — but the compiler that would emit those opcodes is not written yet.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>The language design is the easy part.</strong> Choosing keywords, defining syntax, writing a grammar — that takes a few days. The standard library is what makes a language useful, and we have essentially none. No file I/O. No HTTP client. No JSON parsing. No database access. The fleet this language is supposed to orchestrate has 156,675 memory entries in an FTS5 index across 228 SQLite databases totaling roughly 184MB. RoadC cannot read a single one of them.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Writing a language is the best way to understand what you actually need.</strong> Before RoadC, we would have said we needed "agent orchestration primitives." After building the parser and writing example programs, we know we need: typed node references (<code style={codeInline}>let cecilia: Node = fleet.get("cecilia")</code>), load-aware routing (<code style={codeInline}>spawn</code> that checks stats-proxy before dispatching), structured response matching (match on JSON fields, not just string comparison), and database operations as built-in syntax, not library calls.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Let us be honest about readiness.</strong> RoadC is not ready for production. It is a prototype. The fleet still runs on bash scripts. The 400+ shell scripts in the home directory are not going anywhere soon. When Cecilia's Ollama process crashes at 3am, a bash heal script restarts it — not a RoadC agent. When we need to route inference requests, a Python stats-proxy makes the decision — not a RoadC match expression. The language exists to answer the question "what should the next tool look like?" and right now the answer is "like this, but with the concurrency features actually implemented."
          </p>
        </div>
      </section>

      {/* Section 6: What's Next */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>What Comes Next for RoadC</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            <strong style={strongStyle}>Network-aware types.</strong> <code style={codeInline}>Node</code>, <code style={codeInline}>Fleet</code>, and <code style={codeInline}>Agent</code> as first-class types in the type system. A node is not a string — it has an IP address, a stats-proxy endpoint, a list of running services, a current load. The type system should know this.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}><code style={codeInline}>spawn</code> that actually dispatches.</strong> Right now the parser stub for spawn returns None. The goal is <code style={codeInline}>spawn</code> that reads the fleet's stats-proxy endpoints, evaluates load, and dispatches work across the WireGuard mesh to the node best suited for the task. Not round-robin. Not random. Load-aware, capability-aware routing as a language primitive.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Pattern matching on model outputs.</strong> Match on JSON structure, not just string equality. Match on token probability distributions. Match on response length, sentiment, or whether the model refused the request. The MatchStatement AST node exists. The parser and interpreter need to implement it with patterns expressive enough for real agent workflows.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>A fleet-connected REPL.</strong> Type RoadC expressions, see results from your nodes. <code style={codeInline}>fleet.status()</code> returns live load data from all five Pis. <code style={codeInline}>cecilia.models()</code> lists the 16 Ollama models. <code style={codeInline}>spawn inference("codellama:7b", prompt)</code> dispatches work and returns the result. The REPL infrastructure exists — <code style={codeInline}>roadc.py repl</code> starts a read-eval-print loop with a persistent interpreter instance. It just needs network I/O.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Database integration.</strong> 228 SQLite databases and 156,675 memory entries in FTS5 are not going to access themselves. Native <code style={codeInline}>query</code> syntax that compiles to SQL. Something like <code style={codeInline}>let results = query memory where text contains "infrastructure"</code>. Not ORM abstraction — direct SQL generation from language-level syntax.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Maybe: compile to WASM.</strong> The C implementation already tokenizes source files. If we complete the bytecode compiler and target WASM instead of native code, RoadC programs could run on Cloudflare Workers — and we have 95+ Pages deployments already. Agent orchestration logic at the edge, running in the same infrastructure as the fleet's public-facing services.
          </p>
        </div>
      </section>

      {/* Closing */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>The Best Interface to Infrastructure</h2>
        <div style={bodyStyle}>
          <p style={pStyle}>
            Every sufficiently complex infrastructure grows its own scripting language. We have seen it at every scale — from Terraform's HCL to Kubernetes' YAML dialects to Ansible's Jinja2 templates. The pattern is always the same: start with config files, add conditionals, add loops, add variables, and suddenly you have an ad hoc language with no formal grammar and no error messages. We just made ours intentional.
          </p>
          <p style={pStyle}>
            The fleet this language is designed to control runs{' '}
            <a href="/blog/52-tops-on-400-dollars" style={linkStyle}>52 TOPS of neural inference</a> across five nodes. The network it orchestrates is a{' '}
            <a href="/blog/roadnet-carrier-grade-mesh" style={linkStyle}>carrier-grade mesh</a> with WireGuard encryption and custom DNS zones. The self-healing layer that RoadC will eventually replace is{' '}
            <a href="/blog/self-healing-infrastructure" style={linkStyle}>already running</a> — cron jobs and bash scripts that catch 95% of failures automatically.
          </p>
          <p style={pStyle}>
            RoadC is not replacing those bash scripts today. It is not replacing Python tomorrow. It is a working prototype of the idea that infrastructure deserves a language that understands it — one where nodes are types, spawning work is a keyword, and pattern matching on model responses is syntax, not framework boilerplate.
          </p>
          <p style={pStyle}>
            The fleet dashboard is live at{' '}
            <a href="https://blackroad.io" style={linkStyle}>blackroad.io</a>. The code is on{' '}
            <a href="https://github.com/blackboxprogramming" style={linkStyle}>GitHub</a>.
          </p>
          <p style={pStyle}>
            The best interface to infrastructure is a language that understands it.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 32, marginTop: 64 }}>
        <p style={{ fontFamily: mono, fontSize: 14, color: '#71717a' }}>
          Published March 2026. RoadC source at ~/local/roadc.
        </p>
      </footer>
    </div>
  );
}
