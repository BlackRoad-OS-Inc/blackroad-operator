"""
Advanced threat detection system for BlackRoad Security.
Analyzes network traffic, system behavior, and attack signatures.
"""

import json
import sqlite3
import hashlib
import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
from enum import Enum
from dataclasses import dataclass


class ThreatLevel(Enum):
    """Threat severity levels."""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


@dataclass
class ThreatSignature:
    """Attack signature pattern."""
    sig_id: str
    name: str
    pattern: str
    category: str
    severity: ThreatLevel
    description: str


@dataclass
class DetectedThreat:
    """Detected threat instance."""
    threat_id: str
    signature_id: str
    timestamp: datetime
    source_ip: str
    target_ip: str
    payload: str
    severity: ThreatLevel
    confidence: float
    details: Dict[str, Any]


class ThreatDetector:
    """Production-grade threat detection engine."""

    def __init__(self, db_path: str = "threats.db"):
        """Initialize threat detector with signature database.
        
        Args:
            db_path: Path to SQLite database for threat signatures and detections
        """
        self.db_path = db_path
        self._init_db()
        self._load_signatures()

    def _init_db(self):
        """Initialize SQLite database for threat data."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS threat_signatures (
                    sig_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    pattern TEXT NOT NULL,
                    category TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_category (category),
                    INDEX idx_severity (severity)
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS detected_threats (
                    threat_id TEXT PRIMARY KEY,
                    signature_id TEXT NOT NULL,
                    timestamp DATETIME NOT NULL,
                    source_ip TEXT NOT NULL,
                    target_ip TEXT NOT NULL,
                    payload TEXT,
                    severity TEXT NOT NULL,
                    confidence REAL NOT NULL,
                    details TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (signature_id) REFERENCES threat_signatures(sig_id),
                    INDEX idx_timestamp (timestamp),
                    INDEX idx_source_ip (source_ip),
                    INDEX idx_severity (severity),
                    INDEX idx_confidence (confidence)
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS threat_indicators (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    indicator_type TEXT NOT NULL,
                    indicator_value TEXT NOT NULL,
                    threat_level TEXT NOT NULL,
                    last_seen DATETIME,
                    INDEX idx_type (indicator_type),
                    INDEX idx_value (indicator_value)
                )
            """)
            conn.commit()

    def _load_signatures(self):
        """Load built-in threat signatures."""
        default_signatures = [
            ThreatSignature(
                sig_id="sql_inject_001",
                name="SQL Injection",
                pattern=r"(?i)(union.*select|select.*from|drop|insert|delete|update)",
                category="injection",
                severity=ThreatLevel.CRITICAL,
                description="Detects SQL injection attempts"
            ),
            ThreatSignature(
                sig_id="xss_001",
                name="Cross-Site Scripting",
                pattern=r"<script|javascript:|onerror=|onload=|<iframe",
                category="xss",
                severity=ThreatLevel.HIGH,
                description="Detects XSS attack patterns"
            ),
            ThreatSignature(
                sig_id="cmd_inject_001",
                name="Command Injection",
                pattern=r"(?i)(;|\||&&|\`|\\$\()(cat|ls|whoami|nc|bash|sh)",
                category="injection",
                severity=ThreatLevel.CRITICAL,
                description="Detects command injection attempts"
            ),
            ThreatSignature(
                sig_id="path_traversal_001",
                name="Path Traversal",
                pattern=r"\.\./|\.\.\\|%2e%2e|%252e%252e",
                category="path_traversal",
                severity=ThreatLevel.HIGH,
                description="Detects path traversal attempts"
            ),
            ThreatSignature(
                sig_id="ldap_inject_001",
                name="LDAP Injection",
                pattern=r"(?i)(\*|&|\||!|\(|\))",
                category="injection",
                severity=ThreatLevel.MEDIUM,
                description="Detects LDAP injection patterns"
            ),
        ]
        
        with sqlite3.connect(self.db_path) as conn:
            for sig in default_signatures:
                conn.execute("""
                    INSERT OR IGNORE INTO threat_signatures
                    (sig_id, name, pattern, category, severity, description)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (sig.sig_id, sig.name, sig.pattern, sig.category, sig.severity.name, sig.description))
            conn.commit()

    def detect_payload(
        self,
        payload: str,
        source_ip: str,
        target_ip: str,
        request_type: str = "unknown"
    ) -> List[DetectedThreat]:
        """Analyze payload for threat signatures.
        
        Args:
            payload: Data to analyze
            source_ip: Source IP address
            target_ip: Target IP address
            request_type: Type of request (GET, POST, etc.)
            
        Returns:
            List of detected threats
        """
        detected = []
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT * FROM threat_signatures")
            signatures = cursor.fetchall()
        
        for sig_row in signatures:
            sig_id, name, pattern, category, severity, desc, *_ = sig_row
            try:
                if re.search(pattern, payload):
                    confidence = self._calculate_confidence(payload, pattern, severity)
                    threat = self._create_threat(
                        sig_id, source_ip, target_ip, payload, 
                        severity, confidence
                    )
                    detected.append(threat)
                    self._persist_threat(threat)
            except re.error:
                pass
        
        return detected

    def _calculate_confidence(self, payload: str, pattern: str, severity: str) -> float:
        """Calculate detection confidence score (0.0-1.0)."""
        base_confidence = 0.7
        
        # Increase confidence for multiple matches
        matches = len(re.findall(pattern, payload, re.IGNORECASE))
        match_factor = min(0.3, matches * 0.1)
        
        # Severity-based adjustment
        severity_map = {"LOW": 0.1, "MEDIUM": 0.15, "HIGH": 0.2, "CRITICAL": 0.25}
        severity_factor = severity_map.get(severity, 0.15)
        
        return min(0.99, base_confidence + match_factor + severity_factor)

    def _create_threat(
        self,
        sig_id: str,
        source_ip: str,
        target_ip: str,
        payload: str,
        severity: str,
        confidence: float
    ) -> DetectedThreat:
        """Create a detected threat record."""
        import uuid
        threat_id = str(uuid.uuid4())
        return DetectedThreat(
            threat_id=threat_id,
            signature_id=sig_id,
            timestamp=datetime.utcnow(),
            source_ip=source_ip,
            target_ip=target_ip,
            payload=payload[:500],  # Truncate to 500 chars
            severity=ThreatLevel[severity],
            confidence=confidence,
            details={"detected_at": datetime.utcnow().isoformat()}
        )

    def _persist_threat(self, threat: DetectedThreat):
        """Save detected threat to database."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO detected_threats
                (threat_id, signature_id, timestamp, source_ip, target_ip, 
                 payload, severity, confidence, details)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                threat.threat_id,
                threat.signature_id,
                threat.timestamp.isoformat(),
                threat.source_ip,
                threat.target_ip,
                threat.payload,
                threat.severity.name,
                threat.confidence,
                json.dumps(threat.details)
            ))
            conn.commit()

    def get_threats(
        self,
        source_ip: Optional[str] = None,
        min_severity: ThreatLevel = ThreatLevel.LOW,
        hours: int = 24
    ) -> List[Dict[str, Any]]:
        """Query detected threats from database."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            query = """
                SELECT * FROM detected_threats 
                WHERE timestamp > datetime('now', ?) AND severity IN (?, ?, ?, ?)
            """
            params = [f'-{hours} hours']
            params.extend([t.name for t in ThreatLevel if t.value >= min_severity.value])
            
            if source_ip:
                query += " AND source_ip = ?"
                params.append(source_ip)
            
            query += " ORDER BY timestamp DESC"
            cursor = conn.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]

    def get_threat_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get threat summary statistics."""
        threats = self.get_threats(hours=hours)
        severity_counts = {}
        for threat in threats:
            severity_counts[threat['severity']] = severity_counts.get(threat['severity'], 0) + 1
        
        return {
            "total_threats": len(threats),
            "by_severity": severity_counts,
            "unique_sources": len(set(t['source_ip'] for t in threats)),
            "avg_confidence": sum(t['confidence'] for t in threats) / len(threats) if threats else 0
        }


if __name__ == "__main__":
    detector = ThreatDetector()
    
    # Example detection
    threats = detector.detect_payload(
        payload="GET /api/users?id=1' OR '1'='1",
        source_ip="192.168.1.100",
        target_ip="10.0.0.1"
    )
    
    print(f"Detected {len(threats)} threats")
    summary = detector.get_threat_summary()
    print(json.dumps(summary, indent=2))
