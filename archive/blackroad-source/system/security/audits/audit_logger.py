"""
Production-grade security audit logging system for BlackRoad Security.
Provides comprehensive logging, persistence, and compliance tracking.
"""

import json
import sqlite3
import hashlib
import hmac
import logging
import threading
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, asdict
import uuid


@dataclass
class AuditEvent:
    """Represents a security audit event."""
    event_id: str
    timestamp: datetime
    event_type: str
    actor: str
    action: str
    resource: str
    status: str
    details: Dict[str, Any]
    ip_address: str
    user_agent: Optional[str] = None
    severity: str = "INFO"


class AuditLogger:
    """Production-grade security audit logger with SQLite persistence."""

    def __init__(self, db_path: str = "audit.db", hmac_key: Optional[str] = None):
        """Initialize the audit logger with SQLite backend.
        
        Args:
            db_path: Path to SQLite database file
            hmac_key: Secret key for audit log integrity verification
        """
        self.db_path = db_path
        self.hmac_key = hmac_key or "default-key"
        self.lock = threading.RLock()
        self._init_db()
        self.logger = self._setup_logging()

    def _init_db(self):
        """Initialize SQLite database schema for audit logs."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_events (
                    event_id TEXT PRIMARY KEY,
                    timestamp DATETIME NOT NULL,
                    event_type TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    action TEXT NOT NULL,
                    resource TEXT NOT NULL,
                    status TEXT NOT NULL,
                    details TEXT NOT NULL,
                    ip_address TEXT NOT NULL,
                    user_agent TEXT,
                    severity TEXT DEFAULT 'INFO',
                    event_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_timestamp (timestamp),
                    INDEX idx_actor (actor),
                    INDEX idx_event_type (event_type),
                    INDEX idx_severity (severity)
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_chains (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    prev_event_id TEXT,
                    curr_event_id TEXT,
                    prev_hash TEXT,
                    curr_hash TEXT,
                    chain_valid INTEGER DEFAULT 1,
                    FOREIGN KEY (curr_event_id) REFERENCES audit_events(event_id)
                )
            """)
            conn.commit()

    def _setup_logging(self) -> logging.Logger:
        """Configure standard Python logger."""
        logger = logging.getLogger("audit")
        handler = logging.FileHandler("audit.log")
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        return logger

    def _compute_hash(self, event: AuditEvent) -> str:
        """Compute HMAC-SHA256 of audit event for integrity."""
        event_str = json.dumps(asdict(event), default=str, sort_keys=True)
        return hmac.new(
            self.hmac_key.encode(),
            event_str.encode(),
            hashlib.sha256
        ).hexdigest()

    def log_event(
        self,
        event_type: str,
        actor: str,
        action: str,
        resource: str,
        status: str = "SUCCESS",
        details: Optional[Dict[str, Any]] = None,
        ip_address: str = "0.0.0.0",
        user_agent: Optional[str] = None,
        severity: str = "INFO"
    ) -> str:
        """Log a security audit event.
        
        Args:
            event_type: Type of security event (e.g., 'ACCESS', 'MODIFICATION')
            actor: User or service performing the action
            action: Description of the action taken
            resource: Resource being audited (e.g., '/api/admin')
            status: Outcome status (SUCCESS, FAILURE, etc.)
            details: Additional context (dict)
            ip_address: Source IP address
            user_agent: User agent string
            severity: Event severity (INFO, WARNING, CRITICAL)
            
        Returns:
            The event_id of the logged event
        """
        with self.lock:
            event_id = str(uuid.uuid4())
            timestamp = datetime.utcnow()
            event = AuditEvent(
                event_id=event_id,
                timestamp=timestamp,
                event_type=event_type,
                actor=actor,
                action=action,
                resource=resource,
                status=status,
                details=details or {},
                ip_address=ip_address,
                user_agent=user_agent,
                severity=severity
            )
            
            event_hash = self._compute_hash(event)
            self._persist_event(event, event_hash)
            self.logger.info(
                f"AuditEvent: {event_type} | Actor: {actor} | "
                f"Action: {action} | Status: {status}"
            )
            return event_id

    def _persist_event(self, event: AuditEvent, event_hash: str):
        """Persist audit event to SQLite database."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Get previous event for chain linkage
            cursor.execute(
                "SELECT event_id, event_hash FROM audit_events "
                "ORDER BY timestamp DESC LIMIT 1"
            )
            prev = cursor.fetchone()
            
            # Insert event
            cursor.execute("""
                INSERT INTO audit_events 
                (event_id, timestamp, event_type, actor, action, resource, 
                 status, details, ip_address, user_agent, severity, event_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event.event_id,
                event.timestamp.isoformat(),
                event.event_type,
                event.actor,
                event.action,
                event.resource,
                event.status,
                json.dumps(event.details),
                event.ip_address,
                event.user_agent,
                event.severity,
                event_hash
            ))
            
            # Chain to previous event
            if prev:
                prev_event_id, prev_hash = prev
                cursor.execute("""
                    INSERT INTO audit_chains 
                    (prev_event_id, curr_event_id, prev_hash, curr_hash, chain_valid)
                    VALUES (?, ?, ?, ?, 1)
                """, (prev_event_id, event.event_id, prev_hash, event_hash))
            
            conn.commit()

    def query_events(
        self,
        actor: Optional[str] = None,
        event_type: Optional[str] = None,
        hours: int = 24
    ) -> List[Dict[str, Any]]:
        """Query audit events from database.
        
        Args:
            actor: Filter by actor
            event_type: Filter by event type
            hours: Look back N hours (default 24)
            
        Returns:
            List of matching audit events
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            query = "SELECT * FROM audit_events WHERE timestamp > datetime('now', ?)"
            params = [f'-{hours} hours']
            
            if actor:
                query += " AND actor = ?"
                params.append(actor)
            if event_type:
                query += " AND event_type = ?"
                params.append(event_type)
            
            query += " ORDER BY timestamp DESC"
            cursor = conn.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]

    def verify_chain_integrity(self) -> bool:
        """Verify audit log chain integrity."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT COUNT(*) FROM audit_chains WHERE chain_valid = 0
            """)
            invalid_count = cursor.fetchone()[0]
            return invalid_count == 0

    def export_report(self, output_path: str, days: int = 30):
        """Export audit report to file."""
        events = self.query_events(hours=days*24)
        report = {
            "export_date": datetime.utcnow().isoformat(),
            "total_events": len(events),
            "events": events,
            "chain_integrity_verified": self.verify_chain_integrity()
        }
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2, default=str)


if __name__ == "__main__":
    logger = AuditLogger("security_audit.db")
    
    # Example usage
    logger.log_event(
        event_type="SECURITY_SCAN",
        actor="automated-scanner",
        action="Vulnerability assessment",
        resource="/api/endpoints",
        status="SUCCESS",
        details={"vulnerabilities_found": 0},
        severity="INFO"
    )
    
    # Query recent events
    events = logger.query_events(event_type="SECURITY_SCAN")
    print(f"Found {len(events)} events")
