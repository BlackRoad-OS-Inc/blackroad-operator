# Scrapers

Python web scrapers for collecting data relevant to the simulation-theory research repository.

## Scrapers

| Script | Source | Topics |
|--------|--------|--------|
| [`arxiv_scraper.py`](./arxiv_scraper.py) | [arXiv](https://arxiv.org) | Simulation hypothesis, Gödel incompleteness, Riemann zeta, qutrit/ternary quantum, halting problem, IIT consciousness |
| [`wikipedia_scraper.py`](./wikipedia_scraper.py) | [Wikipedia](https://en.wikipedia.org) | SHA-256, Riemann hypothesis, quantum computing, Euler's identity, fine-structure constant, Turing machine, DNA, Blockchain |
| [`oeis_scraper.py`](./oeis_scraper.py) | [OEIS](https://oeis.org) | Prime numbers, Fibonacci, pi digits, Euler–Mascheroni constant, Catalan numbers, partition numbers |

## Setup

```bash
pip install -r requirements.txt
```

## Usage

### arXiv scraper

```bash
# Use default topic list
python arxiv_scraper.py

# Custom query, limit to 3 results per query
python arxiv_scraper.py --query "Riemann hypothesis zeros" --max 3

# Save to file
python arxiv_scraper.py --output arxiv_results.json
```

### Wikipedia scraper

```bash
# Use default topic list
python wikipedia_scraper.py

# Custom topics
python wikipedia_scraper.py --topics "Riemann hypothesis" "SHA-2" "Turing machine"

# Save to file
python wikipedia_scraper.py --output wikipedia_results.json
```

### OEIS scraper

```bash
# Use default sequence list
python oeis_scraper.py

# Custom sequence IDs
python oeis_scraper.py --ids A000040 A000045 A000796

# Save to file
python oeis_scraper.py --output oeis_results.json
```

## Output format

All scrapers output JSON to stdout by default, or to a file with `--output`.

**arXiv** — dict keyed by query, each value is a list of:
```json
{
  "title": "...",
  "authors": ["..."],
  "published": "2024-01-01T00:00:00Z",
  "abstract": "...",
  "url": "https://arxiv.org/abs/..."
}
```

**Wikipedia** — list of:
```json
{
  "topic": "SHA-2",
  "title": "SHA-2",
  "url": "https://en.wikipedia.org/wiki/SHA-2",
  "summary": "..."
}
```

**OEIS** — list of:
```json
{
  "id": "A000040",
  "name": "The prime numbers.",
  "description": "...",
  "values": ["2", "3", "5", "7", "11", "..."],
  "url": "https://oeis.org/A000040"
}
```
