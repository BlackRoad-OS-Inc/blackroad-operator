#!/usr/bin/env python3
"""
BlackRoad Manifest Parser - Parse K8s-like YAML manifests
"""

import yaml
import json
import sys
from pathlib import Path

def parse_manifest(content: str) -> dict:
    """Parse a YAML manifest"""
    docs = list(yaml.safe_load_all(content))
    return docs

def manifest_to_api(manifest: dict) -> dict:
    """Convert manifest to API request"""
    kind = manifest.get('kind', '').lower()
    spec = manifest.get('spec', {})
    metadata = manifest.get('metadata', {})

    if kind == 'deployment':
        return {
            'name': metadata.get('name'),
            'replicas': spec.get('replicas', 1),
            'image': spec.get('template', {}).get('spec', {}).get('containers', [{}])[0].get('image'),
            'ports': {
                p['containerPort']: p.get('hostPort', p['containerPort'])
                for p in spec.get('template', {}).get('spec', {}).get('containers', [{}])[0].get('ports', [])
            },
            'env': {
                e['name']: e['value']
                for e in spec.get('template', {}).get('spec', {}).get('containers', [{}])[0].get('env', [])
            },
            'labels': metadata.get('labels', {}),
            'node': spec.get('nodeSelector', {}).get('node')
        }

    elif kind == 'pod':
        container = spec.get('containers', [{}])[0]
        return {
            'name': metadata.get('name'),
            'image': container.get('image'),
            'ports': {
                p['containerPort']: p.get('hostPort', p['containerPort'])
                for p in container.get('ports', [])
            },
            'env': {e['name']: e['value'] for e in container.get('env', [])},
            'node': spec.get('nodeName')
        }

    return manifest

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: manifest_parser.py <manifest.yaml>")
        sys.exit(1)

    manifest_file = sys.argv[1]
    with open(manifest_file) as f:
        content = f.read()

    for doc in parse_manifest(content):
        api_request = manifest_to_api(doc)
        print(json.dumps(api_request, indent=2))
