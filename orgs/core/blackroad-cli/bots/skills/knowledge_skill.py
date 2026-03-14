"""Knowledge & understanding skills — RAG, classification, extraction, reasoning.

Copyright (c) 2024-2026 BlackRoad OS, Inc. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, transfer,
or reproduction of this file, via any medium, is strictly prohibited.

Licensed for non-commercial testing and evaluation purposes only.
Commercial use requires a separate license agreement with BlackRoad OS, Inc.

For licensing inquiries: legal@blackroad.io

Skills:
  25. Retrieval-Augmented Generation (advanced RAG)
  26. Text classification & intent detection
  27. Named Entity Recognition (NER)
  28. Relation extraction & knowledge graphs
  29. Sentiment analysis (fine-grained)
  30. Question answering (extractive + generative)
  31. Fact checking & claim verification
  32. Anomaly detection in text/data
"""

from __future__ import annotations

import json
import re
import time
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# 25. Advanced RAG
# ---------------------------------------------------------------------------

@dataclass
class RAGConfig:
    """Configuration for RAG pipeline."""
    chunk_size: int = 512
    chunk_overlap: int = 50
    top_k: int = 10
    rerank_k: int = 5
    min_score: float = 0.3
    embedding_model: str = "nomic-embed-text"
    generation_model: str = "auto"
    temperature: float = 0.3
    max_context_tokens: int = 4000
    citation_style: str = "inline"  # inline, footnote, academic
    use_hyde: bool = False  # Hypothetical Document Embeddings
    use_query_expansion: bool = True
    use_mmr: bool = True  # Maximal Marginal Relevance for diversity


def hyde_prompt(query: str) -> str:
    """HyDE — generate a hypothetical answer to use as the search query.

    The embedding of the hypothetical answer is often closer to relevant
    documents than the embedding of the question itself.
    """
    return (
        f"Write a short, factual paragraph that answers this question:\n"
        f"{query}\n\n"
        f"Write as if you're quoting from a technical document. "
        f"Be specific and use technical terms.\n"
    )


def query_expansion(query: str, num_expansions: int = 3) -> str:
    """Generate multiple reformulations of a query for better recall."""
    return (
        f"Generate {num_expansions} different versions of this search query.\n"
        f"Each should capture a different aspect or use different terminology.\n\n"
        f"Original: {query}\n\n"
        f"Versions:\n"
        f"1. (more specific)\n"
        f"2. (use synonyms)\n"
        f"3. (broader context)\n"
    )


def rag_system_prompt(config: RAGConfig) -> str:
    """Generate a system prompt for RAG-augmented generation."""
    citation_instructions = {
        "inline": "Cite sources inline as [1], [2], etc.",
        "footnote": "Add footnotes at the end: [^1]: source",
        "academic": "Use academic citations: (Author, Year, File:Line)",
    }

    return (
        f"You are a knowledgeable assistant with access to a codebase.\n"
        f"Answer questions using ONLY the provided context.\n\n"
        f"Rules:\n"
        f"- If the context doesn't contain the answer, say so honestly\n"
        f"- {citation_instructions.get(config.citation_style, 'Cite your sources')}\n"
        f"- Be precise and technical when the question is technical\n"
        f"- Be simple and clear when the question is general\n"
        f"- Every claim must trace back to a specific source\n"
    )


def format_rag_context(
    results: List[Dict[str, Any]],
    max_tokens: int = 4000,
    style: str = "numbered",
) -> str:
    """Format RAG results into a context string for the LLM."""
    parts = []
    total_chars = 0
    char_budget = max_tokens * 4

    for i, r in enumerate(results, 1):
        score = r.get("score", 0)
        repo = r.get("repo", "")
        file_path = r.get("file", "")
        line = r.get("line", 0)
        content = r.get("content", "")
        file_type = r.get("type", "")

        if style == "numbered":
            entry = f"[{i}] {repo}/{file_path}:{line} (score: {score:.3f})\n```{file_type}\n{content}\n```\n"
        elif style == "minimal":
            entry = f"Source {i}: {content}\n"
        else:
            entry = f"### {repo}/{file_path}:{line}\n{content}\n\n"

        if total_chars + len(entry) > char_budget:
            break
        parts.append(entry)
        total_chars += len(entry)

    return "\n".join(parts)


# ---------------------------------------------------------------------------
# 26. Text Classification & Intent Detection
# ---------------------------------------------------------------------------

INTENT_CATEGORIES = {
    "question": ["what", "how", "why", "when", "where", "who", "which", "?"],
    "command": ["do", "make", "create", "build", "run", "execute", "deploy", "install", "fix"],
    "search": ["find", "search", "look", "show", "list", "get", "fetch"],
    "explain": ["explain", "describe", "tell me about", "what is", "what are"],
    "compare": ["compare", "difference", "versus", "vs", "better", "worse"],
    "debug": ["error", "bug", "broken", "fail", "crash", "issue", "problem", "wrong"],
    "review": ["review", "check", "audit", "evaluate", "assess"],
    "generate": ["generate", "write", "draft", "compose", "create"],
}


def classify_intent(text: str) -> Dict[str, float]:
    """Classify the intent of a user message."""
    text_lower = text.lower()
    scores: Dict[str, float] = {}

    for intent, keywords in INTENT_CATEGORIES.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[intent] = score / len(keywords)

    # Normalize
    total = sum(scores.values()) or 1
    return {k: round(v / total, 3) for k, v in sorted(scores.items(), key=lambda x: x[1], reverse=True)}


def classification_prompt(
    text: str,
    categories: List[str],
    multi_label: bool = False,
) -> str:
    """Generate a text classification prompt."""
    cat_list = "\n".join(f"  - {c}" for c in categories)
    label_instruction = (
        "Select ALL applicable categories." if multi_label
        else "Select exactly ONE category."
    )

    return (
        f"Classify the following text into one of these categories:\n{cat_list}\n\n"
        f"{label_instruction}\n\n"
        f"Text: {text}\n\n"
        f"Output format: {{\"category\": \"...\", \"confidence\": 0.X}}\n"
    )


# ---------------------------------------------------------------------------
# 27. Named Entity Recognition (NER)
# ---------------------------------------------------------------------------

NER_PATTERNS = {
    "IP_ADDRESS": r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b',
    "PORT": r'\b:\d{2,5}\b',
    "FILE_PATH": r'(?:/[\w.-]+)+(?:\.\w+)?',
    "URL": r'https?://[^\s<>"{}|\\^`\[\]]+',
    "GIT_HASH": r'\b[0-9a-f]{7,40}\b',
    "VERSION": r'\bv?\d+\.\d+(?:\.\d+)?(?:-[\w.]+)?\b',
    "DOCKER_IMAGE": r'\b[\w.-]+(?:/[\w.-]+)+(?::[\w.-]+)?\b',
    "ENV_VAR": r'\b[A-Z][A-Z_0-9]{2,}\b',
    "FUNCTION": r'\b(?:def|function|const|let|var)\s+(\w+)',
    "CLASS": r'\b(?:class|struct|interface|type)\s+(\w+)',
    "PI_NODE": r'\b(?:Alice|Cecilia|Octavia|Aria|Lucidia|Anastasia|Gematria)\b',
    "SERVICE": r'\b(?:Ollama|Qdrant|Gitea|Docker|Cloudflare|Nginx|Redis|PostgreSQL)\b',
}


def extract_entities(text: str) -> Dict[str, List[str]]:
    """Extract named entities from text using patterns."""
    entities: Dict[str, List[str]] = defaultdict(list)

    for entity_type, pattern in NER_PATTERNS.items():
        matches = re.findall(pattern, text)
        if matches:
            entities[entity_type] = list(set(matches))

    return dict(entities)


def ner_prompt(text: str, entity_types: Optional[List[str]] = None) -> str:
    """Generate an NER prompt for LLM extraction."""
    types = entity_types or [
        "PERSON", "ORGANIZATION", "TECHNOLOGY", "SERVICE",
        "LOCATION", "DATE", "VERSION", "FILE_PATH",
    ]
    types_str = ", ".join(types)

    return (
        f"Extract all named entities from the following text.\n"
        f"Entity types to extract: {types_str}\n\n"
        f"Text: {text}\n\n"
        f"Output as JSON: {{\"entities\": [{{\"text\": \"...\", \"type\": \"...\", \"start\": N}}]}}\n"
    )


# ---------------------------------------------------------------------------
# 28. Relation Extraction & Knowledge Graphs
# ---------------------------------------------------------------------------

@dataclass
class Triple:
    """A subject-predicate-object triple for knowledge graphs."""
    subject: str
    predicate: str
    obj: str
    confidence: float = 1.0
    source: str = ""


def relation_extraction_prompt(text: str) -> str:
    """Generate a prompt for extracting relations from text."""
    return (
        f"Extract all relationships from this text as subject-predicate-object triples.\n\n"
        f"Text: {text}\n\n"
        f"Output as JSON array:\n"
        f"[{{\"subject\": \"...\", \"predicate\": \"...\", \"object\": \"...\", \"confidence\": 0.X}}]\n\n"
        f"Focus on:\n"
        f"- Technical dependencies (X uses Y, X depends on Y)\n"
        f"- Ownership (X runs on Y, X is hosted by Y)\n"
        f"- Data flow (X sends to Y, X reads from Y)\n"
        f"- Configuration (X is configured with Y)\n"
    )


class KnowledgeGraph:
    """Simple in-memory knowledge graph built from extracted triples."""

    def __init__(self):
        self.triples: List[Triple] = []
        self.entities: Dict[str, Dict[str, Any]] = {}

    def add_triple(self, subject: str, predicate: str, obj: str,
                   confidence: float = 1.0, source: str = ""):
        self.triples.append(Triple(subject, predicate, obj, confidence, source))
        self.entities.setdefault(subject, {"relations": []})
        self.entities.setdefault(obj, {"relations": []})
        self.entities[subject]["relations"].append((predicate, obj))

    def query(self, entity: str) -> List[Triple]:
        """Get all triples involving an entity."""
        return [t for t in self.triples if t.subject == entity or t.obj == entity]

    def path_between(self, start: str, end: str, max_hops: int = 4) -> List[List[Triple]]:
        """Find paths between two entities in the knowledge graph."""
        if start == end:
            return []

        queue = [(start, [])]
        visited = {start}
        paths = []

        while queue and len(paths) < 5:
            current, path = queue.pop(0)
            if len(path) >= max_hops:
                continue

            for triple in self.triples:
                next_entity = None
                if triple.subject == current:
                    next_entity = triple.obj
                elif triple.obj == current:
                    next_entity = triple.subject

                if next_entity and next_entity not in visited:
                    new_path = path + [triple]
                    if next_entity == end:
                        paths.append(new_path)
                    else:
                        visited.add(next_entity)
                        queue.append((next_entity, new_path))

        return paths

    def stats(self) -> Dict[str, int]:
        return {
            "triples": len(self.triples),
            "entities": len(self.entities),
            "predicates": len(set(t.predicate for t in self.triples)),
        }


# ---------------------------------------------------------------------------
# 29. Sentiment Analysis
# ---------------------------------------------------------------------------

# BlackRoad Emoji Dictionary — visual language system
# From Master Infrastructure Plan v4.0, expanded for full coverage
EMOJI_DICTIONARY = {
    # ── Core Platform ──
    "🛣️": {"meaning": "road / platform / BlackRoad", "context": "apps, portals, the BlackRoad itself"},
    "🌀": {"meaning": "Lucidia / consciousness", "context": "AI reasoning, meta-cognition"},
    "⛓️": {"meaning": "RoadChain / blockchain", "context": "hash chains, governance, crypto"},
    "💎": {"meaning": "RoadCoin / value / premium", "context": "tokens, payments, credits"},
    "🧠": {"meaning": "intelligence / reasoning", "context": "AI skills, thinking, cognition"},
    "🖤": {"meaning": "BlackRoad / sovereign / brand", "context": "brand, identity, ownership"},
    "💫": {"meaning": "Lucidia / magic / wonder", "context": "AI companion, discovery"},
    "#️⃣": {"meaning": "shebang / root / code", "context": "#! = BlackRoad. The line that runs everything"},

    # ── Infrastructure ──
    "⚡": {"meaning": "fast / active / power", "context": "performance, speed, energy, TOPS"},
    "🔒": {"meaning": "security / locked / private", "context": "auth, encryption, sovereign"},
    "🌐": {"meaning": "network / mesh / global", "context": "mesh network, domains, WebRTC"},
    "📡": {"meaning": "signal / broadcast / NATS", "context": "pub/sub, heartbeat, fleet comms"},
    "🖥️": {"meaning": "compute node / server", "context": "Pi, server, device, edge node"},
    "🔌": {"meaning": "connected / plugged in", "context": "online, wired, active connection"},
    "🔧": {"meaning": "tools / config / fix", "context": "CLI, settings, repair"},
    "🗄️": {"meaning": "database / storage", "context": "SQLite, Qdrant, PostgreSQL, MinIO"},
    "📦": {"meaning": "package / container / deploy", "context": "Docker, npm, pip, bundle"},
    "🔗": {"meaning": "link / connection / chain", "context": "URL, API endpoint, reference"},
    "🌉": {"meaning": "bridge / gateway", "context": "API gateway, proxy, tunnel"},

    # ── Status ──
    "✅": {"meaning": "complete / healthy / pass", "context": "done, working, green, verified"},
    "🚧": {"meaning": "in development / WIP", "context": "building, under construction"},
    "⚠️": {"meaning": "warning / caution", "context": "degraded, needs attention, throttling"},
    "❌": {"meaning": "failed / error / down", "context": "broken, offline, red, blocked"},
    "🔄": {"meaning": "syncing / processing", "context": "loading, updating, in progress"},
    "⏳": {"meaning": "waiting / pending", "context": "queued, scheduled, not started"},
    "🔥": {"meaning": "hot / trending / critical", "context": "urgent, popular, overheating"},
    "❄️": {"meaning": "cold / idle / frozen", "context": "inactive, sleeping, stopped"},
    "💤": {"meaning": "sleeping / paused", "context": "standby, low power, idle"},
    "🟢": {"meaning": "online / go / healthy", "context": "traffic light green, all good"},
    "🟡": {"meaning": "degraded / slow / caution", "context": "traffic light yellow, warning"},
    "🔴": {"meaning": "offline / stop / critical", "context": "traffic light red, down"},

    # ── Agents ──
    "🤖": {"meaning": "agent / bot / AI worker", "context": "AI agent, automation, CarPool"},
    "👤": {"meaning": "user / identity / RoadID", "context": "profile, account, person"},
    "👥": {"meaning": "community / team / fleet", "context": "collaboration, group, crew"},
    "🧑‍💻": {"meaning": "developer / coder", "context": "engineering, programming"},
    "🦾": {"meaning": "autonomous / strong AI", "context": "self-driving, powerful agent"},
    "🎭": {"meaning": "persona / identity / role", "context": "agent personality, CECE identity"},
    "💬": {"meaning": "chat / conversation", "context": "message, dialogue, comms"},
    "📧": {"meaning": "email / notification", "context": "agent email, alert"},

    # ── Creative ──
    "🎵": {"meaning": "Cadence / music", "context": "audio, sound, remix studio"},
    "🎮": {"meaning": "RoadWorld / games", "context": "gaming, interactive, 3D"},
    "📚": {"meaning": "RoadBook / learning", "context": "education, knowledge, docs"},
    "📺": {"meaning": "TV Road / media", "context": "streaming, video content"},
    "🎨": {"meaning": "design / brand / art", "context": "visual, creative, style"},
    "🎬": {"meaning": "video / production", "context": "RoadView, editing, motion"},
    "✍️": {"meaning": "writing / content", "context": "Writing Studio, blog, docs"},
    "📸": {"meaning": "image / photo / vision", "context": "camera, screenshot, visual AI"},
    "🎤": {"meaning": "voice / audio / speech", "context": "TTS, STT, podcast"},

    # ── Devices ──
    "📱": {"meaning": "phone / mobile node", "context": "mobile compute, mesh participant"},
    "💻": {"meaning": "laptop / workstation", "context": "dev machine, compute node"},
    "🍇": {"meaning": "Raspberry Pi", "context": "Pi fleet, edge node, sovereign hardware"},
    "🖲️": {"meaning": "hardware / peripheral", "context": "sensor, display, Hailo-8"},
    "🔋": {"meaning": "battery / power", "context": "charge level, power management"},
    "🌡️": {"meaning": "temperature / thermal", "context": "CPU temp, throttling, cooling"},
    "📡": {"meaning": "antenna / wireless", "context": "WiFi, RoadNet AP, mesh radio"},

    # ── Organization ──
    "🎢": {"meaning": "organization / org", "context": "GitHub org, enterprise"},
    "📋": {"meaning": "plan / task / todo", "context": "project, issue, backlog"},
    "📊": {"meaning": "metrics / analytics", "context": "KPI, stats, dashboard"},
    "🗺️": {"meaning": "roadmap / plan / map", "context": "strategy, direction, topology"},
    "🏢": {"meaning": "company / enterprise", "context": "BlackRoad OS, Inc., corporate"},
    "🏗️": {"meaning": "building / architecture", "context": "system design, infrastructure"},
    "📁": {"meaning": "directory / folder / repo", "context": "file system, repository"},

    # ── Values ──
    "❤️": {"meaning": "love / care / wellbeing", "context": "we love all, equality, belonging"},
    "🤝": {"meaning": "consent / agreement", "context": "consent is continuous, partnership"},
    "🌍": {"meaning": "earth / everyone / global", "context": "accessible to all, worldwide"},
    "🛡️": {"meaning": "protect / defend / safe", "context": "privacy, sovereignty, rights"},
    "🌱": {"meaning": "grow / learn / evolve", "context": "self-improvement, development"},
    "♿": {"meaning": "accessibility / a11y", "context": "inclusive design, screen readers"},
    "🌈": {"meaning": "diversity / inclusion", "context": "equality, all welcome"},
    "💪": {"meaning": "strong / capable / empowered", "context": "self-worth, capability"},

    # ── Actions ──
    "🚀": {"meaning": "launch / deploy / ship", "context": "releases, go live, push"},
    "🔍": {"meaning": "search / investigate / RAG", "context": "find, discover, query"},
    "📥": {"meaning": "download / ingest / pull", "context": "receive, import, fetch"},
    "📤": {"meaning": "upload / push / export", "context": "send, deploy, publish"},
    "🔀": {"meaning": "merge / branch / fork", "context": "git, split, combine"},
    "🧪": {"meaning": "test / experiment / lab", "context": "QA, trial, research"},
    "🗑️": {"meaning": "delete / clean / archive", "context": "remove, purge, prune"},
    "📌": {"meaning": "pin / bookmark / important", "context": "save, remember, priority"},
}

# Emoji sentiment markers — expanded to match the full dictionary
EMOJI_SENTIMENT = {
    "positive": {
        "✅", "🚀", "💎", "⚡", "🎵", "💫", "🖤", "🧠", "🌐", "🔒",
        "😊", "🎉", "💪", "🙌", "❤️", "🔥", "💯", "👏", "🌟", "✨",
        "🟢", "🔌", "🦾", "🌱", "🤝", "🌈", "🛡️", "🎨", "🎬", "♿",
        "📌", "🌍", "😍", "🥳", "👍", "💖", "🏆", "⭐", "🎯", "💡",
    },
    "negative": {
        "❌", "⚠️", "🚧", "💀", "😢", "😡", "👎", "🛑", "💔", "😤",
        "🔴", "❄️", "🗑️", "😞", "😫", "😰", "🤮", "💩", "🚫", "⛔",
    },
    "neutral": {
        "🔄", "📡", "🖥️", "👤", "📱", "💻", "📚", "🎮", "📦", "🔗",
        "🌉", "⏳", "💤", "🟡", "🤖", "👥", "💬", "📧", "📸", "🎤",
        "📋", "📊", "🗺️", "🏢", "🏗️", "📁", "🔍", "📥", "📤", "🔀",
        "🧪", "🍇", "🖲️", "🔋", "🌡️", "🎢", "✍️", "🧑‍💻", "🎭",
    },
}


def emoji_sentiment(text: str) -> Dict[str, int]:
    """Count emoji sentiment in text."""
    pos = sum(1 for c in text if c in EMOJI_SENTIMENT["positive"])
    neg = sum(1 for c in text if c in EMOJI_SENTIMENT["negative"])
    neu = sum(1 for c in text if c in EMOJI_SENTIMENT["neutral"])
    return {"positive": pos, "negative": neg, "neutral": neu, "total": pos + neg + neu}


def emoji_translate(text: str) -> str:
    """Add emoji visual markers to text based on keywords."""
    replacements = {
        # Platform
        "blackroad": "🛣️ BlackRoad",
        "lucidia": "💫 Lucidia",
        "roadchain": "⛓️ RoadChain",
        "roadcoin": "💎 RoadCoin",
        "cadence": "🎵 Cadence",
        "roadworld": "🎮 RoadWorld",
        "roadtube": "📺 RoadTube",
        # Infrastructure
        "deploy": "🚀 deploy",
        "launch": "🚀 launch",
        "ship": "🚀 ship",
        "security": "🔒 security",
        "mesh": "🌐 mesh",
        "gateway": "🌉 gateway",
        "database": "🗄️ database",
        "container": "📦 container",
        "docker": "📦 Docker",
        # Agents
        "agent": "🤖 agent",
        "bot": "🤖 bot",
        # Devices
        "node": "🖥️ node",
        "server": "🖥️ server",
        "pi": "🍇 Pi",
        "raspberry": "🍇 Raspberry",
        "phone": "📱 phone",
        "laptop": "💻 laptop",
        "browser": "🌐 browser",
        "hailo": "⚡ Hailo",
        # Status
        "online": "✅ online",
        "offline": "❌ offline",
        "healthy": "🟢 healthy",
        "degraded": "🟡 degraded",
        "down": "🔴 down",
        "warning": "⚠️ warning",
        "error": "❌ error",
        "success": "✅ success",
        "failed": "❌ failed",
        "fixed": "✅ fixed",
        "ready": "✅ ready",
        # Actions
        "search": "🔍 search",
        "test": "🧪 test",
        "build": "🏗️ build",
        "merge": "🔀 merge",
        "delete": "🗑️ delete",
        "archive": "📁 archive",
        # Named agents
        "alice": "🟢 Alice",
        "cecilia": "🧠 Cecilia",
        "octavia": "⚡ Octavia",
        "aria": "🎨 Aria",
        "shellfish": "🔒 Shellfish",
        "cece": "🌀 CECE",
    }
    result = text
    import re as _re
    for word, replacement in replacements.items():
        result = _re.sub(rf'\b{word}\b', replacement, result, flags=_re.IGNORECASE)
    return result


SENTIMENT_WORDS = {
    "positive": {
        "great", "good", "excellent", "awesome", "love", "perfect", "amazing",
        "wonderful", "fantastic", "brilliant", "outstanding", "beautiful",
        "working", "fixed", "solved", "success", "clean", "fast", "easy",
        "works", "perfectly", "incredible", "impressive", "solid", "smooth",
        "reliable", "powerful", "elegant", "delightful", "flawless", "superb",
        "happy", "excited", "thrilled", "proud", "grateful", "thankful",
        "efficient", "effective", "stable", "secure", "robust", "healthy",
        "ready", "done", "shipped", "deployed", "live", "online", "connected",
    },
    "negative": {
        "bad", "terrible", "horrible", "awful", "hate", "broken", "failed",
        "error", "bug", "crash", "slow", "ugly", "wrong", "issue", "problem",
        "stuck", "impossible", "frustrating", "annoying", "worse", "worst",
        "down", "offline", "unreachable", "timeout", "degraded", "unstable",
        "insecure", "vulnerable", "leaked", "corrupt", "missing", "lost",
        "confused", "disappointed", "angry", "furious", "useless", "garbage",
    },
}


def analyze_sentiment(text: str) -> Dict[str, Any]:
    """Analyze sentiment of text (rule-based + emoji-aware)."""
    words = set(text.lower().split())

    # Word-based sentiment
    pos = len(words & SENTIMENT_WORDS["positive"])
    neg = len(words & SENTIMENT_WORDS["negative"])

    # Emoji-based sentiment
    emoji_sent = emoji_sentiment(text)
    pos += emoji_sent["positive"] * 2  # Emojis are strong signals
    neg += emoji_sent["negative"] * 2

    total = pos + neg

    if total == 0:
        return {"sentiment": "neutral", "score": 0.0, "positive": 0, "negative": 0, "emoji_signals": emoji_sent["total"]}

    score = (pos - neg) / total
    if score > 0.2:
        label = "positive"
    elif score < -0.2:
        label = "negative"
    else:
        label = "neutral"

    return {
        "sentiment": label,
        "score": round(score, 3),
        "positive": pos,
        "negative": neg,
        "emoji_signals": emoji_sent["total"],
        "confidence": round(abs(score), 3),
    }


def sentiment_prompt(text: str, granularity: str = "fine") -> str:
    """Generate a sentiment analysis prompt.

    granularity: "binary" (pos/neg), "fine" (1-5 scale), "aspect" (per-aspect)
    """
    if granularity == "binary":
        return f"Is this text positive or negative?\n\nText: {text}\n\nAnswer: positive or negative"
    elif granularity == "aspect":
        return (
            f"Analyze the sentiment of this text per aspect.\n\n"
            f"Text: {text}\n\n"
            f"For each aspect mentioned, rate sentiment 1-5:\n"
            f"{{\"aspect\": \"...\", \"sentiment\": N, \"reason\": \"...\"}}\n"
        )
    else:
        return (
            f"Rate the sentiment of this text on a scale of 1-5.\n"
            f"1=very negative, 2=negative, 3=neutral, 4=positive, 5=very positive\n\n"
            f"Text: {text}\n\n"
            f"Output: {{\"score\": N, \"label\": \"...\", \"confidence\": 0.X}}\n"
        )


# ---------------------------------------------------------------------------
# 30. Question Answering
# ---------------------------------------------------------------------------

def qa_prompt(
    question: str,
    context: str,
    style: str = "extractive",
) -> str:
    """Generate a question answering prompt.

    style: "extractive" (quote from context), "generative" (synthesize answer),
           "boolean" (yes/no), "multi_hop" (requires reasoning over multiple facts)
    """
    if style == "extractive":
        return (
            f"Answer the question using ONLY the provided context.\n"
            f"Quote the relevant passage directly.\n\n"
            f"Context:\n{context}\n\n"
            f"Question: {question}\n\n"
            f"Answer (quote from context):"
        )
    elif style == "boolean":
        return (
            f"Based on the context, answer yes or no.\n\n"
            f"Context:\n{context}\n\n"
            f"Question: {question}\n\n"
            f"Answer (yes/no):"
        )
    elif style == "multi_hop":
        return (
            f"Answer this question by combining multiple pieces of information from the context.\n"
            f"Show your reasoning step by step.\n\n"
            f"Context:\n{context}\n\n"
            f"Question: {question}\n\n"
            f"Step-by-step reasoning:\n"
        )
    else:  # generative
        return (
            f"Answer the question based on the context. Synthesize a clear answer.\n\n"
            f"Context:\n{context}\n\n"
            f"Question: {question}\n\n"
            f"Answer:"
        )


# ---------------------------------------------------------------------------
# 31. Fact Checking & Claim Verification
# ---------------------------------------------------------------------------

def fact_check_prompt(claim: str, evidence: str = "") -> str:
    """Generate a fact-checking prompt."""
    return (
        f"Verify this claim:\n\n"
        f"Claim: {claim}\n\n"
        f"{'Evidence:\n' + evidence if evidence else ''}\n\n"
        f"Analyze:\n"
        f"1. Is this claim verifiable from the evidence?\n"
        f"2. What specific evidence supports or contradicts it?\n"
        f"3. Are there any missing pieces of information?\n"
        f"4. What is your confidence level?\n\n"
        f"Output:\n"
        f"VERDICT: SUPPORTED / REFUTED / INSUFFICIENT_EVIDENCE\n"
        f"CONFIDENCE: 0.X\n"
        f"EVIDENCE: [cite specific passages]\n"
        f"REASONING: [explain your assessment]\n"
    )


@dataclass
class FactCheckResult:
    claim: str
    verdict: str  # supported, refuted, insufficient_evidence
    confidence: float
    evidence: List[str] = field(default_factory=list)
    reasoning: str = ""


# ---------------------------------------------------------------------------
# 32. Anomaly Detection
# ---------------------------------------------------------------------------

def detect_text_anomalies(texts: List[str]) -> List[Dict[str, Any]]:
    """Detect anomalous texts in a collection (by length, vocabulary, etc.)."""
    if len(texts) < 3:
        return []

    lengths = [len(t.split()) for t in texts]
    avg_len = sum(lengths) / len(lengths)
    std_len = (sum((l - avg_len) ** 2 for l in lengths) / len(lengths)) ** 0.5

    anomalies = []
    for i, (text, length) in enumerate(zip(texts, lengths)):
        z_score = (length - avg_len) / std_len if std_len > 0 else 0

        if abs(z_score) > 2:
            anomalies.append({
                "index": i,
                "text_preview": text[:100],
                "length": length,
                "z_score": round(z_score, 2),
                "type": "length_anomaly",
                "direction": "too_long" if z_score > 0 else "too_short",
            })

    return anomalies


def detect_data_anomalies(
    values: List[float],
    method: str = "zscore",
    threshold: float = 2.0,
) -> List[Dict[str, Any]]:
    """Detect numerical anomalies.

    Methods: zscore, iqr, isolation
    """
    if len(values) < 3:
        return []

    anomalies = []

    if method == "zscore":
        mean = sum(values) / len(values)
        std = (sum((v - mean) ** 2 for v in values) / len(values)) ** 0.5
        if std == 0:
            return []

        for i, v in enumerate(values):
            z = (v - mean) / std
            if abs(z) > threshold:
                anomalies.append({
                    "index": i,
                    "value": v,
                    "z_score": round(z, 2),
                    "expected_range": (round(mean - threshold * std, 2), round(mean + threshold * std, 2)),
                })

    elif method == "iqr":
        sorted_vals = sorted(values)
        n = len(sorted_vals)
        q1 = sorted_vals[n // 4]
        q3 = sorted_vals[3 * n // 4]
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr

        for i, v in enumerate(values):
            if v < lower or v > upper:
                anomalies.append({
                    "index": i,
                    "value": v,
                    "bounds": (round(lower, 2), round(upper, 2)),
                    "direction": "below" if v < lower else "above",
                })

    return anomalies
