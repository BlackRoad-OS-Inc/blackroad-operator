"""CLI commands for traffic light template orchestration."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

import typer

from orchestrator.traffic_light import (
    get_orchestrator,
    LightStatus,
    TrafficLightTemplate,
)

traffic_light_app = typer.Typer(help="Traffic light template orchestration")


@traffic_light_app.command("list")
def list_templates(
    status: Optional[str] = typer.Option(
        None,
        "--status",
        "-s",
        help="Filter by status (red, yellow, green)"
    )
):
    """List available traffic light templates."""
    orchestrator = get_orchestrator()
    
    if status:
        try:
            light_status = LightStatus(status.lower())
            templates = orchestrator.get_templates(light_status)
            typer.echo(f"\n{light_status.value.upper()} Templates:")
            for template in templates:
                typer.echo(f"  {template.emoji} {template.name} - {template.description}")
        except ValueError:
            typer.secho(f"Invalid status: {status}. Use: red, yellow, or green", fg="red")
            raise typer.Exit(1)
    else:
        # List all templates
        for status_val in LightStatus:
            templates = orchestrator.get_templates(status_val)
            typer.echo(f"\n{status_val.value.upper()} Templates ({len(templates)}):")
            for template in templates:
                typer.echo(f"  {template.emoji} {template.name} - {template.description}")


@traffic_light_app.command("select")
def select_template(
    status: str = typer.Option(
        ...,
        "--status",
        "-s",
        help="Template status (red, yellow, green)"
    ),
    name: Optional[str] = typer.Option(
        None,
        "--name",
        "-n",
        help="Template name (optional, uses first if not specified)"
    ),
    output: Optional[Path] = typer.Option(
        None,
        "--output",
        "-o",
        help="Output file path (optional, prints to stdout if not specified)"
    )
):
    """Select and output a specific template."""
    orchestrator = get_orchestrator()
    
    try:
        light_status = LightStatus(status.lower())
    except ValueError:
        typer.secho(f"Invalid status: {status}. Use: red, yellow, or green", fg="red")
        raise typer.Exit(1)
    
    template = orchestrator.select_template(light_status, name)
    
    if template is None:
        if name:
            typer.secho(f"Template '{name}' not found for status {status}", fg="red")
        else:
            typer.secho(f"No templates found for status {status}", fg="red")
        raise typer.Exit(1)
    
    # Read template content
    if template.template_path.exists():
        content = template.template_path.read_text()
    else:
        typer.secho(f"Template file not found: {template.template_path}", fg="yellow")
        content = f"# {template.emoji} {template.name}\n\n{template.description}\n"
    
    if output:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(content)
        typer.secho(f"Template written to: {output}", fg="green")
    else:
        typer.echo(content)


@traffic_light_app.command("route")
def route_template(
    criteria: list[str] = typer.Option(
        ...,
        "--criteria",
        "-c",
        help="Criteria to match (can be specified multiple times)"
    ),
    output: Optional[Path] = typer.Option(
        None,
        "--output",
        "-o",
        help="Output file path (optional, prints to stdout if not specified)"
    )
):
    """Route to appropriate template based on criteria."""
    orchestrator = get_orchestrator()
    
    template = orchestrator.route_by_criteria(criteria)
    
    if template is None:
        typer.secho("No matching template found for criteria", fg="yellow")
        raise typer.Exit(1)
    
    typer.secho(
        f"Routed to {template.status.value.upper()} template: {template.emoji} {template.name}",
        fg="green"
    )
    
    # Read template content
    if template.template_path.exists():
        content = template.template_path.read_text()
    else:
        typer.secho(f"Template file not found: {template.template_path}", fg="yellow")
        content = f"# {template.emoji} {template.name}\n\n{template.description}\n"
    
    if output:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(content)
        typer.secho(f"Template written to: {output}", fg="green")
    else:
        typer.echo("\n" + content)


@traffic_light_app.command("summary")
def show_summary():
    """Show summary of available templates."""
    orchestrator = get_orchestrator()
    summary = orchestrator.get_status_summary()
    
    typer.echo("\nTraffic Light Template Summary:")
    typer.echo("=" * 40)
    
    total = sum(summary.values())
    for status_name, count in summary.items():
        emoji = {
            "red": "🔴",
            "yellow": "🟡",
            "green": "🟢"
        }.get(status_name, "⚪️")
        typer.echo(f"{emoji} {status_name.upper():8} {count:2} templates")
    
    typer.echo("-" * 40)
    typer.echo(f"TOTAL:    {total:2} templates\n")


@traffic_light_app.command("meter")
def render_meter(
    status: str = typer.Option(
        ...,
        "--status",
        "-s",
        help="Status color (red, yellow, green)"
    ),
    level: int = typer.Option(
        3,
        "--level",
        "-l",
        min=1,
        max=5,
        help="Fill level (1-5)"
    )
):
    """Render a status meter with the specified status and level."""
    orchestrator = get_orchestrator()
    
    try:
        light_status = LightStatus(status.lower())
    except ValueError:
        typer.secho(f"Invalid status: {status}. Use: red, yellow, or green", fg="red")
        raise typer.Exit(1)
    
    meter = orchestrator.render_status_meter(light_status, level)
    typer.echo(f"\n{meter}\n")
    typer.echo(f"Status: {light_status.value.upper()} | Level: {level}/5")


@traffic_light_app.command("info")
def show_info(
    status: str = typer.Option(
        ...,
        "--status",
        "-s",
        help="Template status (red, yellow, green)"
    ),
    name: str = typer.Option(
        ...,
        "--name",
        "-n",
        help="Template name"
    )
):
    """Show detailed information about a specific template."""
    orchestrator = get_orchestrator()
    
    try:
        light_status = LightStatus(status.lower())
    except ValueError:
        typer.secho(f"Invalid status: {status}. Use: red, yellow, or green", fg="red")
        raise typer.Exit(1)
    
    template = orchestrator.select_template(light_status, name)
    
    if template is None:
        typer.secho(f"Template '{name}' not found for status {status}", fg="red")
        raise typer.Exit(1)
    
    typer.echo(f"\nTemplate Information:")
    typer.echo("=" * 50)
    typer.echo(f"Name:        {template.name}")
    typer.echo(f"Status:      {template.emoji} {template.status.value.upper()}")
    typer.echo(f"Description: {template.description}")
    typer.echo(f"Path:        {template.template_path}")
    typer.echo(f"\nCriteria:")
    for criterion in template.criteria:
        typer.echo(f"  • {criterion}")
    typer.echo()


@traffic_light_app.command("register")
def register_template(
    name: str = typer.Option(..., "--name", "-n", help="Template name"),
    status: str = typer.Option(..., "--status", "-s", help="Status (red, yellow, green)"),
    template_path: Path = typer.Option(..., "--path", "-p", help="Path to template file"),
    description: str = typer.Option(..., "--description", "-d", help="Template description"),
    criteria: list[str] = typer.Option(
        [],
        "--criteria",
        "-c",
        help="Routing criteria (can be specified multiple times)"
    )
):
    """Register a custom template."""
    orchestrator = get_orchestrator()
    
    try:
        light_status = LightStatus(status.lower())
    except ValueError:
        typer.secho(f"Invalid status: {status}. Use: red, yellow, or green", fg="red")
        raise typer.Exit(1)
    
    if not template_path.exists():
        typer.secho(f"Template file not found: {template_path}", fg="red")
        raise typer.Exit(1)
    
    emoji_map = {
        LightStatus.RED: "🔴",
        LightStatus.YELLOW: "🟡",
        LightStatus.GREEN: "🟢"
    }
    
    template = TrafficLightTemplate(
        name=name,
        status=light_status,
        template_path=template_path,
        description=description,
        emoji=emoji_map[light_status],
        criteria=criteria
    )
    
    orchestrator.register_template(template)
    typer.secho(f"✅ Template '{name}' registered successfully!", fg="green")


def register_traffic_light_commands(main_app: typer.Typer):
    """Register traffic light commands with the main CLI app."""
    main_app.add_typer(traffic_light_app, name="traffic-light")


if __name__ == "__main__":
    traffic_light_app()
