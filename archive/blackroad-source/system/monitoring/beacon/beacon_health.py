#!/usr/bin/env python3
"""
BlackRoad OS Beacon - iOS Health Check Script
For use with Pyto app on iOS devices

This script checks the health of all configured beacon services
and can be triggered via iOS Shortcuts integration.
"""

import json
import urllib.request
import urllib.error
from datetime import datetime
from typing import Dict, List, Optional
import ssl

# Configuration
BEACON_URL = "https://beacon.blackroad.io"
TIMEOUT = 10

# iOS-specific imports (available in Pyto)
try:
    import notifications
    import shortcuts
    HAS_IOS_MODULES = True
except ImportError:
    HAS_IOS_MODULES = False


def check_service_health(url: str, timeout: int = TIMEOUT) -> Dict:
    """Check health of a single service."""
    result = {
        "url": url,
        "status": "unknown",
        "latency_ms": None,
        "error": None,
        "checked_at": datetime.utcnow().isoformat() + "Z"
    }

    try:
        # Create SSL context that doesn't verify (for development)
        ctx = ssl.create_default_context()

        start_time = datetime.now()
        request = urllib.request.Request(url, headers={"User-Agent": "BlackRoad-Beacon-iOS/1.0"})

        with urllib.request.urlopen(request, timeout=timeout, context=ctx) as response:
            end_time = datetime.now()
            latency = (end_time - start_time).total_seconds() * 1000

            result["status"] = "healthy" if response.status == 200 else "unhealthy"
            result["latency_ms"] = round(latency, 2)
            result["http_status"] = response.status

    except urllib.error.URLError as e:
        result["status"] = "unhealthy"
        result["error"] = str(e.reason)
    except urllib.error.HTTPError as e:
        result["status"] = "unhealthy"
        result["error"] = f"HTTP {e.code}: {e.reason}"
    except Exception as e:
        result["status"] = "unhealthy"
        result["error"] = str(e)

    return result


def get_beacon_status() -> Dict:
    """Fetch aggregated beacon status from the beacon service."""
    try:
        url = f"{BEACON_URL}/beacon"
        request = urllib.request.Request(url, headers={"User-Agent": "BlackRoad-Beacon-iOS/1.0"})

        ctx = ssl.create_default_context()
        with urllib.request.urlopen(request, timeout=TIMEOUT, context=ctx) as response:
            data = json.loads(response.read().decode())
            return data
    except Exception as e:
        return {"error": str(e), "ok": False}


def get_services_list() -> List[Dict]:
    """Fetch list of monitored services."""
    try:
        url = f"{BEACON_URL}/services"
        request = urllib.request.Request(url, headers={"User-Agent": "BlackRoad-Beacon-iOS/1.0"})

        ctx = ssl.create_default_context()
        with urllib.request.urlopen(request, timeout=TIMEOUT, context=ctx) as response:
            data = json.loads(response.read().decode())
            return data.get("services", [])
    except Exception as e:
        return []


def send_notification(title: str, body: str):
    """Send iOS notification (if available)."""
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


def format_status_report(beacon_data: Dict) -> str:
    """Format beacon data into a readable report."""
    if not beacon_data.get("ok"):
        return f"Error: {beacon_data.get('error', 'Unknown error')}"

    services = beacon_data.get("services", [])
    healthy = sum(1 for s in services if s.get("status") == "healthy")
    unhealthy = sum(1 for s in services if s.get("status") == "unhealthy")
    total = len(services)

    report = [
        f"BlackRoad OS Beacon Status",
        f"{'=' * 30}",
        f"Total Services: {total}",
        f"Healthy: {healthy}",
        f"Unhealthy: {unhealthy}",
        "",
    ]

    if unhealthy > 0:
        report.append("Unhealthy Services:")
        for svc in services:
            if svc.get("status") == "unhealthy":
                report.append(f"  - {svc.get('service', 'Unknown')}: {svc.get('meta', {}).get('error', 'No error info')}")

    return "\n".join(report)


def run_health_check():
    """Main function to run health check."""
    print("Fetching beacon status...")

    # Check beacon service itself
    beacon_health = check_service_health(f"{BEACON_URL}/health")

    if beacon_health["status"] != "healthy":
        message = f"Beacon service is DOWN: {beacon_health.get('error', 'Unknown error')}"
        send_notification("Beacon Alert", message)
        print(message)
        return {"ok": False, "error": message}

    # Get full beacon status
    beacon_data = get_beacon_status()
    report = format_status_report(beacon_data)
    print(report)

    # Send notification if there are unhealthy services
    services = beacon_data.get("services", [])
    unhealthy = [s for s in services if s.get("status") == "unhealthy"]

    if unhealthy:
        send_notification(
            "BlackRoad Services Alert",
            f"{len(unhealthy)} service(s) unhealthy"
        )

    # Return for Shortcuts integration
    if HAS_IOS_MODULES:
        try:
            shortcuts.set_output(report)
        except Exception:
            pass

    return beacon_data


def get_deploy_history(service: Optional[str] = None, limit: int = 10) -> List[Dict]:
    """Fetch recent deployment history."""
    try:
        url = f"{BEACON_URL}/deploys?limit={limit}"
        if service:
            url += f"&service={service}"

        request = urllib.request.Request(url, headers={"User-Agent": "BlackRoad-Beacon-iOS/1.0"})

        ctx = ssl.create_default_context()
        with urllib.request.urlopen(request, timeout=TIMEOUT, context=ctx) as response:
            data = json.loads(response.read().decode())
            return data.get("deploys", [])
    except Exception as e:
        return []


if __name__ == "__main__":
    result = run_health_check()

    # Print JSON for programmatic use
    print("\n--- JSON Output ---")
    print(json.dumps(result, indent=2))
