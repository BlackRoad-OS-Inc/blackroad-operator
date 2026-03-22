#!/usr/bin/env python3
"""
BlackRoad Unified Search
Search across both code components (8,789) and GitHub projects (859)
"""

import sqlite3
import json
import sys
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime, timedelta

class UnifiedSearch:
    """Unified search interface for components and projects."""
    
    def __init__(self):
        # Code components database
        self.components_db = Path("~/blackroad-code-library/index/components.db").expanduser()
        
        # Projects database
        self.projects_db = Path("~/blackroad-index-full.db").expanduser()
        
        # Verify databases exist
        if not self.components_db.exists():
            print(f"⚠️  Warning: Components database not found at {self.components_db}")
            self.has_components = False
        else:
            self.has_components = True
            
        if not self.projects_db.exists():
            print(f"⚠️  Warning: Projects database not found at {self.projects_db}")
            self.has_projects = False
        else:
            self.has_projects = True
    
    def search(self, query: str, limit: int = 20, search_type: str = "both") -> Dict[str, List[Dict]]:
        """
        Search across components and/or projects.
        
        Args:
            query: Search query
            limit: Max results per category
            search_type: "both", "components", or "projects"
            
        Returns:
            Dict with 'components' and 'projects' keys
        """
        results = {
            'components': [],
            'projects': []
        }
        
        if search_type in ["both", "components"] and self.has_components:
            results['components'] = self._search_components(query, limit)
            
        if search_type in ["both", "projects"] and self.has_projects:
            results['projects'] = self._search_projects(query, limit)
            
        return results
    
    def _search_components(self, query: str, limit: int) -> List[Dict]:
        """Search code components."""
        conn = sqlite3.connect(self.components_db)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM components
            WHERE (
                name LIKE ? OR
                tags LIKE ? OR
                description LIKE ? OR
                type LIKE ?
            )
            ORDER BY quality_score DESC, created_at DESC
            LIMIT ?
        """, [f"%{query}%" for _ in range(4)] + [limit])
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def _search_projects(self, query: str, limit: int) -> List[Dict]:
        """Search GitHub projects using FTS."""
        conn = sqlite3.connect(self.projects_db)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Use FTS5 full-text search
        cursor.execute("""
            SELECT 
                p.id, p.name, p.org, p.full_name, p.description, 
                p.language, p.stars, p.forks, p.open_issues,
                p.html_url, p.is_flagship, p.flagship_tier, p.topics
            FROM projects_fts 
            JOIN projects p ON projects_fts.rowid = p.id
            WHERE projects_fts MATCH ?
            ORDER BY p.stars DESC, p.last_updated DESC
            LIMIT ?
        """, (query, limit))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def get_stats(self) -> Dict:
        """Get combined statistics."""
        stats = {}
        
        if self.has_components:
            conn = sqlite3.connect(self.components_db)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM components")
            stats['total_components'] = cursor.fetchone()[0]
            conn.close()
        else:
            stats['total_components'] = 0
            
        if self.has_projects:
            conn = sqlite3.connect(self.projects_db)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM projects")
            stats['total_projects'] = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM projects WHERE is_flagship = 1")
            stats['flagship_projects'] = cursor.fetchone()[0]
            conn.close()
        else:
            stats['total_projects'] = 0
            stats['flagship_projects'] = 0
            
        stats['total_items'] = stats['total_components'] + stats['total_projects']
        
        return stats
    
    def format_results(self, results: Dict[str, List[Dict]]) -> str:
        """Format search results for display."""
        output = []
        
        components = results.get('components', [])
        projects = results.get('projects', [])
        
        total = len(components) + len(projects)
        
        if total == 0:
            return "❌ No results found.\n"
        
        output.append(f"🔍 Found {total} result(s): {len(components)} components, {len(projects)} projects\n")
        
        # Show projects first (higher level)
        if projects:
            output.append("=" * 70)
            output.append("📦 GITHUB PROJECTS")
            output.append("=" * 70)
            
            for i, proj in enumerate(projects, 1):
                flagship_badge = ""
                if proj.get('is_flagship'):
                    tier = proj.get('flagship_tier', '?')
                    flagship_badge = f" 🌟 Tier {tier}"
                
                stars = proj.get('stars', 0)
                star_display = f" ⭐ {stars}" if stars > 0 else ""
                
                output.append(f"\n{i}. {proj['full_name']}{flagship_badge}{star_display}")
                output.append(f"   Language: {proj.get('language') or 'N/A'}")
                
                if proj.get('description'):
                    desc = proj['description'][:100]
                    output.append(f"   {desc}{'...' if len(proj['description']) > 100 else ''}")
                
                output.append(f"   URL: {proj.get('html_url', 'N/A')}")
        
        # Show components
        if components:
            output.append("\n" + "=" * 70)
            output.append("🔧 CODE COMPONENTS")
            output.append("=" * 70)
            
            for i, comp in enumerate(components, 1):
                tags = json.loads(comp.get('tags', '[]'))
                quality = comp.get('quality_score', 0)
                
                output.append(f"\n{i}. {comp['name']} ({comp['language']}/{comp['type']}) - {quality:.1f}/10")
                output.append(f"   📍 {comp['repo']}/{Path(comp['file_path']).name}:{comp['start_line']}")
                
                if tags:
                    output.append(f"   🏷️  {', '.join(tags[:5])}")
                
                if comp.get('description'):
                    desc = comp['description'][:100]
                    output.append(f"   {desc}{'...' if len(comp['description']) > 100 else ''}")
        
        return "\n".join(output) + "\n"


def main():
    """CLI interface for unified search."""
    if len(sys.argv) < 2:
        print("Usage: python3 blackroad-blackroad os-search.py <query> [limit]")
        print("       python3 blackroad-blackroad os-search.py --stats")
        print("")
        print("Examples:")
        print("  python3 blackroad-blackroad os-search.py agent")
        print("  python3 blackroad-blackroad os-search.py \"api gateway\" 10")
        print("  python3 blackroad-blackroad os-search.py --stats")
        sys.exit(1)
    
    searcher = UnifiedSearch()
    
    # Handle stats
    if sys.argv[1] == "--stats":
        stats = searcher.get_stats()
        print("\n📊 BlackRoad Index Statistics")
        print("=" * 40)
        print(f"Total Components: {stats['total_components']:,}")
        print(f"Total Projects:   {stats['total_projects']:,}")
        print(f"Flagship Projects: {stats['flagship_projects']:,}")
        print(f"")
        print(f"Grand Total:      {stats['total_items']:,} searchable items")
        print("")
        return
    
    # Search
    query = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    print(f"\n🔍 Searching for: '{query}'")
    print("=" * 70)
    
    results = searcher.search(query, limit=limit)
    print(searcher.format_results(results))


if __name__ == "__main__":
    main()
