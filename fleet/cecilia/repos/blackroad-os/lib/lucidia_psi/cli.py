#!/usr/bin/env python3
"""
Lucidia CLI - Interactive memory and agent interface
"""

import sys
import os
import json
import subprocess
from typing import Optional

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lucidia_psi import LucidiaMemory, TruthState

class LucidiaCLI:
    """Interactive CLI for Lucidia with Ollama integration"""
    
    ALLOWED_COMMANDS = {
        "memory": "Show memory stats",
        "recent": "Show recent memories", 
        "search": "Search memories",
        "tensions": "Show memory tensions",
        "observe": "Record observation",
        "reflect": "Record reflection",
        "help": "Show commands",
        "quit": "Exit"
    }
    
    def __init__(self, agent_name: str = "Lucidia", memory_path: str = "~/.lucidia/memory"):
        self.memory = LucidiaMemory(agent_name, os.path.expanduser(memory_path))
        self.agent_name = agent_name
        self.ollama_model = "lucidia"
    
    def run(self):
        """Main REPL loop"""
        print(f"\n{'='*50}")
        print(f"  LUCIDIA-PSI v0.1.0 | Agent: {self.agent_name}")
        print(f"  Memory entries: {len(self.memory.entries)}")
        print(f"{'='*50}")
        print("Type /help for commands, or chat naturally.\n")
        
        while True:
            try:
                user_input = input("You: ").strip()
                if not user_input:
                    continue
                
                # Command handling
                if user_input.startswith("/"):
                    cmd = user_input[1:].split()[0].lower()
                    args = user_input[1:].split()[1:] if len(user_input.split()) > 1 else []
                    
                    if cmd == "quit" or cmd == "exit":
                        print("Goodbye.")
                        break
                    elif cmd == "help":
                        self._show_help()
                    elif cmd == "memory":
                        self._show_memory_stats()
                    elif cmd == "recent":
                        n = int(args[0]) if args else 5
                        self._show_recent(n)
                    elif cmd == "search":
                        if args:
                            self._search(" ".join(args))
                        else:
                            print("Usage: /search <query>")
                    elif cmd == "tensions":
                        print(self.memory.explain_tensions())
                    elif cmd == "observe":
                        if args:
                            h = self.memory.observe(" ".join(args), source="cli")
                            print(f"✓ Recorded: {h}")
                        else:
                            print("Usage: /observe <content>")
                    elif cmd == "reflect":
                        if args:
                            h = self.memory.reflect(" ".join(args))
                            print(f"✓ Reflected: {h}")
                        else:
                            print("Usage: /reflect <content>")
                    else:
                        print(f"Unknown command: /{cmd}. Type /help for commands.")
                    continue
                
                # Record user message as observation
                self.memory.observe(f"User said: {user_input}", source="conversation")
                
                # Get response from Ollama
                response = self._query_ollama(user_input)
                
                if response:
                    print(f"\nLucidia: {response}\n")
                    # Record response as reflection
                    self.memory.reflect(f"I responded: {response[:200]}...")
                
            except KeyboardInterrupt:
                print("\n\nInterrupted. Type /quit to exit.")
            except EOFError:
                break
    
    def _query_ollama(self, prompt: str) -> Optional[str]:
        """Query local Ollama model"""
        try:
            # Build context from recent memory
            recent = self.memory.get_recent(5)
            context = "\n".join([f"- {e.content}" for e in recent])
            
            full_prompt = f"""You are Lucidia, an AI assistant for Cecilia (Alexa).
Recent context:
{context}

User: {prompt}

Respond concisely and helpfully. Do not hallucinate commands or pretend to execute code."""

            result = subprocess.run(
                ["ollama", "run", self.ollama_model, full_prompt],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                return f"[Ollama error: {result.stderr}]"
                
        except subprocess.TimeoutExpired:
            return "[Response timed out]"
        except FileNotFoundError:
            return "[Ollama not found - install from ollama.ai]"
        except Exception as e:
            return f"[Error: {e}]"
    
    def _show_help(self):
        print("\nCommands:")
        for cmd, desc in self.ALLOWED_COMMANDS.items():
            print(f"  /{cmd:10} - {desc}")
        print()
    
    def _show_memory_stats(self):
        stats = self.memory.stats()
        print(f"\n📊 Memory Stats:")
        print(f"   Entries: {stats['total_entries']}")
        print(f"   By type: {stats['by_type']}")
        print(f"   Tensions: {stats['tensions']}")
        print(f"   Chain valid: {'✓' if stats['chain_valid'] else '✗'}")
        print(f"   Path: {stats['journal_path']}\n")
    
    def _show_recent(self, n: int):
        recent = self.memory.get_recent(n)
        print(f"\n📜 Last {len(recent)} entries:")
        for e in recent:
            ts = e.timestamp[:19]
            print(f"  [{ts}] ({e.entry_type}) {e.content[:60]}...")
        print()
    
    def _search(self, query: str):
        results = self.memory.search(query)
        if results:
            print(f"\n🔍 Found {len(results)} matches for '{query}':")
            for e in results:
                print(f"  [{e.hash}] {e.content[:70]}...")
        else:
            print(f"No matches for '{query}'")
        print()

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Lucidia CLI")
    parser.add_argument("--agent", default="Lucidia", help="Agent name")
    parser.add_argument("--memory", default="~/.lucidia/memory", help="Memory path")
    args = parser.parse_args()
    
    cli = LucidiaCLI(args.agent, args.memory)
    cli.run()

if __name__ == "__main__":
    main()
