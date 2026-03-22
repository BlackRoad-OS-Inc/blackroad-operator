#!/usr/bin/env python3
"""
BlackRoad Memory Indexer
Builds searchable SQLite FTS5 index from PS-SHA-∞ journal entries
Supports fast text search, tag queries, time-range filtering, entity lookups
"""

import json
import sqlite3
import os
import sys
from pathlib import Path
from datetime import datetime
import argparse

# Configuration
MEMORY_DIR = Path.home() / ".blackroad" / "memory"
JOURNAL_FILE = MEMORY_DIR / "journals" / "master-journal.jsonl"
INDEX_DB = MEMORY_DIR / "memory-index.db"

# ANSI Colors
BLUE = '\033[0;34m'
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
RED = '\033[0;31m'
PURPLE = '\033[0;35m'
CYAN = '\033[0;36m'
NC = '\033[0m'

def log_info(msg):
    print(f"{BLUE}[INDEX]{NC} {msg}")

def log_success(msg):
    print(f"{GREEN}[✓]{NC} {msg}")

def log_warning(msg):
    print(f"{YELLOW}[!]{NC} {msg}")

def log_error(msg):
    print(f"{RED}[✗]{NC} {msg}")

class MemoryIndexer:
    def __init__(self, db_path=INDEX_DB):
        self.db_path = db_path
        self.conn = None
        
    def connect(self):
        """Connect to SQLite database"""
        self.conn = sqlite3.connect(str(self.db_path))
        self.conn.row_factory = sqlite3.Row
        
    def create_schema(self):
        """Create FTS5 tables for fast full-text search"""
        log_info("Creating search index schema...")
        
        cursor = self.conn.cursor()
        
        # Main memories table with FTS5 for full-text search
        cursor.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
                timestamp,
                action,
                entity,
                details,
                sha256,
                parent_hash,
                nonce,
                tokenize='porter unicode61'
            )
        """)
        
        # Metadata table for structured queries
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memories_meta (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                action TEXT,
                entity TEXT,
                details TEXT,
                sha256 TEXT UNIQUE,
                parent_hash TEXT,
                nonce TEXT,
                indexed_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Indexes for common queries
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_action ON memories_meta(action)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_entity ON memories_meta(entity)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON memories_meta(timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sha256 ON memories_meta(sha256)")
        
        # Tags table for tag-based search
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                memory_sha256 TEXT,
                tag TEXT,
                FOREIGN KEY (memory_sha256) REFERENCES memories_meta(sha256)
            )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tag ON tags(tag)")
        
        # Statistics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS index_stats (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        self.conn.commit()
        log_success("Schema created")
        
    def clear_index(self):
        """Clear all indexed data"""
        log_warning("Clearing existing index...")
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM memories_fts")
        cursor.execute("DELETE FROM memories_meta")
        cursor.execute("DELETE FROM tags")
        cursor.execute("DELETE FROM index_stats")
        self.conn.commit()
        log_success("Index cleared")
        
    def index_journal(self, journal_path=JOURNAL_FILE):
        """Index all journal entries"""
        if not journal_path.exists():
            log_error(f"Journal not found: {journal_path}")
            return 0
            
        log_info(f"Indexing journal: {journal_path}")
        
        cursor = self.conn.cursor()
        indexed_count = 0
        skipped_count = 0
        
        with open(journal_path, 'r') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                    
                try:
                    entry = json.loads(line)
                    
                    # Check if already indexed (by sha256)
                    sha256 = entry.get('sha256', '')
                    cursor.execute("SELECT 1 FROM memories_meta WHERE sha256 = ?", (sha256,))
                    if cursor.fetchone():
                        skipped_count += 1
                        continue
                    
                    # Extract fields
                    timestamp = entry.get('timestamp', '')
                    action = entry.get('action', '')
                    entity = entry.get('entity', '')
                    details = entry.get('details', '')
                    parent_hash = entry.get('parent_hash', '')
                    nonce = entry.get('nonce', '')
                    
                    # Insert into FTS5 table
                    cursor.execute("""
                        INSERT INTO memories_fts (timestamp, action, entity, details, sha256, parent_hash, nonce)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (timestamp, action, entity, details, sha256, parent_hash, nonce))
                    
                    # Insert into metadata table
                    cursor.execute("""
                        INSERT INTO memories_meta (timestamp, action, entity, details, sha256, parent_hash, nonce)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (timestamp, action, entity, details, sha256, parent_hash, nonce))
                    
                    # Extract and index tags from details (words starting with #)
                    tags = [word[1:] for word in details.split() if word.startswith('#')]
                    for tag in tags:
                        cursor.execute("INSERT INTO tags (memory_sha256, tag) VALUES (?, ?)", (sha256, tag))
                    
                    indexed_count += 1
                    
                    if indexed_count % 100 == 0:
                        print(f"\r{CYAN}[→]{NC} Indexed {indexed_count} entries...", end='', flush=True)
                        
                except json.JSONDecodeError as e:
                    log_warning(f"Skipping invalid JSON at line {line_num}: {e}")
                except Exception as e:
                    log_error(f"Error indexing line {line_num}: {e}")
                    
        print()  # New line after progress
        self.conn.commit()
        
        # Update statistics
        cursor.execute("INSERT OR REPLACE INTO index_stats (key, value) VALUES ('total_entries', ?)", (str(indexed_count),))
        cursor.execute("INSERT OR REPLACE INTO index_stats (key, value) VALUES ('last_indexed', ?)", (datetime.utcnow().isoformat(),))
        self.conn.commit()
        
        log_success(f"Indexed {indexed_count} new entries (skipped {skipped_count} existing)")
        return indexed_count
        
    def get_stats(self):
        """Get indexing statistics"""
        cursor = self.conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as count FROM memories_meta")
        total = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(DISTINCT action) as count FROM memories_meta")
        actions = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(DISTINCT entity) as count FROM memories_meta")
        entities = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM tags")
        tags = cursor.fetchone()['count']
        
        cursor.execute("SELECT value FROM index_stats WHERE key = 'last_indexed'")
        row = cursor.fetchone()
        last_indexed = row['value'] if row else 'Never'
        
        return {
            'total_entries': total,
            'unique_actions': actions,
            'unique_entities': entities,
            'total_tags': tags,
            'last_indexed': last_indexed
        }
        
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

def rebuild_index():
    """Rebuild entire index from scratch"""
    log_info("Rebuilding memory index...")
    
    indexer = MemoryIndexer()
    indexer.connect()
    indexer.create_schema()
    indexer.clear_index()
    indexed = indexer.index_journal()
    
    stats = indexer.get_stats()
    indexer.close()
    
    print(f"\n{PURPLE}═══════════════════════════════════════{NC}")
    print(f"{PURPLE}      Memory Index Statistics{NC}")
    print(f"{PURPLE}═══════════════════════════════════════{NC}")
    print(f"{GREEN}Total Entries:{NC}     {stats['total_entries']:,}")
    print(f"{GREEN}Unique Actions:{NC}    {stats['unique_actions']}")
    print(f"{GREEN}Unique Entities:{NC}   {stats['unique_entities']}")
    print(f"{GREEN}Tags Extracted:{NC}    {stats['total_tags']}")
    print(f"{GREEN}Last Indexed:{NC}      {stats['last_indexed']}")
    print(f"{PURPLE}═══════════════════════════════════════{NC}\n")
    
    log_success(f"Index rebuilt: {INDEX_DB}")
    return indexed

def update_index():
    """Update index with new entries (incremental)"""
    log_info("Updating memory index...")
    
    indexer = MemoryIndexer()
    indexer.connect()
    indexer.create_schema()
    indexed = indexer.index_journal()
    
    if indexed > 0:
        stats = indexer.get_stats()
        print(f"\n{GREEN}Index updated:{NC} {stats['total_entries']:,} total entries")
    else:
        log_info("No new entries to index")
    
    indexer.close()
    return indexed

def show_stats():
    """Show index statistics"""
    if not INDEX_DB.exists():
        log_error("Index not found. Run: memory-indexer.py rebuild")
        return
        
    indexer = MemoryIndexer()
    indexer.connect()
    stats = indexer.get_stats()
    indexer.close()
    
    print(f"\n{PURPLE}═══════════════════════════════════════{NC}")
    print(f"{PURPLE}      Memory Index Statistics{NC}")
    print(f"{PURPLE}═══════════════════════════════════════{NC}")
    print(f"{GREEN}Total Entries:{NC}     {stats['total_entries']:,}")
    print(f"{GREEN}Unique Actions:{NC}    {stats['unique_actions']}")
    print(f"{GREEN}Unique Entities:{NC}   {stats['unique_entities']}")
    print(f"{GREEN}Tags Extracted:{NC}    {stats['total_tags']}")
    print(f"{GREEN}Last Indexed:{NC}      {stats['last_indexed']}")
    print(f"{GREEN}Database:{NC}          {INDEX_DB}")
    print(f"{PURPLE}═══════════════════════════════════════{NC}\n")

def main():
    parser = argparse.ArgumentParser(
        description="BlackRoad Memory Indexer - Build searchable index of PS-SHA-∞ memories",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  memory-indexer.py rebuild          # Rebuild entire index
  memory-indexer.py update           # Add new entries only
  memory-indexer.py stats            # Show statistics
        """
    )
    
    parser.add_argument('command', choices=['rebuild', 'update', 'stats'],
                        help='Command to execute')
    
    args = parser.parse_args()
    
    # Ensure memory directory exists
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    
    if args.command == 'rebuild':
        rebuild_index()
    elif args.command == 'update':
        update_index()
    elif args.command == 'stats':
        show_stats()

if __name__ == '__main__':
    main()
