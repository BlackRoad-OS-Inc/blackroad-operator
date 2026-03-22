"""Utilities for relating harmonic series to equal-tempered pitch classes."""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Sequence, Tuple, Optional
import math

_A4_MIDI = 69
_A4_FREQ = 440.0
_SEMITONES = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
]


def _frequency_from_midi(midi: int) -> float:
    return _A4_FREQ * (2 ** ((midi - _A4_MIDI) / 12))


def _midi_name(midi: int) -> str:
    octave = (midi // 12) - 1
    name = _SEMITONES[midi % 12]
    return f"{name}{octave}"


@dataclass(frozen=True)
class HarmonicInfo:
    """Container for one harmonic analysis result."""

    harmonic: int
    frequency: float
    midi: int
    note: str
    cents_error: float

    def as_row(self) -> Tuple[str, str, str, str, str]:
        return (
            f"{self.harmonic}",
            f"{self.frequency:.2f}",
            str(self.midi),
            self.note,
            f"{self.cents_error:+.2f}",
        )


def analyze_harmonics(
    base_frequency: float,
    harmonics: Optional[Sequence[int]] = None,
    *,
    plot: bool = False,
) -> Tuple[List[HarmonicInfo], Optional["matplotlib.figure.Figure"]]:
    """Analyse harmonic frequencies against the 12-TET lattice.

    Parameters
    ----------
    base_frequency:
        The fundamental frequency (Hz).
    harmonics:
        Specific harmonic indices to analyse. Defaults to 1..16.
    plot:
        When ``True`` a cents-error line plot is produced and the figure is
        returned alongside the data.

    Returns
    -------
    list of :class:`HarmonicInfo`, matplotlib.figure.Figure | None
        Harmonic descriptors and an optional matplotlib figure when
        ``plot=True``.
    """

    if base_frequency <= 0:
        raise ValueError("base_frequency must be positive")

    if harmonics is None:
        harmonic_numbers: Sequence[int] = tuple(range(1, 17))
    else:
        harmonic_numbers = tuple(dict.fromkeys(harmonics))
        if not harmonic_numbers:
            raise ValueError("harmonics must contain at least one positive integer")
        for h in harmonic_numbers:
            if h <= 0:
                raise ValueError("harmonics must be positive integers")

    results: List[HarmonicInfo] = []
    rows = ["n", "Hz", "MIDI", "Note", "cents"]
    table: List[Tuple[str, str, str, str, str]] = []

    for harmonic in harmonic_numbers:
        frequency = base_frequency * harmonic
        midi_float = _A4_MIDI + 12 * math.log2(frequency / _A4_FREQ)
        midi = int(round(midi_float))
        midi_frequency = _frequency_from_midi(midi)
        cents_error = 1200 * math.log2(frequency / midi_frequency)
        info = HarmonicInfo(
            harmonic=harmonic,
            frequency=frequency,
            midi=midi,
            note=_midi_name(midi),
            cents_error=cents_error,
        )
        results.append(info)
        table.append(info.as_row())

    _print_table(rows, table)

    fig = None
    if plot:
        try:
            import matplotlib.pyplot as plt  # type: ignore
        except ImportError as exc:  # pragma: no cover - optional dependency
            raise RuntimeError("matplotlib is required when plot=True") from exc

        fig, ax = plt.subplots()
        xs = [info.harmonic for info in results]
        ys = [info.cents_error for info in results]
        ax.axhline(0.0, color="black", linewidth=0.8, linestyle="--")
        ax.plot(xs, ys, marker="o")
        ax.set_xlabel("harmonic")
        ax.set_ylabel("cents error (harmonic - 12TET)")
        ax.set_title(f"Harmonic cents error for base {base_frequency:.2f} Hz")
        ax.grid(True, which="both", linestyle=":", linewidth=0.5)
        fig.tight_layout()

    return results, fig


def _print_table(headers: Sequence[str], rows: Sequence[Tuple[str, ...]]) -> None:
    widths = [len(h) for h in headers]
    for row in rows:
        for idx, cell in enumerate(row):
            widths[idx] = max(widths[idx], len(cell))

    def _format(row: Sequence[str]) -> str:
        return "  ".join(cell.rjust(widths[idx]) for idx, cell in enumerate(row))

    print(_format(headers))
    print("  ".join("-" * w for w in widths))
    for row in rows:
        print(_format(row))


__all__ = ["HarmonicInfo", "analyze_harmonics"]
