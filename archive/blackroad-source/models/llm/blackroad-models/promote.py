#!/usr/bin/env python3
"""
Promote a model to the next lifecycle stage.

Lifecycle:
    research → internal → production

Usage:
    python tools/promote.py research/alexa/blackroad-coder-lora --to internal --name blackroad-coder-7b
    python tools/promote.py internal/blackroad-coder-7b-v1 --to production
"""
import argparse
import shutil
import yaml
import os
from pathlib import Path
from datetime import datetime


def load_manifest(model_path: Path) -> dict:
    """Load model manifest."""
    manifest_path = model_path / "MANIFEST.yaml"
    if not manifest_path.exists():
        raise FileNotFoundError(f"No MANIFEST.yaml found in {model_path}")

    with open(manifest_path) as f:
        return yaml.safe_load(f)


def check_promotion_criteria(source_path: Path, target_stage: str, auto_yes: bool = False) -> bool:
    """Check if model meets promotion criteria."""
    print("\n🔍 Checking promotion criteria...")

    manifest = load_manifest(source_path)
    current_stage = manifest.get('stage')

    print(f"  Current stage: {current_stage}")
    print(f"  Target stage:  {target_stage}")

    # Check stage progression
    valid_promotions = {
        'research': ['internal'],
        'internal': ['production'],
    }

    if current_stage not in valid_promotions:
        print(f"  ❌ Cannot promote from stage: {current_stage}")
        return False

    if target_stage not in valid_promotions[current_stage]:
        print(f"  ❌ Invalid promotion: {current_stage} → {target_stage}")
        print(f"  ✅ Valid targets: {', '.join(valid_promotions[current_stage])}")
        return False

    print(f"  ✅ Valid promotion path")

    # Check evaluation results
    evals = manifest.get('evals', [])
    if not evals:
        print(f"  ⚠️  No evaluation results found")
        if not auto_yes:
            response = input("  Continue anyway? (y/N): ")
            if response.lower() != 'y':
                return False
    else:
        print(f"  ✅ Found {len(evals)} evaluation(s)")
        for ev in evals:
            name = ev.get('name', 'Unknown')
            score = ev.get('score', 0)
            print(f"     - {name}: {score:.2%}")

    # Check lineage documentation
    lineage_path = source_path / "LINEAGE.md"
    if not lineage_path.exists():
        print(f"  ⚠️  No LINEAGE.md found")
        if not auto_yes:
            response = input("  Continue anyway? (y/N): ")
            if response.lower() != 'y':
                return False
    else:
        print(f"  ✅ Lineage documented")

    # Research → Internal specific checks
    if current_stage == 'research' and target_stage == 'internal':
        # Check for HumanEval or equivalent
        humaneval = [e for e in evals if 'humaneval' in e.get('name', '').lower()]
        if humaneval:
            score = humaneval[0].get('score', 0)
            target = 0.70
            if score >= target:
                print(f"  ✅ HumanEval pass@1: {score:.2%} (>= {target:.2%})")
            else:
                print(f"  ❌ HumanEval pass@1: {score:.2%} (< {target:.2%})")
                print(f"  Need +{(target - score):.2%} improvement")
                return False

    # Internal → Production specific checks
    if current_stage == 'internal' and target_stage == 'production':
        print(f"\n  📋 Production promotion requires:")
        print(f"     - Legal approval")
        print(f"     - SLA definition")
        print(f"     - Customer validation")
        print(f"     - 14+ days in staging")

        if not auto_yes:
            response = input("\n  All requirements met? (y/N): ")
            if response.lower() != 'y':
                return False

    return True


def promote_model(source_path: str, target_stage: str, new_name: str = None, auto_yes: bool = False):
    """
    Promote a model to next stage.

    Args:
        source_path: Path to source model (e.g., "research/alexa/my-model")
        target_stage: Target stage ("internal" or "production")
        new_name: New model name (required for promotion)
        auto_yes: Skip confirmation prompts
    """
    source = Path(source_path)

    if not source.exists():
        raise FileNotFoundError(f"Source model not found: {source}")

    print("=" * 60)
    print("🚀 BlackRoad Model Promotion")
    print("=" * 60)

    # Check promotion criteria
    if not check_promotion_criteria(source, target_stage, auto_yes):
        print("\n❌ Promotion criteria not met")
        print("Aborting promotion")
        return False

    # Determine target path
    if not new_name:
        raise ValueError("Must provide --name for promotion")

    # Create version number
    if target_stage == "internal":
        version = "v1"
        target = Path(f"internal/{new_name}/{version}")
    elif target_stage == "production":
        version = "v1.0"
        target = Path(f"production/{new_name}/{version}")
    else:
        raise ValueError(f"Invalid target stage: {target_stage}")

    # Check if target already exists
    if target.exists():
        print(f"\n⚠️  Target already exists: {target}")
        if not auto_yes:
            response = input("Overwrite? (y/N): ")
            if response.lower() != 'y':
                print("Aborting promotion")
                return False
        shutil.rmtree(target)

    # Create target directory
    target.mkdir(parents=True, exist_ok=True)

    print(f"\n📦 Copying {source} → {target}")

    # Copy all files
    copied_files = []
    for item in source.iterdir():
        if item.name in ['.git', '__pycache__', '.DS_Store']:
            continue

        dest = target / item.name
        if item.is_dir():
            shutil.copytree(item, dest, dirs_exist_ok=True)
        else:
            shutil.copy2(item, dest)

        copied_files.append(item.name)

    print(f"  ✅ Copied {len(copied_files)} items")

    # Update MANIFEST.yaml
    manifest_path = target / "MANIFEST.yaml"
    if manifest_path.exists():
        with open(manifest_path) as f:
            manifest = yaml.safe_load(f)

        # Update metadata
        old_id = manifest.get('id')
        new_id = f"{target_stage}/{new_name}-{version.replace('/', '-')}"

        manifest['id'] = new_id
        manifest['stage'] = target_stage
        manifest['version'] = version
        manifest['promoted_from'] = str(source)
        manifest['promoted_at'] = datetime.utcnow().isoformat() + 'Z'

        # Update owner if promoting to production
        if target_stage == 'production':
            manifest['owner'] = {
                'type': 'organization',
                'id': 'blackroad-systems',
                'name': 'BlackRoad Systems LLC',
                'contact': 'blackroad.systems@gmail.com'
            }

        with open(manifest_path, 'w') as f:
            yaml.dump(manifest, f, default_flow_style=False, sort_keys=False)

        print(f"  ✅ Updated manifest")
        print(f"     Old ID: {old_id}")
        print(f"     New ID: {new_id}")

    # Update registry
    print(f"\n📋 Updating registry...")
    registry_file = f"registry/{target_stage}.yaml"
    registry_path = Path(registry_file)

    # Load existing registry
    registry = []
    if registry_path.exists():
        with open(registry_path) as f:
            content = f.read().strip()
            if content and content != '[]':
                registry = yaml.safe_load(content) or []

    # Create registry entry
    entry = {
        'id': new_id,
        'name': new_name,
        'version': version,
        'stage': target_stage,
        'promoted_from': str(source),
        'promoted_at': datetime.utcnow().isoformat() + 'Z',
    }

    # Add from manifest
    if manifest:
        entry['owner'] = manifest.get('owner')
        entry['capabilities'] = manifest.get('capabilities')
        entry['evals'] = manifest.get('evals')
        entry['derived_from'] = manifest.get('derived_from')

    registry.append(entry)

    with open(registry_path, 'w') as f:
        yaml.dump(registry, f, default_flow_style=False, sort_keys=False)

    print(f"  ✅ Added to {registry_file}")

    # Update lineage
    lineage_path = Path("registry/lineage.yaml")
    lineage = []
    if lineage_path.exists():
        with open(lineage_path) as f:
            content = f.read().strip()
            if content and content != '[]':
                lineage = yaml.safe_load(content) or []

    # Add promotion link
    lineage.append({
        'child_id': new_id,
        'parent_id': manifest.get('id') if manifest else str(source),
        'method': f'promotion ({source.parts[0]} → {target_stage})',
        'created_at': datetime.utcnow().isoformat() + 'Z',
    })

    with open(lineage_path, 'w') as f:
        yaml.dump(lineage, f, default_flow_style=False, sort_keys=False)

    print(f"  ✅ Updated lineage graph")

    # Success!
    print("\n" + "=" * 60)
    print("✅ Promotion complete!")
    print("=" * 60)
    print(f"\nModel promoted:")
    print(f"  From: {source}")
    print(f"  To:   {target}")
    print(f"  ID:   {new_id}")

    print(f"\n📝 Next steps:")
    if target_stage == 'internal':
        print(f"  1. Deploy to staging:")
        print(f"     python tools/serve.py {new_id} --backend vllm --env staging")
        print(f"  2. Validate for 14 days")
        print(f"  3. Consider production promotion")
    elif target_stage == 'production':
        print(f"  1. Deploy to production:")
        print(f"     python tools/serve.py {new_id} --backend vllm --env production")
        print(f"  2. Monitor SLA compliance")
        print(f"  3. Update customer documentation")

    print(f"\n  Git commit:")
    print(f"     git add .")
    print(f"     git commit -m 'feat: Promote {new_name} to {target_stage}'")

    return True


def main():
    parser = argparse.ArgumentParser(
        description="Promote a model to the next lifecycle stage",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Promote research → internal
  python tools/promote.py research/alexa/blackroad-coder-lora \\
    --to internal \\
    --name blackroad-coder-7b

  # Promote internal → production
  python tools/promote.py internal/blackroad-coder-7b/v1 \\
    --to production \\
    --name blackroad-coder
        """
    )
    parser.add_argument('source', help='Source model path')
    parser.add_argument('--to', required=True, choices=['internal', 'production'],
                        help='Target stage')
    parser.add_argument('--name', required=True, help='New model name (required)')
    parser.add_argument('--yes', '-y', action='store_true', help='Skip confirmation prompts')

    args = parser.parse_args()

    # Check we're in repo root
    if not Path("registry").exists():
        print("❌ Error: Must run from blackroad-models repo root")
        return 1

    success = promote_model(args.source, args.to, args.name, args.yes)

    return 0 if success else 1


if __name__ == "__main__":
    exit(main())
