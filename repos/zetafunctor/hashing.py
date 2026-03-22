"""Hash-based utilities for projecting text streams into the complex plane."""

from __future__ import annotations

import hashlib
from typing import Iterator, List


def rolling_sha256(text: str, window: int = 128, step: int = 1) -> List[str]:
    """Compute SHA-256 digests over a sliding window of the input text.

    Parameters
    ----------
    text:
        Source text to hash.
    window:
        Number of characters per sliding window. Defaults to 128 which captures
        a few sentences without being overly expensive.
    step:
        Advance the window by this many characters for each digest. A ``step`` of
        1 maximises resolution but can be more expensive for large corpora.

    Returns
    -------
    list[str]
        Hex digests ordered by their starting offset.
    """

    if window <= 0:
        raise ValueError("window must be positive")
    if step <= 0:
        raise ValueError("step must be positive")

    digests: List[str] = []
    for start in range(0, max(len(text) - window + 1, 1), step):
        chunk = text[start : start + window]
        digest = hashlib.sha256(chunk.encode("utf-8")).hexdigest()
        digests.append(digest)
    return digests


def _scale_to_interval(value: int, bits: int, lower: float, upper: float) -> float:
    span = upper - lower
    if span == 0:
        return lower
    max_value = (1 << bits) - 1
    return lower + (value / max_value) * span


def hash_to_complex(digest: str, lower: float = -2.0, upper: float = 2.0) -> complex:
    """Project a SHA-256 hex digest onto the complex plane.

    The digest is split into two 128-bit halves that are independently scaled to
    ``[lower, upper]`` and combined into a complex number.
    """

    if len(digest) != 64:
        raise ValueError("SHA-256 digest must be 64 hex characters long")
    real_bits = int(digest[:32], 16)
    imag_bits = int(digest[32:], 16)
    real = _scale_to_interval(real_bits, 128, lower, upper)
    imag = _scale_to_interval(imag_bits, 128, lower, upper)
    return complex(real, imag)


def rolling_hash_to_complex(
    text: str,
    window: int = 128,
    step: int = 1,
    lower: float = -2.0,
    upper: float = 2.0,
) -> List[complex]:
    """Convenience wrapper that hashes and immediately maps to the complex plane."""

    return [hash_to_complex(d, lower=lower, upper=upper) for d in rolling_sha256(text, window, step)]


def chunk_text(text: str, chunk_size: int) -> Iterator[str]:
    """Yield successive ``chunk_size``-sized pieces from ``text``."""

    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    for start in range(0, len(text), chunk_size):
        yield text[start : start + chunk_size]


def hash_blocks_to_complex(text: str, block_size: int = 256) -> List[complex]:
    """Map non-overlapping blocks of text to complex points using SHA-256."""

    return [hash_to_complex(hashlib.sha256(block.encode("utf-8")).hexdigest()) for block in chunk_text(text, block_size)]
