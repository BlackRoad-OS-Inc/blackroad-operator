"""Entropy-credit ledger based on the spiral thermodynamic identity."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

import numpy as np

from .compliance_lagrangian import k_B


@dataclass
class LedgerEntry:
    """Record describing an entropy expenditure event."""

    label: str
    entropy: float
    work: float
    bit_erasure_lower_bound: float


@dataclass
class ThermoLedger:
    """Track the thermodynamic cost of operations in the Amundson stack."""

    temperature: float
    entries: List[LedgerEntry] = field(default_factory=list)

    def log(self, label: str, spiral_rate: float, duration: float) -> LedgerEntry:
        """Log an event assuming :math:`\Omega(t) = e^{a t}`."""

        entropy = k_B * spiral_rate * duration
        work = self.temperature * entropy
        bit_bound = entropy / (k_B * np.log(2.0))
        entry = LedgerEntry(label, entropy, work, bit_bound)
        self.entries.append(entry)
        return entry

    def total_work(self) -> float:
        """Return the cumulative work recorded in the ledger."""

        return float(sum(entry.work for entry in self.entries))

    def required_energy(self, bits_to_erase: float) -> float:
        """Return the Landauer lower bound for erasing the supplied bits."""

        return bits_to_erase * k_B * self.temperature * np.log(2.0)


__all__ = ["LedgerEntry", "ThermoLedger"]
