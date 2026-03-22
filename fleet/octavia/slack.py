#!/usr/bin/env python3
"""BlackRoad Slack Integration"""
import os
import json
import socket
from datetime import datetime

SLACK_WEBHOOK = os.environ.get("SLACK_WEBHOOK_URL", "")
SLACK_LOG = os.path.expanduser("~/blackroad-integrations/slack.log")

def send_message(channel: str, message: str, username: str = None):
    """Send message to Slack"""
    import urllib.request

    if not SLACK_WEBHOOK:
        log_local(channel, message)
        return {"error": "No webhook configured", "logged": True}

    hostname = socket.gethostname()
    payload = {
        "channel": channel,
        "username": username or f"blackroad-{hostname}",
        "text": message,
        "icon_emoji": ":robot_face:"
    }

    try:
        req = urllib.request.Request(
            SLACK_WEBHOOK,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req)
        log_local(channel, message)
        return {"sent": True}
    except Exception as e:
        return {"error": str(e)}

def log_local(channel: str, message: str):
    """Log message locally"""
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "agent": socket.gethostname(),
        "channel": channel,
        "message": message
    }
    with open(SLACK_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")

if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 3:
        result = send_message(sys.argv[1], " ".join(sys.argv[2:]))
        print(json.dumps(result))
    else:
        print("Usage: slack.py <channel> <message>")
