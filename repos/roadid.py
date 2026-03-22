#!/usr/bin/env python3
"""
RoadID — BlackRoad's self-describing, routable, decodable identity system.

Instead of opaque UUIDs like 550e8400-e29b-41d4-a716-446655440000,
RoadID generates human-readable IDs like: cece-chat-k4f2x1-7mq

Format: <node>-<type>-<time_base36>-<rand>
  - node:  2-5 char fleet node name (routable)
  - type:  2-4 char resource type (self-describing)
  - time:  base36-encoded unix timestamp (sortable, decodable)
  - rand:  3-6 char base36 random suffix (unique)

Properties:
  - Human-readable (you can SEE it's a chat on Cecilia)
  - Sortable (timestamp component)
  - Routable (node prefix → mesh routing)
  - Compact (~20 chars vs UUID's 36)
  - Fully decodable without any database lookup

Usage:
  from roadid import RoadID
  rid = RoadID()
  new_id = rid.generate("cece", "chat")     # cece-chat-k4f2x1-7mq
  info = rid.decode("cece-chat-k4f2x1-7mq") # full metadata dict
  print(rid.explain(new_id))                 # human-readable breakdown

CLI:
  python3 roadid.py generate cece chat
  python3 roadid.py decode cece-chat-k4f2x1-7mq
  python3 roadid.py explain cece-chat-k4f2x1-7mq
  python3 roadid.py batch alice req 10
  python3 roadid.py scan <url_or_string>
"""

import os
import sys
import time
import json
import re
import secrets
import struct
from datetime import datetime, timezone

# === FLEET NODES ===
# Every node in the BlackRoad mesh gets a short prefix
NODES = {
    "alice":  {"ip": "192.168.4.49",  "wg": "10.8.0.6",  "desc": "Pi 400 — gateway, Pi-hole, 65+ domains"},
    "cece":   {"ip": "192.168.4.96",  "wg": "10.8.0.3",  "desc": "Pi 5 — CECE API, TTS, Hailo-8, MinIO"},
    "oct":    {"ip": "192.168.4.100", "wg": "10.8.0.4",  "desc": "Pi 5 — Gitea, NVMe, Hailo-8, Swarm leader"},
    "aria":   {"ip": "192.168.4.98",  "wg": "10.8.0.7",  "desc": "Pi 5 — Portainer, Headscale"},
    "luci":   {"ip": "192.168.4.38",  "wg": None,         "desc": "Pi 5 — 334 web apps, Actions runner"},
    "mac":    {"ip": "192.168.4.28",  "wg": None,         "desc": "Mac — command center"},
    "ana":    {"ip": None,             "wg": "10.8.0.1",  "desc": "DO droplet — WG hub, Headscale"},
    "gem":    {"ip": None,             "wg": "10.8.0.8",  "desc": "DO droplet — gematria"},
    "mesh":   {"ip": None,             "wg": None,         "desc": "Browser mesh node (ephemeral)"},
    "edge":   {"ip": None,             "wg": None,         "desc": "External edge node"},
}

# Aliases for convenience
NODE_ALIASES = {
    "cecilia": "cece", "octavia": "oct", "lucidia": "luci",
    "anastasia": "ana", "gematria": "gem", "alexandria": "mac",
}

# === RESOURCE TYPES ===
TYPES = {
    "chat":  "Conversation / chat session",
    "sess":  "User session",
    "req":   "API request",
    "resp":  "API response",
    "mod":   "Model inference",
    "task":  "Background task / job",
    "file":  "File or artifact",
    "msg":   "Message",
    "pipe":  "Pipeline / workflow",
    "hook":  "Webhook event",
    "key":   "API key or credential reference",
    "node":  "Mesh node registration",
    "conn":  "Connection / link",
    "log":   "Log entry",
    "mem":   "Memory entry",
    "evt":   "Event",
    "img":   "Image",
    "aud":   "Audio",
    "vec":   "Vector embedding",
    "dns":   "DNS record",
    "tun":   "Tunnel",
    "err":   "Error",
}

# === BASE36 ENCODING ===
CHARSET = "0123456789abcdefghijklmnopqrstuvwxyz"

def to_base36(num: int) -> str:
    if num == 0:
        return "0"
    result = []
    while num:
        result.append(CHARSET[num % 36])
        num //= 36
    return "".join(reversed(result))

def from_base36(s: str) -> int:
    return int(s, 36)


class RoadID:
    """BlackRoad ID generator and decoder."""

    # Match pattern: node-type-time-rand
    PATTERN = re.compile(
        r'^([a-z]{2,5})-([a-z]{2,4})-([0-9a-z]{4,8})-([0-9a-z]{3,6})$'
    )

    def __init__(self, default_node: str = None):
        """Initialize with optional default node name."""
        self.default_node = self._resolve_node(default_node) if default_node else self._detect_node()

    def _detect_node(self) -> str:
        """Auto-detect which node we're running on."""
        hostname = os.uname().nodename.lower()
        for alias, node in NODE_ALIASES.items():
            if alias in hostname:
                return node
        for node in NODES:
            if node in hostname:
                return node
        if "darwin" in os.uname().sysname.lower():
            return "mac"
        return "edge"

    def _resolve_node(self, name: str) -> str:
        """Resolve node name or alias to canonical short name."""
        name = name.lower().strip()
        if name in NODES:
            return name
        if name in NODE_ALIASES:
            return NODE_ALIASES[name]
        return name[:5]  # Truncate unknown names

    def generate(self, node: str = None, rtype: str = "evt", rand_len: int = 3,
                 timestamp: float = None) -> str:
        """
        Generate a new RoadID.

        Args:
            node: Node name (auto-detected if None)
            rtype: Resource type from TYPES
            rand_len: Length of random suffix (3-6)
            timestamp: Unix timestamp (now if None)

        Returns:
            RoadID string like "cece-chat-k4f2x1-7mq"
        """
        node = self._resolve_node(node) if node else self.default_node
        ts = timestamp or time.time()

        # Encode timestamp as base36 (millisecond precision for sub-second uniqueness)
        ts_ms = int(ts * 1000)
        time_part = to_base36(ts_ms)

        # Random suffix
        rand_bytes = secrets.token_bytes(4)
        rand_int = int.from_bytes(rand_bytes, "big")
        rand_part = to_base36(rand_int)[:rand_len]

        return f"{node}-{rtype}-{time_part}-{rand_part}"

    def decode(self, road_id: str) -> dict:
        """
        Decode a RoadID into its components.

        Returns dict with: node, type, timestamp, datetime, random, raw,
                          node_info, type_desc, age_seconds
        """
        m = self.PATTERN.match(road_id.lower().strip())
        if not m:
            return {"error": f"Invalid RoadID format: {road_id}", "raw": road_id}

        node, rtype, time_part, rand_part = m.groups()

        ts_ms = from_base36(time_part)
        ts = ts_ms / 1000.0
        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
        age = time.time() - ts

        return {
            "raw": road_id,
            "node": node,
            "node_full": NODE_ALIASES.get(node, node),
            "node_info": NODES.get(node, {}).get("desc", "Unknown node"),
            "node_ip": NODES.get(node, {}).get("ip"),
            "node_wg": NODES.get(node, {}).get("wg"),
            "type": rtype,
            "type_desc": TYPES.get(rtype, "Unknown type"),
            "timestamp": ts,
            "datetime": dt.isoformat(),
            "datetime_local": datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S"),
            "age_seconds": round(age, 1),
            "age_human": _human_age(age),
            "random": rand_part,
        }

    def explain(self, road_id: str) -> str:
        """Human-readable explanation of a RoadID."""
        d = self.decode(road_id)
        if "error" in d:
            return d["error"]

        lines = [
            f"  ID:       {d['raw']}",
            f"  Node:     {d['node']} — {d['node_info']}",
        ]
        if d['node_ip']:
            lines.append(f"  Route:    {d['node_ip']}" + (f" (WG: {d['node_wg']})" if d['node_wg'] else ""))
        lines += [
            f"  Type:     {d['type']} — {d['type_desc']}",
            f"  Created:  {d['datetime_local']} ({d['age_human']} ago)",
            f"  Random:   {d['random']}",
        ]
        return "\n".join(lines)

    def batch(self, node: str, rtype: str, count: int = 10, rand_len: int = 3) -> list:
        """Generate multiple IDs. Each gets a unique timestamp via microsecond offset."""
        ids = []
        base_ts = time.time()
        for i in range(count):
            ids.append(self.generate(node, rtype, rand_len, timestamp=base_ts + (i * 0.001)))
        return ids

    def is_valid(self, road_id: str) -> bool:
        """Check if a string is a valid RoadID."""
        return bool(self.PATTERN.match(road_id.lower().strip()))

    def scan_external(self, url: str) -> dict:
        """
        Analyze an external URL's ID scheme.
        Identifies UUID, base64, JWT, nanoid, and other patterns.
        """
        # Extract the path after domain
        path = url.split("//")[-1].split("/", 1)[-1] if "//" in url else url
        segments = [s for s in path.split("/") if s]

        results = []
        for seg in segments:
            analysis = _analyze_segment(seg)
            if analysis["encoding"] != "slug":
                results.append(analysis)

        return {
            "url": url,
            "segments": len(segments),
            "identified": results,
            "road_equivalent": self._suggest_replacement(results) if results else None,
        }

    def _suggest_replacement(self, analyses: list) -> str:
        """Suggest a RoadID equivalent for detected external IDs."""
        for a in analyses:
            if a["encoding"] in ("uuid4", "uuid", "base64", "jwt"):
                return self.generate(self.default_node, "chat")
        return None


def _human_age(seconds: float) -> str:
    """Convert seconds to human-readable age."""
    if seconds < 0:
        return "in the future"
    if seconds < 60:
        return f"{int(seconds)}s"
    if seconds < 3600:
        return f"{int(seconds/60)}m"
    if seconds < 86400:
        return f"{int(seconds/3600)}h"
    days = int(seconds / 86400)
    if days < 30:
        return f"{days}d"
    if days < 365:
        return f"{int(days/30)}mo"
    return f"{days/365:.1f}y"


def _analyze_segment(seg: str) -> dict:
    """Analyze a URL segment to identify its encoding scheme."""
    result = {"value": seg, "length": len(seg)}

    # UUID pattern
    if re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', seg, re.I):
        version = seg[14]  # Version digit
        result["encoding"] = f"uuid{version}" if version in "12345" else "uuid"
        result["bits"] = 128
        result["decodable"] = version != "4"  # v4 is random, others have structure
        result["note"] = {
            "1": "Timestamp-based (MAC + time) — leaks hardware identity",
            "4": "Pure random — no embedded info, just a DB key",
            "5": "SHA1 of namespace+name — deterministic but opaque",
            "7": "Timestamp-ordered — sortable, embeds millisecond time",
        }.get(version, "Unknown version")
        return result

    # JWT pattern (three base64 segments separated by dots)
    if re.match(r'^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$', seg):
        import base64
        parts = seg.split(".")
        try:
            header = json.loads(base64.urlsafe_b64decode(parts[0] + "=="))
            result["encoding"] = "jwt"
            result["decodable"] = True
            result["header"] = header
            result["note"] = f"JWT ({header.get('alg', '?')}) — header+payload readable, signature verifiable"
            try:
                payload = json.loads(base64.urlsafe_b64decode(parts[1] + "=="))
                result["payload_keys"] = list(payload.keys())
            except Exception:
                pass
        except Exception:
            result["encoding"] = "dotted-base64"
            result["decodable"] = False
        return result

    # Hex string (like MongoDB ObjectID)
    if re.match(r'^[0-9a-f]{24}$', seg, re.I):
        result["encoding"] = "objectid"
        result["bits"] = 96
        result["decodable"] = True
        # First 4 bytes = timestamp
        try:
            ts = int(seg[:8], 16)
            dt = datetime.fromtimestamp(ts, tz=timezone.utc)
            result["timestamp"] = dt.isoformat()
            result["note"] = f"MongoDB ObjectID — embeds timestamp: {dt.isoformat()}"
        except Exception:
            result["note"] = "MongoDB ObjectID format (24 hex chars)"
        return result

    # Pure hex (various lengths)
    if re.match(r'^[0-9a-f]{16,64}$', seg, re.I):
        result["encoding"] = "hex"
        result["bits"] = len(seg) * 4
        result["decodable"] = False
        result["note"] = f"{result['bits']}-bit hex — likely hash or random key"
        return result

    # Base64-ish (URL-safe base64)
    if re.match(r'^[A-Za-z0-9_-]{16,}={0,2}$', seg) and len(seg) >= 16:
        result["encoding"] = "base64"
        result["bits"] = len(seg) * 6  # approximate
        result["decodable"] = True
        result["note"] = "Base64 (URL-safe) — may contain structured data"
        import base64
        try:
            decoded = base64.urlsafe_b64decode(seg + "==")
            if all(32 <= b < 127 for b in decoded):
                result["decoded_text"] = decoded.decode("ascii")
            else:
                result["decoded_hex"] = decoded.hex()
        except Exception:
            pass
        return result

    # Nanoid-style (alphanumeric, 21 chars default)
    if re.match(r'^[A-Za-z0-9_-]{10,30}$', seg):
        result["encoding"] = "nanoid"
        result["bits"] = int(len(seg) * 5.95)  # log2(64) ≈ 6 bits per char
        result["decodable"] = False
        result["note"] = f"Nanoid-style ({len(seg)} chars) — random, no embedded info"
        return result

    # Short numeric ID
    if re.match(r'^\d{1,20}$', seg):
        result["encoding"] = "integer"
        result["decodable"] = False
        result["note"] = "Sequential integer ID — reveals creation order, enumerable"
        return result

    # Default: slug/path segment
    result["encoding"] = "slug"
    result["decodable"] = True
    result["note"] = "Human-readable slug"
    return result


# === COMPARISON TABLE ===
def compare_schemes():
    """Print comparison of ID schemes across AI companies vs RoadID."""
    rid = RoadID()
    example = rid.generate("cece", "chat")

    rows = [
        ("OpenAI",      "UUIDv4",    36, "No",  "chat.openai.com/c/550e8400-e29b-..."),
        ("Claude",      "UUIDv4",    36, "No",  "claude.ai/chat/550e8400-e29b-..."),
        ("Perplexity",  "Base64",    22, "Partial", "perplexity.ai/search/abc123..."),
        ("Midjourney",  "UUIDv4",    36, "No",  "midjourney.com/app/jobs/550e84..."),
        ("Gemini",      "Hex",       32, "No",  "gemini.google.com/app/abc123def..."),
        ("HuggingFace", "Slug",      10, "Yes", "huggingface.co/spaces/org/name"),
        ("BlackRoad",   "RoadID",    len(example), "Yes", example),
    ]

    header = f"{'Company':<14} {'Scheme':<10} {'Len':>4} {'Decode':>7}  {'Example'}"
    print(header)
    print("-" * len(header))
    for company, scheme, length, decode, ex in rows:
        print(f"{company:<14} {scheme:<10} {length:>4} {decode:>7}  {ex}")


# === CLI ===
def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="RoadID — BlackRoad's self-describing identity system",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  roadid generate cece chat          # New chat ID on Cecilia
  roadid generate oct task -n 5      # 5 task IDs on Octavia
  roadid decode cece-chat-k4f2x1-7mq
  roadid explain cece-chat-k4f2x1-7mq
  roadid scan "https://chat.openai.com/c/550e8400-e29b-41d4-a716-446655440000"
  roadid compare                     # Show scheme comparison table
        """
    )
    sub = parser.add_subparsers(dest="command")

    # generate
    gen = sub.add_parser("generate", aliases=["gen", "g"], help="Generate new RoadID(s)")
    gen.add_argument("node", help="Node name (alice, cece, oct, aria, luci, mac, ana, gem)")
    gen.add_argument("type", help="Resource type (chat, sess, req, mod, task, file, msg, ...)")
    gen.add_argument("-n", "--count", type=int, default=1, help="Number of IDs to generate")
    gen.add_argument("-r", "--rand-len", type=int, default=3, help="Random suffix length (3-6)")

    # decode
    dec = sub.add_parser("decode", aliases=["d"], help="Decode a RoadID to JSON")
    dec.add_argument("id", help="RoadID to decode")

    # explain
    exp = sub.add_parser("explain", aliases=["e", "x"], help="Human-readable ID explanation")
    exp.add_argument("id", help="RoadID to explain")

    # scan
    scn = sub.add_parser("scan", aliases=["s"], help="Analyze external URL ID scheme")
    scn.add_argument("url", help="URL to analyze")

    # compare
    sub.add_parser("compare", aliases=["cmp", "c"], help="Compare ID schemes")

    # batch (shortcut)
    bat = sub.add_parser("batch", aliases=["b"], help="Generate batch of IDs")
    bat.add_argument("node")
    bat.add_argument("type")
    bat.add_argument("count", type=int, nargs="?", default=10)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    rid = RoadID()

    if args.command in ("generate", "gen", "g"):
        if args.count == 1:
            print(rid.generate(args.node, args.type, args.rand_len))
        else:
            for road_id in rid.batch(args.node, args.type, args.count, args.rand_len):
                print(road_id)

    elif args.command in ("decode", "d"):
        result = rid.decode(args.id)
        print(json.dumps(result, indent=2))

    elif args.command in ("explain", "e", "x"):
        print(rid.explain(args.id))

    elif args.command in ("scan", "s"):
        result = rid.scan_external(args.url)
        print(json.dumps(result, indent=2, default=str))

    elif args.command in ("compare", "cmp", "c"):
        compare_schemes()

    elif args.command in ("batch", "b"):
        for road_id in rid.batch(args.node, args.type, args.count):
            print(road_id)


if __name__ == "__main__":
    main()
