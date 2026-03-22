#!/usr/bin/env python3
"""
BlackRoad OS Beacon - iOS Deploy Trigger Script
For use with Pyto app on iOS devices

This script allows triggering deployments from iOS via webhooks
and can be integrated with iOS Shortcuts.
"""

import json
import urllib.request
import urllib.error
from datetime import datetime
from typing import Dict, Optional
import ssl

# Configuration
BEACON_URL = "https://beacon.blackroad.io"
GITHUB_API = "https://api.github.com"
TIMEOUT = 30

# iOS-specific imports
try:
    import notifications
    import shortcuts
    import keychain
    HAS_IOS_MODULES = True
except ImportError:
    HAS_IOS_MODULES = False


def get_github_token() -> Optional[str]:
    """Get GitHub token from iOS keychain or environment."""
    if HAS_IOS_MODULES:
        try:
            return keychain.get_password("github_token", "blackroad")
        except Exception:
            pass

    import os
    return os.environ.get("GITHUB_TOKEN")


def trigger_workflow(
    owner: str,
    repo: str,
    workflow: str,
    ref: str = "main",
    inputs: Optional[Dict] = None
) -> Dict:
    """Trigger a GitHub Actions workflow."""
    token = get_github_token()
    if not token:
        return {"ok": False, "error": "GitHub token not found"}

    url = f"{GITHUB_API}/repos/{owner}/{repo}/actions/workflows/{workflow}/dispatches"

    payload = {
        "ref": ref,
        "inputs": inputs or {}
    }

    try:
        data = json.dumps(payload).encode()
        request = urllib.request.Request(
            url,
            data=data,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
                "Content-Type": "application/json",
                "User-Agent": "BlackRoad-Beacon-iOS/1.0"
            },
            method="POST"
        )

        ctx = ssl.create_default_context()
        with urllib.request.urlopen(request, timeout=TIMEOUT, context=ctx) as response:
            if response.status == 204:
                return {"ok": True, "message": f"Workflow {workflow} triggered successfully"}
            return {"ok": True, "status": response.status}

    except urllib.error.HTTPError as e:
        return {"ok": False, "error": f"HTTP {e.code}: {e.reason}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def deploy_to_railway(service: str = "blackroad-os-beacon") -> Dict:
    """Trigger Railway deployment via GitHub Actions."""
    return trigger_workflow(
        owner="BlackRoad-OS",
        repo="blackroad-os-beacon",
        workflow="deploy-railway.yml",
        inputs={"service": service}
    )


def deploy_to_cloudflare(site: str) -> Dict:
    """Trigger Cloudflare Pages deployment via GitHub Actions."""
    return trigger_workflow(
        owner="BlackRoad-OS",
        repo="blackroad-os-beacon",
        workflow="deploy-cloudflare.yml",
        inputs={"site": site}
    )


def deploy_to_droplet() -> Dict:
    """Trigger DigitalOcean Droplet deployment via GitHub Actions."""
    return trigger_workflow(
        owner="BlackRoad-OS",
        repo="blackroad-os-beacon",
        workflow="deploy-droplet.yml"
    )


def deploy_to_pis() -> Dict:
    """Trigger Raspberry Pi fleet deployment via GitHub Actions."""
    return trigger_workflow(
        owner="BlackRoad-OS",
        repo="blackroad-os-beacon",
        workflow="deploy-to-pis.yml"
    )


def deploy_all() -> Dict:
    """Trigger deployment to all platforms."""
    return trigger_workflow(
        owner="BlackRoad-OS",
        repo="blackroad-os-beacon",
        workflow="deploy-all.yml"
    )


def log_deploy(
    service: str,
    env: str,
    git_sha: str,
    actor: str,
    outcome: str = "success"
) -> Dict:
    """Log a deployment to the beacon service."""
    url = f"{BEACON_URL}/deploys"

    payload = {
        "service": service,
        "env": env,
        "git_sha": git_sha,
        "actor": actor,
        "started_at": datetime.utcnow().isoformat() + "Z",
        "completed_at": datetime.utcnow().isoformat() + "Z",
        "outcome": outcome,
        "links": [],
        "meta": {
            "triggered_from": "ios",
            "app": "pyto"
        }
    }

    try:
        data = json.dumps(payload).encode()
        request = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "BlackRoad-Beacon-iOS/1.0"
            },
            method="POST"
        )

        ctx = ssl.create_default_context()
        with urllib.request.urlopen(request, timeout=TIMEOUT, context=ctx) as response:
            return json.loads(response.read().decode())

    except Exception as e:
        return {"ok": False, "error": str(e)}


def send_notification(title: str, body: str):
    """Send iOS notification."""
    if HAS_IOS_MODULES:
        try:
            notification = notifications.Notification()
            notification.title = title
            notification.body = body
            notification.send()
        except Exception as e:
            print(f"Notification error: {e}")
    else:
        print(f"[NOTIFICATION] {title}: {body}")


def interactive_deploy():
    """Interactive deployment menu for iOS."""
    print("BlackRoad OS - Deploy Manager")
    print("=" * 30)
    print("1. Deploy to Railway")
    print("2. Deploy to Cloudflare")
    print("3. Deploy to DigitalOcean")
    print("4. Deploy to Raspberry Pis")
    print("5. Deploy All")
    print("0. Exit")
    print()

    if HAS_IOS_MODULES:
        try:
            choice = shortcuts.get_input("Enter choice (0-5):")
        except Exception:
            choice = input("Enter choice (0-5): ")
    else:
        choice = input("Enter choice (0-5): ")

    result = None

    if choice == "1":
        result = deploy_to_railway()
    elif choice == "2":
        if HAS_IOS_MODULES:
            try:
                site = shortcuts.get_input("Enter site name:")
            except Exception:
                site = input("Enter site name: ")
        else:
            site = input("Enter site name: ")
        result = deploy_to_cloudflare(site)
    elif choice == "3":
        result = deploy_to_droplet()
    elif choice == "4":
        result = deploy_to_pis()
    elif choice == "5":
        result = deploy_all()
    elif choice == "0":
        print("Goodbye!")
        return
    else:
        print("Invalid choice")
        return

    if result:
        print(json.dumps(result, indent=2))
        if result.get("ok"):
            send_notification("Deploy Triggered", result.get("message", "Deployment started"))
        else:
            send_notification("Deploy Failed", result.get("error", "Unknown error"))

        if HAS_IOS_MODULES:
            try:
                shortcuts.set_output(json.dumps(result))
            except Exception:
                pass


if __name__ == "__main__":
    interactive_deploy()
