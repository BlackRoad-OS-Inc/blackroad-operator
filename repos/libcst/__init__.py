"""Minimal subset of the :mod:`libcst` API used in tests."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Module:
    """Simple representation of Python source used in unit tests."""

    code: str

    def visit(self, transformer: "Transformer") -> "Module":
        return transformer.transform_module(self)


@dataclass
class Name:
    value: str

    def with_changes(self, *, value: str) -> "Name":
        return Name(value)


class Transformer:
    """Base transformer compatible with the subset of the test suite."""

    def transform_module(self, module: Module) -> Module:  # pragma: no cover - trivial
        return module


CSTTransformer = Transformer


def parse_module(source: str) -> Module:
    """Return a :class:`Module` wrapper around ``source``."""

    return Module(source)


__all__ = [
    "Module",
    "Name",
    "CSTTransformer",
    "parse_module",
]
