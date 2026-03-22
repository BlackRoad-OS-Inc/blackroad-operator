"""Unified deployment script for Prism Console."""

from __future__ import annotations

import base64
import secrets
import time
from pathlib import Path
from typing import Optional

import typer

app = typer.Typer(help="Deployment orchestrator")


def _validate_env(env: str) -> str:
    env_lower = env.lower()
    if env_lower not in {"staging", "production"}:
        raise typer.BadParameter("Environment must be 'staging' or 'production'")
    return env_lower


@app.command()
def push(env: str = typer.Option(..., help="Target environment"), version: Optional[str] = typer.Option(None, help="Optional release version")) -> None:
    """Simulate pushing a release."""

    env_lower = _validate_env(env)
    typer.echo(f"Deploying Prism Console to {env_lower}...")
    if version:
        typer.echo(f"Using release version {version}")
    time.sleep(0.1)
    typer.echo("Deployment completed")


@app.command()
def rollback(
    env: str = typer.Option(..., help="Target environment"),
    release: str = typer.Option(..., help="Release identifier to rollback"),
) -> None:
    """Simulate rollback to a previous release."""

    env_lower = _validate_env(env)
    typer.echo(f"Rolling back {env_lower} to release {release}...")
    time.sleep(0.1)
    typer.echo("Rollback complete")


@app.command()
def status(env: str = typer.Option(..., help="Target environment")) -> None:
    """Display deployment status."""

    env_lower = _validate_env(env)
    typer.echo(f"Environment: {env_lower}")
    typer.echo("Status: healthy")
    typer.echo("Latest release: 2025.02.14")


@app.command()
def keys(output: Path = typer.Option(..., help="Path to write signing key")) -> None:
    """Generate a signing key for audit logs."""

    output.parent.mkdir(parents=True, exist_ok=True)
    key = base64.b64encode(secrets.token_bytes(32)).decode("utf-8")
    output.write_text(key, encoding="utf-8")
    typer.echo(f"Wrote signing key to {output}")


if __name__ == "__main__":
    app()
