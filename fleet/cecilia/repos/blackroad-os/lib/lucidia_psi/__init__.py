"""
Lucidia-Psi: Paraconsistent Memory System
Append-only memory with truth_state_hash commits, contradiction handling, and trinary logic.
"""

import hashlib
import json
import os
from datetime import datetime, timezone
from typing import Optional, Literal, List, Dict, Any
from dataclasses import dataclass, field, asdict
from enum import Enum

class TruthState(Enum):
    """Trinary logic states"""
    TRUE = 1
    FALSE = 0
    UNKNOWN = -1

@dataclass
class MemoryEntry:
    """Single memory entry with hash chain"""
    content: str
    entry_type: Literal["observation", "reflection", "correction", "tension"]
    source: str
    timestamp: str
    truth_state: int  # 1, 0, or -1
    hash: str
    prev_hash: Optional[str] = None
    corrects_hash: Optional[str] = None
    correction_reason: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

class LucidiaMemory:
    """
    Paraconsistent append-only memory system for Lucidia AI.
    
    Features:
    - Append-only journal with PS-SHA∞ hashing
    - Trinary logic (TRUE/FALSE/UNKNOWN)
    - Contradiction detection and quarantine
    - Correction chains with audit trail
    """
    
    def __init__(self, agent_name: str, base_path: str = "./memory"):
        self.agent_name = agent_name
        self.base_path = os.path.expanduser(base_path)
        self.journal_path = os.path.join(self.base_path, agent_name.lower())
        self.entries: List[MemoryEntry] = []
        self.tensions: List[Dict] = []
        self._ensure_dirs()
        self._load_journal()
    
    def _ensure_dirs(self):
        os.makedirs(self.journal_path, exist_ok=True)
    
    def _compute_hash(self, content: str, prev_hash: Optional[str] = None) -> str:
        """PS-SHA∞ style hash - chain-linked content hash"""
        data = f"{prev_hash or 'GENESIS'}:{content}:{datetime.now(timezone.utc).isoformat()}"
        return f"ps:{hashlib.sha256(data.encode()).hexdigest()[:16]}"
    
    def _get_last_hash(self) -> Optional[str]:
        return self.entries[-1].hash if self.entries else None
    
    def _append_entry(self, entry: MemoryEntry):
        """Append to in-memory list and persist to disk"""
        self.entries.append(entry)
        self._persist_entry(entry)
    
    def _persist_entry(self, entry: MemoryEntry):
        """Write entry to append-only journal file"""
        journal_file = os.path.join(self.journal_path, "journal.jsonl")
        with open(journal_file, "a") as f:
            f.write(json.dumps(asdict(entry)) + "\n")
    
    def _load_journal(self):
        """Load existing journal entries"""
        journal_file = os.path.join(self.journal_path, "journal.jsonl")
        if os.path.exists(journal_file):
            with open(journal_file, "r") as f:
                for line in f:
                    if line.strip():
                        data = json.loads(line)
                        self.entries.append(MemoryEntry(**data))
    
    def observe(self, content: str, source: str = "conversation", 
                truth_state: TruthState = TruthState.TRUE,
                metadata: Optional[Dict] = None) -> str:
        """Record an observation"""
        prev_hash = self._get_last_hash()
        entry_hash = self._compute_hash(content, prev_hash)
        
        entry = MemoryEntry(
            content=content,
            entry_type="observation",
            source=source,
            timestamp=datetime.now(timezone.utc).isoformat(),
            truth_state=truth_state.value,
            hash=entry_hash,
            prev_hash=prev_hash,
            metadata=metadata or {}
        )
        
        self._check_contradictions(content)
        self._append_entry(entry)
        return entry_hash
    
    def reflect(self, content: str, basis_hashes: Optional[List[str]] = None,
                metadata: Optional[Dict] = None) -> str:
        """Record a reflection/inference"""
        prev_hash = self._get_last_hash()
        entry_hash = self._compute_hash(content, prev_hash)
        
        meta = metadata or {}
        if basis_hashes:
            meta["basis"] = basis_hashes
        
        entry = MemoryEntry(
            content=content,
            entry_type="reflection",
            source="internal",
            timestamp=datetime.now(timezone.utc).isoformat(),
            truth_state=TruthState.UNKNOWN.value,  # Reflections start as uncertain
            hash=entry_hash,
            prev_hash=prev_hash,
            metadata=meta
        )
        
        self._append_entry(entry)
        return entry_hash
    
    def correct(self, content: str, corrects_hash: str, reason: str,
                metadata: Optional[Dict] = None) -> str:
        """Record a correction to a previous entry"""
        prev_hash = self._get_last_hash()
        entry_hash = self._compute_hash(content, prev_hash)
        
        # Find and mark the corrected entry
        corrected = self._find_by_hash(corrects_hash)
        if corrected:
            self.tensions.append({
                "type": "correction",
                "original_hash": corrects_hash,
                "correction_hash": entry_hash,
                "reason": reason,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        
        entry = MemoryEntry(
            content=content,
            entry_type="correction",
            source="correction",
            timestamp=datetime.now(timezone.utc).isoformat(),
            truth_state=TruthState.TRUE.value,
            hash=entry_hash,
            prev_hash=prev_hash,
            corrects_hash=corrects_hash,
            correction_reason=reason,
            metadata=metadata or {}
        )
        
        self._append_entry(entry)
        return entry_hash
    
    def _find_by_hash(self, hash_prefix: str) -> Optional[MemoryEntry]:
        """Find entry by hash or hash prefix"""
        for entry in self.entries:
            if entry.hash == hash_prefix or entry.hash.startswith(hash_prefix):
                return entry
        return None
    
    def _check_contradictions(self, new_content: str):
        """Simple contradiction detection - flag potential conflicts"""
        new_lower = new_content.lower()
        
        negation_pairs = [
            ("prefers", "does not prefer"), ("likes", "dislikes"),
            ("is", "is not"), ("can", "cannot"), ("will", "will not")
        ]
        
        for entry in self.entries[-50:]:  # Check recent entries
            old_lower = entry.content.lower()
            for pos, neg in negation_pairs:
                if (pos in new_lower and neg in old_lower) or \
                   (neg in new_lower and pos in old_lower):
                    self.tensions.append({
                        "type": "potential_contradiction",
                        "entry1_hash": entry.hash,
                        "entry1_content": entry.content[:100],
                        "entry2_content": new_content[:100],
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
    
    def explain_tensions(self) -> str:
        """Return human-readable tension report"""
        if not self.tensions:
            return "No tensions detected in memory."
        
        lines = [f"=== Memory Tensions for {self.agent_name} ===\n"]
        for i, t in enumerate(self.tensions, 1):
            lines.append(f"{i}. [{t['type']}] @ {t['timestamp']}")
            if t['type'] == 'correction':
                lines.append(f"   Original: {t['original_hash']}")
                lines.append(f"   Corrected by: {t['correction_hash']}")
                lines.append(f"   Reason: {t['reason']}")
            elif t['type'] == 'potential_contradiction':
                lines.append(f"   Entry 1: {t['entry1_content'][:60]}...")
                lines.append(f"   Entry 2: {t['entry2_content'][:60]}...")
            lines.append("")
        
        return "\n".join(lines)
    
    def search(self, query: str, limit: int = 10) -> List[MemoryEntry]:
        """Simple search through memory"""
        query_lower = query.lower()
        matches = []
        for entry in reversed(self.entries):
            if query_lower in entry.content.lower():
                matches.append(entry)
                if len(matches) >= limit:
                    break
        return matches
    
    def get_recent(self, n: int = 10) -> List[MemoryEntry]:
        """Get n most recent entries"""
        return self.entries[-n:]
    
    def export_chain(self) -> List[Dict]:
        """Export full memory chain for verification"""
        return [asdict(e) for e in self.entries]
    
    def verify_chain(self) -> bool:
        """Verify hash chain integrity"""
        for i, entry in enumerate(self.entries):
            if i == 0:
                if entry.prev_hash is not None:
                    return False
            else:
                if entry.prev_hash != self.entries[i-1].hash:
                    return False
        return True
    
    def stats(self) -> Dict:
        """Memory statistics"""
        by_type = {}
        for e in self.entries:
            by_type[e.entry_type] = by_type.get(e.entry_type, 0) + 1
        
        return {
            "agent": self.agent_name,
            "total_entries": len(self.entries),
            "by_type": by_type,
            "tensions": len(self.tensions),
            "chain_valid": self.verify_chain(),
            "journal_path": self.journal_path
        }

# Convenience exports
__all__ = ["LucidiaMemory", "TruthState", "MemoryEntry"]
__version__ = "0.1.0"
