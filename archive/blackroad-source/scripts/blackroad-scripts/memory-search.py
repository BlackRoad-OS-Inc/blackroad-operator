#!/usr/bin/env python3
"""
BlackRoad Memory Search
Fast full-text search across 4,000+ PS-SHA-∞ memory entries
Supports text search, tag filtering, entity lookup, time-range queries
"""

import sqlite3
import sys
import argparse
from pathlib import Path
from datetime import datetime
import json

# Configuration
MEMORY_DIR = Path.home() / ".blackroad" / "memory"
INDEX_DB = MEMORY_DIR / "memory-index.db"

# ANSI Colors
BLUE = '\033[0;34m'
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
RED = '\033[0;31m'
PURPLE = '\033[0;35m'
CYAN = '\033[0;36m'
BOLD = '\033[1m'
DIM = '\033[2m'
NC = '\033[0m'

def highlight(text, term):
    """Highlight search term in text"""
    if not term:
        return text
    # Simple case-insensitive highlight
    import re
    pattern = re.compile(re.escape(term), re.IGNORECASE)
    return pattern.sub(f"{YELLOW}{BOLD}\\g<0>{NC}", text)

def format_timestamp(ts):
    """Format timestamp for display"""
    try:
        dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except:
        return ts

def print_result(row, query_term="", show_hash=False, compact=False):
    """Print a single search result"""
    timestamp = row['timestamp']
    action = row['action']
    entity = row['entity']
    details = row['details']
    sha256 = row['sha256']
    
    formatted_time = format_timestamp(timestamp)
    
    if compact:
        # Compact one-line format
        details_preview = details[:80] + "..." if len(details) > 80 else details
        print(f"{DIM}{formatted_time}{NC} {CYAN}{action}{NC} → {GREEN}{entity}{NC} | {details_preview}")
    else:
        # Full format
        print(f"{PURPLE}{'─' * 80}{NC}")
        print(f"{DIM}Time:{NC}     {formatted_time}")
        print(f"{DIM}Action:{NC}   {CYAN}{action}{NC}")
        print(f"{DIM}Entity:{NC}   {GREEN}{entity}{NC}")
        print(f"{DIM}Details:{NC}  {highlight(details, query_term)}")
        if show_hash:
            print(f"{DIM}SHA256:{NC}   {sha256[:16]}...")
        print()

def search_text(query, limit=20, compact=False, show_hash=False):
    """Full-text search across all memories"""
    if not INDEX_DB.exists():
        print(f"{RED}[✗]{NC} Index not found. Run: ./memory-indexer.py rebuild")
        return
        
    conn = sqlite3.connect(str(INDEX_DB))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # FTS5 full-text search
    cursor.execute("""
        SELECT timestamp, action, entity, details, sha256
        FROM memories_fts
        WHERE memories_fts MATCH ?
        ORDER BY rank
        LIMIT ?
    """, (query, limit))
    
    results = cursor.fetchall()
    count = len(results)
    
    if count == 0:
        print(f"{YELLOW}[!]{NC} No results found for: {BOLD}{query}{NC}")
        conn.close()
        return
        
    print(f"\n{BOLD}{GREEN}Found {count} result(s){NC} for: {BOLD}{query}{NC}\n")
    
    for row in results:
        print_result(row, query_term=query, show_hash=show_hash, compact=compact)
        
    if count == limit:
        print(f"{DIM}Showing first {limit} results. Use --limit to see more.{NC}\n")
        
    conn.close()

def search_by_action(action, limit=20, compact=False):
    """Search by action type"""
    if not INDEX_DB.exists():
        print(f"{RED}[✗]{NC} Index not found. Run: ./memory-indexer.py rebuild")
        return
        
    conn = sqlite3.connect(str(INDEX_DB))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT timestamp, action, entity, details, sha256
        FROM memories_meta
        WHERE action = ?
        ORDER BY timestamp DESC
        LIMIT ?
    """, (action, limit))
    
    results = cursor.fetchall()
    count = len(results)
    
    if count == 0:
        print(f"{YELLOW}[!]{NC} No memories with action: {BOLD}{action}{NC}")
        conn.close()
        return
        
    print(f"\n{BOLD}{GREEN}Found {count} result(s){NC} with action: {BOLD}{action}{NC}\n")
    
    for row in results:
        print_result(row, compact=compact)
        
    conn.close()

def search_by_entity(entity, limit=20, compact=False):
    """Search by entity"""
    if not INDEX_DB.exists():
        print(f"{RED}[✗]{NC} Index not found. Run: ./memory-indexer.py rebuild")
        return
        
    conn = sqlite3.connect(str(INDEX_DB))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT timestamp, action, entity, details, sha256
        FROM memories_meta
        WHERE entity LIKE ?
        ORDER BY timestamp DESC
        LIMIT ?
    """, (f'%{entity}%', limit))
    
    results = cursor.fetchall()
    count = len(results)
    
    if count == 0:
        print(f"{YELLOW}[!]{NC} No memories for entity: {BOLD}{entity}{NC}")
        conn.close()
        return
        
    print(f"\n{BOLD}{GREEN}Found {count} result(s){NC} for entity: {BOLD}{entity}{NC}\n")
    
    for row in results:
        print_result(row, compact=compact)
        
    conn.close()

def search_by_tag(tag, limit=20, compact=False):
    """Search by tag"""
    if not INDEX_DB.exists():
        print(f"{RED}[✗]{NC} Index not found. Run: ./memory-indexer.py rebuild")
        return
        
    conn = sqlite3.connect(str(INDEX_DB))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT m.timestamp, m.action, m.entity, m.details, m.sha256
        FROM memories_meta m
        JOIN tags t ON m.sha256 = t.memory_sha256
        WHERE t.tag = ?
        ORDER BY m.timestamp DESC
        LIMIT ?
    """, (tag, limit))
    
    results = cursor.fetchall()
    count = len(results)
    
    if count == 0:
        print(f"{YELLOW}[!]{NC} No memories with tag: {BOLD}#{tag}{NC}")
        conn.close()
        return
        
    print(f"\n{BOLD}{GREEN}Found {count} result(s){NC} with tag: {BOLD}#{tag}{NC}\n")
    
    for row in results:
        print_result(row, compact=compact)
        
    conn.close()

def list_actions():
    """List all unique actions"""
    if not INDEX_DB.exists():
        print(f"{RED}[✗]{NC} Index not found. Run: ./memory-indexer.py rebuild")
        return
        
    conn = sqlite3.connect(str(INDEX_DB))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT action, COUNT(*) as count
        FROM memories_meta
        GROUP BY action
        ORDER BY count DESC
    """)
    
    results = cursor.fetchall()
    
    print(f"\n{BOLD}{PURPLE}All Actions{NC} ({len(results)} unique)\n")
    
    for row in results:
        action = row['action']
        count = row['count']
        print(f"{CYAN}{action:30}{NC} {DIM}({count} entries){NC}")
        
    print()
    conn.close()

def list_entities(limit=50):
    """List top entities"""
    if not INDEX_DB.exists():
        print(f"{RED}[✗]{NC} Index not found. Run: ./memory-indexer.py rebuild")
        return
        
    conn = sqlite3.connect(str(INDEX_DB))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT entity, COUNT(*) as count
        FROM memories_meta
        GROUP BY entity
        ORDER BY count DESC
        LIMIT ?
    """, (limit,))
    
    results = cursor.fetchall()
    
    print(f"\n{BOLD}{PURPLE}Top Entities{NC} (showing {len(results)})\n")
    
    for row in results:
        entity = row['entity']
        count = row['count']
        print(f"{GREEN}{entity:40}{NC} {DIM}({count} entries){NC}")
        
    print()
    conn.close()

def recent_memories(limit=10, compact=True):
    """Show recent memories"""
    if not INDEX_DB.exists():
        print(f"{RED}[✗]{NC} Index not found. Run: ./memory-indexer.py rebuild")
        return
        
    conn = sqlite3.connect(str(INDEX_DB))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT timestamp, action, entity, details, sha256
        FROM memories_meta
        ORDER BY timestamp DESC
        LIMIT ?
    """, (limit,))
    
    results = cursor.fetchall()
    
    print(f"\n{BOLD}{PURPLE}Recent Memories{NC} (last {limit})\n")
    
    for row in results:
        print_result(row, compact=compact)
        
    print()
    conn.close()

def main():
    parser = argparse.ArgumentParser(
        description="BlackRoad Memory Search - Search PS-SHA-∞ memory entries",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  memory-search.py "PR templates"                    # Full-text search
  memory-search.py --action completed                # Search by action
  memory-search.py --entity blackroad-os             # Search by entity
  memory-search.py --tag deployment                  # Search by tag
  memory-search.py --recent 20                       # Show 20 recent entries
  memory-search.py --list-actions                    # List all actions
  memory-search.py --list-entities                   # List top entities
  
Options:
  --compact                Show compact one-line results
  --limit N                Limit results (default: 20)
  --hash                   Show SHA256 hashes
        """
    )
    
    parser.add_argument('query', nargs='?', help='Search query for full-text search')
    parser.add_argument('--action', help='Search by action type')
    parser.add_argument('--entity', help='Search by entity')
    parser.add_argument('--tag', help='Search by tag')
    parser.add_argument('--recent', type=int, metavar='N', help='Show N recent memories')
    parser.add_argument('--list-actions', action='store_true', help='List all unique actions')
    parser.add_argument('--list-entities', action='store_true', help='List top entities')
    parser.add_argument('--compact', action='store_true', help='Show compact one-line results')
    parser.add_argument('--limit', type=int, default=20, help='Limit number of results')
    parser.add_argument('--hash', action='store_true', help='Show SHA256 hashes')
    
    args = parser.parse_args()
    
    # Determine which search to perform
    if args.list_actions:
        list_actions()
    elif args.list_entities:
        list_entities(limit=50)
    elif args.recent:
        recent_memories(limit=args.recent, compact=args.compact)
    elif args.action:
        search_by_action(args.action, limit=args.limit, compact=args.compact)
    elif args.entity:
        search_by_entity(args.entity, limit=args.limit, compact=args.compact)
    elif args.tag:
        search_by_tag(args.tag, limit=args.limit, compact=args.compact)
    elif args.query:
        search_text(args.query, limit=args.limit, compact=args.compact, show_hash=args.hash)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
