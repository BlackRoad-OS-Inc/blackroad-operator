#!/usr/bin/env python3
"""
Fork an upstream model and create a Forkie snapshot.

Usage:
    python3 tools/fork.py meta-llama/Llama-3.1-8B-Instruct --version v1.0.0
    python3 tools/fork.py Qwen/Qwen2.5-Coder-7B-Instruct --version v1.0.0
"""
import argparse
import os
import yaml
from datetime import datetime
from pathlib import Path


def fork_model(source: str, version: str, local_path: str = None):
    """
    Fork a model from HuggingFace or local path.

    Args:
        source: HuggingFace model ID (e.g., "meta-llama/Llama-3.1-8B-Instruct")
        version: Version tag (e.g., "v1.0.0")
        local_path: Optional local path if already downloaded
    """
    # Extract model name and normalize
    model_name = source.split('/')[-1].lower().replace('.', '-')
    forkie_path = Path(f"forkies/{model_name}/{version}")
    forkie_path.mkdir(parents=True, exist_ok=True)

    print(f"🍴 Forking {source}...")
    print(f"📁 Creating: {forkie_path}")

    # Create FORK.yaml metadata
    fork_meta = {
        'id': f"forkies/{model_name}@{version}",
        'name': model_name,
        'full_name': source,
        'version': version,
        'source': source,
        'forked_at': datetime.utcnow().isoformat() + 'Z',
        'forked_by': 'alexa',
        'license': 'See LICENSE file (from upstream)',
        'purpose': 'Upstream dependency for BlackRoad proprietary models',
        'serving_allowed': False,
        'stage': 'forkie',
        'artifacts': {
            'weights': f"s3://blackroad-models/forkies/{model_name}/{version}/weights/" if not local_path else local_path,
            'config': f"forkies/{model_name}/{version}/config.json",
        }
    }

    fork_yaml_path = forkie_path / "FORK.yaml"
    with open(fork_yaml_path, 'w') as f:
        yaml.dump(fork_meta, f, default_flow_style=False, sort_keys=False)

    print(f"✅ Created metadata: {fork_yaml_path}")

    # Create README
    readme_content = f"""# {model_name} - {version}

**Type:** Forkie (Upstream Snapshot)
**Source:** {source}
**Status:** Read-only
**Serving:** Not allowed (use derived models instead)

## Metadata
See `FORK.yaml` for complete metadata.

## Forked
- **Date:** {datetime.utcnow().strftime('%Y-%m-%d')}
- **By:** alexa

## Derived Models
See `registry/lineage.yaml` for models derived from this Forkie.

## License
See `LICENSE` file (from upstream source).

## Next Steps
1. Download model weights (if not already available)
2. Create research experiment: `python3 tools/create.py research/owner/experiment --base {fork_meta['id']}`
"""

    readme_path = forkie_path / "README.md"
    with open(readme_path, 'w') as f:
        f.write(readme_content)

    print(f"✅ Created README: {readme_path}")

    # Add to registry
    registry_path = Path("registry/forkies.yaml")
    registry = []
    if registry_path.exists():
        with open(registry_path) as f:
            content = f.read().strip()
            if content and content != '[]':
                registry = yaml.safe_load(content) or []

    # Check if already exists
    existing = [m for m in registry if m.get('id') == fork_meta['id']]
    if existing:
        print(f"⚠️  Already in registry: {fork_meta['id']}")
    else:
        registry.append(fork_meta)
        with open(registry_path, 'w') as f:
            yaml.dump(registry, f, default_flow_style=False, sort_keys=False)
        print(f"✅ Added to registry: registry/forkies.yaml")

    # Download instructions
    print(f"\n📦 Next steps:")
    print(f"  1. Download model weights (optional - can use symlink or S3):")
    print(f"     huggingface-cli download {source} --local-dir {forkie_path}/weights")
    print(f"\n  2. Commit:")
    print(f"     git add .")
    print(f"     git commit -m 'feat: Fork {model_name} {version}'")
    print(f"\n  3. Create research experiment:")
    print(f"     python3 tools/create.py research/alexa/my-experiment --base {fork_meta['id']}")

    return fork_meta


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Fork an upstream model and create a Forkie",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 tools/fork.py meta-llama/Llama-3.1-8B-Instruct --version v1.0.0
  python3 tools/fork.py Qwen/Qwen2.5-Coder-7B-Instruct --version v1.0.0
  python3 tools/fork.py mistralai/Mixtral-8x7B-Instruct-v0.1 --version v0.1.0
        """
    )
    parser.add_argument("source", help="HuggingFace model ID (org/model-name)")
    parser.add_argument("--version", default="v1.0.0", help="Version tag (default: v1.0.0)")
    parser.add_argument("--local-path", help="Local path if already downloaded")

    args = parser.parse_args()

    # Change to repo root if needed
    if not Path("registry").exists():
        print("❌ Error: Must run from blackroad-models repo root")
        print("   Current directory:", os.getcwd())
        exit(1)

    fork_model(args.source, args.version, args.local_path)
    print("\n🎉 Fork complete!")
