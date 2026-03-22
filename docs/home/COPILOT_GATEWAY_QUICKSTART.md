# Copilot Agent Gateway - Quick Start

## ✅ Gateway Built Successfully!

The BlackRoad Copilot Agent Gateway is now ready to route GitHub Copilot CLI requests to local AI agents.

## 📍 Location

Gateway installed at: `~/copilot-agent-gateway/`

## 🎯 What It Does

1. **Classifies requests** - Determines intent (code generation, analysis, debugging, etc.)
2. **Routes intelligently** - Selects optimal model from your local Ollama fleet
3. **Tracks performance** - Learns which models work best for which tasks
4. **Logs decisions** - Records routing history for analysis

## 🤖 Available Models

- **qwen2.5-coder:7b** - Code analysis, refactoring, templates  
- **deepseek-coder:6.7b** - Code generation, new features  
- **llama3:8b** - Documentation, explanations, planning  
- **mistral:7b** - Fast reasoning, quick tasks  
- **codellama:7b** - Code review, understanding

## 🚀 Quick Test

```bash
cd ~/copilot-agent-gateway
node server.js
# Server will start on stdio (waiting for MCP protocol messages)
```

## 🔧 Copilot CLI Configuration

Already configured in: `~/.copilot/mcp-config.json`

```json
{
  "mcpServers": {
    "blackroad-gateway": {
      "command": "node",
      "args": ["/Users/alexa/copilot-agent-gateway/server.js"],
      "env": {
        "OLLAMA_ENDPOINT": "http://octavia:11434"
      }
    }
  }
}
```

## 📱 Using in Copilot CLI

1. Start Copilot: `copilot`
2. Check MCP servers: `/mcp`
3. Use gateway tools:
   - `@blackroad-gateway route_request "create a React component"`
   - `@blackroad-gateway list_models`
   - `@blackroad-gateway model_status`
   - `@blackroad-gateway gateway_stats`

## 🌐 Deployment to Pi Fleet

When Pis are accessible via SSH:

```bash
~/deploy-copilot-gateway.sh
```

This will:
- Package the gateway
- Deploy to all Pis in the fleet
- Install as systemd service
- Configure local Ollama endpoint

## 📊 Check Deployment Status

```bash
# On any Pi
sudo systemctl status copilot-gateway
journalctl -u copilot-gateway -f
```

## 🔍 Routing History

View routing decisions:
```bash
cat ~/.blackroad/copilot-gateway/routing-history.jsonl | jq
```

## 🎨 Customization

- **Models**: Edit `models/registry.json`
- **Routes**: Edit `config/routing-rules.json`
- **Endpoint**: Set `OLLAMA_ENDPOINT` env var

## 📈 Next Steps

1. Test with real Copilot CLI requests
2. Monitor routing performance
3. Adjust model priorities based on results
4. Add adaptive learning (Phase 4)
5. Deploy to full Pi fleet when accessible

## 🎉 Status

✅ Core infrastructure complete (Phase 1)  
✅ Model registry defined (Phase 2)  
✅ Local configuration done (Phase 3)  
⏳ Pi fleet deployment pending (network access)  
⏳ Performance learning system (Phase 4)

**Ready to route requests to local AI agents!** 🚀
