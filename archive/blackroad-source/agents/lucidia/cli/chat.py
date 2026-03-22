#!/usr/bin/env python3
"""
Lucidia CLI - Chat Command
Chat with indexed agents via Ollama
"""

import sys
import subprocess
import sqlite3
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
from rich.theme import Theme

THEME = Theme({
    "br.orange": "orange1",
    "br.dark_orange": "dark_orange",
    "br.pink": "deep_pink2",
    "br.orchid": "medium_orchid",
    "br.magenta": "magenta",
    "br.blue": "dodger_blue2",
})
console = Console(theme=THEME)

DB_PATH = Path.home() / ".lucidia" / "index" / "blackroad.db"

def get_agents():
    """Get list of available agents from index."""
    if not DB_PATH.exists():
        return []
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT name, model, filepath FROM agents ORDER BY name")
    agents = c.fetchall()
    conn.close()
    return agents

def list_agents():
    """Display available agents."""
    agents = get_agents()
    if not agents:
        console.print("[red]No agents indexed. Run 'lucidia index' first.[/]")
        return
    
    table = Table(title="Available Agents", show_header=True)
    table.add_column("#", style="dim", width=4)
    table.add_column("Name", style="br.orange")
    table.add_column("Model", style="br.pink")
    
    for i, (name, model, _) in enumerate(agents, 1):
        table.add_row(str(i), name, model or "-")
    
    console.print(table)

def chat_with_agent(agent_name: str):
    """Start chat session with an agent."""
    agents = get_agents()
    agent = None
    
    # Find by name or number
    if agent_name.isdigit():
        idx = int(agent_name) - 1
        if 0 <= idx < len(agents):
            agent = agents[idx]
    else:
        for a in agents:
            if a[0].lower() == agent_name.lower():
                agent = a
                break
    
    if not agent:
        console.print(f"[red]Agent not found: {agent_name}[/]")
        list_agents()
        return
    
    name, model, filepath = agent
    
    # Check if Ollama has this model
    console.print(f"\n[br.orange]▸[/] [br.pink]▸[/] [br.blue]▸[/] Connecting to [bold]{name}[/] ({model})\n")
    
    # Interactive chat loop
    console.print("[dim]Type 'exit' or Ctrl+C to quit[/]\n")
    
    history = []
    
    while True:
        try:
            user_input = Prompt.ask("[br.blue]you[/]")
            
            if user_input.lower() in ['exit', 'quit', 'q']:
                console.print("\n[dim]Session ended.[/]")
                break
            
            if not user_input.strip():
                continue
            
            # Build conversation for Ollama
            history.append({"role": "user", "content": user_input})
            
            # Call Ollama
            try:
                # Use the modelfile-based agent if available
                model_to_use = f"blackroad-{name}" if model and "blackroad" in model else (model or "phi3:latest")
                
                result = subprocess.run(
                    ["ollama", "run", model_to_use, user_input],
                    capture_output=True,
                    text=True,
                    timeout=120
                )
                
                if result.returncode == 0:
                    response = result.stdout.strip()
                    console.print(f"\n[br.orange]{name}[/]: {response}\n")
                    history.append({"role": "assistant", "content": response})
                else:
                    console.print(f"[red]Error: {result.stderr}[/]")
                    
            except subprocess.TimeoutExpired:
                console.print("[red]Request timed out[/]")
            except FileNotFoundError:
                console.print("[red]Ollama not found. Install from https://ollama.ai[/]")
                break
                
        except KeyboardInterrupt:
            console.print("\n\n[dim]Session ended.[/]")
            break

def main():
    args = sys.argv[1:]
    
    if not args:
        # Interactive agent selection
        list_agents()
        console.print()
        agent = Prompt.ask("[br.pink]Select agent (name or #)[/]")
        if agent:
            chat_with_agent(agent)
    elif args[0] in ["-l", "--list", "list"]:
        list_agents()
    elif args[0] in ["-h", "--help", "help"]:
        console.print("""
[br.orange]lucidia chat[/] - Chat with BlackRoad agents

[bold]Usage:[/]
  lucidia chat              Interactive agent selection
  lucidia chat <agent>      Chat with specific agent
  lucidia chat list         List available agents
  lucidia chat help         Show this help

[dim]Agents are loaded from indexed Modelfiles[/]
""")
    else:
        chat_with_agent(args[0])

if __name__ == "__main__":
    main()
