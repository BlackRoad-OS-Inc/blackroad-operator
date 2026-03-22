import json
import pathlib
import subprocess
from typing import List

import click
import yaml

ROOT = pathlib.Path(__file__).parent
EXPERIMENTS_DIR = ROOT / "experiments"
NOTEBOOKS_DIR = ROOT / "notebooks"


def load_experiments() -> List[dict]:
    experiments = []
    for path in sorted(EXPERIMENTS_DIR.glob("*.yml")):
        with path.open() as handle:
            experiments.append(yaml.safe_load(handle))
    return experiments


def print_table(rows: List[dict]) -> None:
    headers = ["id", "status", "tags"]
    click.echo(" | ".join(headers))
    click.echo("-|-".join(["---"] * len(headers)))
    for row in rows:
        tags = ",".join(row.get("tags", []))
        click.echo(f"{row.get('id')} | {row.get('status')} | {tags}")


def run_agent(agent_name: str, cfg: dict) -> None:
    agent_path = ROOT / "agents" / f"{agent_name}.py"
    if not agent_path.exists():
        raise click.ClickException(f"Agent {agent_name} not found")
    subprocess.run(["python", str(agent_path), json.dumps(cfg)], check=True)


def publish_notebook(nb_path: pathlib.Path) -> None:
    html_path = nb_path.with_suffix(".html")
    try:
        subprocess.run(
            ["jupyter", "nbconvert", "--to", "html", str(nb_path), "--output", html_path.name],
            check=True,
        )
    except FileNotFoundError as err:
        raise click.ClickException(
            "jupyter command not found. Please install jupyter with: pip install jupyter nbconvert"
        ) from err
    except subprocess.CalledProcessError as e:
        raise click.ClickException(f"Failed to convert notebook: {e}") from e


@click.group()
def cli() -> None:
    """Blackroad Research Lab CLI."""


@cli.command()
def list() -> None:  # pylint: disable=redefined-builtin
    experiments = load_experiments()
    print_table(experiments)


@cli.command()
@click.argument("exp_id")
def run(exp_id: str) -> None:
    experiments = {item["id"]: item for item in load_experiments()}
    if exp_id not in experiments:
        raise click.ClickException(f"Experiment {exp_id} not found")
    cfg = experiments[exp_id]
    click.echo(f"Running {exp_id} via {cfg['agent']}...")
    run_agent(cfg["agent"], cfg)


@cli.command()
@click.argument("exp_id")
def publish(exp_id: str) -> None:
    experiments = {item["id"]: item for item in load_experiments()}
    if exp_id not in experiments:
        raise click.ClickException(f"Experiment {exp_id} not found")
    nb_path = ROOT / experiments[exp_id]["notebook"]
    if not nb_path.exists():
        raise click.ClickException("Notebook missing; run experiment first")
    click.echo(f"Publishing {nb_path}...")
    publish_notebook(nb_path)


if __name__ == "__main__":
    cli()
