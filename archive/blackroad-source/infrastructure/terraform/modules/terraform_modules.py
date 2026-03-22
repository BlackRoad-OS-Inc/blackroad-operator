"""
BlackRoad Terraform Modules
Production-quality Terraform module generation and IaC management.
"""

from __future__ import annotations
import argparse
import json
import re
import sqlite3
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional


DB_PATH = Path.home() / ".blackroad" / "terraform_modules.db"

# ---------------------------------------------------------------------------
# Pricing table (USD/hr)
# ---------------------------------------------------------------------------

PRICING: dict[str, dict[str, float]] = {
    "aws": {
        "instance": 0.023,    # t3.small per hr
        "rds": 0.017,
        "s3": 0.000023,       # per GB-month
        "vpc": 0.0,
        "subnet": 0.0,
        "security_group": 0.0,
        "load_balancer": 0.008,
        "nat_gateway": 0.045,
        "elasticache": 0.034,
        "lambda": 0.0000002,  # per invocation
    },
    "gcp": {
        "instance": 0.019,
        "sql": 0.014,
        "storage": 0.00002,
        "vpc": 0.0,
        "subnet": 0.0,
        "load_balancer": 0.008,
        "nat": 0.044,
        "redis": 0.029,
    },
    "azure": {
        "vm": 0.021,
        "sql": 0.016,
        "blob": 0.000018,
        "vnet": 0.0,
        "subnet": 0.0,
        "load_balancer": 0.009,
        "nat_gateway": 0.047,
    },
}

# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class TerraformVariable:
    name: str
    type: str = "string"
    description: str = ""
    default: Any = None
    required: bool = False
    sensitive: bool = False

    def to_tf(self) -> str:
        lines = [f'variable "{self.name}" {{']
        lines.append(f'  type        = {self.type}')
        if self.description:
            lines.append(f'  description = "{self.description}"')
        if self.default is not None:
            if isinstance(self.default, str):
                lines.append(f'  default     = "{self.default}"')
            elif isinstance(self.default, bool):
                lines.append(f'  default     = {str(self.default).lower()}')
            else:
                lines.append(f'  default     = {json.dumps(self.default)}')
        if self.sensitive:
            lines.append("  sensitive   = true")
        lines.append("}")
        return "\n".join(lines)


@dataclass
class TerraformOutput:
    name: str
    value: str
    description: str = ""
    sensitive: bool = False

    def to_tf(self) -> str:
        lines = [f'output "{self.name}" {{']
        lines.append(f'  value       = {self.value}')
        if self.description:
            lines.append(f'  description = "{self.description}"')
        if self.sensitive:
            lines.append("  sensitive   = true")
        lines.append("}")
        return "\n".join(lines)


@dataclass
class TerraformModule:
    name: str
    provider: str                             # aws | gcp | azure
    resource_type: str                        # e.g. aws_instance, google_compute_instance
    variables: list[TerraformVariable] = field(default_factory=list)
    outputs: list[TerraformOutput] = field(default_factory=list)
    description: str = ""
    version: str = "1.0.0"
    required_providers: dict[str, str] = field(default_factory=dict)

    def __post_init__(self):
        valid_providers = {"aws", "gcp", "azure", "random", "null", "local", "tls"}
        if self.provider not in valid_providers:
            raise ValueError(f"provider must be one of {valid_providers}")
        if not re.match(r"^[a-z][a-z0-9_]*$", self.name):
            raise ValueError(f"Invalid module name: {self.name}")
        if not self.required_providers:
            provider_versions = {
                "aws": "~> 5.0", "gcp": "~> 5.0",
                "azure": "~> 3.0", "random": "~> 3.0"
            }
            if self.provider in provider_versions:
                self.required_providers[self.provider] = provider_versions[self.provider]


# ---------------------------------------------------------------------------
# Terraform file generators
# ---------------------------------------------------------------------------

def generate_main_tf(module: TerraformModule) -> str:
    """Generate main.tf content for a Terraform module."""
    lines: list[str] = []

    # Terraform block
    lines.append("terraform {")
    lines.append("  required_version = \">= 1.5\"")
    lines.append("  required_providers {")
    for prov, ver in module.required_providers.items():
        source_map = {
            "aws": "hashicorp/aws", "gcp": "hashicorp/google",
            "azure": "hashicorp/azurerm", "random": "hashicorp/random",
            "null": "hashicorp/null", "local": "hashicorp/local", "tls": "hashicorp/tls",
        }
        src = source_map.get(prov, f"hashicorp/{prov}")
        lines.append(f'    {prov} = {{')
        lines.append(f'      source  = "{src}"')
        lines.append(f'      version = "{ver}"')
        lines.append("    }")
    lines.append("  }")
    lines.append("}")
    lines.append("")

    # Provider block
    if module.provider == "aws":
        lines += ['provider "aws" {', '  region = var.region', "}"]
    elif module.provider == "gcp":
        lines += ['provider "google" {', '  project = var.project_id', '  region  = var.region', "}"]
    elif module.provider == "azure":
        lines += ['provider "azurerm" {', '  features {}', "}"]
    lines.append("")

    # Resource block with sensible defaults per resource_type
    rt = module.resource_type
    lines.append(f'resource "{rt}" "main" {{')
    _add_resource_defaults(lines, rt, module)
    lines.append("}")
    lines.append("")

    return "\n".join(lines)


def _add_resource_defaults(lines: list[str], rt: str, module: TerraformModule) -> None:
    """Add default resource body based on resource type."""
    var_names = {v.name for v in module.variables}

    if rt == "aws_instance":
        lines += [
            '  ami           = var.ami' if "ami" in var_names else '  ami           = "ami-0c55b159cbfafe1f0"',
            '  instance_type = var.instance_type' if "instance_type" in var_names else '  instance_type = "t3.small"',
            '  tags = { Name = "${var.name}-instance", ManagedBy = "blackroad" }',
        ]
    elif rt == "aws_s3_bucket":
        lines += [
            '  bucket = var.bucket_name' if "bucket_name" in var_names else '  bucket = "${var.name}-bucket"',
            '  tags   = { ManagedBy = "blackroad" }',
        ]
    elif rt == "aws_security_group":
        lines += [
            '  name        = "${var.name}-sg"',
            '  description = "Managed by BlackRoad"',
            '  vpc_id      = var.vpc_id' if "vpc_id" in var_names else '  vpc_id      = ""',
            '  ingress { from_port = 80  to_port = 80  protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] }',
            '  ingress { from_port = 443 to_port = 443 protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] }',
            '  egress  { from_port = 0   to_port = 0   protocol = "-1" cidr_blocks  = ["0.0.0.0/0"] }',
        ]
    elif rt == "aws_vpc":
        lines += [
            '  cidr_block           = var.cidr_block' if "cidr_block" in var_names else '  cidr_block           = "10.0.0.0/16"',
            '  enable_dns_hostnames = true',
            '  enable_dns_support   = true',
            '  tags = { Name = "${var.name}-vpc", ManagedBy = "blackroad" }',
        ]
    elif rt.startswith("google_compute_"):
        lines += [
            '  name    = var.name',
            '  project = var.project_id',
            '  region  = var.region',
        ]
    elif rt.startswith("azurerm_"):
        lines += [
            '  name                = var.name',
            '  location            = var.location' if "location" in var_names else '  location            = "East US"',
            '  resource_group_name = var.resource_group_name' if "resource_group_name" in var_names else '  resource_group_name = azurerm_resource_group.main.name',
            '  tags                = { ManagedBy = "blackroad" }',
        ]
    else:
        for v in module.variables[:5]:
            lines.append(f"  # {v.name} = var.{v.name}")


def generate_variables_tf(module: TerraformModule) -> str:
    """Generate variables.tf content for a Terraform module."""
    if not module.variables:
        return '# No variables defined for this module\n'
    parts = ["# Variables for the {} module".format(module.name), ""]
    for var in module.variables:
        parts.append(var.to_tf())
        parts.append("")
    return "\n".join(parts)


def generate_outputs_tf(module: TerraformModule) -> str:
    """Generate outputs.tf content for a Terraform module."""
    if not module.outputs:
        return '# No outputs defined for this module\n'
    parts = ["# Outputs for the {} module".format(module.name), ""]
    for out in module.outputs:
        parts.append(out.to_tf())
        parts.append("")
    return "\n".join(parts)


def generate_tfvars(values: dict) -> str:
    """Generate a .tfvars file from a Python dict."""
    lines: list[str] = ["# Terraform variable values - generated by BlackRoad", ""]
    for k, v in values.items():
        if isinstance(v, str):
            lines.append(f'{k} = "{v}"')
        elif isinstance(v, bool):
            lines.append(f'{k} = {str(v).lower()}')
        elif isinstance(v, (int, float)):
            lines.append(f"{k} = {v}")
        elif isinstance(v, list):
            items = ", ".join(f'"{x}"' if isinstance(x, str) else str(x) for x in v)
            lines.append(f"{k} = [{items}]")
        elif isinstance(v, dict):
            lines.append(f"{k} = " + json.dumps(v))
        else:
            lines.append(f'# {k} = (unsupported type: {type(v).__name__})')
    return "\n".join(lines) + "\n"


def generate_module_readme(module: TerraformModule) -> str:
    lines = [
        f"# {module.name}",
        "",
        module.description or f"Terraform module for `{module.resource_type}` on {module.provider}.",
        "",
        "## Usage",
        "",
        "```hcl",
        f'module "{module.name}" {{',
        f'  source = "./{module.name}"',
    ]
    for v in module.variables:
        if v.required:
            lines.append(f'  {v.name} = "<{v.type}>"')
    lines += ["}", "```", "", "## Variables", "", "| Name | Type | Description | Required |", "| --- | --- | --- | --- |"]
    for v in module.variables:
        req = "yes" if v.required else "no"
        lines.append(f"| `{v.name}` | `{v.type}` | {v.description} | {req} |")
    lines += ["", "## Outputs", "", "| Name | Description |", "| --- | --- |"]
    for o in module.outputs:
        lines.append(f"| `{o.name}` | {o.description} |")
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# Plan / cost helpers
# ---------------------------------------------------------------------------

def plan_summary(terraform_output_str: str) -> dict:
    """Parse terraform plan JSON output and return a summary dict."""
    try:
        data = json.loads(terraform_output_str)
    except json.JSONDecodeError:
        # Try to extract key numbers from text output
        summary: dict[str, Any] = {"raw": terraform_output_str[:500]}
        add = re.search(r"(\d+) to add", terraform_output_str)
        change = re.search(r"(\d+) to change", terraform_output_str)
        destroy = re.search(r"(\d+) to destroy", terraform_output_str)
        summary["add"] = int(add.group(1)) if add else 0
        summary["change"] = int(change.group(1)) if change else 0
        summary["destroy"] = int(destroy.group(1)) if destroy else 0
        return summary

    changes = data.get("resource_changes", [])
    counts: dict[str, int] = {"create": 0, "update": 0, "delete": 0, "no-op": 0}
    affected: list[str] = []
    for rc in changes:
        actions = rc.get("change", {}).get("actions", ["no-op"])
        for a in actions:
            counts[a] = counts.get(a, 0) + 1
        if set(actions) != {"no-op"}:
            affected.append(rc.get("address", "unknown"))
    return {
        "add": counts.get("create", 0),
        "change": counts.get("update", 0),
        "destroy": counts.get("delete", 0),
        "no_op": counts.get("no-op", 0),
        "affected_resources": affected,
        "total_changes": counts.get("create", 0) + counts.get("update", 0) + counts.get("delete", 0),
    }


def cost_estimate(resources: list[dict], provider: str = "aws") -> dict:
    """
    Estimate monthly cost for a list of resources.

    Each resource dict: {"type": "instance", "count": 1, "hours": 730}
    Returns {"total_monthly": float, "breakdown": list[dict]}
    """
    pricing_table = PRICING.get(provider, {})
    breakdown: list[dict] = []
    total = 0.0
    for res in resources:
        rtype = res.get("type", "unknown")
        count = res.get("count", 1)
        hours = res.get("hours", 730)
        price_per_hr = pricing_table.get(rtype, 0.0)
        monthly = price_per_hr * count * hours
        total += monthly
        breakdown.append({
            "type": rtype,
            "count": count,
            "hours": hours,
            "price_per_hour": price_per_hr,
            "monthly_cost": round(monthly, 4),
        })
    return {
        "provider": provider,
        "total_monthly": round(total, 4),
        "total_annual": round(total * 12, 4),
        "currency": "USD",
        "breakdown": breakdown,
    }


# ---------------------------------------------------------------------------
# SQLite persistence
# ---------------------------------------------------------------------------

def _init_db(path: Path = DB_PATH) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS modules (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            name         TEXT NOT NULL,
            provider     TEXT NOT NULL,
            resource_type TEXT NOT NULL,
            description  TEXT,
            version      TEXT,
            created_at   REAL NOT NULL,
            updated_at   REAL NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS module_files (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            module_id INTEGER NOT NULL REFERENCES modules(id),
            filename  TEXT NOT NULL,
            content   TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS cost_estimates (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            provider   TEXT NOT NULL,
            resources  TEXT NOT NULL,
            total      REAL NOT NULL,
            created_at REAL NOT NULL
        )
    """)
    conn.commit()
    return conn


def save_module(module: TerraformModule, db: sqlite3.Connection) -> int:
    now = time.time()
    cur = db.execute(
        "INSERT INTO modules (name,provider,resource_type,description,version,created_at,updated_at) "
        "VALUES (?,?,?,?,?,?,?)",
        (module.name, module.provider, module.resource_type,
         module.description, module.version, now, now),
    )
    mid = cur.lastrowid
    files = {
        "main.tf": generate_main_tf(module),
        "variables.tf": generate_variables_tf(module),
        "outputs.tf": generate_outputs_tf(module),
        "README.md": generate_module_readme(module),
    }
    for fname, content in files.items():
        db.execute(
            "INSERT INTO module_files (module_id,filename,content) VALUES (?,?,?)",
            (mid, fname, content),
        )
    db.commit()
    return mid


def list_modules(db: sqlite3.Connection) -> list[dict]:
    rows = db.execute("SELECT * FROM modules ORDER BY created_at DESC").fetchall()
    cols = [d[0] for d in db.execute("SELECT * FROM modules LIMIT 0").description]
    return [dict(zip(cols, row)) for row in rows]


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _cmd_new(args: argparse.Namespace) -> None:
    variables = [
        TerraformVariable("name", "string", "Resource name", required=True),
        TerraformVariable("region", "string", "Cloud region", "us-east-1"),
    ]
    if args.provider == "gcp":
        variables.append(TerraformVariable("project_id", "string", "GCP Project ID", required=True))
    if args.provider == "azure":
        variables += [
            TerraformVariable("location", "string", "Azure region", "East US"),
            TerraformVariable("resource_group_name", "string", "Resource group", required=True),
        ]

    outputs = [
        TerraformOutput(f"{args.resource_type}_id",
                        f'{args.resource_type}.main.id', "Resource ID"),
        TerraformOutput(f"{args.resource_type}_arn",
                        f'{args.resource_type}.main.arn', "Resource ARN"),
    ]

    module = TerraformModule(
        name=args.name,
        provider=args.provider,
        resource_type=args.resource_type,
        variables=variables,
        outputs=outputs,
        description=f"BlackRoad module for {args.resource_type}",
    )

    out_dir = Path(args.output_dir) / module.name
    out_dir.mkdir(parents=True, exist_ok=True)

    (out_dir / "main.tf").write_text(generate_main_tf(module))
    (out_dir / "variables.tf").write_text(generate_variables_tf(module))
    (out_dir / "outputs.tf").write_text(generate_outputs_tf(module))
    (out_dir / "README.md").write_text(generate_module_readme(module))
    print(f"Module created in {out_dir}/")

    if args.save:
        db = _init_db()
        mid = save_module(module, db)
        print(f"Saved module id={mid}")


def _cmd_cost(args: argparse.Namespace) -> None:
    resources = json.loads(args.resources)
    result = cost_estimate(resources, args.provider)
    print(json.dumps(result, indent=2))


def _cmd_plan(args: argparse.Namespace) -> None:
    content = Path(args.plan_file).read_text()
    result = plan_summary(content)
    print(json.dumps(result, indent=2))


def _cmd_list(args: argparse.Namespace) -> None:
    db = _init_db()
    rows = list_modules(db)
    if not rows:
        print("No modules found.")
        return
    print(f"{'ID':<5} {'NAME':<25} {'PROVIDER':<10} {'RESOURCE TYPE':<30}")
    print("-" * 75)
    for r in rows:
        print(f"{r['id']:<5} {r['name']:<25} {r['provider']:<10} {r['resource_type']:<30}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="BlackRoad Terraform Module Generator")
    sub = parser.add_subparsers(dest="command")

    n = sub.add_parser("new", help="Create a new Terraform module")
    n.add_argument("--name", required=True)
    n.add_argument("--provider", required=True, choices=["aws", "gcp", "azure", "random"])
    n.add_argument("--resource-type", required=True)
    n.add_argument("--output-dir", default=".")
    n.add_argument("--save", action="store_true")

    c = sub.add_parser("cost", help="Estimate resource costs")
    c.add_argument("--provider", default="aws")
    c.add_argument("--resources", required=True, help='JSON list: [{"type":"instance","count":2}]')

    p = sub.add_parser("plan", help="Summarize terraform plan output")
    p.add_argument("plan_file")

    sub.add_parser("list", help="List saved modules")

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    dispatch = {"new": _cmd_new, "cost": _cmd_cost, "plan": _cmd_plan, "list": _cmd_list}
    if args.command in dispatch:
        dispatch[args.command](args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
