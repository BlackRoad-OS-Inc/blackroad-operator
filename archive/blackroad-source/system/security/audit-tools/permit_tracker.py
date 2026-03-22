#!/usr/bin/env python3
"""
Permit Tracker — Municipal permit lifecycle management.
Handles permit applications, approvals/denials, expiry, compliance checks,
CSV export, and reminder notifications. SQLite-backed.
"""
import argparse
import csv
import io
import json
import sqlite3
import sys
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, List

DB_PATH = Path.home() / ".blackroad" / "permits.db"

VALID_STATUSES = ("pending", "approved", "denied", "expired")
PERMIT_TYPES = (
    "building", "demolition", "electrical", "plumbing",
    "mechanical", "zoning", "signage", "event", "food_service",
    "business_license", "home_occupation", "variance", "other",
)


# ── Dataclasses ──────────────────────────────────────────────────────────────

@dataclass
class Permit:
    id: str
    permit_type: str
    applicant: str
    address: str
    description: str
    status: str          # pending | approved | denied | expired
    issued_at: Optional[str]
    expires_at: Optional[str]
    created_at: str
    updated_at: str
    notes: str

    def to_row(self):
        return (
            self.id, self.permit_type, self.applicant, self.address,
            self.description, self.status, self.issued_at, self.expires_at,
            self.created_at, self.updated_at, self.notes,
        )

    @classmethod
    def from_row(cls, row) -> "Permit":
        return cls(**dict(row))

    @property
    def is_expired(self) -> bool:
        if not self.expires_at:
            return False
        return datetime.now(timezone.utc).isoformat() > self.expires_at


# ── Database ─────────────────────────────────────────────────────────────────

def get_db(path: Path = DB_PATH) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS permits (
            id           TEXT PRIMARY KEY,
            permit_type  TEXT NOT NULL,
            applicant    TEXT NOT NULL,
            address      TEXT NOT NULL,
            description  TEXT,
            status       TEXT NOT NULL DEFAULT 'pending',
            issued_at    TEXT,
            expires_at   TEXT,
            created_at   TEXT NOT NULL,
            updated_at   TEXT NOT NULL,
            notes        TEXT DEFAULT ''
        );
        CREATE INDEX IF NOT EXISTS idx_permits_address
            ON permits(address);
        CREATE INDEX IF NOT EXISTS idx_permits_status
            ON permits(status);
        CREATE TABLE IF NOT EXISTS permit_events (
            id         TEXT PRIMARY KEY,
            permit_id  TEXT NOT NULL,
            event_type TEXT NOT NULL,
            actor      TEXT,
            message    TEXT,
            occurred_at TEXT NOT NULL,
            FOREIGN KEY(permit_id) REFERENCES permits(id)
        );
    """)
    conn.commit()


def _log_event(conn: sqlite3.Connection, permit_id: str,
               event_type: str, actor: str = "system", message: str = "") -> None:
    conn.execute(
        "INSERT INTO permit_events VALUES (?,?,?,?,?,?)",
        (str(uuid.uuid4())[:8], permit_id, event_type, actor, message,
         datetime.now(timezone.utc).isoformat()),
    )


# ── Core API ──────────────────────────────────────────────────────────────────

def apply(
    permit_type: str,
    applicant: str,
    address: str,
    description: str = "",
    validity_days: int = 365,
    db_path: Path = DB_PATH,
) -> Permit:
    """Submit a new permit application."""
    if permit_type not in PERMIT_TYPES:
        raise ValueError(f"Unknown permit type '{permit_type}'. Valid: {PERMIT_TYPES}")
    now = datetime.now(timezone.utc).isoformat()
    permit = Permit(
        id=str(uuid.uuid4())[:10],
        permit_type=permit_type,
        applicant=applicant,
        address=address,
        description=description,
        status="pending",
        issued_at=None,
        expires_at=None,
        created_at=now,
        updated_at=now,
        notes="",
    )
    conn = get_db(db_path)
    init_db(conn)
    conn.execute("INSERT INTO permits VALUES (?,?,?,?,?,?,?,?,?,?,?)", permit.to_row())
    _log_event(conn, permit.id, "applied", applicant, f"Applied for {permit_type} permit")
    conn.commit()
    conn.close()
    return permit


def approve(
    permit_id: str,
    actor: str = "admin",
    notes: str = "",
    validity_days: int = 365,
    db_path: Path = DB_PATH,
) -> Permit:
    """Approve a pending permit and set its validity window."""
    conn = get_db(db_path)
    init_db(conn)
    row = conn.execute("SELECT * FROM permits WHERE id=?", (permit_id,)).fetchone()
    if not row:
        raise ValueError(f"Permit '{permit_id}' not found.")
    p = Permit.from_row(row)
    if p.status != "pending":
        raise ValueError(f"Permit '{permit_id}' is '{p.status}', not pending.")
    now = datetime.now(timezone.utc)
    issued = now.isoformat()
    expires = (now + timedelta(days=validity_days)).isoformat()
    conn.execute(
        "UPDATE permits SET status='approved', issued_at=?, expires_at=?, updated_at=?, notes=? WHERE id=?",
        (issued, expires, issued, notes, permit_id),
    )
    _log_event(conn, permit_id, "approved", actor, notes or "Permit approved")
    conn.commit()
    updated = Permit.from_row(conn.execute("SELECT * FROM permits WHERE id=?", (permit_id,)).fetchone())
    conn.close()
    return updated


def deny(
    permit_id: str,
    reason: str,
    actor: str = "admin",
    db_path: Path = DB_PATH,
) -> Permit:
    """Deny a pending permit."""
    conn = get_db(db_path)
    init_db(conn)
    row = conn.execute("SELECT * FROM permits WHERE id=?", (permit_id,)).fetchone()
    if not row:
        raise ValueError(f"Permit '{permit_id}' not found.")
    p = Permit.from_row(row)
    if p.status not in ("pending",):
        raise ValueError(f"Permit '{permit_id}' cannot be denied (status: {p.status}).")
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "UPDATE permits SET status='denied', updated_at=?, notes=? WHERE id=?",
        (now, reason, permit_id),
    )
    _log_event(conn, permit_id, "denied", actor, reason)
    conn.commit()
    updated = Permit.from_row(conn.execute("SELECT * FROM permits WHERE id=?", (permit_id,)).fetchone())
    conn.close()
    return updated


def expire_permit(permit_id: str, actor: str = "system", db_path: Path = DB_PATH) -> Permit:
    """Manually mark a permit as expired."""
    conn = get_db(db_path)
    init_db(conn)
    row = conn.execute("SELECT * FROM permits WHERE id=?", (permit_id,)).fetchone()
    if not row:
        raise ValueError(f"Permit '{permit_id}' not found.")
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "UPDATE permits SET status='expired', updated_at=? WHERE id=?",
        (now, permit_id),
    )
    _log_event(conn, permit_id, "expired", actor, "Permit expired")
    conn.commit()
    updated = Permit.from_row(conn.execute("SELECT * FROM permits WHERE id=?", (permit_id,)).fetchone())
    conn.close()
    return updated


def expire_overdue(db_path: Path = DB_PATH) -> List[str]:
    """Auto-expire all approved permits past their expires_at date. Returns IDs."""
    conn = get_db(db_path)
    init_db(conn)
    now = datetime.now(timezone.utc).isoformat()
    rows = conn.execute(
        "SELECT id FROM permits WHERE status='approved' AND expires_at IS NOT NULL AND expires_at < ?",
        (now,),
    ).fetchall()
    expired_ids = [r["id"] for r in rows]
    for pid in expired_ids:
        conn.execute(
            "UPDATE permits SET status='expired', updated_at=? WHERE id=?", (now, pid)
        )
        _log_event(conn, pid, "auto_expired", "system", "Auto-expired by system sweep")
    conn.commit()
    conn.close()
    return expired_ids


def get_permits_by_address(address: str, db_path: Path = DB_PATH) -> List[Permit]:
    """Return all permits associated with an address (partial match)."""
    conn = get_db(db_path)
    init_db(conn)
    rows = conn.execute(
        "SELECT * FROM permits WHERE address LIKE ? ORDER BY created_at DESC",
        (f"%{address}%",),
    ).fetchall()
    conn.close()
    return [Permit.from_row(r) for r in rows]


def check_compliance(permit_id: str, db_path: Path = DB_PATH) -> dict:
    """
    Run a compliance check on a permit. Returns issues list and overall pass/fail.
    Checks: status validity, expiry, required fields.
    """
    conn = get_db(db_path)
    init_db(conn)
    row = conn.execute("SELECT * FROM permits WHERE id=?", (permit_id,)).fetchone()
    conn.close()
    if not row:
        raise ValueError(f"Permit '{permit_id}' not found.")
    p = Permit.from_row(row)

    issues = []

    if not p.address.strip():
        issues.append("MISSING_ADDRESS: Permit has no address.")
    if not p.applicant.strip():
        issues.append("MISSING_APPLICANT: Permit has no applicant name.")
    if p.status not in VALID_STATUSES:
        issues.append(f"INVALID_STATUS: '{p.status}' is not a valid status.")
    if p.status == "approved":
        if not p.issued_at:
            issues.append("MISSING_ISSUED_AT: Approved permit has no issue date.")
        if not p.expires_at:
            issues.append("MISSING_EXPIRES_AT: Approved permit has no expiry date.")
        if p.is_expired and p.status != "expired":
            issues.append("OVERDUE_EXPIRY: Permit is past expiry but still marked approved.")
    if p.permit_type not in PERMIT_TYPES:
        issues.append(f"UNKNOWN_TYPE: '{p.permit_type}' is not a recognised permit type.")

    return {
        "permit_id": permit_id,
        "status": p.status,
        "compliant": len(issues) == 0,
        "issues": issues,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }


def send_reminder(
    permit_id: str, days_before: int = 30, db_path: Path = DB_PATH
) -> Optional[dict]:
    """
    Check if a permit expires within `days_before` days.
    Returns reminder payload if so, else None.
    """
    conn = get_db(db_path)
    init_db(conn)
    row = conn.execute("SELECT * FROM permits WHERE id=?", (permit_id,)).fetchone()
    conn.close()
    if not row:
        raise ValueError(f"Permit '{permit_id}' not found.")
    p = Permit.from_row(row)
    if not p.expires_at or p.status != "approved":
        return None
    deadline = datetime.fromisoformat(p.expires_at)
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    delta = (deadline - now).days
    if 0 <= delta <= days_before:
        return {
            "permit_id": permit_id,
            "applicant": p.applicant,
            "address": p.address,
            "expires_at": p.expires_at,
            "days_remaining": delta,
            "message": (
                f"REMINDER: Your {p.permit_type} permit at {p.address} "
                f"expires in {delta} day(s). Please renew."
            ),
        }
    return None


def export_csv(db_path: Path = DB_PATH, status: Optional[str] = None) -> str:
    """Export all (or filtered) permits as CSV."""
    conn = get_db(db_path)
    init_db(conn)
    if status:
        rows = conn.execute("SELECT * FROM permits WHERE status=? ORDER BY created_at", (status,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM permits ORDER BY created_at").fetchall()
    conn.close()
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["id", "permit_type", "applicant", "address", "description",
                "status", "issued_at", "expires_at", "created_at", "updated_at", "notes"])
    for r in rows:
        w.writerow([r["id"], r["permit_type"], r["applicant"], r["address"],
                    r["description"], r["status"], r["issued_at"], r["expires_at"],
                    r["created_at"], r["updated_at"], r["notes"]])
    return out.getvalue()


def get_permit(permit_id: str, db_path: Path = DB_PATH) -> Optional[Permit]:
    conn = get_db(db_path)
    init_db(conn)
    row = conn.execute("SELECT * FROM permits WHERE id=?", (permit_id,)).fetchone()
    conn.close()
    return Permit.from_row(row) if row else None


def list_permits(status: Optional[str] = None, db_path: Path = DB_PATH) -> List[Permit]:
    conn = get_db(db_path)
    init_db(conn)
    if status:
        rows = conn.execute(
            "SELECT * FROM permits WHERE status=? ORDER BY created_at DESC", (status,)
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM permits ORDER BY created_at DESC").fetchall()
    conn.close()
    return [Permit.from_row(r) for r in rows]


# ── CLI ───────────────────────────────────────────────────────────────────────

def cmd_apply(args):
    p = apply(args.type, args.applicant, args.address,
              args.description or "", int(args.validity_days or 365))
    print(json.dumps(asdict(p), indent=2))


def cmd_approve(args):
    p = approve(args.permit_id, args.actor or "admin",
                args.notes or "", int(args.validity_days or 365))
    print(json.dumps(asdict(p), indent=2))


def cmd_deny(args):
    p = deny(args.permit_id, args.reason, args.actor or "admin")
    print(json.dumps(asdict(p), indent=2))


def cmd_expire(args):
    p = expire_permit(args.permit_id)
    print(json.dumps(asdict(p), indent=2))


def cmd_sweep(args):
    expired = expire_overdue()
    print(f"✅ Expired {len(expired)} overdue permit(s): {expired}")


def cmd_search_address(args):
    permits = get_permits_by_address(args.address)
    if not permits:
        print("No permits found.")
        return
    for p in permits:
        print(f"[{p.id}] {p.permit_type} | {p.status} | {p.applicant} | {p.address}")


def cmd_compliance(args):
    result = check_compliance(args.permit_id)
    print(json.dumps(result, indent=2))
    if not result["compliant"]:
        sys.exit(1)


def cmd_reminder(args):
    result = send_reminder(args.permit_id, int(args.days or 30))
    if result:
        print(json.dumps(result, indent=2))
    else:
        print("No reminder needed.")


def cmd_export(args):
    output = export_csv(status=args.status or None)
    if args.output:
        Path(args.output).write_text(output)
        print(f"✅ Exported to {args.output}")
    else:
        print(output)


def cmd_list(args):
    permits = list_permits(status=args.status or None)
    if not permits:
        print("No permits found.")
        return
    status_icon = {"pending": "🟡", "approved": "🟢", "denied": "🔴", "expired": "⚫"}
    for p in permits:
        icon = status_icon.get(p.status, "⚪")
        exp = p.expires_at[:10] if p.expires_at else "N/A"
        print(f"{icon} [{p.id}] {p.permit_type:<18} | {p.applicant:<20} | {p.address} | expires: {exp}")


def cmd_show(args):
    p = get_permit(args.permit_id)
    if not p:
        print(f"Permit '{args.permit_id}' not found.", file=sys.stderr)
        sys.exit(1)
    print(json.dumps(asdict(p), indent=2))


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="permit_tracker",
        description="🏛️  Municipal Permit Tracker — full lifecycle management",
    )
    sub = p.add_subparsers(dest="command", required=True)

    # apply
    ap = sub.add_parser("apply", help="Submit a permit application")
    ap.add_argument("type", choices=PERMIT_TYPES)
    ap.add_argument("applicant")
    ap.add_argument("address")
    ap.add_argument("--description", default="")
    ap.add_argument("--validity-days", default=365)
    ap.set_defaults(func=cmd_apply)

    # approve
    apr = sub.add_parser("approve", help="Approve a permit")
    apr.add_argument("permit_id")
    apr.add_argument("--actor", default="admin")
    apr.add_argument("--notes", default="")
    apr.add_argument("--validity-days", default=365)
    apr.set_defaults(func=cmd_approve)

    # deny
    dn = sub.add_parser("deny", help="Deny a permit")
    dn.add_argument("permit_id")
    dn.add_argument("reason")
    dn.add_argument("--actor", default="admin")
    dn.set_defaults(func=cmd_deny)

    # expire
    ex = sub.add_parser("expire", help="Mark permit as expired")
    ex.add_argument("permit_id")
    ex.set_defaults(func=cmd_expire)

    # sweep
    sw = sub.add_parser("sweep", help="Auto-expire all overdue permits")
    sw.set_defaults(func=cmd_sweep)

    # search
    sr = sub.add_parser("search", help="Search permits by address")
    sr.add_argument("address")
    sr.set_defaults(func=cmd_search_address)

    # compliance
    co = sub.add_parser("compliance", help="Run compliance check")
    co.add_argument("permit_id")
    co.set_defaults(func=cmd_compliance)

    # reminder
    rm = sub.add_parser("reminder", help="Check/send expiry reminder")
    rm.add_argument("permit_id")
    rm.add_argument("--days", default=30)
    rm.set_defaults(func=cmd_reminder)

    # export
    ep = sub.add_parser("export", help="Export permits as CSV")
    ep.add_argument("--status", choices=list(VALID_STATUSES))
    ep.add_argument("--output", help="Output file path")
    ep.set_defaults(func=cmd_export)

    # list
    ls = sub.add_parser("list", help="List permits")
    ls.add_argument("--status", choices=list(VALID_STATUSES))
    ls.set_defaults(func=cmd_list)

    # show
    sh = sub.add_parser("show", help="Show permit details")
    sh.add_argument("permit_id")
    sh.set_defaults(func=cmd_show)

    return p


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    try:
        args.func(args)
    except (ValueError, RuntimeError) as exc:
        print(f"❌ Error: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
