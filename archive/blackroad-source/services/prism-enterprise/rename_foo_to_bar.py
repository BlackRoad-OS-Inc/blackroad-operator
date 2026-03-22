"""Simple codemod that renames ``foo`` identifiers to ``bar``."""

from __future__ import annotations

from libcst import Module


def codemod(module: Module, **_: object) -> Module:
    """Return a new module with every occurrence of ``foo`` rewritten to ``bar``."""

    return Module(module.code.replace("foo", "bar"))
