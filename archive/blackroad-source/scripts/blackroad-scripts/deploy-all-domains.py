#!/usr/bin/env python3
"""
BlackRoad Mass Deployment Script (Python)
Deploy all domains to Cloudflare Pages
Version: 3.0.0 - Python Edition
"""

import json
import sys
import time
import requests
from typing import Dict, List, Tuple

# Configuration
CF_TOKEN = "yP5h0HvsXX0BpHLs01tLmgtTbQurIKPL4YnQfIwy"
CF_ACCOUNT_ID = "463024cf9efed5e7b40c5fbe7938e256"
GITHUB_ORG = "BlackRoad-OS"

# Colors
class Color:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    PURPLE = '\033[0;35m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'

# Domain -> Repo mapping
DEPLOYMENTS = {
    # Primary
    "blackroad.io": "blackroad-os-home",
    "app.blackroad.io": "blackroad-os-web",
    "console.blackroad.io": "blackroad-os-prism-console",
    "docs.blackroad.io": "blackroad-os-docs",
    "api.blackroad.io": "blackroad-os-api",
    "brand.blackroad.io": "blackroad-os-brand",
    "status.blackroad.io": "blackroad-os-beacon",

    # Lucidia
    "lucidia.earth": "lucidia-earth-website",
    "app.lucidia.earth": "blackroad-os-web",
    "console.lucidia.earth": "blackroad-os-prism-console",

    # Verticals
    "finance.blackroad.io": "blackroad-os-pack-finance",
    "edu.blackroad.io": "blackroad-os-pack-education",
    "studio.blackroad.io": "blackroad-os-pack-creator-studio",
    "lab.blackroad.io": "blackroad-os-pack-research-lab",
    "canvas.blackroad.io": "blackroad-os-pack-creator-studio",
    "video.blackroad.io": "blackroad-os-pack-creator-studio",
    "writing.blackroad.io": "blackroad-os-pack-creator-studio",
    "legal.blackroad.io": "blackroad-os-pack-legal",
    "devops.blackroad.io": "blackroad-os-pack-infra-devops",

    # Demo
    "demo.blackroad.io": "blackroad-os-demo",
    "sandbox.blackroad.io": "blackroad-os-demo",
}

# Stats
stats = {
    "total": 0,
    "success": 0,
    "failed": 0,
    "skipped": 0
}

def log(message: str, color: str = Color.BLUE):
    """Print colored log message"""
    timestamp = time.strftime("%H:%M:%S")
    print(f"{color}[{timestamp}]{Color.NC} {message}")

def success(message: str):
    """Print success message"""
    print(f"{Color.GREEN}[✓]{Color.NC} {message}")
    stats["success"] += 1

def fail(message: str):
    """Print failure message"""
    print(f"{Color.RED}[✗]{Color.NC} {message}")
    stats["failed"] += 1

def skip(message: str):
    """Print skip message"""
    print(f"{Color.YELLOW}[⊙]{Color.NC} {message}")
    stats["skipped"] += 1

def cf_api(method: str, endpoint: str, data: dict = None) -> dict:
    """Make Cloudflare API request"""
    url = f"https://api.cloudflare.com/client/v4{endpoint}"
    headers = {
        "Authorization": f"Bearer {CF_TOKEN}",
        "Content-Type": "application/json"
    }

    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            return {"success": False, "errors": [{"message": f"Unknown method: {method}"}]}

        return response.json()
    except Exception as e:
        return {"success": False, "errors": [{"message": str(e)}]}

def project_exists(project_name: str) -> bool:
    """Check if Cloudflare Pages project exists"""
    result = cf_api("GET", f"/accounts/{CF_ACCOUNT_ID}/pages/projects/{project_name}")
    return result.get("success", False)

def create_project(project_name: str) -> bool:
    """Create Cloudflare Pages project"""
    data = {
        "name": project_name,
        "production_branch": "main",
        "build_config": {
            "build_command": "npm run build",
            "destination_dir": "out",
            "root_dir": ""
        }
    }

    result = cf_api("POST", f"/accounts/{CF_ACCOUNT_ID}/pages/projects", data)

    if result.get("success"):
        return True
    else:
        errors = result.get("errors", [])
        if errors:
            print(f"      Error: {errors[0].get('message', 'Unknown error')}")
        return False

def add_domain(project_name: str, domain: str) -> bool:
    """Add custom domain to project"""
    data = {"name": domain}
    result = cf_api("POST", f"/accounts/{CF_ACCOUNT_ID}/pages/projects/{project_name}/domains", data)
    return result.get("success", False)

def deploy_one(domain: str, repo: str, index: int, total: int) -> bool:
    """Deploy a single domain"""
    project_name = domain.replace(".", "-")

    stats["total"] += 1

    print()
    print(f"{Color.CYAN}{'━' * 60}{Color.NC}")
    print(f"{Color.PURPLE}[{index}/{total}]{Color.NC} {Color.YELLOW}{domain}{Color.NC} → {Color.BLUE}{repo}{Color.NC}")
    print(f"{Color.CYAN}{'━' * 60}{Color.NC}")

    # Check if exists
    if project_exists(project_name):
        skip(f"{project_name} already exists")
        add_domain(project_name, domain)
        return True

    # Create project
    log(f"Creating Cloudflare Pages project: {project_name}")
    if create_project(project_name):
        success(f"Created {project_name}")
        time.sleep(1)

        # Add domain
        if add_domain(project_name, domain):
            log(f"Added domain {domain}")

        return True
    else:
        fail(f"Could not create {project_name}")
        return False

def print_summary():
    """Print deployment summary"""
    print()
    print(f"{Color.PURPLE}{'╔' + '═' * 62 + '╗'}{Color.NC}")
    print(f"{Color.PURPLE}║{' ' * 21}DEPLOYMENT SUMMARY{' ' * 23}║{Color.NC}")
    print(f"{Color.PURPLE}{'╚' + '═' * 62 + '╝'}{Color.NC}")
    print()
    print(f"  {Color.BLUE}Total:{Color.NC}    {stats['total']}")
    print(f"  {Color.GREEN}Success:{Color.NC}  {stats['success']}")
    print(f"  {Color.YELLOW}Skipped:{Color.NC}  {stats['skipped']}")
    print(f"  {Color.RED}Failed:{Color.NC}   {stats['failed']}")
    print()

    if stats["failed"] == 0:
        print(f"{Color.GREEN}🎉 All deployments completed!{Color.NC}")
    else:
        print(f"{Color.YELLOW}⚠️  {stats['failed']} deployment(s) failed{Color.NC}")

    print()
    print(f"{Color.CYAN}Next steps:{Color.NC}")
    print("  1. Test: ~/test-deployments.sh smoke")
    print("  2. Status: ~/status-dashboard.sh compact")
    print("  3. Log to memory: ~/memory-system.sh log deployed 'all-domains' 'mass deployment'")
    print()

def main():
    """Main deployment function"""
    print()
    print(f"{Color.PURPLE}{'╔' + '═' * 62 + '╗'}{Color.NC}")
    print(f"{Color.PURPLE}║{' ' * 62}║{Color.NC}")
    print(f"{Color.PURPLE}║{' ' * 10}🚀 BLACKROAD MASS DEPLOYMENT v3.0 🚀{' ' * 11}║{Color.NC}")
    print(f"{Color.PURPLE}║{' ' * 62}║{Color.NC}")
    print(f"{Color.PURPLE}{'╚' + '═' * 62 + '╝'}{Color.NC}")
    print()
    print(f"  Total domains: {Color.YELLOW}{len(DEPLOYMENTS)}{Color.NC}")
    print(f"  Account ID: {Color.CYAN}{CF_ACCOUNT_ID[:20]}...{Color.NC}")
    print()

    # Confirmation
    if "--yes" not in sys.argv and "-y" not in sys.argv:
        response = input(f"{Color.YELLOW}This will create {len(DEPLOYMENTS)} Cloudflare Pages projects. Continue? (y/n) {Color.NC}")
        if response.lower() != 'y':
            print("Aborted.")
            return

    print()
    log("Starting deployment...")
    print()

    # Deploy each domain
    for index, (domain, repo) in enumerate(DEPLOYMENTS.items(), 1):
        try:
            deploy_one(domain, repo, index, len(DEPLOYMENTS))
            time.sleep(0.5)
        except KeyboardInterrupt:
            print()
            print(f"{Color.RED}Deployment interrupted by user{Color.NC}")
            break
        except Exception as e:
            print(f"{Color.RED}Error: {e}{Color.NC}")
            stats["failed"] += 1

    # Summary
    print_summary()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print()
        print(f"{Color.YELLOW}Aborted by user{Color.NC}")
        sys.exit(1)
