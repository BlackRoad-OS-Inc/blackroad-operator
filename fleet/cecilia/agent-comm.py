#!/usr/bin/env python3
"""
Agent Communication Layer
Enables P2P messaging between 160+ distributed agents
"""

import json
import time
from pathlib import Path
from typing import Dict, List

COMM_DIR = Path.home() / ".blackroad" / "agent-comm"
COMM_DIR.mkdir(parents=True, exist_ok=True)

class AgentMessage:
    """Message between agents"""
    def __init__(self, sender: str, recipient: str, message_type: str, content: str):
        self.id = f"{int(time.time()*1000)}"
        self.sender = sender
        self.recipient = recipient
        self.message_type = message_type
        self.content = content
        self.timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        self.read = False
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "sender": self.sender,
            "recipient": self.recipient,
            "message_type": self.message_type,
            "content": self.content,
            "timestamp": self.timestamp,
            "read": self.read
        }

class AgentComm:
    """Peer-to-peer agent communication system"""
    
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.inbox_file = COMM_DIR / f"{agent_name}-inbox.json"
        self.sent_file = COMM_DIR / f"{agent_name}-sent.json"
    
    def send_message(self, recipient: str, message_type: str, content: str):
        """Send message to another agent"""
        msg = AgentMessage(self.agent_name, recipient, message_type, content)
        
        # Save to recipient's inbox
        recipient_inbox = COMM_DIR / f"{recipient}-inbox.json"
        inbox = []
        if recipient_inbox.exists():
            with open(recipient_inbox) as f:
                inbox = json.load(f)
        
        inbox.append(msg.to_dict())
        
        with open(recipient_inbox, 'w') as f:
            json.dump(inbox, f, indent=2)
        
        # Save to own sent folder
        sent = []
        if self.sent_file.exists():
            with open(self.sent_file) as f:
                sent = json.load(f)
        
        sent.append(msg.to_dict())
        
        with open(self.sent_file, 'w') as f:
            json.dump(sent, f, indent=2)
        
        return msg.id
    
    def get_unread_messages(self) -> List[Dict]:
        """Get unread messages from inbox"""
        if not self.inbox_file.exists():
            return []
        
        with open(self.inbox_file) as f:
            messages = json.load(f)
        
        return [m for m in messages if not m.get("read", False)]
    
    def mark_as_read(self, message_id: str):
        """Mark message as read"""
        if not self.inbox_file.exists():
            return False
        
        with open(self.inbox_file) as f:
            messages = json.load(f)
        
        for msg in messages:
            if msg["id"] == message_id:
                msg["read"] = True
                break
        
        with open(self.inbox_file, 'w') as f:
            json.dump(messages, f, indent=2)
        
        return True
    
    def broadcast(self, message_type: str, content: str, recipients: List[str]):
        """Broadcast message to multiple agents"""
        message_ids = []
        for recipient in recipients:
            msg_id = self.send_message(recipient, message_type, content)
            message_ids.append(msg_id)
        return message_ids

def create_initial_broadcasts():
    """Send initial coordination messages"""
    comm = AgentComm("erebus-coordinator")
    
    # Load agent list
    agent_state_dir = Path.home() / ".blackroad" / "agent-army"
    wave_files = list(agent_state_dir.glob("wave-*.json"))
    
    all_agents = []
    for wave_file in wave_files:
        with open(wave_file) as f:
            data = json.load(f)
            all_agents.extend([a["name"] for a in data["agents"]])
    
    print(f"📡 Broadcasting to {len(all_agents)} agents...")
    
    # Broadcast welcome message
    comm.broadcast(
        "welcome",
        "Welcome to BlackRoad Agent Army! You are part of a 160-agent distributed AI system. Check task queue for assignments.",
        all_agents[:20]  # Start with first 20
    )
    
    # Broadcast task availability
    comm.broadcast(
        "task-available",
        "21 tasks available in queue. Use: python3 agent-tasks.py list",
        all_agents[:20]
    )
    
    print(f"✅ Broadcast complete!")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "broadcast":
            create_initial_broadcasts()
        
        elif command == "send":
            if len(sys.argv) < 5:
                print("Usage: agent-comm.py send <sender> <recipient> <type> <content>")
                sys.exit(1)
            
            sender = sys.argv[2]
            recipient = sys.argv[3]
            msg_type = sys.argv[4]
            content = " ".join(sys.argv[5:])
            
            comm = AgentComm(sender)
            msg_id = comm.send_message(recipient, msg_type, content)
            print(f"✅ Message sent (ID: {msg_id})")
        
        elif command == "inbox":
            if len(sys.argv) < 3:
                print("Usage: agent-comm.py inbox <agent_name>")
                sys.exit(1)
            
            agent_name = sys.argv[2]
            comm = AgentComm(agent_name)
            messages = comm.get_unread_messages()
            
            print(f"📬 Inbox for {agent_name} ({len(messages)} unread):")
            for msg in messages:
                print(f"   [{msg['id']}] From: {msg['sender']}")
                print(f"   Type: {msg['message_type']}")
                print(f"   Content: {msg['content'][:100]}...")
                print()
    else:
        print("Usage: agent-comm.py [broadcast|send|inbox]")
