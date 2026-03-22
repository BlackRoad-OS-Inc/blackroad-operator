#!/usr/bin/env python3
"""
Generate GitHub usernames for all archetype agents.
"""

import yaml
import json
import os
from pathlib import Path

def normalize_for_username(text):
    """Convert text to lowercase and replace spaces with dashes."""
    return text.lower().replace(' ', '-').replace('_', '-')

def generate_github_username(cluster, agent_id):
    """Generate GitHub username in format: {cluster}_{archetype}_blackroad"""
    cluster_normalized = normalize_for_username(cluster)
    agent_id_normalized = normalize_for_username(agent_id)
    return f"{cluster_normalized}_{agent_id_normalized}_blackroad"

def process_manifest_files():
    """Process all manifest files and generate GitHub identities."""
    base_path = Path("/home/user/blackroad-prism-console/agents/archetypes")

    # Find all manifest files
    manifest_files = sorted(base_path.rglob("*.manifest.yaml"))

    print(f"Found {len(manifest_files)} manifest files")

    # Process each manifest file
    identities = []
    start_id = 15  # P15

    for idx, manifest_path in enumerate(manifest_files):
        try:
            with open(manifest_path, 'r') as f:
                data = yaml.safe_load(f)

            # Extract required fields
            agent_id = data.get('id', '')
            agent_name = data.get('name', '')
            cluster = data.get('cluster', '')
            role = data.get('role', '')

            # Generate GitHub username
            github_username = generate_github_username(cluster, agent_id)

            # Create identity object
            identity = {
                "id": f"P{start_id + idx}",
                "name": agent_name,
                "cluster": cluster,
                "role": role,
                "github_username": github_username,
                "github_handle": f"@{github_username}",
                "category": "archetype",
                "manifest_path": str(manifest_path),
                "permissions": ["pr_create", "issue_create", "comment"]
            }

            identities.append(identity)

        except Exception as e:
            print(f"Error processing {manifest_path}: {e}")
            continue

    print(f"Processed {len(identities)} identities")
    print(f"ID range: P{start_id} to P{start_id + len(identities) - 1}")

    return identities

def write_jsonl(identities, output_path):
    """Write identities to JSONL file."""
    with open(output_path, 'w') as f:
        for identity in identities:
            f.write(json.dumps(identity) + '\n')

    print(f"Written {len(identities)} records to {output_path}")

def main():
    output_path = "/home/user/blackroad-prism-console/registry/github_agent_identities_archetypes.jsonl"

    # Ensure registry directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Process manifest files
    identities = process_manifest_files()

    # Write JSONL file
    write_jsonl(identities, output_path)

    # Print some sample records
    print("\nSample records:")
    for i in [0, 1, 2, -3, -2, -1]:
        if abs(i) < len(identities):
            print(f"\n{identities[i]['id']}: {identities[i]['name']}")
            print(f"  Cluster: {identities[i]['cluster']}")
            print(f"  Role: {identities[i]['role']}")
            print(f"  GitHub: {identities[i]['github_username']}")

if __name__ == "__main__":
    main()
