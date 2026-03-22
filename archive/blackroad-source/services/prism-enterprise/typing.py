"""Common typing aliases for RoadQLM."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Protocol, Sequence, Tuple, TypeVar

import numpy as np

T = TypeVar("T")

ArrayLike = np.ndarray | Sequence[float] | Sequence[complex]


class SupportsToFloat(Protocol):
    """Protocol describing objects convertible to ``float``."""

    def __float__(self) -> float: ...


class Backend(Protocol):
    """Minimal protocol for simulator backends."""

    name: str

    def run(self, circuit: "Circuit", params: ArrayLike | None = None) -> ArrayLike: ...


@dataclass(slots=True)
class ParameterBatch:
    """Container representing a batch of parameters for a circuit run."""

    values: np.ndarray

    @classmethod
    def from_iterable(cls, iterable: Iterable[Sequence[SupportsToFloat]]) -> "ParameterBatch":
        values = np.asarray(list(iterable), dtype=float)
        if values.ndim == 1:
            values = values.reshape(1, -1)
        return cls(values=values)

    def __len__(self) -> int:
        return int(self.values.shape[0])

    def __iter__(self):
        return iter(self.values)


__all__ = ["ArrayLike", "Backend", "ParameterBatch"]
