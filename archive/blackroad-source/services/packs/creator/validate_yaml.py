import sys
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parent.parent


def load_yaml(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def validate_pack_manifest() -> list[str]:
    pack_path = ROOT / "pack.yaml"
    data = load_yaml(pack_path)
    required_fields = {"id", "name", "version", "description", "required_roles", "depends_on", "tags"}
    missing = required_fields - set(data.keys())
    errors: list[str] = []
    if missing:
        errors.append(f"pack.yaml missing fields: {', '.join(sorted(missing))}")
    if not isinstance(data.get("depends_on", []), list):
        errors.append("pack.yaml depends_on must be a list")
    return errors


def validate_directory(glob_pattern: str) -> list[str]:
    errors: list[str] = []
    for path in ROOT.glob(glob_pattern):
        try:
            load_yaml(path)
        except yaml.YAMLError as exc:  # noqa: PERF203
            errors.append(f"Failed to parse {path.relative_to(ROOT)}: {exc}")
    return errors


def main() -> int:
    issues = []
    issues.extend(validate_pack_manifest())
    issues.extend(validate_directory("workflows/*.workflow.yaml"))
    issues.extend(validate_directory("presets/*.yaml"))

    if issues:
        for issue in issues:
            print(issue)
        return 1
    print("YAML validation passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
