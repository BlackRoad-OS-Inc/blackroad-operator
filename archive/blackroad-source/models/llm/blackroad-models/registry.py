#!/usr/bin/env python3
"""
BlackRoad Model Registry Client

Query and manage the model registry.

Usage:
    python3 tools/registry.py list --stage internal
    python3 tools/registry.py get internal/blackroad-coder-7b-v1
    python3 tools/registry.py check-access internal/my-model blackroad-os-operator
"""
import argparse
import json
import yaml
from pathlib import Path
from typing import List, Dict, Optional


class ModelRegistry:
    """Model registry client."""

    def __init__(self, registry_dir: str = "registry"):
        self.registry_dir = Path(registry_dir)
        self.forkies = self._load("forkies.yaml")
        self.research = self._load("research.yaml")
        self.internal = self._load("internal.yaml")
        self.production = self._load("production.yaml")
        self.lineage = self._load("lineage.yaml")

    def _load(self, filename: str) -> List[Dict]:
        """Load a registry file."""
        path = self.registry_dir / filename
        if not path.exists():
            return []
        with open(path) as f:
            content = f.read().strip()
            if not content or content == '[]':
                return []
            return yaml.safe_load(content) or []

    def _save(self, filename: str, data: List[Dict]):
        """Save a registry file."""
        path = self.registry_dir / filename
        with open(path, 'w') as f:
            yaml.dump(data, f, default_flow_style=False, sort_keys=False)

    def list_models(self, stage: str = None) -> List[Dict]:
        """List models by stage."""
        if stage == "forkie":
            return self.forkies
        elif stage == "research":
            return self.research
        elif stage == "internal":
            return self.internal
        elif stage == "production":
            return self.production
        else:
            # Return all
            return self.forkies + self.research + self.internal + self.production

    def get_model(self, model_id: str) -> Optional[Dict]:
        """Get model by ID."""
        for model in self.list_models():
            if model.get('id') == model_id:
                return model
        return None

    def add_model(self, stage: str, model: Dict):
        """Add a model to registry."""
        if stage == "forkie":
            self.forkies.append(model)
            self._save("forkies.yaml", self.forkies)
        elif stage == "research":
            self.research.append(model)
            self._save("research.yaml", self.research)
        elif stage == "internal":
            self.internal.append(model)
            self._save("internal.yaml", self.internal)
        elif stage == "production":
            self.production.append(model)
            self._save("production.yaml", self.production)

    def get_models_by_capability(self, capability: str) -> List[Dict]:
        """Get models supporting a capability."""
        results = []
        for model in self.list_models():
            capabilities = model.get('capabilities', [])
            if capability in capabilities:
                results.append(model)
        return results

    def check_access(self, model_id: str, service_id: str) -> bool:
        """Check if a service can access a model."""
        model = self.get_model(model_id)
        if not model:
            return False

        # Forkies are never served
        if model.get('stage') == 'forkie':
            return False

        access = model.get('access', {})
        allowed_services = access.get('allowed_services', [])

        # Empty list = deny (explicit allow only)
        if not allowed_services:
            # Check if internal_only is explicitly False
            if access.get('internal_only') is False:
                return True
            return False

        return service_id in allowed_services

    def get_lineage(self, model_id: str) -> List[Dict]:
        """Get lineage chain for a model."""
        chain = []
        current_id = model_id

        while current_id:
            # Find parent
            parent_link = None
            for link in self.lineage:
                if link.get('child_id') == current_id:
                    parent_link = link
                    break

            if not parent_link:
                break

            chain.append(parent_link)
            current_id = parent_link.get('parent_id')

        return chain


def main():
    parser = argparse.ArgumentParser(
        description="BlackRoad Model Registry CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # List command
    list_parser = subparsers.add_parser('list', help='List models')
    list_parser.add_argument(
        '--stage',
        choices=['forkie', 'research', 'internal', 'production'],
        help='Filter by stage'
    )
    list_parser.add_argument('--json', action='store_true', help='Output JSON')

    # Get command
    get_parser = subparsers.add_parser('get', help='Get model by ID')
    get_parser.add_argument('model_id', help='Model ID')
    get_parser.add_argument('--json', action='store_true', help='Output JSON')

    # Check access command
    check_parser = subparsers.add_parser('check-access', help='Check service access')
    check_parser.add_argument('model_id', help='Model ID')
    check_parser.add_argument('service_id', help='Service ID')

    # Capability command
    cap_parser = subparsers.add_parser('capability', help='Find models by capability')
    cap_parser.add_argument('capability', help='Capability name')
    cap_parser.add_argument('--json', action='store_true', help='Output JSON')

    # Lineage command
    lineage_parser = subparsers.add_parser('lineage', help='Show model lineage')
    lineage_parser.add_argument('model_id', help='Model ID')

    # Stats command
    stats_parser = subparsers.add_parser('stats', help='Show registry statistics')

    args = parser.parse_args()

    # Check we're in repo root
    if not Path("registry").exists():
        print("❌ Error: Must run from blackroad-models repo root")
        return 1

    registry = ModelRegistry()

    if args.command == 'list':
        models = registry.list_models(args.stage)
        if args.json:
            print(json.dumps(models, indent=2))
        else:
            if not models:
                print(f"No models found{' in stage: ' + args.stage if args.stage else ''}")
            else:
                print(f"\n📦 Models ({len(models)} total):")
                for model in models:
                    stage = model.get('stage', 'unknown')
                    name = model.get('name', 'N/A')
                    model_id = model.get('id', 'N/A')
                    print(f"  [{stage:10}] {model_id:50} - {name}")

    elif args.command == 'get':
        model = registry.get_model(args.model_id)
        if model:
            if args.json:
                print(json.dumps(model, indent=2))
            else:
                print(f"\n📦 Model: {args.model_id}\n")
                print(yaml.dump(model, default_flow_style=False, sort_keys=False))
        else:
            print(f"❌ Model not found: {args.model_id}")
            return 1

    elif args.command == 'check-access':
        allowed = registry.check_access(args.model_id, args.service_id)
        if allowed:
            print(f"✅ {args.service_id} CAN access {args.model_id}")
            return 0
        else:
            print(f"❌ {args.service_id} CANNOT access {args.model_id}")
            return 1

    elif args.command == 'capability':
        models = registry.get_models_by_capability(args.capability)
        if args.json:
            print(json.dumps(models, indent=2))
        else:
            if not models:
                print(f"No models found with capability: {args.capability}")
            else:
                print(f"\n📦 Models with capability '{args.capability}' ({len(models)} found):")
                for model in models:
                    print(f"  {model.get('id')} - {model.get('name', 'N/A')}")

    elif args.command == 'lineage':
        chain = registry.get_lineage(args.model_id)
        if not chain:
            print(f"No lineage found for: {args.model_id}")
        else:
            print(f"\n🌳 Lineage for {args.model_id}:")
            print(f"  {args.model_id}")
            for link in chain:
                method = link.get('method', 'unknown')
                parent = link.get('parent_id', 'unknown')
                print(f"  └─> ({method}) {parent}")

    elif args.command == 'stats':
        print("\n📊 BlackRoad Model Registry Statistics\n")
        print(f"  Forkies:    {len(registry.forkies)}")
        print(f"  Research:   {len(registry.research)}")
        print(f"  Internal:   {len(registry.internal)}")
        print(f"  Production: {len(registry.production)}")
        print(f"  Total:      {len(registry.list_models())}")

        # Lineage stats
        print(f"\n  Lineage links: {len(registry.lineage)}")

    else:
        parser.print_help()

    return 0


if __name__ == "__main__":
    exit(main())
