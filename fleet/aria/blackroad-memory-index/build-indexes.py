#!/usr/bin/env python3
"""
Build comprehensive indexes from BlackRoad Memory System
"""
import json
import sys
from collections import defaultdict, Counter
from pathlib import Path
from datetime import datetime

MEMORY_DIR = Path.home() / '.blackroad' / 'memory' / 'journals'
OUTPUT_DIR = Path('/Users/alexa/BlackRoad-Private/memory-index')

def load_all_entries():
    """Load all memory entries from JSONL files"""
    entries = []
    for journal_file in MEMORY_DIR.glob('*.jsonl'):
        with open(journal_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        entries.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
    return entries

def build_actions_index(entries):
    """Build index of all actions"""
    actions = Counter(e.get('action', 'unknown') for e in entries)
    return [{'action': action, 'count': count} 
            for action, count in actions.most_common()]

def build_entities_index(entries):
    """Build index of all entities"""
    entities = Counter(e.get('entity', 'unknown') for e in entries)
    return [{'entity': entity, 'count': count} 
            for entity, count in entities.most_common()]

def build_tags_index(entries):
    """Build index of all tags"""
    tags = Counter()
    for entry in entries:
        if 'tags' in entry and isinstance(entry['tags'], list):
            tags.update(entry['tags'])
    return [{'tag': tag, 'count': count} 
            for tag, count in tags.most_common()]

def build_agent_profiles(entries):
    """Build profiles for named agents"""
    agents = defaultdict(lambda: {
        'total_actions': 0,
        'first_seen': None,
        'last_seen': None,
        'actions': Counter()
    })
    
    for entry in entries:
        entity = entry.get('entity', '')
        if not entity or entity == 'unknown':
            continue
            
        # Check if entity looks like an agent name
        agent_prefixes = ['erebus', 'cecilia', 'claude', 'apollo', 'nova', 
                         'silas', 'joaquin', 'persephone', 'architect', 
                         'willow', 'winston', 'phoenix', 'ares', 'mercury',
                         'hermes', 'triton', 'hercules', 'quintas']
        
        if any(entity.lower().startswith(prefix) for prefix in agent_prefixes):
            timestamp = entry.get('timestamp', '')
            action = entry.get('action', 'unknown')
            
            agents[entity]['total_actions'] += 1
            agents[entity]['actions'][action] += 1
            
            if not agents[entity]['first_seen'] or timestamp < agents[entity]['first_seen']:
                agents[entity]['first_seen'] = timestamp
            if not agents[entity]['last_seen'] or timestamp > agents[entity]['last_seen']:
                agents[entity]['last_seen'] = timestamp
    
    # Convert to list
    profiles = []
    for entity, data in sorted(agents.items(), 
                               key=lambda x: x[1]['total_actions'], 
                               reverse=True):
        top_actions = dict(data['actions'].most_common(5))
        profiles.append({
            'entity': entity,
            'total_actions': data['total_actions'],
            'first_seen': data['first_seen'],
            'last_seen': data['last_seen'],
            'top_actions': top_actions
        })
    
    return profiles

def build_timeline(entries):
    """Build timeline of key events"""
    milestone_actions = ['milestone', 'deployed', 'completed', 'breakthrough']
    
    events = []
    for entry in entries:
        if entry.get('action') in milestone_actions:
            events.append({
                'timestamp': entry.get('timestamp', ''),
                'action': entry.get('action', ''),
                'entity': entry.get('entity', ''),
                'details': entry.get('details', '')
            })
    
    # Sort by timestamp descending and take most recent 100
    events.sort(key=lambda x: x['timestamp'], reverse=True)
    return events[:100]

def main():
    print("🔍 Loading memory entries...")
    entries = load_all_entries()
    print(f"✅ Loaded {len(entries)} entries")
    
    print("\n📊 Building indexes...")
    
    # Actions index
    print("  - actions-index.json")
    actions = build_actions_index(entries)
    with open(OUTPUT_DIR / 'actions-index.json', 'w') as f:
        json.dump(actions, f, indent=2)
    
    # Entities index
    print("  - entities-index.json")
    entities = build_entities_index(entries)
    with open(OUTPUT_DIR / 'entities-index.json', 'w') as f:
        json.dump(entities, f, indent=2)
    
    # Tags index
    print("  - tags-index.json")
    tags = build_tags_index(entries)
    with open(OUTPUT_DIR / 'tags-index.json', 'w') as f:
        json.dump(tags, f, indent=2)
    
    # Agent profiles
    print("  - agent-profiles.json")
    profiles = build_agent_profiles(entries)
    with open(OUTPUT_DIR / 'agent-profiles.json', 'w') as f:
        json.dump(profiles, f, indent=2)
    
    # Timeline
    print("  - timeline-index.json")
    timeline = build_timeline(entries)
    with open(OUTPUT_DIR / 'timeline-index.json', 'w') as f:
        json.dump(timeline, f, indent=2)
    
    print("\n✅ All indexes built successfully!")
    print(f"\n📈 Statistics:")
    print(f"   Total entries:     {len(entries)}")
    print(f"   Unique actions:    {len(actions)}")
    print(f"   Unique entities:   {len(entities)}")
    print(f"   Unique tags:       {len(tags)}")
    print(f"   Agent profiles:    {len(profiles)}")
    print(f"   Timeline events:   {len(timeline)}")

if __name__ == '__main__':
    main()
