#!/usr/bin/env python3
"""Validate environment manifest files under ``environments/``.

The manifests describe deployment footprints that automation relies on. This
script performs a series of structural checks so that missing or malformed
fields are caught before they land in version control. It intentionally focuses
on lightweight validation and avoids external dependencies beyond PyYAML so that
it can run in CI or local workflows.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List, Sequence

import yaml

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST_DIR = REPO_ROOT / "environments"
ALLOWED_ENV_STATES = {"active", "planned", "provisioning", "decommissioned"}
ALLOWED_DEPLOYMENT_STATES = ALLOWED_ENV_STATES | {"deprecated"}


def _load_yaml(path: Path) -> Dict[str, Any]:
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except yaml.YAMLError as exc:  # pragma: no cover - defensive guard
        raise ValueError(f"{path}: failed to parse YAML ({exc})") from exc

    if data is None:
        raise ValueError(f"{path}: manifest is empty")
    if not isinstance(data, dict):
        raise ValueError(f"{path}: expected a mapping at the document root")
    return data


def _ensure_string(
    container: Dict[str, Any],
    key: str,
    path: str,
    errors: List[str],
    *,
    required: bool = True,
    allow_empty: bool = False,
) -> None:
    value = container.get(key)
    if value is None:
        if required:
            errors.append(f"{path}: missing required field '{key}'")
        return
    if not isinstance(value, str):
        errors.append(f"{path}: field '{key}' must be a string")
        return
    if not allow_empty and not value.strip():
        errors.append(f"{path}: field '{key}' must not be empty")


def _ensure_dict(
    value: Any,
    path: str,
    errors: List[str],
    *,
    required: bool = True,
) -> Dict[str, Any] | None:
    if value is None:
        if required:
            errors.append(f"{path}: missing required mapping")
        return None
    if not isinstance(value, dict):
        errors.append(f"{path}: expected a mapping")
        return None
    return value


def _ensure_list(
    value: Any,
    path: str,
    errors: List[str],
    *,
    required: bool = True,
) -> Sequence[Any] | None:
    if value is None:
        if required:
            errors.append(f"{path}: missing required list")
        return None
    if not isinstance(value, list):
        errors.append(f"{path}: expected a list")
        return None
    return value


def _validate_workflows(
    workflows: Sequence[Any] | None,
    *,
    base_path: str,
    errors: List[str],
) -> None:
    if workflows is None:
        return
    for index, raw in enumerate(workflows):
        wf_path = f"{base_path}[{index}]"
        if not isinstance(raw, dict):
            errors.append(f"{wf_path}: workflow entries must be mappings")
            continue
        _ensure_string(raw, "name", wf_path, errors)
        _ensure_string(raw, "file", wf_path, errors)

        triggers = raw.get("triggers")
        if triggers is not None and not isinstance(triggers, list):
            errors.append(f"{wf_path}: 'triggers' must be a list when provided")

        for field in ("secrets_required", "variables_required"):
            payload = raw.get(field)
            if payload is not None and not isinstance(payload, list):
                errors.append(f"{wf_path}: '{field}' must be a list when provided")


def _validate_required_checks(
    required_checks: Any,
    *,
    base_path: str,
    errors: List[str],
) -> None:
    if required_checks is None:
        return
    if not isinstance(required_checks, dict):
        errors.append(f"{base_path}: expected a mapping for required_checks")
        return

    # Accept nested mappings (e.g., push -> main -> [checks])
    for key, value in required_checks.items():
        sub_path = f"{base_path}.{key}"
        if isinstance(value, dict):
            _validate_required_checks(value, base_path=sub_path, errors=errors)
        elif isinstance(value, list):
            if not all(isinstance(item, str) for item in value):
                errors.append(
                    f"{sub_path}: check lists must contain only strings"
                )
        else:
            errors.append(
                f"{sub_path}: expected nested mapping or list of check names"
            )


def _validate_deployments(
    deployments: Sequence[Any] | None,
    *,
    base_path: str,
    errors: List[str],
) -> None:
    if deployments is None:
        return
    for index, raw in enumerate(deployments):
        dep_path = f"{base_path}[{index}]"
        if not isinstance(raw, dict):
            errors.append(f"{dep_path}: deployment entries must be mappings")
            continue
        _ensure_string(raw, "service", dep_path, errors)
        _ensure_string(raw, "type", dep_path, errors)
        _ensure_string(raw, "provider", dep_path, errors)

        state = raw.get("state")
        if state is not None and not isinstance(state, str):
            errors.append(f"{dep_path}: 'state' must be a string when provided")
        if isinstance(state, str) and state not in ALLOWED_DEPLOYMENT_STATES:
            errors.append(
                f"{dep_path}: unknown deployment state '{state}'"
                f" (allowed: {sorted(ALLOWED_DEPLOYMENT_STATES)})"
            )

        for list_field in ("secrets", "notes", "health_check"):
            # notes/health_check are often strings; allow them as-is and only
            # guard against incorrect container types.
            value = raw.get(list_field)
            if list_field == "notes":
                if value is not None and not isinstance(value, (str, list)):
                    errors.append(
                        f"{dep_path}: 'notes' must be a string or list when provided"
                    )
                continue
            if value is not None and not isinstance(value, (str, list)):
                errors.append(
                    f"{dep_path}: '{list_field}' must be a string or list when provided"
                )

        environment_block = raw.get("environment")
        if environment_block is not None and not isinstance(
            environment_block, dict
        ):
            errors.append(
                f"{dep_path}: 'environment' must be a mapping when provided"
            )

        terraform_backend = raw.get("terraform_backend")
        if terraform_backend is not None and not isinstance(
            terraform_backend, dict
        ):
            errors.append(
                f"{dep_path}: 'terraform_backend' must be a mapping when provided"
            )


def _validate_infrastructure(
    infrastructure: Any,
    *,
    base_path: str,
    errors: List[str],
) -> None:
    if infrastructure is None:
        return
    mapping = _ensure_dict(infrastructure, base_path, errors, required=False)
    if not mapping:
        return
    for field in ("cloud", "region"):
        value = mapping.get(field)
        if value is not None and not isinstance(value, str):
            errors.append(f"{base_path}: '{field}' must be a string when provided")

    terraform = mapping.get("terraform")
    if terraform is not None:
        tf_mapping = _ensure_dict(terraform, f"{base_path}.terraform", errors)
        if tf_mapping:
            if "root" in tf_mapping and not isinstance(tf_mapping["root"], str):
                errors.append(
                    f"{base_path}.terraform: 'root' must be a string when provided"
                )
            backend = tf_mapping.get("backend")
            if backend is not None and not isinstance(backend, dict):
                errors.append(
                    f"{base_path}.terraform: 'backend' must be a mapping when provided"
                )


def validate_manifest(path: Path) -> List[str]:
    data = _load_yaml(path)
    errors: List[str] = []

    _ensure_string(data, "name", str(path), errors)
    _ensure_string(data, "slug", str(path), errors)
    _ensure_string(data, "state", str(path), errors)
    _ensure_string(data, "description", str(path), errors)

    state = data.get("state")
    if isinstance(state, str) and state not in ALLOWED_ENV_STATES:
        errors.append(
            f"{path}: unknown environment state '{state}'"
            f" (allowed: {sorted(ALLOWED_ENV_STATES)})"
        )

    contacts = data.get("contacts")
    contacts_map = _ensure_dict(contacts, f"{path}.contacts", errors, required=False)
    if contacts_map:
        reviewers = contacts_map.get("reviewers")
        if reviewers is not None and not isinstance(reviewers, list):
            errors.append(f"{path}.contacts: 'reviewers' must be a list when provided")

    domains = data.get("domains")
    domains_map = _ensure_dict(domains, f"{path}.domains", errors, required=False)
    if domains_map:
        for key, value in domains_map.items():
            if not isinstance(value, str):
                errors.append(
                    f"{path}.domains['{key}']: domain entries must be strings"
                )

    automation = data.get("automation")
    automation_map = _ensure_dict(
        automation, f"{path}.automation", errors, required=False
    )
    if automation_map:
        _validate_workflows(
            _ensure_list(
                automation_map.get("workflows"),
                f"{path}.automation.workflows",
                errors,
                required=False,
            ),
            base_path=f"{path}.automation.workflows",
            errors=errors,
        )
        _validate_required_checks(
            automation_map.get("required_checks"),
            base_path=f"{path}.automation.required_checks",
            errors=errors,
        )

    _validate_deployments(
        _ensure_list(
            data.get("deployments"),
            f"{path}.deployments",
            errors,
            required=False,
        ),
        base_path=f"{path}.deployments",
        errors=errors,
    )

    _validate_infrastructure(
        data.get("infrastructure"),
        base_path=f"{path}.infrastructure",
        errors=errors,
    )

    change_management = data.get("change_management")
    _ensure_dict(
        change_management, f"{path}.change_management", errors, required=False
    )

    observability = data.get("observability")
    observability_map = _ensure_dict(
        observability, f"{path}.observability", errors, required=False
    )
    if observability_map:
        verification = observability_map.get("verification")
        if verification is not None and not isinstance(verification, list):
            errors.append(
                f"{path}.observability: 'verification' must be a list when provided"
            )

    return errors


def iter_manifest_paths(directory: Path) -> Iterable[Path]:
    yield from sorted(directory.glob("*.yml"))
    yield from sorted(directory.glob("*.yaml"))


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate environment manifest files for structural issues.",
    )
    parser.add_argument(
        "paths",
        nargs="*",
        help="Specific manifest files to validate (defaults to all manifests).",
    )
    parser.add_argument(
        "--manifest-dir",
        default=str(DEFAULT_MANIFEST_DIR),
        help="Directory containing manifests (default: environments/).",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    manifest_dir = Path(args.manifest_dir).resolve()

    if args.paths:
        manifest_paths = [Path(p).resolve() for p in args.paths]
    else:
        manifest_paths = list(iter_manifest_paths(manifest_dir))

    if not manifest_paths:
        print("No manifest files found to validate.", file=sys.stderr)
        return 1

    overall_errors: List[str] = []
    for path in manifest_paths:
        try:
            errors = validate_manifest(path)
        except ValueError as exc:
            overall_errors.append(str(exc))
            continue
        overall_errors.extend(errors)

    if overall_errors:
        print("Environment manifest validation failed:", file=sys.stderr)
        for error in overall_errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print(f"Validated {len(manifest_paths)} environment manifest(s) successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
