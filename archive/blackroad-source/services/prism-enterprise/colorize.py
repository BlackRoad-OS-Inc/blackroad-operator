"""Color utilities for Silas outputs."""
from __future__ import annotations

import colorsys
import io
from dataclasses import dataclass
from typing import Dict, List, Optional, Sequence, Tuple
from rich.console import Console
from rich.text import Text


@dataclass(frozen=True)
class ColorSpec:
    """Defines both HSL and RGB representations for a color."""

    h: int
    s: int
    l: int

    @property
    def hsl_css(self) -> str:
        return f"hsl({self.h}, {self.s}%, {self.l}%)"

    @property
    def hex(self) -> str:
        r, g, b = colorsys.hls_to_rgb(self.h / 360, self.l / 100, self.s / 100)
        return f"#{int(r * 255):02x}{int(g * 255):02x}{int(b * 255):02x}"


BALANCED_TERNARY_COLORS: Dict[str, ColorSpec] = {
    "+": ColorSpec(135, 70, 45),
    "0": ColorSpec(0, 0, 60),
    "-": ColorSpec(10, 70, 50),
}

POS_COLORS: Dict[str, ColorSpec] = {
    "NOUN": ColorSpec(210, 70, 52),
    "PROPN": ColorSpec(210, 70, 52),
    "VERB": ColorSpec(30, 80, 52),
    "AUX": ColorSpec(30, 80, 52),
    "ADJ": ColorSpec(280, 65, 62),
}

DEFAULT_POS_COLOR = ColorSpec(200, 10, 55)


def ansi(color: ColorSpec, text: str) -> str:
    """Return ANSI styled text for the provided color specification."""
    buffer = io.StringIO()
    console = Console(
        color_system="truecolor", record=True, force_terminal=True, width=80, file=buffer
    )
    console.print(Text(text, style=color.hex), end="")
    styled = console.export_text(styles=True)
    return styled.rstrip("\n")


def html(color: ColorSpec, text: str) -> str:
    """Wrap text inside a colored span using inline HSL values."""
    escaped = text.replace("<", "&lt;").replace(">", "&gt;")
    return f'<span style="color:{color.hsl_css};">{escaped}</span>'


def color_by_bt(text: str, bt_char: str) -> Dict[str, str]:
    """Return ANSI and HTML representations keyed by the balanced ternary symbol."""
    color = BALANCED_TERNARY_COLORS.get(bt_char, DEFAULT_POS_COLOR)
    return {
        "text": text,
        "bt": bt_char,
        "ansi": ansi(color, text),
        "html": html(color, text),
        "color": color.hsl_css,
    }


def color_by_pos(tokens_with_pos: Sequence[Tuple[str, str]]) -> List[Dict[str, str]]:
    """Colorise tokens based on coarse part-of-speech tags."""
    results: List[Dict[str, str]] = []
    for token, pos in tokens_with_pos:
        color = POS_COLORS.get(pos.upper(), DEFAULT_POS_COLOR)
        results.append(
            {
                "token": token,
                "pos": pos,
                "ansi": ansi(color, token),
                "html": html(color, token),
                "color": color.hsl_css,
            }
        )
    return results


def simple_pos_tag(text: str) -> List[Tuple[str, str]]:
    """Tag text using spaCy when available, otherwise a basic heuristic tagger."""
    tokens: List[Tuple[str, str]] = []
    nlp = _load_spacy_model()
    if nlp is not None:
        doc = nlp(text)
        return [(token.text, token.pos_) for token in doc]

    for raw in text.split():
        token = raw.strip()
        if not token:
            continue
        upper = token.upper()
        if upper.endswith("ING") or upper.endswith("ED"):
            pos = "VERB"
        elif upper[0].isupper():
            pos = "NOUN"
        elif token.endswith("ly"):
            pos = "ADJ"
        else:
            pos = "NOUN"
        tokens.append((token, pos))
    return tokens


_SPACY_MODEL: Optional[object] = None
_SPACY_UNAVAILABLE = False


def _load_spacy_model() -> Optional[object]:
    global _SPACY_MODEL, _SPACY_UNAVAILABLE
    if _SPACY_UNAVAILABLE:
        return None
    if _SPACY_MODEL is not None:
        return _SPACY_MODEL
    try:  # pragma: no cover - optional dependency
        import spacy

        for model_name in ("en_core_web_sm", "en_core_web_md", "en_core_web_lg"):
            try:
                _SPACY_MODEL = spacy.load(model_name)  # type: ignore[assignment]
                return _SPACY_MODEL
            except OSError:
                continue
        _SPACY_MODEL = spacy.blank("en")
        return _SPACY_MODEL
    except Exception:  # pragma: no cover - optional dependency
        _SPACY_UNAVAILABLE = True
        return None


__all__ = [
    "ansi",
    "html",
    "color_by_bt",
    "color_by_pos",
    "simple_pos_tag",
]
