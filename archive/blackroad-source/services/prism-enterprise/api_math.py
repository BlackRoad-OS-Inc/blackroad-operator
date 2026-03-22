"""Text-only Infinity Math API endpoints."""
from __future__ import annotations

import ast
import itertools
from math import pi, sin
from typing import Any, Dict, Iterable, List, Sequence

import numpy as np
from flask import Blueprint, Response, jsonify, request

from packages.textviz import heatmap_svg, line_svg, pgm_p2

math_api = Blueprint("math_api", __name__)


def mandelbrot_counts(
    width: int,
    height: int,
    max_iter: int,
    xmin: float,
    xmax: float,
    ymin: float,
    ymax: float,
) -> np.ndarray:
    """Return iteration counts for the Mandelbrot set."""

    xs = np.linspace(xmin, xmax, width)
    ys = np.linspace(ymin, ymax, height)
    C = xs + ys[:, None] * 1j
    Z = np.zeros_like(C)
    counts = np.zeros(C.shape, dtype=int)
    mask = np.ones(C.shape, dtype=bool)
    for i in range(max_iter):
        Z[mask] = Z[mask] ** 2 + C[mask]
        escaped = np.abs(Z) > 2.0
        newly_escaped = escaped & mask
        counts[newly_escaped] = i
        mask &= ~escaped
    counts[mask] = max_iter
    return counts


def _pgm_from_counts(counts: np.ndarray) -> str:
    return pgm_p2(counts)


def _svg_from_counts(counts: np.ndarray) -> str:
    return heatmap_svg(counts.tolist(), width=480, height=480)


def _sieve(limit: int) -> list[int]:
    if limit < 2:
        return []
    sieve = [True] * (limit + 1)
    sieve[0:2] = [False, False]
    for num in range(2, int(limit ** 0.5) + 1):
        if sieve[num]:
            for multiple in range(num * num, limit + 1, num):
                sieve[multiple] = False
    return [i for i, is_prime in enumerate(sieve) if is_prime]


def primes_payload(limit: int) -> Dict[str, Any]:
    primes = _sieve(limit)
    return {
        "limit": limit,
        "count": len(primes),
        "primes": primes,
        "units": {"limit": "integer"},
    }


class _BooleanEvaluator(ast.NodeVisitor):
    def __init__(self, assignment: Dict[str, bool]):
        self.assignment = assignment

    def visit_Name(self, node: ast.Name) -> bool:
        if node.id not in self.assignment:
            raise ValueError(f"unknown variable '{node.id}'")
        return bool(self.assignment[node.id])

    def visit_Constant(self, node: ast.Constant) -> bool:  # type: ignore[override]
        if isinstance(node.value, bool):
            return bool(node.value)
        raise ValueError("only boolean constants are supported")

    def visit_UnaryOp(self, node: ast.UnaryOp) -> bool:  # type: ignore[override]
        if not isinstance(node.op, ast.Not):
            raise ValueError("only logical NOT is supported as unary operator")
        return not self.visit(node.operand)

    def visit_BoolOp(self, node: ast.BoolOp) -> bool:  # type: ignore[override]
        values = [self.visit(value) for value in node.values]
        if isinstance(node.op, ast.And):
            result = all(values)
        elif isinstance(node.op, ast.Or):
            result = any(values)
        else:
            raise ValueError("only AND/OR boolean operations are supported")
        return result

    def generic_visit(self, node: ast.AST) -> bool:
        raise ValueError(f"unsupported expression element: {type(node).__name__}")


def _parse_boolean_expression(expr: str, variables: Iterable[str]) -> ast.AST:
    tree = ast.parse(expr, mode="eval")
    allowed = (ast.Expression, ast.BoolOp, ast.UnaryOp, ast.Name, ast.Load, ast.And, ast.Or, ast.Not, ast.Constant)
    for node in ast.walk(tree):
        if not isinstance(node, allowed):
            raise ValueError(f"unsupported syntax: {type(node).__name__}")
        if isinstance(node, ast.Name) and node.id not in variables:
            raise ValueError(f"unknown variable '{node.id}'")
    return tree


def evaluate_expression(
    expr: str,
    variables: Sequence[str],
    assignment: Dict[str, bool],
    tree: ast.AST | None = None,
) -> bool:
    if tree is None:
        tree = _parse_boolean_expression(expr, variables)
    evaluator = _BooleanEvaluator(assignment)
    return evaluator.visit(tree.body)  # type: ignore[arg-type]


def truth_table_payload(expr: str, variables: Sequence[str]) -> Dict[str, Any]:
    tree = _parse_boolean_expression(expr, variables)
    rows = []
    for values in itertools.product([False, True], repeat=len(variables)):
        assignment = dict(zip(variables, values))
        result = evaluate_expression(expr, variables, assignment, tree)
        rows.append({**assignment, "result": result})
    return {
        "expression": expr,
        "variables": list(variables),
        "rows": rows,
        "units": {var: "bool" for var in variables} | {"result": "bool"},
    }


def sine_wave_samples(
    freq: float,
    phase: float,
    samples: int,
    duration: float,
) -> tuple[list[float], list[float]]:
    xs = np.linspace(0.0, duration, samples).tolist()
    ys = [sin(2 * pi * freq * x + phase) for x in xs]
    return xs, ys


@math_api.get("/api/math/fractals/mandelbrot.pgm")
def mandelbrot_endpoint() -> Response:
    width = int(request.args.get("width", 256))
    height = int(request.args.get("height", 256))
    max_iter = int(request.args.get("iter", 80))
    xmin = float(request.args.get("xmin", -2.0))
    xmax = float(request.args.get("xmax", 1.0))
    ymin = float(request.args.get("ymin", -1.5))
    ymax = float(request.args.get("ymax", 1.5))
    counts = mandelbrot_counts(width, height, max_iter, xmin, xmax, ymin, ymax)
    if request.args.get("format") == "svg":
        svg = _svg_from_counts(counts)
        return Response(svg, mimetype="image/svg+xml; charset=utf-8")
    pgm_text = _pgm_from_counts(counts)
    return Response(pgm_text, mimetype="image/x-portable-graymap; charset=us-ascii")


@math_api.get("/api/math/primes.json")
def primes_endpoint() -> Response:
    limit = int(request.args.get("limit", 1000))
    return jsonify(primes_payload(limit))


@math_api.post("/api/math/logic/truth-table")
def logic_truth_table() -> Response:
    body = request.get_json(force=True)
    expr = body.get("expression", "a and b")
    variables: List[str]
    if "variables" in body and body["variables"]:
        variables = [str(v) for v in body["variables"]]
    else:
        parsed = ast.parse(expr, mode="eval")
        variables = sorted({node.id for node in ast.walk(parsed) if isinstance(node, ast.Name)})
    payload = truth_table_payload(expr, variables)
    return jsonify(payload)


@math_api.get("/api/math/waves/sine.svg")
def sine_wave_svg() -> Response:
    freq = float(request.args.get("freq", 1.0))
    phase = float(request.args.get("phase", 0.0))
    samples = int(request.args.get("samples", 256))
    duration = float(request.args.get("duration", 1.0))
    xs, ys = sine_wave_samples(freq, phase, samples, duration)
    svg = line_svg(xs, ys, width=600, height=260, stroke="#1cbe8f")
    return Response(svg, mimetype="image/svg+xml; charset=utf-8")
