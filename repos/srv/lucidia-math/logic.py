"""Truth table utilities and boolean expression parsing."""

from __future__ import annotations

import ast
import itertools
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Sequence

from .storage import ensure_domain, write_json

DOMAIN = "logic"


@dataclass(slots=True)
class TruthTableRow:
    assignment: Dict[str, bool]
    result: bool


@dataclass(slots=True)
class TruthTable:
    variables: Sequence[str]
    rows: List[TruthTableRow]
    expression: str | None = None

    def to_serialisable(self) -> Dict[str, object]:
        return {
            "variables": list(self.variables),
            "expression": self.expression,
            "rows": [
                {
                    "assignment": row.assignment,
                    "result": row.result,
                }
                for row in self.rows
            ],
        }


def _timestamp() -> str:
    return datetime.utcnow().strftime("%Y%m%dT%H%M%S%f")


class BooleanEvaluator(ast.NodeVisitor):
    """Evaluate a safe boolean expression against an assignment."""

    def __init__(self, assignment: Dict[str, bool]):
        self.assignment = assignment

    def visit_Name(self, node: ast.Name) -> bool:  # noqa: N802
        if node.id not in self.assignment:
            raise ValueError(f"Unknown symbol '{node.id}' in expression")
        return bool(self.assignment[node.id])

    def visit_Constant(self, node: ast.Constant) -> bool:  # noqa: N802
        if isinstance(node.value, bool):
            return bool(node.value)
        raise ValueError("Only boolean constants are permitted")

    def visit_UnaryOp(self, node: ast.UnaryOp) -> bool:  # noqa: N802
        operand = self.visit(node.operand)
        if isinstance(node.op, (ast.Not, ast.Invert)):
            return not operand
        raise ValueError("Unsupported unary operator")

    def visit_BoolOp(self, node: ast.BoolOp) -> bool:  # noqa: N802
        values = [self.visit(value) for value in node.values]
        if isinstance(node.op, ast.And):
            return all(values)
        if isinstance(node.op, ast.Or):
            return any(values)
        raise ValueError("Unsupported boolean operator")

    def visit_BinOp(self, node: ast.BinOp) -> bool:  # noqa: N802
        left = self.visit(node.left)
        right = self.visit(node.right)
        if isinstance(node.op, (ast.BitAnd, ast.And)):
            return left and right
        if isinstance(node.op, (ast.BitOr, ast.Or)):
            return left or right
        if isinstance(node.op, ast.BitXor):
            return bool(left) ^ bool(right)
        raise ValueError("Unsupported binary operator")

    def visit_Compare(self, node: ast.Compare) -> bool:  # noqa: N802
        if len(node.ops) != 1 or len(node.comparators) != 1:
            raise ValueError("Only single comparisons are supported")
        left = self.visit(node.left)
        right = self.visit(node.comparators[0])
        op = node.ops[0]
        if isinstance(op, ast.Eq):
            return left == right
        if isinstance(op, ast.NotEq):
            return left != right
        raise ValueError("Unsupported comparison operator")

    def generic_visit(self, node: ast.AST) -> bool:  # noqa: N802
        raise ValueError(f"Unsupported expression element: {type(node).__name__}")


def _parse_expression(expression: str) -> ast.Expression:
    try:
        parsed = ast.parse(expression, mode="eval")
    except SyntaxError as exc:  # pragma: no cover - direct re-raise with hint
        raise ValueError(f"Invalid boolean expression: {exc.msg}") from exc
    for node in ast.walk(parsed):
        if isinstance(node, ast.Call):
            raise ValueError("Function calls are not permitted in expressions")
        if isinstance(node, ast.Attribute):
            raise ValueError("Attributes are not permitted in expressions")
    return parsed


def _validate_variables(variables: Iterable[str]) -> List[str]:
    normalised = []
    for var in variables:
        if not var or not var.isidentifier():
            raise ValueError(f"Invalid variable name '{var}'")
        if var in normalised:
            raise ValueError(f"Duplicate variable '{var}'")
        normalised.append(var)
    if not normalised:
        raise ValueError("At least one variable is required")
    return normalised


def generate_truth_table(variables: Sequence[str], expression: str | None = None) -> TruthTable:
    vars_norm = _validate_variables(variables)
    parsed_expr = _parse_expression(expression) if expression else None

    rows: List[TruthTableRow] = []
    for values in itertools.product([False, True], repeat=len(vars_norm)):
        assignment = dict(zip(vars_norm, values))
        result = False
        if parsed_expr is not None:
            evaluator = BooleanEvaluator(assignment)
            result = evaluator.visit(parsed_expr.body)
        rows.append(TruthTableRow(assignment=assignment, result=result))

    return TruthTable(variables=vars_norm, rows=rows, expression=expression)


def persist_truth_table(table: TruthTable) -> Path:
    output_dir = ensure_domain(DOMAIN)
    output_dir.mkdir(parents=True, exist_ok=True)
    file_path = output_dir / f"truth_table_{_timestamp()}.json"
    write_json(file_path, table.to_serialisable())
    return file_path


def demo() -> Dict[str, object]:
    table = generate_truth_table(["A", "B"], expression="A and not B")
    path = persist_truth_table(table)
    return {
        "path": str(path),
        "rows": table.to_serialisable()["rows"],
    }
