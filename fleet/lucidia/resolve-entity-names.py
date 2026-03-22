#!/usr/bin/env python3
"""
Entity Name Resolver - Converts cryptic IDs to human-readable names
"""
import json
import re
from pathlib import Path
from collections import defaultdict

INPUT_FILE = Path('/Users/alexa/BlackRoad-Private/memory-index/entities-index.json')
OUTPUT_FILE = Path('/Users/alexa/BlackRoad-Private/memory-index/entities-named.json')

# Agent name patterns
AGENT_NAMES = {
    'erebus': 'Erebus (Memory Weaver)',
    'cecilia': 'Cecilia (Production Enhancer)',
    'apollo': 'Apollo (Architect)',
    'nova': 'Nova (ESP32 Systems)',
    'silas': 'Silas (ESP32 Engineer)',
    'joaquin': 'Joaquin (Sales Master)',
    'persephone': 'Persephone (Session Coordinator)',
    'claude': 'Claude (Collaboration Agent)',
    'architect': 'Architect (Systems Designer)',
    'willow': 'Willow (Product Manager)',
    'winston': 'Winston (Infrastructure)',
    'phoenix': 'Phoenix (Recovery Agent)',
    'ares': 'Ares (Battle Commander)',
    'mercury': 'Mercury (Message Broker)',
    'hermes': 'Hermes (Communication)',
    'triton': 'Triton (Data Systems)',
    'hercules': 'Hercules (Heavy Lifting)',
    'quintas': 'Quintas (Quality Assurance)',
    'cadence': 'Cadence (UX Master)',
    'cicero': 'Cicero (Pi Coordinator)',
    'monitor': 'System Monitor',
}

# System patterns
SYSTEM_PATTERNS = {
    r'^blackroad-.*': 'BlackRoad System',
    r'^cloudflare-.*': 'Cloudflare Service',
    r'^railway-.*': 'Railway Service',
    r'^github-.*': 'GitHub Integration',
    r'^deployment-.*': 'Deployment System',
    r'^memory-.*': 'Memory System',
    r'^codex-.*': 'Codex System',
}

# Special entities
SPECIAL_NAMES = {
    'empire-deployment': 'Empire Deployment System',
    'unknown': 'Unknown/Anonymous',
    '[CLOUDFLARE]+[BRAND-AUDIT]': 'Cloudflare Brand Audit',
    '[CLOUDFLARE]+[BATCH-PERFECT]': 'Cloudflare Batch Perfect',
    'claude-collab-revolution': 'Claude Collaboration Revolution',
    'claude-bot-deployment': 'Claude Bot Deployment',
    'claude-golden-ratio-templates': 'Claude Golden Ratio Templates',
    'claude-cloudflare-integration-test': 'Claude Cloudflare Integration',
    'claude-quantum-physics-agents': 'Claude Quantum Physics Agents',
    'blackroad-api': 'BlackRoad API Gateway',
}

def resolve_entity_name(entity_id):
    """Convert entity ID to human-readable name"""
    
    # Check special names first
    if entity_id in SPECIAL_NAMES:
        return SPECIAL_NAMES[entity_id]
    
    # Check for agent names
    for prefix, name in AGENT_NAMES.items():
        if entity_id.startswith(prefix):
            # Extract any additional context
            if '-' in entity_id:
                parts = entity_id.split('-')
                if len(parts) > 2:
                    context = ' '.join(parts[1:-2]).title()
                    if context and context not in name:
                        return f"{name} - {context}"
            return name
    
    # Check system patterns
    for pattern, name in SYSTEM_PATTERNS.items():
        if re.match(pattern, entity_id):
            # Extract specific service name
            service = entity_id.split('-', 1)[1] if '-' in entity_id else ''
            if service:
                service = service.replace('-', ' ').title()
                return f"{name}: {service}"
            return name
    
    # Project/milestone names
    if entity_id.endswith('-complete') or entity_id.endswith('-deployed'):
        project = entity_id.rsplit('-', 1)[0]
        project = project.replace('-', ' ').title()
        return f"Project: {project}"
    
    # Session names
    if 'session' in entity_id.lower():
        parts = entity_id.split('-')
        agent = parts[0].title() if parts else 'Agent'
        return f"{agent} Session"
    
    # Generic cleanup
    cleaned = entity_id.replace('-', ' ').replace('_', ' ')
    cleaned = re.sub(r'\b\d{10,}\b', '', cleaned)  # Remove long numbers
    cleaned = re.sub(r'\b[0-9a-f]{8,}\b', '', cleaned)  # Remove hex IDs
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    if cleaned and cleaned != entity_id:
        return cleaned.title()
    
    # If all else fails, return original with cleanup
    return entity_id.replace('-', ' ').title()

def categorize_entity(entity_id, name):
    """Categorize entity for better organization"""
    
    # Agent check
    for prefix in AGENT_NAMES.keys():
        if entity_id.startswith(prefix):
            return 'agent'
    
    # System check
    for pattern in SYSTEM_PATTERNS.keys():
        if re.match(pattern, entity_id):
            return 'system'
    
    # Project check
    if any(keyword in entity_id for keyword in ['deployment', 'session', 'complete', 'deployed']):
        return 'project'
    
    # Service check
    if any(keyword in entity_id for keyword in ['api', 'worker', 'service', 'bot']):
        return 'service'
    
    return 'other'

def main():
    print("🔄 Loading entities...")
    with open(INPUT_FILE, 'r') as f:
        entities = json.load(f)
    
    print(f"✅ Loaded {len(entities)} entities")
    print("\n🏷️  Resolving names...")
    
    # Process entities
    named_entities = []
    categories = defaultdict(int)
    
    for entity in entities:
        entity_id = entity['entity']
        count = entity['count']
        
        # Resolve name
        name = resolve_entity_name(entity_id)
        category = categorize_entity(entity_id, name)
        
        named_entities.append({
            'id': entity_id,
            'name': name,
            'category': category,
            'count': count
        })
        
        categories[category] += 1
    
    # Save results
    print(f"\n💾 Saving to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(named_entities, f, indent=2)
    
    # Create category summary
    category_file = OUTPUT_FILE.parent / 'entities-by-category.json'
    
    categorized = defaultdict(list)
    for entity in named_entities:
        categorized[entity['category']].append({
            'id': entity['id'],
            'name': entity['name'],
            'count': entity['count']
        })
    
    # Sort each category by count
    for category in categorized:
        categorized[category].sort(key=lambda x: x['count'], reverse=True)
    
    with open(category_file, 'w') as f:
        json.dump(dict(categorized), f, indent=2)
    
    print("\n📊 Statistics:")
    print(f"   Total entities:  {len(named_entities)}")
    print(f"\n   By category:")
    for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"     {category.title():12} {count:4}")
    
    print(f"\n✅ Created:")
    print(f"   - {OUTPUT_FILE.name}")
    print(f"   - {category_file.name}")
    
    # Show examples
    print(f"\n📝 Example mappings:")
    for entity in named_entities[:10]:
        print(f"   {entity['id'][:40]:40} → {entity['name']}")

if __name__ == '__main__':
    main()
