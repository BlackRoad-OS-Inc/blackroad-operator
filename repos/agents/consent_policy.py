"""Consent enforcement helpers for BlackRoad agents.

This module provides a small runtime utility that allows agent implementations
to verify that they have been granted full consent before performing any
operation.  Agents can store a :class:`ConsentRecord` alongside their runtime
state and invoke :func:`ensure_full_consent` whenever sensitive actions are
requested.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import FrozenSet, Iterable


@dataclass(frozen=True)
class ConsentRecord:
    """A record describing the consent that has been granted to an agent.

    Parameters
    ----------
    granted:
        Indicates whether consent has been granted.
    level:
        The qualitative level of the granted consent (for example ``"full"``).
    scopes:
        A collection describing the specific capabilities that have been
        authorised.
    evidence:
        Free-form text capturing how the consent was collected.
    granted_at:
        Timestamp for when the consent was finalised.
    """

    granted: bool
    level: str = "none"
    scopes: FrozenSet[str] = field(default_factory=frozenset)
    evidence: str = ""
    granted_at: datetime | None = None

    def __post_init__(self) -> None:
        normalised_level = self.level.strip().lower()
        object.__setattr__(self, "level", normalised_level)

        scopes = frozenset(scope.strip() for scope in self.scopes if scope.strip())
        object.__setattr__(self, "scopes", scopes)

        if self.granted and self.granted_at is None:
            object.__setattr__(self, "granted_at", datetime.now(timezone.utc))

    @classmethod
    def full(
        cls,
        *,
        scopes: Iterable[str] | None = None,
        evidence: str = "",
        granted_at: datetime | None = None,
    ) -> "ConsentRecord":
        """Return a consent record representing full consent."""

        return cls(
            granted=True,
            level="full",
            scopes=frozenset(scopes or ()),
            evidence=evidence,
            granted_at=granted_at,
        )

    def is_full(self) -> bool:
        """Return ``True`` when the record represents full consent."""

        return self.granted and self.level == "full"

    def require_full_consent(
        self,
        *,
        scope: str | None = None,
        actor: str | None = None,
    ) -> None:
        """Raise ``PermissionError`` unless full consent has been granted.

        Parameters
        ----------
        scope:
            Optional scope that should be present in the consent record.  When
            provided the method verifies that the scope is authorised.
        actor:
            Optional label describing who is requesting the action.  The label is
            only used to provide clearer error messages.
        """

        if not self.is_full():
            label = f" for {actor}" if actor else ""
            raise PermissionError(f"Full consent is required{label} before action.")

        if scope is not None and scope not in self.scopes:
            available = ", ".join(sorted(self.scopes)) or "<none>"
            label = f" by {actor}" if actor else ""
            raise PermissionError(
                f"Consent scope mismatch{label}: '{scope}' not in [{available}]."
            )


def ensure_full_consent(
    consent: ConsentRecord,
    *,
    scope: str | None = None,
    actor: str | None = None,
) -> None:
    """Helper wrapper around :meth:`ConsentRecord.require_full_consent`."""

    consent.require_full_consent(scope=scope, actor=actor)


__all__ = ["ConsentRecord", "ensure_full_consent"]
