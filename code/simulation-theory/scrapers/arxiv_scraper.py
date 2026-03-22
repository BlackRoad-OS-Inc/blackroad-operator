"""
arXiv scraper — fetches abstracts for papers related to simulation theory research topics.

Topics covered: simulation hypothesis, Gödel incompleteness, Riemann hypothesis,
quantum computation, SHA-256/cryptographic hash functions, consciousness/integrated
information theory, ternary/qutrit systems.

Usage:
    python arxiv_scraper.py
    python arxiv_scraper.py --query "Riemann hypothesis" --max 5
    python arxiv_scraper.py --output results.json
"""

import argparse
import json
import time
import xml.etree.ElementTree as ET

import requests

ARXIV_API = "https://export.arxiv.org/api/query"

DEFAULT_QUERIES = [
    "simulation hypothesis computational reality",
    "Gödel incompleteness self-reference formal systems",
    "Riemann zeta function trivial zeros",
    "SHA-256 hash chain cryptographic proof",
    "qutrit ternary quantum computation",
    "integrated information theory consciousness",
    "halting problem quantum physics undecidability",
]

NS = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}


def fetch_papers(query: str, max_results: int = 5) -> list[dict]:
    """Return a list of paper dicts for the given arXiv search query."""
    params = {
        "search_query": f"all:{query}",
        "start": 0,
        "max_results": max_results,
        "sortBy": "relevance",
        "sortOrder": "descending",
    }
    resp = requests.get(ARXIV_API, params=params, timeout=30)
    resp.raise_for_status()

    root = ET.fromstring(resp.text)
    papers = []
    for entry in root.findall("atom:entry", NS):
        title_el = entry.find("atom:title", NS)
        summary_el = entry.find("atom:summary", NS)
        id_el = entry.find("atom:id", NS)
        published_el = entry.find("atom:published", NS)
        authors = [
            a.find("atom:name", NS).text
            for a in entry.findall("atom:author", NS)
            if a.find("atom:name", NS) is not None
        ]
        papers.append(
            {
                "title": title_el.text.strip() if title_el is not None else "",
                "authors": authors,
                "published": published_el.text.strip() if published_el is not None else "",
                "abstract": summary_el.text.strip() if summary_el is not None else "",
                "url": id_el.text.strip() if id_el is not None else "",
            }
        )
    return papers


def scrape(queries: list[str], max_per_query: int = 5) -> dict[str, list[dict]]:
    """Scrape arXiv for each query and return results keyed by query string."""
    results = {}
    for query in queries:
        print(f"Fetching: {query!r} …")
        try:
            results[query] = fetch_papers(query, max_results=max_per_query)
        except requests.RequestException as exc:
            print(f"  Error: {exc}")
            results[query] = []
        time.sleep(1)  # be polite to the API
    return results


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrape arXiv for simulation-theory topics.")
    parser.add_argument(
        "--query",
        nargs="*",
        default=DEFAULT_QUERIES,
        help="Search queries (defaults to built-in topic list).",
    )
    parser.add_argument(
        "--max",
        type=int,
        default=5,
        dest="max_results",
        help="Maximum results per query (default: 5).",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Write results to a JSON file instead of stdout.",
    )
    args = parser.parse_args()

    results = scrape(args.query, max_per_query=args.max_results)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as fh:
            json.dump(results, fh, indent=2, ensure_ascii=False)
        print(f"Results written to {args.output}")
    else:
        print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
