from __future__ import annotations

from pathlib import Path
import sys
from textwrap import dedent

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from tools import environments_summary as envsum


def test_summarise_manifest_preserves_security_metadata(tmp_path, monkeypatch):
    manifest = dedent(
        """
        name: preview
        slug: pr
        state: active
        description: Preview stack
        automation:
          workflows:
            - name: Deploy Preview
              file: .github/workflows/deploy-preview.yml
              triggers:
                - push
              secrets_required:
                - CF_API_TOKEN
              variables_required:
                - PREVIEW_ENV
          required_checks:
            push:
              preview:
                - build
                - deploy
        deployments:
          - service: web
            type: static-site
            provider: github-pages
            workflow: .github/workflows/deploy-preview.yml
            domain: https://dev.blackroad.io
            health_check: https://dev.blackroad.io/health.json
        infrastructure:
          cloud: aws
        """
    )
    manifest_path = tmp_path / "preview.yml"
    manifest_path.write_text(manifest, encoding="utf-8")

    monkeypatch.setattr(envsum, "MANIFEST_DIR", tmp_path)
    monkeypatch.setattr(envsum, "REPO_ROOT", tmp_path)

    loaded = list(envsum._iter_manifests())
    assert len(loaded) == 1

    summary = envsum._summarise_manifest(loaded[0])
    workflow = summary["workflows"][0]
    assert workflow["secrets_required"] == ["CF_API_TOKEN"]
    assert workflow["variables_required"] == ["PREVIEW_ENV"]

    required_checks = summary["required_checks"]
    assert required_checks == {
        "push": {"preview": ["build", "deploy"]},
    }

    service = summary["services"][0]
    assert service["health_check"] == "https://dev.blackroad.io/health.json"


def test_render_text_outputs_required_checks_and_health():
    summary = {
        "name": "preview",
        "slug": "pr",
        "state": "active",
        "file": "environments/preview.yml",
        "description": "Preview stack",
        "contacts": {},
        "domains": {},
        "workflows": [
            {
                "name": "Deploy Preview",
                "file": ".github/workflows/deploy-preview.yml",
                "triggers": ["push"],
                "secrets_required": ["CF_API_TOKEN"],
                "variables_required": ["PREVIEW_ENV"],
                "summary": "",
            }
        ],
        "services": [
            {
                "service": "web",
                "type": "static-site",
                "provider": "github-pages",
                "state": "active",
                "workflow": ".github/workflows/deploy-preview.yml",
                "domain": "https://dev.blackroad.io",
                "terraform_directory": None,
                "terraform_backend": None,
                "module": None,
                "notes": None,
                "health_check": [
                    "https://dev.blackroad.io/health.json",
                    "curl -fsS https://dev.blackroad.io/ping",
                ],
            }
        ],
        "infrastructure": {"cloud": "aws", "region": "us-west-2", "terraform_root": None, "terraform_backend": None},
        "required_checks": {"push": {"preview": ["build", "deploy"]}},
        "change_management": {},
        "observability": {},
    }

    rendered = envsum._render_text([summary])

    assert "Required checks:" in rendered
    assert "push:" in rendered
    assert "preview: build, deploy" in rendered
    assert "health: https://dev.blackroad.io/health.json" in rendered
    assert "health: curl -fsS https://dev.blackroad.io/ping" in rendered
    assert "[secrets=CF_API_TOKEN | vars=PREVIEW_ENV]" in rendered
