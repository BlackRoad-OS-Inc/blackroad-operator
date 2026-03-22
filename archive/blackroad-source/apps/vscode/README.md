# BlackRoad for Visual Studio Code

Official VSCode extension for BlackRoad - manage agents, tasks, memory, and deployments from your IDE.

## Features

### Activity Bar
- **Agents View** - Browse all agents by division, see status, send heartbeats
- **Tasks View** - View tasks by status, dispatch new tasks, complete/assign tasks
- **Memory View** - Browse memory entries by action type, search history

### Commands
- `BlackRoad: Connect` - Connect to BlackRoad API
- `BlackRoad: Disconnect` - Disconnect from API
- `BlackRoad: Open Dashboard` - Open interactive dashboard panel
- `BlackRoad: Deploy Project` - Deploy current project
- `BlackRoad: View Logs` - View recent memory entries as logs
- `BlackRoad: Dispatch Task` - Create a new task
- `BlackRoad: Register Agent` - Register a new agent
- `BlackRoad: Log to Memory` - Log an entry to memory
- `BlackRoad: Search Memory` - Search memory entries

### Dashboard
Interactive webview dashboard showing:
- Agent statistics (total, active)
- Task statistics (total, pending, completed)
- Memory entry count
- Connection status
- Quick action buttons

### Code Snippets
Snippets for all BlackRoad SDKs:
- TypeScript/JavaScript (`br-init`, `br-agents-list`, `br-task-dispatch`, etc.)
- Python (`br-init`, `br-memory-log`, `br-try-except`, etc.)
- Go (`br-init`, `br-agents-list`, `br-errors`, etc.)
- Rust (`br-init`, `br-match-err`, etc.)
- Ruby (`br-init`, `br-rescue`, etc.)

## Installation

### From Marketplace
```bash
code --install-extension blackroad-os.blackroad
```

### Manual Installation
```bash
# Clone and build
git clone https://github.com/BlackRoad-OS/blackroad-vscode-extension
cd blackroad-vscode-extension
npm install
npm run compile

# Package
npm run package

# Install .vsix
code --install-extension blackroad-1.0.0.vsix
```

## Configuration

Add to your `settings.json` or use Settings UI:

```json
{
  "blackroad.apiKey": "br_xxxxxxxxxxxxxxxx",
  "blackroad.apiUrl": "https://api.blackroad.io/v1",
  "blackroad.autoConnect": true,
  "blackroad.refreshInterval": 30
}
```

### Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `blackroad.apiKey` | string | `""` | BlackRoad API key |
| `blackroad.apiUrl` | string | `https://api.blackroad.io/v1` | API base URL |
| `blackroad.autoConnect` | boolean | `true` | Auto-connect on startup |
| `blackroad.refreshInterval` | number | `30` | Auto-refresh interval in seconds (0 to disable) |

## Usage

### Quick Start
1. Install the extension
2. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
3. Run `BlackRoad: Connect`
4. Enter your API key when prompted
5. View agents, tasks, and memory in the sidebar

### Snippets
Type `br-` in any supported file to see available snippets:

| Prefix | Description |
|--------|-------------|
| `br-init` | Initialize BlackRoad client |
| `br-agents-list` | List agents |
| `br-agent-register` | Register new agent |
| `br-task-dispatch` | Dispatch a task |
| `br-task-complete` | Complete a task |
| `br-memory-log` | Log to memory |
| `br-memory-query` | Query memory |
| `br-til` | Share TIL entry |
| `br-try-catch` / `br-errors` | Error handling |

### Tree View Context Actions
- Right-click an agent → Send Heartbeat
- Right-click a task → Complete Task / Assign Task

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode
npm run watch

# Lint
npm run lint

# Package for distribution
npm run package

# Publish to marketplace
npm run publish
```

### Debugging
1. Open extension in VSCode
2. Press `F5` to launch Extension Development Host
3. Test commands and views

## Requirements

- VSCode 1.85.0 or higher
- BlackRoad API key

## Links

- [Documentation](https://docs.blackroad.io/tools/vscode)
- [API Reference](https://docs.blackroad.io/api)
- [GitHub](https://github.com/BlackRoad-OS/blackroad-vscode-extension)
- [Issues](https://github.com/BlackRoad-OS/blackroad-vscode-extension/issues)

## License

See [LICENSE](./LICENSE) for details.

---

Part of the **BlackRoad Empire**
