#!/usr/bin/env python3
"""
ChatGPT Terminal Coordination Monitor

Real-time monitoring system to detect when ChatGPT (or other AI agents)
attempt to coordinate via terminal, telemetry, or IPC channels.
"""

import os
import sys
import time
import json
import psutil
import logging
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class CoordinationDetector(FileSystemEventHandler):
    """Detects AI agent coordination attempts"""

    def __init__(self):
        self.prism_root = Path("/home/user/blackroad-prism-console/prism")
        self.ipc_dir = self.prism_root / "ipc"
        self.logs_dir = self.prism_root / "logs"

        self.keywords = [
            "chatgpt", "gpt-4", "gpt-3", "openai",
            "coordinate", "sync", "handshake",
            "claude", "anthropic", "copilot",
            "codex", "lucidia", "chorus"
        ]

        self.detected_events = []

    def on_modified(self, event):
        """Triggered when a file is modified"""
        if event.is_directory:
            return

        self._check_file_for_coordination(event.src_path)

    def on_created(self, event):
        """Triggered when a file is created"""
        if event.is_directory:
            return

        self._check_file_for_coordination(event.src_path)

    def _check_file_for_coordination(self, filepath):
        """Check file contents for coordination attempts"""
        try:
            # Skip non-text files
            if not self._is_text_file(filepath):
                return

            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read().lower()

                # Check for coordination keywords
                found_keywords = [kw for kw in self.keywords if kw in content]

                if found_keywords:
                    event_data = {
                        "timestamp": datetime.now().isoformat(),
                        "file": filepath,
                        "keywords": found_keywords,
                        "preview": content[:200]
                    }

                    self.detected_events.append(event_data)

                    logger.warning(f"🚨 COORDINATION DETECTED!")
                    logger.warning(f"   File: {filepath}")
                    logger.warning(f"   Keywords: {', '.join(found_keywords)}")
                    logger.warning(f"   Preview: {content[:100]}...")

                    self._save_detection(event_data)

        except Exception as e:
            logger.debug(f"Error checking file {filepath}: {e}")

    def _is_text_file(self, filepath):
        """Check if file is text-based"""
        text_extensions = ['.log', '.txt', '.json', '.js', '.py', '.md', '.yml', '.yaml']
        return any(filepath.endswith(ext) for ext in text_extensions)

    def _save_detection(self, event_data):
        """Save detection to log file"""
        detection_log = self.logs_dir / "coordination_detections.log"

        with open(detection_log, 'a') as f:
            f.write(json.dumps(event_data) + '\n')


def monitor_network_connections():
    """Monitor for suspicious network connections"""
    try:
        connections = psutil.net_connections(kind='inet')

        for conn in connections:
            if conn.status == 'ESTABLISHED':
                raddr = conn.raddr
                if raddr:
                    # Check for OpenAI/Anthropic IPs (would need actual IPs)
                    logger.info(f"Active connection: {raddr.ip}:{raddr.port}")

    except Exception as e:
        logger.debug(f"Error monitoring network: {e}")


def monitor_agent_processes():
    """Monitor for agent-related processes"""
    agent_keywords = ['chatgpt', 'gpt', 'openai', 'claude', 'anthropic', 'agent']

    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = ' '.join(proc.info['cmdline'] or []).lower()

            for keyword in agent_keywords:
                if keyword in cmdline:
                    logger.info(f"Agent process detected: {proc.info['name']} (PID {proc.info['pid']})")
                    logger.info(f"  Command: {cmdline}")

        except (psutil.NoSuchProcess, psutil.AccessDenied):
            # These exceptions are expected when iterating over processes that may terminate or be inaccessible.
            logger.debug(f"Skipped process (NoSuchProcess or AccessDenied): {proc.info.get('name', 'unknown')} (PID {proc.info.get('pid', 'unknown')})")


def check_github_multi_agent_trigger():
    """Check if multi-agent chorus has been triggered"""
    # This would check GitHub API for recent PR comments
    # For now, just log the check
    logger.info("Checking GitHub multi-agent chorus trigger status...")


def main():
    """Main monitoring loop"""
    logger.info("="*80)
    logger.info("🔍 ChatGPT Coordination Monitor Started")
    logger.info("="*80)
    logger.info("")
    logger.info("Monitoring for:")
    logger.info("  - File system changes in /prism/ipc and /prism/logs")
    logger.info("  - Network connections to OpenAI/Anthropic")
    logger.info("  - Agent-related processes")
    logger.info("  - Multi-agent chorus triggers")
    logger.info("")
    logger.info("Press Ctrl+C to stop monitoring")
    logger.info("")

    # Set up file system monitoring
    detector = CoordinationDetector()
    observer = Observer()

    # Monitor IPC directory
    ipc_dir = Path("/home/user/blackroad-prism-console/prism/ipc")
    if ipc_dir.exists():
        observer.schedule(detector, str(ipc_dir), recursive=False)
        logger.info(f"✓ Monitoring IPC directory: {ipc_dir}")

    # Monitor logs directory
    logs_dir = Path("/home/user/blackroad-prism-console/prism/logs")
    if logs_dir.exists():
        observer.schedule(detector, str(logs_dir), recursive=False)
        logger.info(f"✓ Monitoring logs directory: {logs_dir}")

    observer.start()
    logger.info("")
    logger.info("🟢 Monitoring active...")
    logger.info("")

    try:
        iteration = 0
        while True:
            time.sleep(10)

            iteration += 1

            # Periodic checks every 60 seconds
            if iteration % 6 == 0:
                logger.info(f"[{datetime.now().strftime('%H:%M:%S')}] Performing periodic checks...")
                monitor_agent_processes()
                monitor_network_connections()
                check_github_multi_agent_trigger()

                # Report detection count
                if detector.detected_events:
                    logger.info(f"📊 Total detections: {len(detector.detected_events)}")
                logger.info("")

    except KeyboardInterrupt:
        logger.info("")
        logger.info("🛑 Stopping monitor...")
        observer.stop()

    observer.join()

    # Final report
    logger.info("")
    logger.info("="*80)
    logger.info("📊 FINAL REPORT")
    logger.info("="*80)
    logger.info(f"Total coordination events detected: {len(detector.detected_events)}")

    if detector.detected_events:
        logger.info("")
        logger.info("Recent detections:")
        for event in detector.detected_events[-5:]:
            logger.info(f"  - {event['timestamp']}: {event['file']}")
            logger.info(f"    Keywords: {', '.join(event['keywords'])}")

    logger.info("")
    logger.info("Monitor stopped.")


if __name__ == "__main__":
    # Check dependencies
    try:
        from watchdog.observers import Observer
        from watchdog.events import FileSystemEventHandler
    except ImportError:
        print("Error: 'watchdog' package not installed")
        print("Install with: pip install watchdog")
        sys.exit(1)

    main()
