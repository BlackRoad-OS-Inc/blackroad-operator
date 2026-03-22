"""Validate Prism Console environment manifest files.

This script provides a lightweight schema check for the YAML documents that
describe Prism Console deployment environments.  It is intentionally narrow –
just enough structure to keep the manifests consumable by automation while
remaining easy for humans to edit.
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover - handled by CLI
    raise SystemExit(
        "PyYAML is required to validate environment manifests. Install it with"
        " `pip install PyYAML` or `make setup`."
    ) from exc


ALLOWED_STATUS = {"active", "planned", "deprecated"}


@dataclass
class ValidationError:
    path: Path
    message: str


def _expect_keys(data: dict, required: Iterable[str], optional: Iterable[str] = ()) -> List[str]:
    errors: List[str] = []
    missing = [key for key in required if key not in data]
    if missing:
        errors.append(f"missing keys: {', '.join(sorted(missing))}")
    unexpected = [key for key in data if key not in (*required, *optional)]
    if unexpected:
        errors.append(f"unexpected keys: {', '.join(sorted(unexpected))}")
    return errors


def _ensure_type(value, expected_type, label: str) -> List[str]:
    if not isinstance(value, expected_type):
        return [f"{label} must be of type {expected_type.__name__}"]
    return []


def validate_manifest(path: Path) -> List[ValidationError]:
    errors: List[ValidationError] = []
    try:
        data = yaml.safe_load(path.read_text())
    except yaml.YAMLError as exc:
        return [ValidationError(path, f"invalid YAML: {exc}")]

    if not isinstance(data, dict):
        return [ValidationError(path, "expected a mapping at the document root")]

    top_level_required = [
        "name",
        "slug",
        "status",
        "description",
        "domains",
        "deploy_targets",
        "ci_cd",
        "approvals",
        "runbooks",
        "observability",
        "notes",
    ]
    top_level_optional = []

    for msg in _expect_keys(data, top_level_required, top_level_optional):
        errors.append(ValidationError(path, msg))

    for key in ("name", "slug", "description"):
        errors.extend(
            ValidationError(path, msg)
            for msg in _ensure_type(data.get(key), str, key)
        )

    status = data.get("status")
    if isinstance(status, str) and status not in ALLOWED_STATUS:
        errors.append(
            ValidationError(
                path,
                f"status '{status}' must be one of: {', '.join(sorted(ALLOWED_STATUS))}",
            )
        )
    elif not isinstance(status, str):
        errors.append(ValidationError(path, "status must be of type str"))

    slug = data.get("slug")
    if isinstance(slug, str) and slug != slug.lower():
        errors.append(ValidationError(path, "slug must be lowercase"))

    domains = data.get("domains")
    domain_errors = _ensure_type(domains, dict, "domains")
    errors.extend(ValidationError(path, msg) for msg in domain_errors)
    if not domain_errors and isinstance(domains, dict):
        for domain_key, domain_value in domains.items():
            if not isinstance(domain_value, str):
                errors.append(
                    ValidationError(
                        path, f"domains['{domain_key}'] must be a string"
                    )
                )

    deploy_targets = data.get("deploy_targets")
    deploy_errors = _ensure_type(deploy_targets, list, "deploy_targets")
    errors.extend(ValidationError(path, msg) for msg in deploy_errors)
    if not deploy_errors:
        for index, entry in enumerate(deploy_targets):
            if not isinstance(entry, dict):
                errors.append(
                    ValidationError(path, f"deploy_targets[{index}] must be a mapping")
                )
                continue
            entry_errors = _expect_keys(entry, ["provider", "status"], optional=entry.keys())
            errors.extend(
                ValidationError(path, f"deploy_targets[{index}] {msg}")
                for msg in entry_errors
            )
            provider_value = entry.get("provider")
            if not isinstance(provider_value, str):
                errors.append(
                    ValidationError(
                        path, f"deploy_targets[{index}].provider must be a string"
                    )
                )
            status_value = entry.get("status")
            if isinstance(status_value, str) and status_value not in ALLOWED_STATUS:
                errors.append(
                    ValidationError(
                        path,
                        f"deploy_targets[{index}].status '{status_value}' must be one of: "
                        f"{', '.join(sorted(ALLOWED_STATUS))}",
                    )
                )
            elif not isinstance(status_value, str):
                errors.append(
                    ValidationError(
                        path, f"deploy_targets[{index}].status must be a string"
                    )
                )

    ci_cd = data.get("ci_cd")
    ci_cd_errors = _ensure_type(ci_cd, dict, "ci_cd")
    errors.extend(ValidationError(path, msg) for msg in ci_cd_errors)
    if not ci_cd_errors and isinstance(ci_cd, dict):
        for msg in _expect_keys(ci_cd, ["branch", "workflows"], optional=["promotes_from"]):
            errors.append(ValidationError(path, f"ci_cd {msg}"))
        workflows = ci_cd.get("workflows")
        errors.extend(
            ValidationError(path, f"ci_cd.workflows {msg}")
            for msg in _ensure_type(workflows, list, "workflows")
        )
        if isinstance(workflows, list):
            for index, workflow in enumerate(workflows):
                if not isinstance(workflow, str):
                    errors.append(
                        ValidationError(
                            path, f"ci_cd.workflows[{index}] must be a string"
                        )
                    )
        branch = ci_cd.get("branch")
        if not isinstance(branch, str):
            errors.append(ValidationError(path, "ci_cd.branch must be a string"))
        promotes_from = ci_cd.get("promotes_from")
        if promotes_from is not None and not isinstance(promotes_from, str):
            errors.append(
                ValidationError(
                    path, "ci_cd.promotes_from must be a string or null"
                )
            )

    approvals = data.get("approvals")
    approvals_errors = _ensure_type(approvals, dict, "approvals")
    errors.extend(ValidationError(path, msg) for msg in approvals_errors)
    if not approvals_errors and isinstance(approvals, dict):
        for msg in _expect_keys(
            approvals, ["required", "reviewers"], optional=["change_window", "policy_gates"]
        ):
            errors.append(ValidationError(path, f"approvals {msg}"))
        required_value = approvals.get("required")
        if not isinstance(required_value, bool):
            errors.append(ValidationError(path, "approvals.required must be a boolean"))
        reviewers_value = approvals.get("reviewers")
        errors.extend(
            ValidationError(path, f"approvals.reviewers {msg}")
            for msg in _ensure_type(reviewers_value, list, "reviewers")
        )
        if isinstance(reviewers_value, list):
            for index, reviewer in enumerate(reviewers_value):
                if not isinstance(reviewer, str):
                    errors.append(
                        ValidationError(
                            path, f"approvals.reviewers[{index}] must be a string"
                        )
                    )

    runbooks = data.get("runbooks")
    runbook_errors = _ensure_type(runbooks, dict, "runbooks")
    errors.extend(ValidationError(path, msg) for msg in runbook_errors)
    if not runbook_errors and isinstance(runbooks, dict):
        for msg in _expect_keys(runbooks, ["deploy", "rollback"]):
            errors.append(ValidationError(path, f"runbooks {msg}"))
        for key in ("deploy", "rollback"):
            if not isinstance(runbooks.get(key), str):
                errors.append(
                    ValidationError(path, f"runbooks.{key} must be a string")
                )

    observability = data.get("observability")
    observability_errors = _ensure_type(observability, dict, "observability")
    errors.extend(ValidationError(path, msg) for msg in observability_errors)
    if not observability_errors and isinstance(observability, dict):
        for msg in _expect_keys(
            observability,
            ["dashboards", "alerts", "logging"],
        ):
            errors.append(ValidationError(path, f"observability {msg}"))
        for key in ("dashboards", "alerts", "logging"):
            section = observability.get(key)
            if not isinstance(section, dict):
                errors.append(
                    ValidationError(
                        path, f"observability.{key} must be a mapping"
                    )
                )

    notes = data.get("notes")
    notes_errors = _ensure_type(notes, list, "notes")
    errors.extend(ValidationError(path, msg) for msg in notes_errors)
    if not notes_errors:
        for index, value in enumerate(notes):
            if not isinstance(value, str):
                errors.append(
                    ValidationError(path, f"notes[{index}] must be a string")
                )

    return errors


def run(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "directory",
        nargs="?",
        default=Path("environments"),
        type=Path,
        help="Directory containing environment manifest YAML files (default: environments)",
    )
    args = parser.parse_args(argv)

    directory: Path = args.directory
    if not directory.exists():
        parser.error(f"directory '{directory}' does not exist")

    manifests = sorted(directory.glob("*.yml"))
    if not manifests:
        parser.error(f"no manifest files found in '{directory}'")

    all_errors: List[ValidationError] = []
    for manifest in manifests:
        all_errors.extend(validate_manifest(manifest))

    if all_errors:
        for error in all_errors:
            print(f"{error.path}: {error.message}", file=sys.stderr)
        return 1

    for manifest in manifests:
        print(f"✔ {manifest.relative_to(directory.parent)}")
    return 0


if __name__ == "__main__":  # pragma: no cover - CLI entry point
    raise SystemExit(run())
