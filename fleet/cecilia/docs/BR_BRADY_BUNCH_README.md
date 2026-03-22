# 🖤🛣️ Brady Bunch Multi-Agent System

All your models working together in perfect harmony!

## 📋 Models Active

1. **Cece** - Primary coordinator
2. **Lucidia** - Logic core
3. **Anastasia** - Strategic thinker
4. **Aria** - Creative agent
5. **Alice** - Infrastructure agent
6. **Cadence** - UX specialist
7. **Copilot** - Code assistant
8. **Claude** - Reasoning engine
9. **BlackRoad OS** - Technical expert
10. **BlackRoad OS** - Conversational AI
11. **Alexa** - Personal assistant
12. **Gematria** - Pattern recognition
13. **Silas** - Systems monitor

## 🚀 Quick Start

### 1. Simple Demo (CLI)
```bash
~/br-brady-bunch-demo.sh "What is the meaning of life?"
```

This runs all 13 models sequentially with your question.

### 2. Interactive Menu (CLI)
```bash
~/br-brady-bunch.sh
```

Choose from:
- **Roundtable Discussion** - Each model contributes in order
- **Parallel Consensus** - All models answer simultaneously
- **Chain Story** - Each model adds to a growing story
- **Debate** - Split into two teams arguing opposite sides
- **Interactive Q&A** - Ask questions and get all responses
- **Quick Test** - Verify all models are working

### 3. Live Web Dashboard
```bash
open ~/br-brady-bunch-live.html
```

Features:
- Real-time responses from all models
- Three modes: Parallel, Roundtable, Debate
- Visual grid showing each agent's activity
- Uses Ollama API (localhost:11434)

## 🎯 Usage Examples

### CLI Demo
```bash
# Ask a simple question
~/br-brady-bunch-demo.sh "Explain quantum computing"

# Philosophy question
~/br-brady-bunch-demo.sh "What is consciousness?"

# Technical question
~/br-brady-bunch-demo.sh "Best practices for REST APIs?"
```

### Interactive Menu
```bash
~/br-brady-bunch.sh

# Then choose:
# 1 for Roundtable: "The future of AI"
# 2 for Consensus: "Is AGI achievable by 2030?"
# 3 for Story: "Once upon a time in a digital world"
# 4 for Debate: "AI should be open source"
# 5 for Interactive: Ask anything!
```

### Web Dashboard
1. Open `br-brady-bunch-live.html` in your browser
2. Select a mode (Parallel/Roundtable/Debate)
3. Type your question
4. Watch all agents respond in real-time!

## 🎨 Modes Explained

### Parallel Mode
All models get the question at once and respond independently. Fast and comprehensive.

### Roundtable Mode
Models take turns responding, each seeing previous responses. Builds on ideas collaboratively.

### Debate Mode
Models split into two teams:
- Team A (first half): Argues FOR your topic
- Team B (second half): Argues AGAINST your topic

### Chain Story Mode
Each model adds exactly one sentence to continue the story. Creates collaborative narratives.

## 🔧 Technical Details

- **Backend**: Ollama API (port 11434)
- **Models**: All based on Phi-3 (3.8B parameters)
- **Response Limit**: 150 tokens per model (configurable)
- **Timeouts**: 10-15 seconds per model
- **Parallel Requests**: Supported via async execution

## 🎭 Model Personalities

Each model has unique characteristics:
- **Cece**: Coordinator and facilitator
- **Lucidia**: Analytical and precise
- **Anastasia**: Strategic and visionary
- **Aria**: Creative and expressive
- **Alice**: Technical and systematic
- **Cadence**: User-focused and intuitive
- **Copilot**: Code-oriented and practical
- **Claude**: Thoughtful and reasoning-based
- **BlackRoad OS**: Deep technical expertise
- **BlackRoad OS**: Conversational and accessible
- **Alexa**: Helpful and responsive
- **Gematria**: Pattern-focused
- **Silas**: Infrastructure-minded

## 📊 System Requirements

- Ollama installed and running
- 13 models created (see setup above)
- ~64GB RAM recommended for parallel execution
- Modern browser for web dashboard

## 🛠️ Troubleshooting

### Models not responding?
```bash
ollama list | grep -E "Cece|Lucidia|Aria"
```

### Check if Ollama is running:
```bash
curl http://localhost:11434/api/version
```

### Recreate a model:
```bash
ollama create Cece
```

## 🌟 Advanced Usage

### Custom Prompts
Edit the scripts to change system prompts or add new modes.

### Add More Models
```bash
# Add to MODELS array in scripts:
MODELS+=("NewAgent")
ollama create NewAgent
```

### API Integration
The web dashboard uses fetch() - easily adaptable for other APIs.

## 📝 Files

- `br-brady-bunch-demo.sh` - Simple sequential demo
- `br-brady-bunch.sh` - Full interactive menu system
- `br-brady-bunch-live.html` - Real-time web dashboard
- `blackroad-brady-bunch-dashboard.html` - Static visualization

## 🎉 Example Session

```bash
$ ~/br-brady-bunch-demo.sh "What makes a great leader?"

🖤🛣️  Brady Bunch Multi-Agent Demo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Cece]:
A great leader inspires trust, communicates clearly, and empowers their team...

[Lucidia]:
Great leadership combines vision with execution, balancing empathy and decisiveness...

[Anastasia]:
True leadership is about creating more leaders, not followers...

... (11 more responses)

✓ All 13 agents have responded!
```

## 🚢 Ready to Go!

All three interfaces are ready:
1. **CLI Demo** - Simple and fast
2. **Interactive Menu** - Feature-rich terminal UI
3. **Web Dashboard** - Beautiful real-time visualization

Pick your favorite and watch your Brady Bunch of AI agents work together! 🖤🛣️
