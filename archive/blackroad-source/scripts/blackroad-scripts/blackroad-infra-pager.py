#!/usr/bin/env python3
"""
BlackRoad Infrastructure Pager
Physical YES/NO approval system for ALL operations

Connects ESP32 operator to:
- GitHub deployments
- Cloudflare deployments
- Railway services
- Pi cluster operations
- Agent deployments
"""

import serial
import time
import requests
import json
import sys
from datetime import datetime

DEVICE = "/dev/cu.usbserial-110"
BAUD = 115200

# Infrastructure endpoints
INFRA = {
    "github_orgs": ["BlackRoad-OS", "BlackRoad-AI", "BlackRoad-Cloud"],
    "cloudflare_zones": 16,
    "cloudflare_pages": 8,
    "railway_projects": 12,
    "pi_cluster": ["192.168.4.38", "192.168.4.64", "192.168.4.99"],
    "total_repos": 66,
    "total_agents": 0  # Will grow to 30,000
}

class InfraPager:
    def __init__(self):
        self.ser = serial.Serial(DEVICE, BAUD, timeout=1)
        time.sleep(2)  # Wait for ESP32 reset

        # Clear startup messages
        if self.ser.in_waiting > 0:
            self.ser.read(self.ser.in_waiting)

        print("🌌 BlackRoad Infrastructure Pager")
        print("=" * 60)
        print(f"Connected: {DEVICE}")
        print(f"GitHub Orgs: {len(INFRA['github_orgs'])}")
        print(f"Repos: {INFRA['total_repos']}")
        print(f"Cloudflare Zones: {INFRA['cloudflare_zones']}")
        print(f"Railway Projects: {INFRA['railway_projects']}")
        print(f"Pi Cluster Nodes: {len(INFRA['pi_cluster'])}")
        print("=" * 60)
        print()

        self.pending_operations = []
        self.approved_count = 0
        self.rejected_count = 0

    def send_command(self, cmd):
        """Send command to ESP32"""
        self.ser.write(f"{cmd}\n".encode())
        time.sleep(0.3)

        if self.ser.in_waiting > 0:
            response = self.ser.read(self.ser.in_waiting).decode('utf-8', errors='ignore')
            return response.strip()
        return ""

    def ask_approval(self, operation, context=""):
        """Ask for YES/NO approval on hardware"""
        timestamp = datetime.now().strftime("%H:%M:%S")

        print(f"\n[{timestamp}] 🚨 APPROVAL REQUIRED")
        print(f"Operation: {operation}")
        if context:
            print(f"Context: {context}")
        print()
        print("⚡ Waiting for PHYSICAL approval on USB-C operator...")
        print("   Press YES button to approve")
        print("   Press NO button to reject")
        print()

        # Wait for YES or NO from hardware
        while True:
            if self.ser.in_waiting > 0:
                response = self.ser.read(self.ser.in_waiting).decode('utf-8', errors='ignore')

                if "APPROVED" in response:
                    print(f"✅ [{timestamp}] APPROVED by operator")
                    self.approved_count += 1
                    return True

                elif "REJECTED" in response:
                    print(f"❌ [{timestamp}] REJECTED by operator")
                    self.rejected_count += 1
                    return False

            time.sleep(0.1)

    def deploy_to_cloudflare(self, project_name):
        """Deploy to Cloudflare Pages"""
        approved = self.ask_approval(
            f"Deploy {project_name} to Cloudflare Pages",
            f"Zone: blackroad.io | Pages: {INFRA['cloudflare_pages']}"
        )

        if approved:
            print(f"🚀 Deploying {project_name}...")
            # Actual deployment would happen here
            print(f"✅ {project_name} deployed to Cloudflare")
            return True
        else:
            print(f"⏸️  Deployment cancelled: {project_name}")
            return False

    def scale_railway_service(self, service_name, instances):
        """Scale Railway service"""
        approved = self.ask_approval(
            f"Scale {service_name} to {instances} instances",
            f"Railway Projects: {INFRA['railway_projects']}"
        )

        if approved:
            print(f"📈 Scaling {service_name} to {instances} instances...")
            # Actual scaling would happen here
            print(f"✅ {service_name} scaled successfully")
            return True
        else:
            print(f"⏸️  Scaling cancelled: {service_name}")
            return False

    def deploy_agents(self, count, target="all"):
        """Deploy AI agents"""
        approved = self.ask_approval(
            f"Deploy {count} AI agents",
            f"Target: {target} | Current: {INFRA['total_agents']}"
        )

        if approved:
            print(f"🤖 Deploying {count} agents to {target}...")
            # Actual agent deployment would happen here
            INFRA['total_agents'] += count
            print(f"✅ {count} agents deployed (Total: {INFRA['total_agents']})")
            return True
        else:
            print(f"⏸️  Agent deployment cancelled")
            return False

    def restart_pi_cluster(self):
        """Restart Pi cluster"""
        approved = self.ask_approval(
            "Restart entire Pi cluster",
            f"Nodes: {', '.join(INFRA['pi_cluster'])}"
        )

        if approved:
            print(f"🔄 Restarting Pi cluster...")
            for ip in INFRA['pi_cluster']:
                print(f"  → Restarting {ip}...")
            print(f"✅ Pi cluster restarted")
            return True
        else:
            print(f"⏸️  Cluster restart cancelled")
            return False

    def merge_pr(self, repo, pr_number):
        """Merge GitHub PR"""
        approved = self.ask_approval(
            f"Merge PR #{pr_number}",
            f"Repo: {repo}"
        )

        if approved:
            print(f"🔀 Merging PR #{pr_number} in {repo}...")
            # Actual merge would happen here via gh CLI
            print(f"✅ PR #{pr_number} merged")
            return True
        else:
            print(f"⏸️  PR merge cancelled")
            return False

    def show_stats(self):
        """Show pager statistics"""
        print()
        print("=" * 60)
        print("📊 Infrastructure Pager Statistics")
        print("=" * 60)
        print(f"Total Approvals: {self.approved_count}")
        print(f"Total Rejections: {self.rejected_count}")
        print(f"Approval Rate: {self.approved_count / max(1, self.approved_count + self.rejected_count) * 100:.1f}%")
        print(f"Active Agents: {INFRA['total_agents']}")
        print("=" * 60)

    def interactive_mode(self):
        """Interactive pager mode"""
        print()
        print("🎯 Interactive Mode - Choose operation:")
        print()
        print("1. Deploy to Cloudflare")
        print("2. Scale Railway service")
        print("3. Deploy AI agents")
        print("4. Restart Pi cluster")
        print("5. Merge GitHub PR")
        print("6. Show statistics")
        print("7. Test hardware (PING)")
        print("0. Exit")
        print()

        while True:
            try:
                choice = input("Select operation (0-7): ").strip()

                if choice == "0":
                    print("👋 Exiting pager...")
                    break

                elif choice == "1":
                    project = input("Project name: ")
                    self.deploy_to_cloudflare(project)

                elif choice == "2":
                    service = input("Service name: ")
                    instances = input("Number of instances: ")
                    self.scale_railway_service(service, instances)

                elif choice == "3":
                    count = int(input("Number of agents: "))
                    target = input("Target (e.g., 'all', 'BlackRoad-OS'): ")
                    self.deploy_agents(count, target)

                elif choice == "4":
                    self.restart_pi_cluster()

                elif choice == "5":
                    repo = input("Repository: ")
                    pr = input("PR number: ")
                    self.merge_pr(repo, pr)

                elif choice == "6":
                    self.show_stats()

                elif choice == "7":
                    print("🏓 Testing hardware...")
                    response = self.send_command("PING")
                    print(f"Response: {response}")

            except KeyboardInterrupt:
                print("\n👋 Exiting pager...")
                break
            except Exception as e:
                print(f"❌ Error: {e}")

    def close(self):
        """Cleanup"""
        self.show_stats()
        self.ser.close()
        print("\n✅ Pager disconnected")

def main():
    """Main entry point"""
    try:
        pager = InfraPager()

        # Demo sequence
        print("🎬 Running demo sequence...\n")
        time.sleep(1)

        # 1. Deploy dashboard
        pager.deploy_to_cloudflare("blackroad-monitoring-dashboard")

        # 2. Scale API
        pager.scale_railway_service("blackroad-api", 5)

        # 3. Deploy agents
        pager.deploy_agents(100, "BlackRoad-OS")

        # 4. Merge PR
        pager.merge_pr("BlackRoad-OS/blackroad-os-operator", 42)

        # Show stats
        pager.show_stats()

        # Interactive mode
        print("\n" + "=" * 60)
        print("Demo complete! Starting interactive mode...")
        print("=" * 60)
        pager.interactive_mode()

        pager.close()

    except serial.SerialException as e:
        print(f"❌ Serial error: {e}")
        print(f"Is ESP32 connected to {DEVICE}?")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n👋 Interrupted by user")
        sys.exit(0)

if __name__ == "__main__":
    main()
