"""Command line interface for the Lucid Ego local memory store."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Sequence

from .db import LucidEgoDB


def positive_int(value: str) -> int:
    try:
        parsed = int(value)
    except ValueError as exc:  # pragma: no cover - defensive branch
        raise argparse.ArgumentTypeError("step index must be an integer") from exc
    if parsed < 0:
        raise argparse.ArgumentTypeError("step index must be non-negative")
    return parsed


def parse_vector(values: str | Sequence[str]) -> Sequence[float]:
    if isinstance(values, (list, tuple)):
        joined = ",".join(values)
    else:
        joined = values
    if not joined:
        raise argparse.ArgumentTypeError("vector values may not be empty")
    try:
        return [float(item.strip()) for item in joined.split(",") if item.strip()]
    except ValueError as exc:  # pragma: no cover - defensive branch
        raise argparse.ArgumentTypeError("unable to parse vector values") from exc


def parse_metadata(text: str | None) -> dict:
    if not text:
        return {}
    try:
        value = json.loads(text)
    except json.JSONDecodeError as exc:  # pragma: no cover - defensive branch
        raise argparse.ArgumentTypeError("metadata must be valid JSON") from exc
    if not isinstance(value, dict):
        raise argparse.ArgumentTypeError("metadata JSON must be an object")
    return value


def add_common_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--db",
        default="lucid_ego.db",
        help="Path to the SQLite database file (default: lucid_ego.db)",
    )


def command_init(args: argparse.Namespace) -> None:
    db = LucidEgoDB(Path(args.db))
    db.init()
    print(f"Initialised Lucid Ego database at {Path(args.db).resolve()}")


def command_agent_add(args: argparse.Namespace) -> None:
    db = LucidEgoDB(Path(args.db))
    agent_id = db.ensure_agent(args.name, role=args.role, agent_id=args.id)
    print(agent_id)


def command_run_start(args: argparse.Namespace) -> None:
    db = LucidEgoDB(Path(args.db))
    session_id = db.start_session(args.agent, label=args.label)
    print(session_id)


def command_run_end(args: argparse.Namespace) -> None:
    db = LucidEgoDB(Path(args.db))
    db.end_session(args.session)
    print(args.session)


def command_log(args: argparse.Namespace) -> None:
    db = LucidEgoDB(Path(args.db))
    log_id = db.log(args.session, args.level, args.channel, args.message)
    print(log_id)


def command_decision(args: argparse.Namespace) -> None:
    db = LucidEgoDB(Path(args.db))
    decision_id = db.record_decision(
        args.session,
        step_index=args.step,
        prompt=args.prompt,
        output=args.output,
        rationale=args.rationale,
        score=args.score,
    )
    print(decision_id)


def command_embedding(args: argparse.Namespace) -> None:
    db = LucidEgoDB(Path(args.db))
    vector = parse_vector(args.vector)
    metadata = parse_metadata(args.metadata)
    embedding_id = db.add_embedding(
        args.session,
        ref_kind=args.ref_kind,
        ref_id=args.ref_id,
        model=args.model,
        vector=vector,
        metadata=metadata,
    )
    print(embedding_id)


def command_dump(args: argparse.Namespace) -> None:
    db = LucidEgoDB(Path(args.db))
    if args.json:
        print(db.dump_session(args.session))
        return

    bundle = db.get_session(args.session)
    session = bundle["session"]
    agent = bundle.get("agent") or {}
    print(f"Session {session['id']} (agent={agent.get('name', 'unknown')} label={session.get('label')})")
    print(f"  started: {session.get('started_at')} ended: {session.get('ended_at')}")
    print("  Decisions:")
    for decision in bundle["decisions"]:
        print(
            f"    [{decision['step_index']}] id={decision['id']} score={decision.get('score')}",
        )
        prompt = decision.get("prompt")
        if prompt:
            print(f"      prompt: {prompt[:120]}")
        output = decision.get("output")
        if output:
            print(f"      output: {output[:120]}")
        rationale = decision.get("rationale")
        if rationale:
            print(f"      rationale: {rationale[:120]}")
    print("  Logs:")
    for log in bundle["logs"][-args.tail :]:
        print(f"    {log['ts']} {log.get('level', 'INFO')} {log.get('channel', '-')}: {log.get('message', '')}")
    if bundle["artifacts"]:
        print("  Artifacts:")
        for artifact in bundle["artifacts"]:
            print(
                "    {id} {kind} -> {uri}".format(
                    id=artifact["id"], kind=artifact.get("kind", ""), uri=artifact.get("uri", ""),
                )
            )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    init_parser = subparsers.add_parser("init", help="initialise the database")
    add_common_arguments(init_parser)
    init_parser.set_defaults(func=command_init)

    agent_parser = subparsers.add_parser("agent", help="manage agents")
    add_common_arguments(agent_parser)
    agent_sub = agent_parser.add_subparsers(dest="agent_command", required=True)
    agent_add = agent_sub.add_parser("add", help="create or update an agent")
    agent_add.add_argument("name", help="Agent display name")
    agent_add.add_argument("--id", help="Optional agent id (defaults to UUID4)")
    agent_add.add_argument("--role", help="Agent role or description")
    add_common_arguments(agent_add)
    agent_add.set_defaults(func=command_agent_add)

    run_parser = subparsers.add_parser("run", help="manage sessions")
    add_common_arguments(run_parser)
    run_sub = run_parser.add_subparsers(dest="run_command", required=True)

    run_start = run_sub.add_parser("start", help="start a session")
    add_common_arguments(run_start)
    run_start.add_argument("agent", help="Agent id")
    run_start.add_argument("--label", help="Optional session label")
    run_start.set_defaults(func=command_run_start)

    run_end = run_sub.add_parser("end", help="end a session")
    add_common_arguments(run_end)
    run_end.add_argument("session", help="Session id")
    run_end.set_defaults(func=command_run_end)

    log_parser = subparsers.add_parser("log", help="append a log line")
    add_common_arguments(log_parser)
    log_parser.add_argument("session", help="Session id")
    log_parser.add_argument("level", help="Log level", default="INFO")
    log_parser.add_argument("channel", help="Log channel")
    log_parser.add_argument("message", help="Log message")
    log_parser.set_defaults(func=command_log)

    decision_parser = subparsers.add_parser("decision", help="record a decision")
    add_common_arguments(decision_parser)
    decision_parser.add_argument("session", help="Session id")
    decision_parser.add_argument("step", type=positive_int, help="Step index")
    decision_parser.add_argument("--prompt", help="Prompt text")
    decision_parser.add_argument("--output", help="Output text")
    decision_parser.add_argument("--rationale", help="Decision rationale")
    decision_parser.add_argument("--score", type=float, help="Confidence score")
    decision_parser.set_defaults(func=command_decision)

    embedding_parser = subparsers.add_parser("embedding", help="store an embedding")
    add_common_arguments(embedding_parser)
    embedding_parser.add_argument("session", help="Session id", nargs="?")
    embedding_parser.add_argument("ref_kind", help="Reference kind, e.g. prompt or doc")
    embedding_parser.add_argument("ref_id", help="Reference identifier")
    embedding_parser.add_argument("model", help="Embedding model name")
    embedding_parser.add_argument(
        "--vector",
        required=True,
        help="Comma separated vector values (e.g. '0.1,0.2,0.3')",
    )
    embedding_parser.add_argument(
        "--metadata",
        help="JSON encoded metadata to store alongside the embedding",
    )
    embedding_parser.set_defaults(func=command_embedding)

    dump_parser = subparsers.add_parser("dump", help="show session details")
    add_common_arguments(dump_parser)
    dump_parser.add_argument("session", help="Session id")
    dump_parser.add_argument("--json", action="store_true", help="Emit raw JSON output")
    dump_parser.add_argument(
        "--tail",
        type=positive_int,
        default=25,
        help="Number of log entries to display (default: 25)",
    )
    dump_parser.set_defaults(func=command_dump)

    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    func = getattr(args, "func", None)
    if func is None:
        parser.print_help()
        return 1
    func(args)
    return 0


if __name__ == "__main__":  # pragma: no cover - manual invocation guard
    sys.exit(main())
