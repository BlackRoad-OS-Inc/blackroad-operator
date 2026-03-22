#!/usr/bin/env python3
"""BlackRoad Mail System"""
import os
import json
import socket
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

MAIL_LOG = os.path.expanduser("~/blackroad-integrations/mail.log")
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASS = os.environ.get("SMTP_PASS", "")

def send_mail(to: str, subject: str, body: str, from_addr: str = None):
    """Send email"""
    hostname = socket.gethostname()
    from_addr = from_addr or f"agent-{hostname}@blackroad.io"

    # Log locally always
    log_mail(to, subject, body)

    if not SMTP_USER or not SMTP_PASS:
        return {"error": "SMTP not configured", "logged": True}

    try:
        msg = MIMEMultipart()
        msg["From"] = from_addr
        msg["To"] = to
        msg["Subject"] = f"[BlackRoad/{hostname}] {subject}"
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)

        return {"sent": True}
    except Exception as e:
        return {"error": str(e)}

def log_mail(to: str, subject: str, body: str):
    """Log email locally"""
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "agent": socket.gethostname(),
        "to": to,
        "subject": subject,
        "body": body[:200]
    }
    with open(MAIL_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")

if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 4:
        result = send_mail(sys.argv[1], sys.argv[2], " ".join(sys.argv[3:]))
        print(json.dumps(result))
    else:
        print("Usage: mail.py <to> <subject> <body>")
