#!/usr/bin/env python3
"""
Voting System — Civic ballot management with SQLite persistence.
Supports ballot creation, voter eligibility, double-vote prevention,
cryptographic vote signing, tallying, and JSON/CSV export.
"""
import argparse
import csv
import hashlib
import io
import json
import sqlite3
import sys
import uuid
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, List

DB_PATH = Path.home() / ".blackroad" / "voting.db"


# ── Dataclasses ──────────────────────────────────────────────────────────────

@dataclass
class Ballot:
    id: str
    title: str
    description: str
    options: List[str]
    start_time: str
    end_time: str
    is_active: bool
    created_at: str

    def to_row(self):
        return (self.id, self.title, self.description, json.dumps(self.options),
                self.start_time, self.end_time, int(self.is_active), self.created_at)

    @classmethod
    def from_row(cls, row) -> "Ballot":
        d = dict(row)
        d["options"] = json.loads(d["options"])
        d["is_active"] = bool(d["is_active"])
        return cls(**d)


@dataclass
class Vote:
    id: str
    voter_id: str
    ballot_id: str
    choice: str
    timestamp: str
    signature: str

    def to_row(self):
        return (self.id, self.voter_id, self.ballot_id,
                self.choice, self.timestamp, self.signature)

    @classmethod
    def from_row(cls, row) -> "Vote":
        return cls(**dict(row))


# ── Database ─────────────────────────────────────────────────────────────────

def get_db(path: Path = DB_PATH) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS ballots (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL,
            description TEXT,
            options     TEXT NOT NULL,
            start_time  TEXT NOT NULL,
            end_time    TEXT NOT NULL,
            is_active   INTEGER DEFAULT 1,
            created_at  TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS votes (
            id         TEXT PRIMARY KEY,
            voter_id   TEXT NOT NULL,
            ballot_id  TEXT NOT NULL,
            choice     TEXT NOT NULL,
            timestamp  TEXT NOT NULL,
            signature  TEXT NOT NULL,
            UNIQUE(voter_id, ballot_id)
        );
        CREATE TABLE IF NOT EXISTS eligible_voters (
            voter_id   TEXT NOT NULL,
            ballot_id  TEXT NOT NULL,
            registered_at TEXT NOT NULL,
            PRIMARY KEY(voter_id, ballot_id)
        );
    """)
    conn.commit()


# ── Crypto helpers ────────────────────────────────────────────────────────────

def _sign(voter_id: str, ballot_id: str, choice: str, timestamp: str) -> str:
    """Deterministic HMAC-style signature for vote integrity."""
    raw = f"{voter_id}:{ballot_id}:{choice}:{timestamp}"
    return hashlib.sha256(raw.encode()).hexdigest()


def verify_vote(vote: Vote) -> bool:
    expected = _sign(vote.voter_id, vote.ballot_id, vote.choice, vote.timestamp)
    return vote.signature == expected


# ── Core API ──────────────────────────────────────────────────────────────────

def create_ballot(
    title: str,
    description: str,
    options: List[str],
    start_time: str,
    end_time: str,
    db_path: Path = DB_PATH,
) -> Ballot:
    """Create and persist a new ballot."""
    if len(options) < 2:
        raise ValueError("A ballot must have at least 2 options.")
    conn = get_db(db_path)
    init_db(conn)
    ballot = Ballot(
        id=str(uuid.uuid4())[:8],
        title=title,
        description=description,
        options=options,
        start_time=start_time,
        end_time=end_time,
        is_active=True,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    conn.execute(
        "INSERT INTO ballots VALUES (?,?,?,?,?,?,?,?)", ballot.to_row()
    )
    conn.commit()
    conn.close()
    return ballot


def register_voter(voter_id: str, ballot_id: str, db_path: Path = DB_PATH) -> None:
    """Register a voter as eligible for a specific ballot."""
    conn = get_db(db_path)
    init_db(conn)
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "INSERT OR IGNORE INTO eligible_voters VALUES (?,?,?)",
        (voter_id, ballot_id, now),
    )
    conn.commit()
    conn.close()


def validate_eligibility(voter_id: str, ballot_id: str, db_path: Path = DB_PATH) -> bool:
    """Return True if voter is registered for the ballot."""
    conn = get_db(db_path)
    init_db(conn)
    row = conn.execute(
        "SELECT 1 FROM eligible_voters WHERE voter_id=? AND ballot_id=?",
        (voter_id, ballot_id),
    ).fetchone()
    conn.close()
    return row is not None


def cast_vote(
    ballot_id: str,
    voter_id: str,
    choice: str,
    db_path: Path = DB_PATH,
) -> Vote:
    """Cast a vote. Prevents double-voting and validates eligibility + window."""
    conn = get_db(db_path)
    init_db(conn)

    row = conn.execute("SELECT * FROM ballots WHERE id=?", (ballot_id,)).fetchone()
    if not row:
        raise ValueError(f"Ballot '{ballot_id}' not found.")

    ballot = Ballot.from_row(row)

    if not ballot.is_active:
        raise ValueError(f"Ballot '{ballot_id}' is closed.")

    now_str = datetime.now(timezone.utc).isoformat()
    if now_str < ballot.start_time:
        raise ValueError("Voting window has not opened yet.")
    if now_str > ballot.end_time:
        raise ValueError("Voting window has closed.")

    if choice not in ballot.options:
        raise ValueError(f"Invalid choice '{choice}'. Valid: {ballot.options}")

    if not validate_eligibility(voter_id, ballot_id, db_path):
        raise ValueError(f"Voter '{voter_id}' is not registered for ballot '{ballot_id}'.")

    dupe = conn.execute(
        "SELECT 1 FROM votes WHERE voter_id=? AND ballot_id=?",
        (voter_id, ballot_id),
    ).fetchone()
    if dupe:
        raise ValueError(f"Voter '{voter_id}' has already voted on ballot '{ballot_id}'.")

    timestamp = now_str
    sig = _sign(voter_id, ballot_id, choice, timestamp)
    vote = Vote(
        id=str(uuid.uuid4())[:8],
        voter_id=voter_id,
        ballot_id=ballot_id,
        choice=choice,
        timestamp=timestamp,
        signature=sig,
    )
    conn.execute("INSERT INTO votes VALUES (?,?,?,?,?,?)", vote.to_row())
    conn.commit()
    conn.close()
    return vote


def tally(ballot_id: str, db_path: Path = DB_PATH) -> dict:
    """Return vote counts, percentages, and winner for a ballot."""
    conn = get_db(db_path)
    init_db(conn)
    row = conn.execute("SELECT * FROM ballots WHERE id=?", (ballot_id,)).fetchone()
    if not row:
        raise ValueError(f"Ballot '{ballot_id}' not found.")
    ballot = Ballot.from_row(row)

    counts: dict = {opt: 0 for opt in ballot.options}
    for vrow in conn.execute("SELECT choice FROM votes WHERE ballot_id=?", (ballot_id,)):
        c = vrow["choice"]
        if c in counts:
            counts[c] += 1
    conn.close()

    total = sum(counts.values())
    percentages = {
        opt: round(100 * cnt / total, 2) if total else 0.0
        for opt, cnt in counts.items()
    }
    winner = max(counts, key=counts.get) if total else None

    return {
        "ballot_id": ballot_id,
        "title": ballot.title,
        "total_votes": total,
        "counts": counts,
        "percentages": percentages,
        "winner": winner,
    }


def export_results(
    ballot_id: str, fmt: str = "json", db_path: Path = DB_PATH
) -> str:
    """Export full ballot results as JSON or CSV."""
    summary = tally(ballot_id, db_path)
    conn = get_db(db_path)
    votes = [dict(v) for v in conn.execute(
        "SELECT * FROM votes WHERE ballot_id=?", (ballot_id,)
    ).fetchall()]
    conn.close()

    if fmt == "json":
        return json.dumps({"summary": summary, "votes": votes}, indent=2)
    elif fmt == "csv":
        out = io.StringIO()
        w = csv.writer(out)
        w.writerow(["voter_id", "ballot_id", "choice", "timestamp", "signature"])
        for v in votes:
            w.writerow([v["voter_id"], v["ballot_id"], v["choice"], v["timestamp"], v["signature"]])
        return out.getvalue()
    raise ValueError(f"Unknown format '{fmt}'. Use 'json' or 'csv'.")


def close_ballot(ballot_id: str, db_path: Path = DB_PATH) -> None:
    """Deactivate a ballot so no further votes are accepted."""
    conn = get_db(db_path)
    init_db(conn)
    conn.execute("UPDATE ballots SET is_active=0 WHERE id=?", (ballot_id,))
    conn.commit()
    conn.close()


def list_ballots(db_path: Path = DB_PATH) -> List[dict]:
    conn = get_db(db_path)
    init_db(conn)
    rows = conn.execute("SELECT * FROM ballots ORDER BY created_at DESC").fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["options"] = json.loads(d["options"])
        d["is_active"] = bool(d["is_active"])
        result.append(d)
    return result


def get_ballot(ballot_id: str, db_path: Path = DB_PATH) -> Optional[dict]:
    conn = get_db(db_path)
    init_db(conn)
    row = conn.execute("SELECT * FROM ballots WHERE id=?", (ballot_id,)).fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["options"] = json.loads(d["options"])
    d["is_active"] = bool(d["is_active"])
    return d


# ── CLI ───────────────────────────────────────────────────────────────────────

def _now_plus(hours: int = 0) -> str:
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()


def cmd_create(args) -> None:
    options = [o.strip() for o in args.options.split(",")]
    start = args.start or _now_plus(0)
    end = args.end or _now_plus(int(args.duration_hours or 24))
    b = create_ballot(args.title, args.description or "", options, start, end)
    print(json.dumps(asdict(b), indent=2))


def cmd_register(args) -> None:
    register_voter(args.voter_id, args.ballot_id)
    print(f"✅ Registered voter '{args.voter_id}' for ballot '{args.ballot_id}'")


def cmd_vote(args) -> None:
    v = cast_vote(args.ballot_id, args.voter_id, args.choice)
    print(json.dumps(asdict(v), indent=2))


def cmd_tally(args) -> None:
    result = tally(args.ballot_id)
    print(json.dumps(result, indent=2))


def cmd_export(args) -> None:
    output = export_results(args.ballot_id, fmt=args.format)
    if args.output:
        Path(args.output).write_text(output)
        print(f"✅ Exported to {args.output}")
    else:
        print(output)


def cmd_close(args) -> None:
    close_ballot(args.ballot_id)
    print(f"✅ Ballot '{args.ballot_id}' closed.")


def cmd_list(args) -> None:
    ballots = list_ballots()
    if not ballots:
        print("No ballots found.")
        return
    for b in ballots:
        status = "🟢 ACTIVE" if b["is_active"] else "🔴 CLOSED"
        print(f"[{b['id']}] {b['title']} — {status} | ends: {b['end_time']}")
        print(f"       Options: {', '.join(b['options'])}")


def cmd_verify(args) -> None:
    conn = get_db()
    init_db(conn)
    votes = [Vote.from_row(r) for r in
             conn.execute("SELECT * FROM votes WHERE ballot_id=?", (args.ballot_id,))]
    conn.close()
    invalid = [v for v in votes if not verify_vote(v)]
    if invalid:
        print(f"❌ {len(invalid)} invalid vote(s) detected!")
        for v in invalid:
            print(f"   Vote {v.id} by {v.voter_id}")
        sys.exit(1)
    print(f"✅ All {len(votes)} votes verified.")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="voting_system",
        description="🗳️  Civic Voting System — SQLite-backed ballot management",
    )
    sub = p.add_subparsers(dest="command", required=True)

    # create
    cr = sub.add_parser("create", help="Create a new ballot")
    cr.add_argument("title")
    cr.add_argument("--description", default="")
    cr.add_argument("--options", required=True, help="Comma-separated choices")
    cr.add_argument("--start", help="ISO8601 start time (default: now)")
    cr.add_argument("--end", help="ISO8601 end time")
    cr.add_argument("--duration-hours", default=24, help="Hours until close (default: 24)")
    cr.set_defaults(func=cmd_create)

    # register
    rg = sub.add_parser("register", help="Register voter eligibility")
    rg.add_argument("voter_id")
    rg.add_argument("ballot_id")
    rg.set_defaults(func=cmd_register)

    # vote
    vt = sub.add_parser("vote", help="Cast a vote")
    vt.add_argument("ballot_id")
    vt.add_argument("voter_id")
    vt.add_argument("choice")
    vt.set_defaults(func=cmd_vote)

    # tally
    ta = sub.add_parser("tally", help="Show current tally")
    ta.add_argument("ballot_id")
    ta.set_defaults(func=cmd_tally)

    # export
    ex = sub.add_parser("export", help="Export results")
    ex.add_argument("ballot_id")
    ex.add_argument("--format", choices=["json", "csv"], default="json")
    ex.add_argument("--output", help="Output file path")
    ex.set_defaults(func=cmd_export)

    # close
    cl = sub.add_parser("close", help="Close a ballot")
    cl.add_argument("ballot_id")
    cl.set_defaults(func=cmd_close)

    # list
    ls = sub.add_parser("list", help="List all ballots")
    ls.set_defaults(func=cmd_list)

    # verify
    vr = sub.add_parser("verify", help="Cryptographically verify vote signatures")
    vr.add_argument("ballot_id")
    vr.set_defaults(func=cmd_verify)

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
