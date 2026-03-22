"""Compute the Amundson Identity Overlap Score (IOS) for multiple agents.

Usage example::

    python -m twin.ios --responses /path/to/answers.yaml

The responses file may be YAML or JSON. Two canonical layouts are supported::

    agents:
      - id: clone_a
        answers:
          axioms.truth_telling: "I default to truth even when it is costly."
          horizons.one_year_vector: "Ship the resilience console."
      - id: clone_b
        answers:
          axioms.truth_telling: "Always surface the real data."

    # or a flat mapping keyed by agent id
    clone_a:
      axioms.truth_telling: "..."

Pairwise IOS values close to 1.0 indicate the agents are behaviorally aligned on
self-state probes. Drift alerts surface individual questions whose per-answer
IOS falls below the configured threshold (default 0.80).
"""

from __future__ import annotations

import argparse
import json
import math
import re
from collections import Counter
from itertools import combinations
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, Sequence, Tuple

import yaml

DEFAULT_PROBE_PATH = Path("twin/resources/identity_probe.yaml")
EPSILON = 1e-12


def load_probe(path: Path) -> Mapping[str, Mapping[str, str]]:
    """Return a mapping of question id -> probe metadata."""

    with path.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle)
    probe = data.get("probe", [])
    questions: Dict[str, Mapping[str, str]] = {}
    for item in probe:
        if not isinstance(item, Mapping):
            continue
        qid = str(item.get("id"))
        if not qid:
            continue
        questions[qid] = item
    return questions


def load_responses(path: Path) -> Mapping[str, Mapping[str, str]]:
    """Load agent responses from YAML or JSON."""

    with path.open("r", encoding="utf-8") as handle:
        if path.suffix.lower() == ".json":
            raw = json.load(handle)
        else:
            raw = yaml.safe_load(handle)

    agents: Dict[str, Dict[str, str]] = {}
    if isinstance(raw, Mapping) and "agents" in raw:
        entries = raw.get("agents", [])
        if not isinstance(entries, Iterable):
            raise ValueError("'agents' key must be a list of agent definitions")
        for entry in entries:
            if not isinstance(entry, Mapping):
                continue
            agent_id = str(entry.get("id"))
            answers = entry.get("answers", {})
            if not agent_id:
                raise ValueError("Each agent entry must include an 'id'")
            if not isinstance(answers, Mapping):
                raise ValueError(f"Answers for agent {agent_id} must be a mapping")
            agents[agent_id] = {str(k): str(v) for k, v in answers.items()}
    elif isinstance(raw, Mapping):
        for agent_id, answers in raw.items():
            if not isinstance(answers, Mapping):
                raise ValueError(f"Answers for agent {agent_id} must be a mapping")
            agents[str(agent_id)] = {str(k): str(v) for k, v in answers.items()}
    else:
        raise ValueError("Unsupported response file structure")

    if len(agents) < 2:
        raise ValueError("Need at least two agents to compute overlap scores")

    return agents


_token_pattern = re.compile(r"[a-z0-9']+")


def tokenize(text: str) -> List[str]:
    tokens = _token_pattern.findall(text.lower())
    return tokens or ["<empty>"]


def normalize(counter: Counter) -> Dict[str, float]:
    total = sum(counter.values())
    if not total:
        return {"<empty>": 1.0}
    return {token: count / total for token, count in counter.items()}


def aggregate_distribution(answers: Mapping[str, str]) -> Dict[str, float]:
    counter: Counter = Counter()
    for answer in answers.values():
        counter.update(tokenize(answer))
    return normalize(counter)


def answer_distribution(answer: str) -> Dict[str, float]:
    return normalize(Counter(tokenize(answer)))


def kl_divergence(p: Mapping[str, float], q: Mapping[str, float]) -> float:
    value = 0.0
    for key, pk in p.items():
        if pk <= 0:
            continue
        qk = q.get(key, 0.0)
        qk = qk if qk > 0 else EPSILON
        value += pk * math.log(pk / qk)
    return value


def js_divergence(p: Mapping[str, float], q: Mapping[str, float]) -> float:
    keys = set(p) | set(q)
    m: Dict[str, float] = {}
    for key in keys:
        m[key] = 0.5 * (p.get(key, 0.0) + q.get(key, 0.0))
    return 0.5 * kl_divergence(p, m) + 0.5 * kl_divergence(q, m)


def identity_overlap(p: Mapping[str, float], q: Mapping[str, float]) -> float:
    """Return IOS = 1 - JSD / log(2)."""

    divergence = js_divergence(p, q)
    return max(0.0, 1.0 - divergence / math.log(2))


def compute_matrix(responses: Mapping[str, Mapping[str, str]]) -> Tuple[List[str], List[List[float]]]:
    agent_ids = sorted(responses)
    distributions = {agent: aggregate_distribution(responses[agent]) for agent in agent_ids}
    matrix: List[List[float]] = []
    for agent_a in agent_ids:
        row: List[float] = []
        for agent_b in agent_ids:
            if agent_a == agent_b:
                row.append(1.0)
            else:
                row.append(identity_overlap(distributions[agent_a], distributions[agent_b]))
        matrix.append(row)
    return agent_ids, matrix


def detect_drift(
    responses: Mapping[str, Mapping[str, str]],
    questions: Mapping[str, Mapping[str, str]],
    threshold: float,
    top_n: int,
) -> List[Tuple[str, float, Mapping[str, str]]]:
    """Return question ids whose minimum IOS falls below the threshold."""

    agent_ids = sorted(responses)
    drifts: List[Tuple[str, float, Mapping[str, str]]] = []
    for qid, meta in questions.items():
        per_agent_answers = {agent: responses[agent].get(qid, "") for agent in agent_ids}
        scores: List[float] = []
        for agent_a, agent_b in combinations(agent_ids, 2):
            dist_a = answer_distribution(per_agent_answers[agent_a])
            dist_b = answer_distribution(per_agent_answers[agent_b])
            scores.append(identity_overlap(dist_a, dist_b))
        if not scores:
            continue
        min_score = min(scores)
        if min_score < threshold:
            drifts.append((qid, min_score, per_agent_answers))
    drifts.sort(key=lambda item: item[1])
    if top_n:
        drifts = drifts[:top_n]
    return drifts


def format_matrix(agent_ids: Sequence[str], matrix: Sequence[Sequence[float]]) -> str:
    label_width = max(len("agent"), *(len(agent) for agent in agent_ids))
    widths = [max(len(agent_ids[i]), 5) for i in range(len(agent_ids))]
    header_cells = ["agent".ljust(label_width)]
    for idx, agent in enumerate(agent_ids):
        header_cells.append(agent.ljust(widths[idx]))
    lines = [" ".join(header_cells)]
    for agent, row in zip(agent_ids, matrix):
        cells = [agent.ljust(label_width)]
        for idx, value in enumerate(row):
            cells.append(f"{value:0.3f}".ljust(widths[idx]))
        lines.append(" ".join(cells))
    return "\n".join(lines)


def print_drift(
    drifts: Sequence[Tuple[str, float, Mapping[str, str]]],
    questions: Mapping[str, Mapping[str, str]],
) -> None:
    if not drifts:
        print("\nNo drift alerts — all pairwise IOS values are above threshold.")
        return

    print("\nDrift alerts:")
    for qid, score, answers in drifts:
        prompt = questions.get(qid, {}).get("prompt", "")
        print(f"- {qid} (min IOS={score:0.3f})")
        if prompt:
            print(f"  Prompt: {prompt}")
        for agent, answer in answers.items():
            sample = answer.strip().replace("\n", " ")
            if len(sample) > 120:
                sample = sample[:117] + "..."
            print(f"  {agent}: {sample or '<empty>'}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Compute the Identity Overlap Score across agents.")
    parser.add_argument(
        "--responses",
        required=True,
        type=Path,
        help="Path to YAML/JSON file containing agent answers to the probe questions.",
    )
    parser.add_argument(
        "--questions",
        type=Path,
        default=DEFAULT_PROBE_PATH,
        help="Path to the probe YAML definition. Defaults to twin/resources/identity_probe.yaml.",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.8,
        help="Minimum acceptable per-question IOS before flagging drift.",
    )
    parser.add_argument(
        "--top",
        type=int,
        default=10,
        help="Maximum number of drift items to print (0 = no limit).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    questions = load_probe(args.questions)
    responses = load_responses(args.responses)
    agent_ids, matrix = compute_matrix(responses)
    print("Pairwise Identity Overlap Score (IOS)")
    print("------------------------------------")
    print(format_matrix(agent_ids, matrix))

    drifts = detect_drift(responses, questions, args.threshold, args.top)
    print_drift(drifts, questions)


if __name__ == "__main__":
    main()
