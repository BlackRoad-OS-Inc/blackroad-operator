"""Love operator weights and helpers."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class LoveWeights:
    user: float = 0.45
    team: float = 0.25
    world: float = 0.30

    def normalize(self) -> "LoveWeights":
        total = self.user + self.team + self.world
        if total == 0:
            return self
        return LoveWeights(self.user / total, self.team / total, self.world / total)


DEFAULT_WEIGHTS = LoveWeights().normalize()


__all__ = ["LoveWeights", "DEFAULT_WEIGHTS"]
