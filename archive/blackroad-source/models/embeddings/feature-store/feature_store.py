"""
ML Feature Store with Versioning and Serving
blackroad-feature-store: Register, version, and serve ML features with point-in-time correctness.
"""

import argparse
import json
import logging
import os
import sqlite3
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional
from uuid import uuid4

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("feature_store")

DB_PATH = Path(os.environ.get("FEATURE_STORE_DB", Path.home() / ".blackroad" / "feature_store.db"))

DTYPE_INT = "int"
DTYPE_FLOAT = "float"
DTYPE_STR = "str"
DTYPE_BOOL = "bool"
DTYPE_LIST = "list"

DTYPES = [DTYPE_INT, DTYPE_FLOAT, DTYPE_STR, DTYPE_BOOL, DTYPE_LIST]

FREQ_BATCH = "batch"
FREQ_STREAMING = "streaming"


@dataclass
class Feature:
    """Describes a single feature definition."""
    id: str
    name: str
    entity_type: str
    dtype: str
    description: str
    tags: list
    source_query: str
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    is_active: bool = True

    def to_dict(self) -> dict:
        d = asdict(self)
        d["tags"] = self.tags
        return d

    @classmethod
    def from_row(cls, row) -> "Feature":
        return cls(
            id=row["id"],
            name=row["name"],
            entity_type=row["entity_type"],
            dtype=row["dtype"],
            description=row["description"] or "",
            tags=json.loads(row["tags"]) if row["tags"] else [],
            source_query=row["source_query"] or "",
            created_at=row["created_at"],
            is_active=bool(row["is_active"]),
        )


@dataclass
class FeatureGroup:
    """Groups related features together for serving."""
    id: str
    name: str
    features: list  # List of feature names
    entity_key: str
    frequency: str
    version: int
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> dict:
        d = asdict(self)
        d["features"] = self.features
        return d

    @classmethod
    def from_row(cls, row) -> "FeatureGroup":
        return cls(
            id=row["id"],
            name=row["name"],
            features=json.loads(row["features"]) if row["features"] else [],
            entity_key=row["entity_key"],
            frequency=row["frequency"],
            version=row["version"],
            created_at=row["created_at"],
        )


@dataclass
class EntityRecord:
    """A snapshot of feature values for an entity at a point in time."""
    id: str
    group_id: str
    entity_id: str
    feature_values: dict
    timestamp: str
    version: int = 1

    def to_dict(self) -> dict:
        d = asdict(self)
        d["feature_values"] = self.feature_values
        return d

    @classmethod
    def from_row(cls, row) -> "EntityRecord":
        return cls(
            id=row["id"],
            group_id=row["group_id"],
            entity_id=row["entity_id"],
            feature_values=json.loads(row["feature_values"]) if row["feature_values"] else {},
            timestamp=row["timestamp"],
            version=row["version"],
        )


class FeatureStore:
    """
    ML Feature Store with versioning and point-in-time serving.

    Stores feature definitions, groups, and entity values in SQLite.
    Supports point-in-time joins for training data generation.

    Usage::

        store = FeatureStore()
        store.register_feature("age", "user", "int", "SELECT age FROM users")
        store.create_group("user_features", ["age", "income"], entity_key="user_id")
        store.write_features(group_id, "user-123", {"age": 35, "income": 80000.0})
        values = store.get_features(group_id, "user-123")
    """

    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._get_conn() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS features (
                    id TEXT PRIMARY KEY,
                    name TEXT UNIQUE NOT NULL,
                    entity_type TEXT NOT NULL,
                    dtype TEXT NOT NULL,
                    description TEXT DEFAULT '',
                    tags TEXT DEFAULT '[]',
                    source_query TEXT DEFAULT '',
                    created_at TEXT NOT NULL,
                    is_active INTEGER DEFAULT 1
                );

                CREATE TABLE IF NOT EXISTS feature_groups (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    features TEXT DEFAULT '[]',
                    entity_key TEXT NOT NULL,
                    frequency TEXT DEFAULT 'batch',
                    version INTEGER DEFAULT 1,
                    created_at TEXT NOT NULL,
                    UNIQUE(name, version)
                );

                CREATE TABLE IF NOT EXISTS entity_records (
                    id TEXT PRIMARY KEY,
                    group_id TEXT NOT NULL,
                    entity_id TEXT NOT NULL,
                    feature_values TEXT DEFAULT '{}',
                    timestamp TEXT NOT NULL,
                    version INTEGER DEFAULT 1,
                    FOREIGN KEY (group_id) REFERENCES feature_groups(id)
                );

                CREATE INDEX IF NOT EXISTS idx_features_entity ON features(entity_type);
                CREATE INDEX IF NOT EXISTS idx_groups_name ON feature_groups(name);
                CREATE INDEX IF NOT EXISTS idx_records_group_entity ON entity_records(group_id, entity_id);
                CREATE INDEX IF NOT EXISTS idx_records_timestamp ON entity_records(timestamp);
            """)
        logger.debug("DB initialized at %s", self.db_path)

    def register_feature(
        self,
        name: str,
        entity_type: str,
        dtype: str,
        source_query: str = "",
        description: str = "",
        tags: Optional[list] = None,
    ) -> Feature:
        """Register a new feature definition.

        Args:
            name: Feature name (unique).
            entity_type: Entity type this feature belongs to (e.g. 'user', 'item').
            dtype: Data type (int/float/str/bool/list).
            source_query: SQL or expression for computing the feature.
            description: Human-readable description.
            tags: List of tag strings for grouping.

        Returns:
            The registered Feature.
        """
        if dtype not in DTYPES:
            raise ValueError(f"Invalid dtype '{dtype}'. Must be one of {DTYPES}")

        feature = Feature(
            id=str(uuid4()),
            name=name,
            entity_type=entity_type,
            dtype=dtype,
            description=description,
            tags=tags or [],
            source_query=source_query,
        )
        with self._get_conn() as conn:
            conn.execute(
                """INSERT OR REPLACE INTO features
                   (id, name, entity_type, dtype, description, tags, source_query, created_at, is_active)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)""",
                (
                    feature.id, feature.name, feature.entity_type, feature.dtype,
                    feature.description, json.dumps(feature.tags),
                    feature.source_query, feature.created_at,
                ),
            )
        logger.info("Feature registered: %s (%s/%s)", name, entity_type, dtype)
        return feature

    def get_feature(self, name: str) -> Optional[Feature]:
        """Fetch a feature definition by name."""
        with self._get_conn() as conn:
            row = conn.execute("SELECT * FROM features WHERE name=?", (name,)).fetchone()
        return Feature.from_row(row) if row else None

    def list_features(self, entity_type: Optional[str] = None) -> list:
        """List feature definitions."""
        with self._get_conn() as conn:
            if entity_type:
                rows = conn.execute(
                    "SELECT * FROM features WHERE entity_type=? AND is_active=1 ORDER BY name",
                    (entity_type,),
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM features WHERE is_active=1 ORDER BY entity_type, name"
                ).fetchall()
        return [Feature.from_row(r) for r in rows]

    def create_group(
        self,
        name: str,
        features: list,
        entity_key: str,
        frequency: str = FREQ_BATCH,
        version: int = 1,
    ) -> FeatureGroup:
        """Create a feature group for logical organization and serving.

        Args:
            name: Group name.
            features: List of feature names to include.
            entity_key: Primary key column (e.g. 'user_id').
            frequency: batch or streaming.
            version: Group version.

        Returns:
            The created FeatureGroup.
        """
        # Validate features exist
        for fname in features:
            if not self.get_feature(fname):
                raise ValueError(f"Feature '{fname}' not registered.")

        group = FeatureGroup(
            id=str(uuid4()),
            name=name,
            features=features,
            entity_key=entity_key,
            frequency=frequency,
            version=version,
        )
        with self._get_conn() as conn:
            conn.execute(
                """INSERT INTO feature_groups (id, name, features, entity_key, frequency, version, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    group.id, group.name, json.dumps(group.features),
                    group.entity_key, group.frequency, group.version, group.created_at,
                ),
            )
        logger.info("Feature group created: %s v%d (%d features)", name, version, len(features))
        return group

    def get_group(self, group_id: str) -> Optional[FeatureGroup]:
        """Fetch a feature group by ID."""
        with self._get_conn() as conn:
            row = conn.execute("SELECT * FROM feature_groups WHERE id=?", (group_id,)).fetchone()
        return FeatureGroup.from_row(row) if row else None

    def get_group_by_name(self, name: str, version: int = 1) -> Optional[FeatureGroup]:
        """Fetch a feature group by name and version."""
        with self._get_conn() as conn:
            row = conn.execute(
                "SELECT * FROM feature_groups WHERE name=? AND version=?", (name, version)
            ).fetchone()
        return FeatureGroup.from_row(row) if row else None

    def write_features(
        self,
        group_id: str,
        entity_id: str,
        values: dict,
        timestamp: Optional[str] = None,
        version: int = 1,
    ) -> EntityRecord:
        """Write feature values for an entity.

        Args:
            group_id: Feature group ID.
            entity_id: Entity identifier.
            values: Dict mapping feature name → value.
            timestamp: ISO timestamp (defaults to now).
            version: Record version.

        Returns:
            The EntityRecord.
        """
        group = self.get_group(group_id)
        if not group:
            raise ValueError(f"Feature group {group_id} not found.")

        # Validate keys against group
        for key in values:
            if key not in group.features:
                logger.warning("Feature '%s' not in group '%s', storing anyway.", key, group.name)

        ts = timestamp or datetime.utcnow().isoformat()
        record = EntityRecord(
            id=str(uuid4()),
            group_id=group_id,
            entity_id=entity_id,
            feature_values=values,
            timestamp=ts,
            version=version,
        )
        with self._get_conn() as conn:
            conn.execute(
                """INSERT INTO entity_records (id, group_id, entity_id, feature_values, timestamp, version)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    record.id, record.group_id, record.entity_id,
                    json.dumps(record.feature_values), record.timestamp, record.version,
                ),
            )
        logger.debug("Feature values written for entity %s in group %s", entity_id, group_id)
        return record

    def get_features(
        self,
        group_id: str,
        entity_id: str,
        as_of_timestamp: Optional[str] = None,
    ) -> Optional[dict]:
        """Retrieve the latest feature values for an entity.

        Point-in-time correctness: returns the most recent record at or before
        as_of_timestamp (or the absolute latest if not specified).

        Args:
            group_id: Feature group ID.
            entity_id: Entity identifier.
            as_of_timestamp: ISO timestamp for point-in-time lookup.

        Returns:
            Dict of feature_name → value, or None if no record found.
        """
        with self._get_conn() as conn:
            if as_of_timestamp:
                row = conn.execute(
                    """SELECT * FROM entity_records
                       WHERE group_id=? AND entity_id=? AND timestamp <= ?
                       ORDER BY timestamp DESC LIMIT 1""",
                    (group_id, entity_id, as_of_timestamp),
                ).fetchone()
            else:
                row = conn.execute(
                    """SELECT * FROM entity_records
                       WHERE group_id=? AND entity_id=?
                       ORDER BY timestamp DESC LIMIT 1""",
                    (group_id, entity_id),
                ).fetchone()

        if not row:
            return None
        return json.loads(row["feature_values"])

    def point_in_time_join(
        self,
        entities: list,
        feature_groups: list,
        timestamp: str,
    ) -> list:
        """Perform a point-in-time join across multiple feature groups.

        For each entity in entities, retrieves feature values from each
        group as-of the given timestamp.

        Args:
            entities: List of entity ID strings.
            feature_groups: List of feature group IDs.
            timestamp: ISO timestamp for point-in-time correctness.

        Returns:
            List of dicts: {entity_id, <feature_name>: value, ...}
        """
        result = []
        for entity_id in entities:
            row: dict = {"entity_id": entity_id}
            for group_id in feature_groups:
                values = self.get_features(group_id, entity_id, as_of_timestamp=timestamp)
                if values:
                    row.update(values)
                else:
                    # Fill nulls for missing entities
                    group = self.get_group(group_id)
                    if group:
                        for fname in group.features:
                            row.setdefault(fname, None)
            result.append(row)
        logger.info(
            "Point-in-time join: %d entities × %d groups @ %s",
            len(entities), len(feature_groups), timestamp[:19],
        )
        return result

    def statistics(self, group_id: str) -> dict:
        """Compute basic statistics for all features in a group.

        Args:
            group_id: Feature group ID.

        Returns:
            Dict mapping feature_name → {count, mean, min, max, null_count}.
        """
        group = self.get_group(group_id)
        if not group:
            raise ValueError(f"Feature group {group_id} not found.")

        with self._get_conn() as conn:
            rows = conn.execute(
                "SELECT feature_values FROM entity_records WHERE group_id=?",
                (group_id,),
            ).fetchall()

        feature_data: dict = {f: [] for f in group.features}
        null_counts: dict = {f: 0 for f in group.features}

        for row in rows:
            values = json.loads(row["feature_values"])
            for fname in group.features:
                v = values.get(fname)
                if v is None:
                    null_counts[fname] += 1
                else:
                    feature_data[fname].append(v)

        stats = {}
        for fname in group.features:
            vals = feature_data[fname]
            numeric_vals = [v for v in vals if isinstance(v, (int, float))]
            if numeric_vals:
                mean = sum(numeric_vals) / len(numeric_vals)
                stats[fname] = {
                    "count": len(vals),
                    "null_count": null_counts[fname],
                    "mean": round(mean, 6),
                    "min": min(numeric_vals),
                    "max": max(numeric_vals),
                }
            else:
                stats[fname] = {
                    "count": len(vals),
                    "null_count": null_counts[fname],
                    "mean": None,
                    "min": None,
                    "max": None,
                }

        return {
            "group_id": group_id,
            "group_name": group.name,
            "total_records": len(rows),
            "features": stats,
        }

    def list_groups(self) -> list:
        """List all feature groups."""
        with self._get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM feature_groups ORDER BY name, version"
            ).fetchall()
        return [FeatureGroup.from_row(r).to_dict() for r in rows]


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def cmd_register(args, store: FeatureStore) -> None:
    tags = args.tags.split(",") if args.tags else []
    feature = store.register_feature(
        name=args.name,
        entity_type=args.entity_type,
        dtype=args.dtype,
        source_query=args.source or "",
        description=args.description or "",
        tags=tags,
    )
    print(f"✓ Feature registered: {feature.name} [{feature.dtype}] on {feature.entity_type}")


def cmd_create_group(args, store: FeatureStore) -> None:
    features = args.features.split(",")
    group = store.create_group(
        name=args.name,
        features=features,
        entity_key=args.entity_key,
        frequency=args.frequency,
        version=args.version,
    )
    print(f"✓ Feature group created: {group.name} v{group.version} ({len(group.features)} features)")
    print(f"  ID: {group.id}")


def cmd_write(args, store: FeatureStore) -> None:
    values = json.loads(args.values)
    record = store.write_features(
        group_id=args.group_id,
        entity_id=args.entity_id,
        values=values,
        timestamp=getattr(args, "timestamp", None),
    )
    print(f"✓ Features written for entity '{args.entity_id}' in group {args.group_id[:8]}...")


def cmd_get(args, store: FeatureStore) -> None:
    values = store.get_features(
        group_id=args.group_id,
        entity_id=args.entity_id,
        as_of_timestamp=getattr(args, "as_of", None),
    )
    if values is None:
        print(f"No feature values found for entity '{args.entity_id}'.")
        return
    print(f"Features for '{args.entity_id}':")
    for k, v in values.items():
        print(f"  {k}: {v}")


def cmd_join(args, store: FeatureStore) -> None:
    entities = args.entities.split(",")
    groups = args.groups.split(",")
    ts = args.timestamp or datetime.utcnow().isoformat()
    result = store.point_in_time_join(entities, groups, ts)
    print(json.dumps(result, indent=2))


def cmd_stats(args, store: FeatureStore) -> None:
    stats = store.statistics(args.group_id)
    print(f"Group: {stats['group_name']} | Records: {stats['total_records']}")
    print(f"{'Feature':<30} {'Count':>8} {'Nulls':>8} {'Mean':>12} {'Min':>10} {'Max':>10}")
    print("-" * 80)
    for fname, s in stats["features"].items():
        mean = f"{s['mean']:.4f}" if s["mean"] is not None else "N/A"
        mn = f"{s['min']}" if s["min"] is not None else "N/A"
        mx = f"{s['max']}" if s["max"] is not None else "N/A"
        print(f"{fname:<30} {s['count']:>8} {s['null_count']:>8} {mean:>12} {mn:>10} {mx:>10}")


def cmd_list_features(args, store: FeatureStore) -> None:
    features = store.list_features(entity_type=getattr(args, "entity_type", None))
    if not features:
        print("No features registered.")
        return
    for f in features:
        tags = ", ".join(f.tags) if f.tags else ""
        print(f"  {f.name:<30} [{f.dtype:<6}] {f.entity_type:<15} {tags}")


def cmd_list_groups(args, store: FeatureStore) -> None:
    groups = store.list_groups()
    if not groups:
        print("No feature groups.")
        return
    for g in groups:
        feats = ", ".join(g["features"])
        print(f"  {g['name']} v{g['version']} [{g['frequency']}] → {feats}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="ML Feature Store")
    parser.add_argument("--db", help="Override database path")
    sub = parser.add_subparsers(dest="command", metavar="COMMAND")

    p = sub.add_parser("register", help="Register a feature definition")
    p.add_argument("name", help="Feature name")
    p.add_argument("entity_type", help="Entity type (e.g. user, item)")
    p.add_argument("dtype", choices=DTYPES)
    p.add_argument("--source", help="Source query")
    p.add_argument("--description", help="Description")
    p.add_argument("--tags", help="Comma-separated tags")
    p.set_defaults(func=cmd_register)

    p = sub.add_parser("create-group", help="Create a feature group")
    p.add_argument("name", help="Group name")
    p.add_argument("--features", required=True, help="Comma-separated feature names")
    p.add_argument("--entity-key", required=True, help="Entity key column")
    p.add_argument("--frequency", default=FREQ_BATCH, choices=[FREQ_BATCH, FREQ_STREAMING])
    p.add_argument("--version", type=int, default=1)
    p.set_defaults(func=cmd_create_group)

    p = sub.add_parser("write", help="Write feature values for an entity")
    p.add_argument("group_id", help="Feature group ID")
    p.add_argument("entity_id", help="Entity ID")
    p.add_argument("values", help="JSON dict of feature values")
    p.add_argument("--timestamp", help="ISO timestamp override")
    p.set_defaults(func=cmd_write)

    p = sub.add_parser("get", help="Get feature values for an entity")
    p.add_argument("group_id")
    p.add_argument("entity_id")
    p.add_argument("--as-of", help="Point-in-time ISO timestamp")
    p.set_defaults(func=cmd_get)

    p = sub.add_parser("join", help="Point-in-time join")
    p.add_argument("entities", help="Comma-separated entity IDs")
    p.add_argument("groups", help="Comma-separated group IDs")
    p.add_argument("--timestamp", help="ISO timestamp")
    p.set_defaults(func=cmd_join)

    p = sub.add_parser("stats", help="Feature group statistics")
    p.add_argument("group_id")
    p.set_defaults(func=cmd_stats)

    p = sub.add_parser("list-features", help="List feature definitions")
    p.add_argument("--entity-type", help="Filter by entity type")
    p.set_defaults(func=cmd_list_features)

    p = sub.add_parser("list-groups", help="List feature groups")
    p.set_defaults(func=cmd_list_groups)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        return
    db_path = Path(args.db) if getattr(args, "db", None) else None
    store = FeatureStore(db_path=db_path)
    args.func(args, store)


if __name__ == "__main__":
    main()
