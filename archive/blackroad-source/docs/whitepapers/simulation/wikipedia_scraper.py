"""
Wikipedia scraper — fetches introductory summaries for key topics in the
simulation-theory research repository.

Topics covered: simulation hypothesis, SHA-256, Gödel incompleteness,
Riemann hypothesis, quantum computing, halting problem, integrated information
theory, fine-structure constant, Euler's identity, and more.

Usage:
    python wikipedia_scraper.py
    python wikipedia_scraper.py --topics "Riemann hypothesis" "SHA-2"
    python wikipedia_scraper.py --output results.json
"""

import argparse
import json
import time

import requests
from bs4 import BeautifulSoup

WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"

DEFAULT_TOPICS = [
    "Simulation hypothesis",
    "SHA-2",
    "Gödel's incompleteness theorems",
    "Riemann hypothesis",
    "Quantum computing",
    "Halting problem",
    "Integrated information theory",
    "Fine-structure constant",
    "Euler's identity",
    "Ternary numeral system",
    "DNA",
    "Blockchain",
    "Boltzmann entropy formula",
    "Turing machine",
]


def fetch_summary(topic: str) -> dict:
    """Return a dict with title, url and plain-text intro for a Wikipedia topic."""
    params = {
        "action": "query",
        "prop": "extracts|info",
        "exintro": True,
        "explaintext": True,
        "inprop": "url",
        "titles": topic,
        "format": "json",
        "redirects": 1,
    }
    resp = requests.get(WIKIPEDIA_API, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    pages = data.get("query", {}).get("pages", {})
    page = next(iter(pages.values()))

    if "missing" in page:
        return {"topic": topic, "title": topic, "url": "", "summary": ""}

    return {
        "topic": topic,
        "title": page.get("title", topic),
        "url": page.get("fullurl", ""),
        "summary": page.get("extract", "").strip(),
    }


def scrape(topics: list[str]) -> list[dict]:
    """Scrape Wikipedia summaries for each topic."""
    results = []
    for topic in topics:
        print(f"Fetching: {topic!r} …")
        try:
            results.append(fetch_summary(topic))
        except requests.RequestException as exc:
            print(f"  Error: {exc}")
            results.append({"topic": topic, "title": topic, "url": "", "summary": ""})
        time.sleep(0.5)  # be polite
    return results


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scrape Wikipedia summaries for simulation-theory topics."
    )
    parser.add_argument(
        "--topics",
        nargs="*",
        default=DEFAULT_TOPICS,
        help="Wikipedia article titles to scrape (defaults to built-in topic list).",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Write results to a JSON file instead of stdout.",
    )
    args = parser.parse_args()

    results = scrape(args.topics)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as fh:
            json.dump(results, fh, indent=2, ensure_ascii=False)
        print(f"Results written to {args.output}")
    else:
        print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
