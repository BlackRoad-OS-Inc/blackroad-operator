# Local Coding Assistant - Quick Reference

## Installation

```bash
~/setup-local-coding-assistant.sh
```

## Quick Commands

| Command | Description |
|---------|-------------|
| `br-code-assistant` | Interactive menu |
| `br-code-assistant chat` | Start chat mode |
| `br-code-assistant task "description"` | Execute coding task |
| `br-code-assistant analyze <path>` | Analyze files/dirs |
| `br-code-assistant review <file>` | Code review |
| `br-code-assistant search "query"` | Search blackroad os |
| `br-code-assistant aider` | Agentic workflows |

## Modes

### 💬 Chat Mode
Interactive coding session for Q&A, debugging, explanations.

**Use when:** You need back-and-forth conversation

```bash
br-code-assistant chat
```

### 🔧 Task Mode
Structured task execution with plan, code, commands, tests.

**Use when:** You have a specific task to complete

```bash
br-code-assistant task "Add Stripe webhook handler"
```

### 🔍 Analyze Mode
Architecture overview, component analysis, suggestions.

**Use when:** Understanding existing code

```bash
br-code-assistant analyze services/web
```

### 🧪 Review Mode
Focused code review: bugs, security, performance, best practices.

**Use when:** Quality checking code

```bash
br-code-assistant review app/api/route.ts
```

### 📚 Search Mode
Search 22,244 indexed components in BlackRoad OS.

**Use when:** Looking for existing solutions first

```bash
br-code-assistant search "authentication patterns"
```

### 🤖 Aider Mode
Agentic pair programming with multi-file editing, auto-commits.

**Use when:** Complex multi-file refactoring

```bash
br-code-assistant aider
```

## Configuration

```bash
# Change model (temporary)
export BR_CODE_MODEL="qwen2.5:32b"

# Change model (permanent)
echo 'export BR_CODE_MODEL="qwen2.5:32b"' >> ~/.zshrc
```

## Integration Points

### Memory System
```bash
# View coding sessions
~/memory-query.sh "br-code-assistant"
```

### BlackRoad OS
```bash
# Manual search
python3 ~/blackroad-blackroad os-search.py "query"
```

### Traffic Lights
```bash
# Check project status
~/memory-realtime-context.sh live blackroad os compact
```

## Recommended Models

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| `qwen2.5-coder:7b` | 4.7GB | Fast | Good | **Default** |
| `qwen2.5-coder:32b` | 18GB | Slow | Excellent | Complex tasks |
| `qwen2.5-coder:1.5b` | 1GB | Very Fast | Fair | Quick fixes |
| `deepseek-coder:6.7b` | 3.8GB | Fast | Good | Alternative |

```bash
ollama pull qwen2.5-coder:32b
```

## Tips

### ✅ DO
- Be specific in task descriptions
- Provide file paths and context
- Search blackroad os first
- Review generated code before applying
- Use chat mode for iteration

### ❌ DON'T
- Give vague prompts like "fix the bug"
- Blindly copy-paste without understanding
- Skip the blackroad os search step
- Use for tasks requiring cloud APIs
- Forget to review security implications

## Common Patterns

### Feature Development
```bash
# 1. Search for patterns
br-code-assistant search "user authentication"

# 2. Generate implementation
br-code-assistant task "Add JWT auth middleware"

# 3. Review code
br-code-assistant review lib/auth.ts

# 4. Generate tests
br-code-assistant task "Create tests for auth middleware"
```

### Debugging
```bash
br-code-assistant chat
> "I'm getting [error]. Here's my code: [paste]"
> "What's causing this?"
> "Show me the fix with proper error handling"
```

### Refactoring
```bash
# 1. Analyze current code
br-code-assistant analyze old-module.js

# 2. Get refactoring plan
br-code-assistant task "Refactor to TypeScript with types"

# 3. Use Aider for multi-file
br-code-assistant aider
/add old-module.js types.ts
"Refactor with proper TypeScript types"
```

## Troubleshooting

### Ollama Not Running
```bash
ollama serve &
```

### Model Missing
```bash
ollama pull qwen2.5-coder:7b
```

### Slow Performance
```bash
export BR_CODE_MODEL="qwen2.5-coder:1.5b"
```

### Aider Not Found
```bash
pip3 install aider-chat
```

## Full Documentation

- **Setup**: `~/setup-local-coding-assistant.sh`
- **Guide**: `~/BlackRoad-Private/docs/LOCAL_CODING_ASSISTANT.md`
- **Examples**: `~/BlackRoad-Private/docs/CODING_ASSISTANT_EXAMPLES.md`

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Updated**: 2026-02-13
