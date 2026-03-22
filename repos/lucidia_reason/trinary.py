"""Three-valued logic helpers."""

from __future__ import annotations

import enum


class TruthValue(enum.Enum):
    """Simple Kleene-inspired three valued logic enum."""

    TRUE = 1
    UNKNOWN = 0
    FALSE = -1


def neg(value: TruthValue) -> TruthValue:
    if value is TruthValue.UNKNOWN:
        return TruthValue.UNKNOWN
    return TruthValue.FALSE if value is TruthValue.TRUE else TruthValue.TRUE


def and3(a: TruthValue, b: TruthValue) -> TruthValue:
    table = {
        (TruthValue.TRUE, TruthValue.TRUE): TruthValue.TRUE,
        (TruthValue.TRUE, TruthValue.UNKNOWN): TruthValue.UNKNOWN,
        (TruthValue.UNKNOWN, TruthValue.TRUE): TruthValue.UNKNOWN,
        (TruthValue.UNKNOWN, TruthValue.UNKNOWN): TruthValue.UNKNOWN,
    }
    if TruthValue.FALSE in {a, b}:
        return TruthValue.FALSE
    return table.get((a, b), table.get((b, a), TruthValue.UNKNOWN))


def or3(a: TruthValue, b: TruthValue) -> TruthValue:
    table = {
        (TruthValue.FALSE, TruthValue.FALSE): TruthValue.FALSE,
        (TruthValue.FALSE, TruthValue.UNKNOWN): TruthValue.UNKNOWN,
        (TruthValue.UNKNOWN, TruthValue.FALSE): TruthValue.UNKNOWN,
        (TruthValue.UNKNOWN, TruthValue.UNKNOWN): TruthValue.UNKNOWN,
    }
    if TruthValue.TRUE in {a, b}:
        return TruthValue.TRUE
    return table.get((a, b), table.get((b, a), TruthValue.UNKNOWN))


def imp3(a: TruthValue, b: TruthValue) -> TruthValue:
    if a is TruthValue.FALSE:
        return TruthValue.TRUE
    if a is TruthValue.UNKNOWN:
        return TruthValue.TRUE if b is TruthValue.TRUE else TruthValue.UNKNOWN
    return TruthValue.TRUE if b is TruthValue.TRUE else TruthValue.FALSE


def conflict(a: TruthValue, b: TruthValue) -> TruthValue:
    if TruthValue.UNKNOWN in {a, b}:
        return TruthValue.UNKNOWN
    return TruthValue.TRUE if a is b else TruthValue.FALSE


__all__ = [
    "TruthValue",
    "neg",
    "and3",
    "or3",
    "imp3",
    "conflict",
]
