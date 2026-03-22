"""CashForecast-BOT agent for generating Q4 revenue forecasts from sales CSVs.

This lightweight script is designed for single-device workflows where Ollama is
available locally. It reads a CSV file, summarizes the data, and asks a small
language model to emit a structured JSON forecast for the upcoming quarter.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import pandas as pd
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import OllamaLLM

LLM_MODEL_NAME = "llama3.2:1b"

PROMPT = ChatPromptTemplate.from_template(
    (
        "You are CashForecast-BOT. From this sales CSV data: {data}, project Q4 "
        'revenue. Assume 5% MoM growth. Output JSON: {"q4_forecast": float, '
        '"assumptions": list}. Be precise.'
    )
)


def summarize_sales(csv_path: Path) -> str:
    """Return a compact textual summary of the provided sales CSV."""
    df = pd.read_csv(csv_path)
    numeric_summary = df.describe(include="all").fillna(0).to_string()
    recent_rows = df.tail(5).to_dict(orient="records")
    return f"Summary:\n{numeric_summary}\nRecent rows: {recent_rows}"


def _parse_response(response: Any) -> dict[str, Any]:
    """Convert the LLM response into a dictionary with meaningful errors."""
    if isinstance(response, dict):
        return response
    if isinstance(response, str):
        try:
            return json.loads(response)
        except json.JSONDecodeError as exc:
            raise ValueError("Model response was not valid JSON.") from exc
    raise TypeError(f"Unexpected response type: {type(response)!r}")


def forecast_from_csv(csv_path: Path) -> dict[str, Any]:
    """Generate a Q4 revenue forecast for the provided sales CSV."""
    chain = PROMPT | OllamaLLM(model=LLM_MODEL_NAME)
    response = chain.invoke({"data": summarize_sales(csv_path)})
    return _parse_response(response)


def _log_audit(csv_path: Path, forecast: dict[str, Any], audit_path: Path) -> None:
    """Append the forecast result to the specified JSON Lines audit log."""
    record = {"input": str(csv_path), "output": forecast}
    with audit_path.open("a", encoding="utf-8") as audit_file:
        audit_file.write(json.dumps(record) + "\n")


def main(argv: list[str]) -> int:
    """Entrypoint for command-line execution."""
    if len(argv) not in {2, 3}:
        print("Usage: python cash_forecast_bot.py <sales.csv> [audit.jsonl]", file=sys.stderr)
        return 1

    csv_path = Path(argv[1]).expanduser()
    forecast = forecast_from_csv(csv_path)
    print(json.dumps(forecast, indent=2))

    if len(argv) == 3:
        audit_path = Path(argv[2]).expanduser()
        _log_audit(csv_path, forecast, audit_path)
        print(f"Logged to {audit_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
