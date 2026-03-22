"""Utility agent capable of ideating stories and lightweight games."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import ClassVar, Iterable, Sequence

import sys

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parent))
    from consent_policy import ConsentRecord, ensure_full_consent  # type: ignore
else:  # pragma: no cover - executed when the package is installed
    from .consent_policy import ConsentRecord, ensure_full_consent

DEFAULT_SUPPORTED_ENGINES: tuple[str, ...] = ("unity", "unreal")

_OPERATION_SCOPE_MAP: dict[str, str] = {
    "deploy": "agent:deploy",
    "create_game": "game:create",
    "generate_game_idea": "story:ideate",
    "generate_story": "story:create",
    "generate_story_series": "story:create",
    "generate_coding_challenge": "content:create",
    "generate_code_snippet": "code:suggest",
    "proofread_paragraph": "content:edit",
    "validate_scopes": "consent:validate",
    "add_supported_engine": "agent:configure",
    "remove_supported_engine": "agent:configure",
    "set_gamma": "agent:configure",
    "write_novel": "story:create",
}

_BASE_CONSENT_SCOPES = {"outline:read", "outline:write"}
DEFAULT_CONSENT_SCOPES = frozenset(
    _BASE_CONSENT_SCOPES.union(_OPERATION_SCOPE_MAP.values())
)
"""Simple auto novel agent example with game creation abilities."""
"""Simple auto novel agent example with game creation abilities.

This module defines :class:`AutoNovelAgent`, a minimal agent capable of
deploying itself, creating weapon‑free games, and now generating tiny novels
for demonstration purposes.
"""Simple auto novel agent example with game creation abilities.

This module defines :class:`AutoNovelAgent`, a tiny demonstration agent that can
deploy itself, create weapon‑free games in supported engines, and draft novel
outlines.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import ClassVar


@dataclass(frozen=True, slots=True)
class GameRecord:
    """Record describing a game created by :class:`AutoNovelAgent`."""

    engine: str
    created_at: datetime
    message: str
from dataclasses import dataclass, field
from typing import Final, List


DEFAULT_SUPPORTED_ENGINES: Final[tuple[str, ...]] = ("unity", "unreal")
from typing import ClassVar
from typing import ClassVar, Dict, Iterator

DEFAULT_SUPPORTED_ENGINES: tuple[str, ...] = ("unity", "unreal")
from typing import ClassVar


@dataclass
class AutoNovelAgent:
    """A small agent that can build games and craft stories."""
    """A toy agent that can deploy itself, create simple games, and write novels."""
    """A toy agent that can deploy itself and create simple games or stories."""
    """A toy agent that can deploy itself, create simple games and novels."""

    name: str = "AutoNovelAgent"
    gamma: float = 1.0
    _supported_engines: set[str] = field(
        default_factory=lambda: set(DEFAULT_SUPPORTED_ENGINES)
    )
    consent: ConsentRecord = field(
        default_factory=lambda: ConsentRecord.full(
            scopes=DEFAULT_CONSENT_SCOPES,
            evidence="AutoNovelAgent default configuration",
        )
    )
    _created_games: list[str] = field(default_factory=list, init=False, repr=False)
    SUPPORTED_ENGINES: ClassVar[set[str]] = {"unity", "unreal"}
    games: list[GameRecord] = field(default_factory=list)

    SAMPLE_SNIPPETS: ClassVar[dict[str, str]] = {
        "python": "def solve():\n    # TODO: Implement addition\n    pass\n",
        "javascript": "function solve() {\n  // TODO: Implement addition\n  return null;\n}\n",
        "java": (
            "class Solution {\n"
            "    void solve() {\n"
            "        // TODO: Implement addition\n"
            "    }\n"
            "}\n"
        ),
    }
    OPERATION_SCOPE_MAP: ClassVar[dict[str, str]] = dict(_OPERATION_SCOPE_MAP)
    LEAST_PRIVILEGE_SCOPES: ClassVar[set[str]] = set(DEFAULT_CONSENT_SCOPES)
    supported_engines: set[str] = field(
        default_factory=lambda: set(DEFAULT_SUPPORTED_ENGINES)
    )

    def __post_init__(self) -> None:
        if self.gamma <= 0:
            raise ValueError("gamma must be positive.")
        self._supported_engines = {
            self._normalize_engine(engine) for engine in self._supported_engines
        }
        ensure_full_consent(
            self.consent,
            scope=self.OPERATION_SCOPE_MAP.get("deploy"),
            actor=f"{self.name}.bootstrap",
        )

    # ------------------------------------------------------------------
    # Consent helpers
    # ------------------------------------------------------------------
    def _require_scope(self, operation: str) -> None:
        """Ensure the agent has full consent for the requested operation."""

        ensure_full_consent(
            self.consent,
            scope=self.OPERATION_SCOPE_MAP.get(operation),
            actor=f"{self.name}.{operation}",
        )

    # ------------------------------------------------------------------
    # Engine helpers
    # ------------------------------------------------------------------
    def _normalize_engine(self, engine: str) -> str:
        """Return a lowercase, trimmed engine name."""

        engine_normalized = engine.strip().lower()
        if not engine_normalized:
            raise ValueError("Engine name must be a non-empty string.")
        return engine_normalized

    def supports_engine(self, engine: str) -> bool:
        """Return ``True`` when ``engine`` is present in the supported set."""

        try:
            return self._normalize_engine(engine) in self._supported_engines
        except ValueError:
            return False

    def list_supported_engines(self) -> list[str]:
        """Return a sorted snapshot of supported engines."""

        return sorted(self.supported_engines)
        Args:
            engine: Name of the engine to verify.
        """
        return engine.lower() in self.supported_engines
        return sorted(self._supported_engines)

    def add_supported_engine(self, engine: str) -> None:
        """Register a new game engine."""

        self._require_scope("add_supported_engine")
        self.supported_engines.add(self._normalize_engine(engine))
        self._supported_engines.add(self._normalize_engine(engine))

    def remove_supported_engine(self, engine: str) -> None:
        """Remove an engine from the supported set."""
        Args:
            engine: Name of the engine to add.
        """
        self.supported_engines.add(engine.lower())

    def remove_supported_engine(self, engine: str) -> None:
        """Remove an engine from the supported list.

        Engines are matched in a case-insensitive manner.

        Args:
            engine: Name of the engine to remove.

        Raises:
            ValueError: If the engine is not currently supported.
        """
        normalized = engine.lower()
        if normalized not in self.supported_engines:
            raise ValueError(f"{engine} is not a supported engine.")
        self.supported_engines.remove(normalized)

        self._require_scope("remove_supported_engine")
        normalized = self._normalize_engine(engine)
        if normalized not in self.supported_engines:
            raise ValueError(f"Engine '{engine}' is not currently supported.")
        self.supported_engines.remove(normalized)
        if normalized not in self._supported_engines:
            supported = ", ".join(self.list_supported_engines())
            raise ValueError(
                f"Cannot remove unsupported engine '{normalized}'. "
                f"Supported engines: {supported}."
            )
        self._supported_engines.remove(normalized)

    @property
    def SUPPORTED_ENGINES(self) -> set[str]:
        """Return the set of engines supported by this agent instance."""

        return set(self._supported_engines)

    # ------------------------------------------------------------------
    # Capabilities
    # ------------------------------------------------------------------
    def deploy(self) -> str:
        """Return a message indicating the agent is ready for use."""

        self._require_scope("deploy")
        return f"{self.name} ready to generate novels!"
        if not engine_name:
            return "a"
        lower = engine_name.lower()
        if lower.startswith(("honest", "hour", "heir")):
            return "an"
        return "an" if lower[0] in "aeiou" else "a"

    def create_game(self, engine: str, include_weapons: bool = False) -> str:
        """Create a basic game using a supported engine without weapons."""

        self._require_scope("create_game")
        normalized = self._normalize_engine(engine)
        if normalized not in self.supported_engines:
        Args:
            engine: Game engine to use.
            include_weapons: If ``True``, raise a ``ValueError`` because weapons
                are not allowed.

        Raises:
            ValueError: If ``engine`` is not supported or ``include_weapons`` is
                ``True``.
        """
        engine_lower = engine.lower()
        if not self.supports_engine(engine_lower):
            supported = ", ".join(sorted(self.supported_engines))
            raise ValueError(f"Unsupported engine. Choose one of: {supported}.")
        if engine_lower not in self.SUPPORTED_ENGINES:
            supported = ", ".join(sorted(self.SUPPORTED_ENGINES))
            raise ValueError(
                f"Unsupported engine '{engine}'. Choose one of: {supported}."
            )
        if include_weapons:
            raise ValueError("Weapons are not allowed in generated games.")
        message = f"Creating a {normalized.capitalize()} game without weapons..."
        self._created_games.append(normalized)
        message = f"Creating a {engine_lower.capitalize()} game without weapons..."
        if normalized not in self._supported_engines:
            supported = ", ".join(self.list_supported_engines())
            raise ValueError(
                "Unsupported engine "
                f"'{normalized}'. Supported engines: {supported}. "
                "Use add_supported_engine to register new engines."
            )
        if include_weapons:
            raise ValueError("Weapons are not allowed in generated games.")

        article = self._indefinite_article(normalized)
        message = f"Creating {article} {normalized.capitalize()} game without weapons..."
        print(message)
        self.games.append(
            GameRecord(
                engine=engine_lower,
                created_at=datetime.utcnow(),
                message=message,
            )
        )
        return message

    def generate_story_series(
        self, genres: Sequence[str], *, protagonist: str
    ) -> list[str]:
        """Return a series of story snippets for the supplied ``genres``."""

        self._require_scope("generate_story_series")
        if not protagonist.strip():
            raise ValueError("Protagonist must be a non-empty string.")
        stories = []
        for index, genre in enumerate(genres, start=1):
            topic = genre.strip() or "untitled"
            stories.append(
                f"Episode {index} ({topic}): {protagonist} faces an unexpected twist."
            )
        return stories

    def generate_code_snippet(self, prompt: str, *, language: str = "python") -> str:
        """Return a starter code snippet for the given ``language``."""

        self._require_scope("generate_code_snippet")
        lang_key = language.strip().lower()
        try:
            template = self.SAMPLE_SNIPPETS[lang_key]
        except KeyError as exc:  # pragma: no cover - defensive guard
            supported = ", ".join(sorted(self.SAMPLE_SNIPPETS))
            raise ValueError(f"Unsupported language: {language}. [{supported}]") from exc
        header = f"# {prompt.strip() or 'TODO'}\n"
        return header + template

    def validate_scopes(self, scopes: Iterable[str]) -> frozenset[str]:
        """Validate ``scopes`` returning the normalised set."""

        self._require_scope("validate_scopes")
        cleaned = {scope.strip() for scope in scopes}
        if not cleaned or any(not scope for scope in cleaned):
            raise ValueError("Invalid scopes: empty values are not allowed.")
        if not cleaned.issubset(self.LEAST_PRIVILEGE_SCOPES):
            raise ValueError("Invalid scopes requested.")
        return frozenset(cleaned)

    def set_gamma(self, value: float) -> None:
        """Update the novelty factor used by the agent."""

        self._require_scope("set_gamma")
        if value <= 0:
            raise ValueError("gamma must be positive.")
        self.gamma = value

    def write_novel(self, title: str, chapters: int = 3) -> list[str]:
        """Return a simple outline for a multi-chapter novel."""

        self._require_scope("write_novel")
        if chapters <= 0:
            raise ValueError("At least one chapter is required.")
        title_clean = title.strip() or "Untitled"
        return [f"Chapter {index}: TBD" for index in range(1, chapters + 1)]

    def generate_storyline(self, protagonist: str, setting: str) -> str:
        """Generate a simple storyline for a given protagonist and setting.
        """Remove a game engine if it is currently supported.

        Args:
            engine: Name of the engine to remove.
        """
        self.SUPPORTED_ENGINES.discard(engine.lower())

    def list_supported_engines(self) -> list[str]:
    def list_supported_engines(self) -> List[str]:
    def list_supported_engines(self) -> list[str]:
        """Return a list of supported game engines."""
        return sorted(self.supported_engines)

    def generate_story(self, theme: str, protagonist: str = "An adventurer") -> str:
        """Generate a short themed story.

        Args:
            protagonist: Name of the main character.
            setting: Location where the story takes place.

        Returns:
            A short storyline sentence.
        """
        return (
            f"{protagonist} embarks on an adventure in {setting}, "
            "discovering the true meaning of courage."
            A short story string.

        Raises:
            ValueError: If ``theme`` is empty or only whitespace.
            TypeError: If ``theme`` or ``protagonist`` are not strings.
        """
        if not isinstance(theme, str):
            raise TypeError("Theme must be provided as a string.")
        if not isinstance(protagonist, str):
            raise TypeError("Protagonist must be provided as a string.")

        normalized_theme = theme.strip()
        if not normalized_theme:
            raise ValueError("Theme must be a non-empty string.")
        normalized_protagonist = protagonist.strip() or "An unnamed protagonist"
        return (
            f"{normalized_protagonist} set out on a {normalized_theme} journey, discovering "
            f"wonders along the way."
    def generate_game_idea(self, theme: str, engine: str) -> str:
        """Return a short description for a themed game."""

        theme_clean = theme.strip()
        if not theme_clean:
            raise ValueError("Theme must be a non-empty string.")

        normalized = self._normalize_engine(engine)
        if normalized not in self._supported_engines:
            supported = ", ".join(self.list_supported_engines())
            raise ValueError(f"Unsupported engine. Choose one of: {supported}.")

        return (
            f"Imagine a {theme_clean} adventure crafted with "
            f"{normalized.capitalize()} where creativity reigns."
        )

    def generate_story(self, theme: str, protagonist: str) -> str:
        """Generate a short themed story."""

        clean_theme = " ".join(theme.split())
        clean_protagonist = protagonist.strip() or "Someone"
        if not clean_theme:
            raise ValueError("Theme must be provided.")
        return (
            f"{clean_protagonist} embarked on a {clean_theme} quest, "
            "discovering wonders along the way."
        )

    def generate_coding_challenge(self, topic: str, difficulty: str) -> str:
        """Return a coding challenge prompt."""

        topic_clean = topic.strip()
        if not topic_clean:
            raise ValueError("Topic must be provided.")

        difficulty_clean = difficulty.strip().lower() or "medium"
        return (
            f"Implement a solution for {topic_clean} at a {difficulty_clean} difficulty."
        )
    def generate_novel(self, title: str, chapters: int = 1) -> List[str]:
        """Generate a lightweight novel outline.

        Args:
            title: Title for the novel.
            chapters: Number of chapters to create.

        Returns:
            A list of chapter strings forming the novel outline.
        """
        if chapters < 1:
            raise ValueError("`chapters` must be at least 1")
        outline = []
        for i in range(1, chapters + 1):
            outline.append(f"Chapter {i}: {title} — part {i}")
        return outline
    def list_created_games(self) -> list[GameRecord]:
        """Return a copy of the games created by the agent."""
        return list(self.games)

    def write_novel(self, title: str, protagonist: str) -> str:
        """Generate a minimal novel blurb.

        Args:
            title: Title of the story to generate.
            protagonist: Main character of the story.

        Returns:
            A short string describing the novel.
        """
        return f"{title} is a thrilling tale about {protagonist}."

    def generate_outline(self, topic: str, chapters: int = 3) -> List[str]:
        """Generate a simple chapter outline for a novel topic.

        Args:
            topic: Main theme for the novel.
            chapters: Number of chapters to produce. Must be positive.

        Returns:
            A list of chapter titles.

        Raises:
            ValueError: If ``chapters`` is less than 1.
        """
        if chapters < 1:
            raise ValueError("chapters must be at least 1")
        return [f"Chapter {i + 1}: {topic} Part {i + 1}" for i in range(chapters)]
    def generate_code_snippet(self, prompt: str, language: str) -> str:
        """Return a canned code snippet for the given language."""

        lang_key = language.strip().lower()
        snippet = self.SAMPLE_SNIPPETS.get(lang_key)
        if snippet:
            return snippet
        return f"// Code snippet for {lang_key} not available. Prompt was: {prompt}"

    def proofread_paragraph(self, paragraph: str) -> str:
        """Return a polished version of ``paragraph`` with basic fixes."""

        cleaned = paragraph.strip()
        if not cleaned:
            return ""
        sentence = cleaned[0].upper() + cleaned[1:]
        if not sentence.endswith('.'):
            sentence += '.'
        return sentence

    def generate_novel(self, title: str, chapters: int = 3) -> Iterator[str]:
        """Yield a few sentences representing chapters of a novel."""

        if chapters <= 0:
            raise ValueError("chapters must be a positive integer")

        for index in range(1, chapters + 1):
            yield f"Chapter {index}: The tale of {title} unfolds with new revelations."

    def write_short_story(
        self,
        theme: str,
        *,
        setting: str | None = None,
        protagonist: str | None = None,
    ) -> str:
        """Generate a short, two-sentence story for the given theme."""

        clean_theme = " ".join(theme.split())
        if not clean_theme:
            raise ValueError("Theme must be provided.")

        setting_part = f" set in {setting}" if setting else ""
        protagonist_part = protagonist or "Someone"
        return (
            f"A tale of {clean_theme}{setting_part} begins with hope. "
            f"In the end, {protagonist_part} discovers that {clean_theme} prevails."
    def generate_poem(self, theme: str, form: str = "haiku") -> str:
        """Generate a simple poem using the provided theme.

        Currently only the ``haiku`` form is supported.

        Args:
            theme: Central theme for the poem. Must be a non-empty string.
            form: Poetic form to use. Only ``haiku`` is supported.

        Returns:
            A poem string with lines separated by newlines.

        Raises:
            ValueError: If ``theme`` is empty or ``form`` is unsupported.
        """
        if not theme or not theme.strip():
            raise ValueError("Theme must be a non-empty string.")
        form_lower = form.lower()
        if form_lower != "haiku":
            raise ValueError("Only 'haiku' form is supported.")
        theme_clean = theme.strip()
        return "\n".join(
            [
                f"{theme_clean} in the breeze",
                "Soft whispers through the tall trees",
                "Dreams drift on the leaves",
            ]
        )


__all__ = [
    "AutoNovelAgent",
    "DEFAULT_CONSENT_SCOPES",
    "DEFAULT_SUPPORTED_ENGINES",
]
if __name__ == "__main__":
    agent = AutoNovelAgent()
    agent.deploy()
    agent.create_game("unity")
    print(agent.generate_storyline("Ada", "a digital forest"))
    for line in agent.generate_novel("The Journey", chapters=2):
        print(line)
    for record in agent.list_created_games():
        print(record)
    print(agent.write_novel("Journey", "Alice"))
    for title in agent.generate_outline("Space Adventure", chapters=2):
        print(title)
    print(agent.generate_story("mystical", "A coder"))
    print(agent.generate_poem("serenity"))
