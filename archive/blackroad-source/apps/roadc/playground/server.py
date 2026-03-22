#!/usr/bin/env python3
"""RoadC Playground — Run RoadC code in the browser"""
import sys, os, io, time, contextlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

# Add RoadC to path
sys.path.insert(0, os.path.expanduser("~/roadc"))
from lexer import Lexer
from parser import Parser
from interpreter import Interpreter

app = FastAPI(title="RoadC Playground")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

EXAMPLES = {
    "hello": {
        "name": "Hello World",
        "code": 'print("Hello from RoadC!")\nprint("Born on BlackRoad")'
    },
    "fibonacci": {
        "name": "Fibonacci",
        "code": """fun fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

let i = 0
while i <= 12:
    print(fibonacci(i))
    i = i + 1"""
    },
    "factorial": {
        "name": "Factorial",
        "code": """fun factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print("10! =", factorial(10))
print("5! =", factorial(5))"""
    },
    "fizzbuzz": {
        "name": "FizzBuzz",
        "code": """fun fizzbuzz(n):
    let i = 1
    while i <= n:
        if i % 15 == 0:
            print("FizzBuzz")
        if i % 3 == 0:
            if i % 5 != 0:
                print("Fizz")
        if i % 5 == 0:
            if i % 3 != 0:
                print("Buzz")
        if i % 3 != 0:
            if i % 5 != 0:
                print(i)
        i = i + 1

fizzbuzz(20)"""
    },
    "lists": {
        "name": "Lists & Loops",
        "code": """let fruits = ["apple", "banana", "cherry"]
print("Fruits:", fruits)
print("First:", fruits[0])
print("Count:", len(fruits))

let nums = [3, 1, 4, 1, 5, 9, 2, 6]
print("Sorted:", sorted(nums))
print("Sum:", sum(nums))

print("")
print("Squares 1-5:")
for i in range(1, 6):
    print(i * i)"""
    },
    "closures": {
        "name": "Closures",
        "code": """fun make_adder(n):
    fun adder(x):
        return x + n
    return adder

let add5 = make_adder(5)
let add10 = make_adder(10)

print("add5(3) =", add5(3))
print("add5(20) =", add5(20))
print("add10(7) =", add10(7))
print("2^10 =", 2 ** 10)"""
    },
    "greet": {
        "name": "Functions",
        "code": """fun greet(name):
    return "Hello, " + name + "!"

fun repeat(msg, n):
    let i = 0
    while i < n:
        print(msg)
        i = i + 1

print(greet("BlackRoad"))
print(greet("RoadC"))
repeat("---", 3)
print("Done!")"""
    }
}

@app.get("/health")
def health():
    return {"service": "roadc-playground", "version": "0.1.0", "examples": len(EXAMPLES)}

@app.get("/examples")
def get_examples():
    return EXAMPLES

@app.post("/run")
async def run_code(body: dict):
    code = body.get("code", "")
    if not code.strip():
        return {"error": "no code provided"}

    t0 = time.time()
    stdout_capture = io.StringIO()

    try:
        tokens = Lexer(code).tokenize()
        ast = Parser(tokens).parse_program()
        interp = Interpreter()

        with contextlib.redirect_stdout(stdout_capture):
            interp.run(ast)

        output = stdout_capture.getvalue()
        return {
            "output": output,
            "ms": int((time.time() - t0) * 1000),
            "success": True
        }
    except Exception as e:
        output = stdout_capture.getvalue()
        return {
            "output": output,
            "error": str(e),
            "ms": int((time.time() - t0) * 1000),
            "success": False
        }

@app.get("/", response_class=HTMLResponse)
def index():
    return """<!DOCTYPE html><html><head><title>RoadC Playground</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#fff;font-family:'Space Grotesk',sans-serif;height:100vh;display:flex;flex-direction:column}
.bar{height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)}
header{padding:16px 24px;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;justify-content:space-between}
header h1{font-size:18px}
.examples{display:flex;gap:8px;flex-wrap:wrap}
.examples button{padding:4px 12px;background:transparent;border:1px solid #333;border-radius:4px;color:#888;font-size:11px;cursor:pointer;font-family:'JetBrains Mono'}
.examples button:hover{border-color:#666;color:#fff}
.main{flex:1;display:flex;overflow:hidden}
.editor-pane,.output-pane{flex:1;display:flex;flex-direction:column;min-width:0}
.editor-pane{border-right:1px solid #1a1a1a}
.pane-header{padding:8px 16px;font-size:11px;opacity:.4;font-family:'JetBrains Mono';border-bottom:1px solid #1a1a1a;display:flex;justify-content:space-between;align-items:center}
textarea{flex:1;background:transparent;color:#fff;border:none;padding:16px;font-family:'JetBrains Mono';font-size:13px;line-height:1.7;resize:none;outline:none;tab-size:4}
.output{flex:1;padding:16px;font-family:'JetBrains Mono';font-size:13px;line-height:1.7;overflow:auto;white-space:pre-wrap;opacity:.8}
.output.error{color:#ff4466}
.run-btn{padding:4px 16px;background:#fff;color:#000;border:none;border-radius:4px;font-weight:600;cursor:pointer;font-family:'Space Grotesk';font-size:12px}
.meta{font-size:10px;opacity:.3;margin-top:8px;font-family:'JetBrains Mono'}
</style></head>
<body>
<div class="bar"></div>
<header>
    <h1>RoadC Playground</h1>
    <div class="examples" id="examples"></div>
</header>
<div class="main">
    <div class="editor-pane">
        <div class="pane-header"><span>editor</span><button class="run-btn" onclick="run()">Run ▸</button></div>
        <textarea id="code" spellcheck="false" placeholder="Write RoadC code...">fun greet(name):
    return "Hello, " + name + "!"

print(greet("BlackRoad"))
print(greet("World"))

let i = 1
while i <= 5:
    print(i * i)
    i = i + 1</textarea>
    </div>
    <div class="output-pane">
        <div class="pane-header"><span>output</span><span id="timing"></span></div>
        <div class="output" id="output">press Run or Ctrl+Enter</div>
    </div>
</div>
<script>
async function run(){
    const code=document.getElementById('code').value;
    const out=document.getElementById('output');
    const timing=document.getElementById('timing');
    out.textContent='running...';out.className='output';
    const r=await fetch('/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});
    const d=await r.json();
    if(d.success){
        out.textContent=d.output||'(no output)';out.className='output';
    }else{
        out.textContent=(d.output||'')+('\\n'+d.error);out.className='output error';
    }
    timing.textContent=d.ms+'ms';
}

async function loadExamples(){
    const r=await fetch('/examples');const ex=await r.json();
    const container=document.getElementById('examples');
    for(const[key,val]of Object.entries(ex)){
        const btn=document.createElement('button');
        btn.textContent=val.name;
        btn.onclick=()=>{document.getElementById('code').value=val.code};
        container.appendChild(btn);
    }
}
loadExamples();

document.getElementById('code').addEventListener('keydown',e=>{
    if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run()}
    if(e.key==='Tab'){e.preventDefault();const t=e.target;const s=t.selectionStart;t.value=t.value.substring(0,s)+'    '+t.value.substring(t.selectionEnd);t.selectionStart=t.selectionEnd=s+4}
});
</script>
</body></html>"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8400)
