"""Utilities for mapping Rohonc glyphs into a byte-friendly alphabet."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Optional


@dataclass
class RohoncGlyphMapper:
    """Assign unique byte values to Rohonc glyphs up to a 256-symbol alphabet."""

    alphabet_size: int = 256
    unknown_token: int = 0
    _mapping: Dict[str, int] = field(default_factory=dict)
    _reverse: Dict[int, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not (1 <= self.alphabet_size <= 256):
            raise ValueError("alphabet_size must be between 1 and 256")
        if not (0 <= self.unknown_token < self.alphabet_size):
            raise ValueError("unknown_token must be a valid symbol index")

    @property
    def mapping(self) -> Dict[str, int]:
        return dict(self._mapping)

    def _next_symbol(self) -> int:
        used = set(self._reverse.keys()) | {self.unknown_token}
        for symbol in range(self.alphabet_size):
            if symbol in used:
                continue
            return symbol
        raise RuntimeError("alphabet exhausted; consider increasing alphabet_size")

    def fit(self, glyphs: Iterable[str]) -> None:
        """Register glyphs so they receive stable byte assignments."""

        for glyph in glyphs:
            if glyph in self._mapping:
                continue
            symbol = self._next_symbol()
            self._mapping[glyph] = symbol
            self._reverse[symbol] = glyph

    def transform(self, glyphs: Iterable[str]) -> List[int]:
        """Convert a glyph sequence into a list of byte values."""

        encoded: List[int] = []
        for glyph in glyphs:
            if glyph not in self._mapping:
                symbol = self.unknown_token
            else:
                symbol = self._mapping[glyph]
            encoded.append(symbol)
        return encoded

    def fit_transform(self, glyphs: Iterable[str]) -> List[int]:
        glyph_list = list(glyphs)
        self.fit(glyph_list)
        return self.transform(glyph_list)

    def inverse_transform(self, codes: Iterable[int]) -> List[str]:
        """Convert byte values back to glyphs when possible."""

        decoded: List[str] = []
        for code in codes:
            glyph = self._reverse.get(code)
            if glyph is None:
                raise KeyError(f"code {code} not present in mapper")
            decoded.append(glyph)
        return decoded


def encode_text_blocks(text: str, mapper: Optional[RohoncGlyphMapper] = None) -> List[int]:
    """Encode the characters from ``text`` using a ``RohoncGlyphMapper``."""

    mapper = mapper or RohoncGlyphMapper()
    return mapper.fit_transform(list(text))
