#!/usr/bin/env python3
"""
BlackRoad OS Filesystem Indexer
Generates a JSON index of files with metadata.
"""

import os
import json
import hashlib
import argparse
from datetime import datetime
from pathlib import Path

SKIP_DIRS = {
    '.git', 'node_modules', '__pycache__', '.venv', 'venv',
    '.cache', '.npm', '.cargo', 'target', 'dist', 'build',
    '.next', '.nuxt', '.output', 'coverage', '.pytest_cache'
}

SKIP_FILES = {'.DS_Store', 'Thumbs.db', '.gitkeep'}

def get_file_hash(path, quick=True):
    """Get file hash. Quick mode uses first 8KB only."""
    try:
        h = hashlib.sha256()
        with open(path, 'rb') as f:
            chunk = f.read(8192) if quick else f.read()
            h.update(chunk)
        return h.hexdigest()[:16]
    except:
        return None

def get_first_line(path):
    """Get first meaningful line of text files."""
    skip_prefixes = ('#!', '"""', "'''", '#', '//', '/*', '*', '<!--')
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                if any(line.startswith(p) for p in skip_prefixes):
                    continue
                if line in ('"""', "'''", '{', '}', '[', ']'):
                    continue
                return line[:200]
            return None
    except:
        return None

def categorize(name, ext, is_dir):
    """Infer category from filename/extension."""
    if is_dir:
        return 'directory'
    
    categories = {
        'script': {'.sh', '.bash', '.zsh', '.fish', '.py', '.rb', '.pl'},
        'config': {'.toml', '.yaml', '.yml', '.json', '.ini', '.conf', '.env'},
        'code': {'.js', '.ts', '.tsx', '.jsx', '.go', '.rs', '.c', '.cpp', '.h', '.java'},
        'doc': {'.md', '.txt', '.rst', '.adoc'},
        'data': {'.csv', '.tsv', '.xml', '.sql'},
        'web': {'.html', '.css', '.scss', '.less'},
    }
    
    for cat, exts in categories.items():
        if ext.lower() in exts:
            return cat
    
    if name.startswith('.'):
        return 'dotfile'
    
    return 'other'

def index_path(root, include_hash=False, include_preview=False):
    """Index a directory tree."""
    entries = []
    root = Path(root).resolve()
    
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip excluded directories
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        
        rel_dir = Path(dirpath).relative_to(root)
        
        # Index directories
        for d in dirnames:
            full = Path(dirpath) / d
            entries.append({
                'path': str(rel_dir / d),
                'name': d,
                'type': 'dir',
                'category': 'directory',
                'mtime': datetime.fromtimestamp(full.stat().st_mtime).isoformat(),
            })
        
        # Index files
        for f in filenames:
            if f in SKIP_FILES:
                continue
                
            full = Path(dirpath) / f
            try:
                stat = full.stat()
            except:
                continue
            
            ext = full.suffix
            entry = {
                'path': str(rel_dir / f),
                'name': f,
                'type': 'file',
                'ext': ext,
                'category': categorize(f, ext, False),
                'size': stat.st_size,
                'mtime': datetime.fromtimestamp(stat.st_mtime).isoformat(),
            }
            
            if include_hash:
                entry['hash'] = get_file_hash(full)
            
            if include_preview and entry['category'] in ('script', 'config', 'code', 'doc'):
                preview = get_first_line(full)
                if preview:
                    entry['preview'] = preview
            
            entries.append(entry)
    
    return entries

def main():
    parser = argparse.ArgumentParser(description='Index filesystem to JSON')
    parser.add_argument('path', nargs='?', default='.', help='Path to index')
    parser.add_argument('-o', '--output', default='index.json', help='Output file')
    parser.add_argument('--hash', action='store_true', help='Include file hashes')
    parser.add_argument('--preview', action='store_true', help='Include first line preview')
    parser.add_argument('--pretty', action='store_true', help='Pretty print JSON')
    args = parser.parse_args()
    
    root = Path(args.path).resolve()
    print(f"Indexing: {root}")
    
    entries = index_path(root, args.hash, args.preview)
    
    result = {
        'root': str(root),
        'indexed_at': datetime.now().isoformat(),
        'count': len(entries),
        'entries': entries
    }
    
    with open(args.output, 'w') as f:
        if args.pretty:
            json.dump(result, f, indent=2)
        else:
            json.dump(result, f)
    
    print(f"Indexed {len(entries)} items → {args.output}")

if __name__ == '__main__':
    main()
