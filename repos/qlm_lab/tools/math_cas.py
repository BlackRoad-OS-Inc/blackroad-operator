"""Symbolic mathematics helpers powered by SymPy."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import sympy as sp


@dataclass
class CasResult:
    """Container for CAS operations."""

    expression: sp.Expr

    def to_latex(self) -> str:
        return sp.latex(self.expression)


def simplify(expr: str | sp.Expr) -> CasResult:
    """Simplify an expression."""

    sym_expr = sp.sympify(expr)
    return CasResult(sp.simplify(sym_expr))


def factor(expr: str | sp.Expr) -> CasResult:
    sym_expr = sp.sympify(expr)
    return CasResult(sp.factor(sym_expr))


def series(expr: str | sp.Expr, symbol: str, order: int) -> CasResult:
    sym_expr = sp.sympify(expr)
    sym = sp.Symbol(symbol)
    return CasResult(sp.series(sym_expr, sym, 0, order).removeO())


def solve(equation: str | sp.Equality, symbol: str) -> list[Any]:
    sym_equation = sp.sympify(equation)
    sym = sp.Symbol(symbol)
    return sp.solve(sym_equation, sym)
