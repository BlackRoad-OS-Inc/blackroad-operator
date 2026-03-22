"""Symbolic math helpers powered by SymPy."""
from __future__ import annotations

from typing import Dict, Sequence

import sympy as sp


__all__ = ["simplify_expr", "solve_system", "series_expand"]


def simplify_expr(expression: str, symbols: Sequence[str] | None = None) -> sp.Expr:
    """Simplify a symbolic expression provided as a string."""

    sym_map = {name: sp.symbols(name) for name in (symbols or [])}
    expr = sp.sympify(expression, locals=sym_map)
    return sp.simplify(expr)


def solve_system(equations: Sequence[str], variables: Sequence[str]) -> Dict[str, sp.Expr]:
    """Solve a system of equations for the given variables."""

    syms = sp.symbols(list(variables))
    eqs = [sp.Eq(sp.sympify(eq.split("=", 1)[0]), sp.sympify(eq.split("=", 1)[1])) for eq in equations]
    solution = sp.solve(eqs, syms, dict=True)
    return solution[0] if solution else {}


def series_expand(expression: str, symbol: str, about: int = 0, order: int = 4) -> sp.Series:
    """Return the truncated series expansion of ``expression``."""

    sym = sp.symbols(symbol)
    expr = sp.sympify(expression, locals={symbol: sym})
    return sp.series(expr, sym, about, order)
