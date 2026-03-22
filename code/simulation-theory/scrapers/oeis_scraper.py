"""
OEIS (On-Line Encyclopedia of Integer Sequences) scraper — fetches sequence
metadata for integer sequences relevant to simulation-theory research.

Sequences of interest: primes, Fibonacci, pi digits, Euler–Mascheroni constant
digits, Pascal's triangle, Catalan numbers, SHA-256 round constants, and others.

Usage:
    python oeis_scraper.py
    python oeis_scraper.py --ids A000040 A000045
    python oeis_scraper.py --output results.json
"""

import argparse
import json
import time

import requests

OEIS_SEARCH_URL = "https://oeis.org/search"

# Default sequence IDs relevant to the repository topics
DEFAULT_IDS = [
    "A000040",   # prime numbers
    "A000045",   # Fibonacci numbers
    "A000796",   # decimal expansion of pi
    "A001620",   # decimal expansion of Euler–Mascheroni constant
    "A000108",   # Catalan numbers
    "A000012",   # the all-1s sequence (trivial zero analogue)
    "A000720",   # pi(n): number of primes <= n
    "A006862",   # Euclid numbers: 1 + product of first n primes
    "A000041",   # number of partitions of n
    "A001358",   # semiprimes
]


def fetch_sequence(oeis_id: str) -> dict:
    """Fetch metadata for a single OEIS sequence via the JSON search endpoint."""
    params = {"q": f"id:{oeis_id}", "fmt": "json"}
    resp = requests.get(OEIS_SEARCH_URL, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    results = data.get("results") or []
    if not results:
        return {"id": oeis_id, "name": "", "description": "", "values": [], "url": ""}

    seq = results[0]
    return {
        "id": oeis_id,
        "name": seq.get("name", ""),
        "description": seq.get("comment", [""])[0] if seq.get("comment") else "",
        "values": seq.get("data", "").split(",")[:20],  # first 20 terms
        "url": f"https://oeis.org/{oeis_id}",
    }


def scrape(ids: list[str]) -> list[dict]:
    """Scrape OEIS for each sequence ID."""
    results = []
    for oeis_id in ids:
        print(f"Fetching: {oeis_id} …")
        try:
            results.append(fetch_sequence(oeis_id))
        except requests.RequestException as exc:
            print(f"  Error: {exc}")
            results.append({"id": oeis_id, "name": "", "description": "", "values": [], "url": ""})
        time.sleep(0.5)  # be polite
    return results


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scrape OEIS sequences relevant to simulation-theory research."
    )
    parser.add_argument(
        "--ids",
        nargs="*",
        default=DEFAULT_IDS,
        help="OEIS sequence IDs (e.g. A000040). Defaults to built-in list.",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Write results to a JSON file instead of stdout.",
    )
    args = parser.parse_args()

    results = scrape(args.ids)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as fh:
            json.dump(results, fh, indent=2, ensure_ascii=False)
        print(f"Results written to {args.output}")
    else:
        print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
