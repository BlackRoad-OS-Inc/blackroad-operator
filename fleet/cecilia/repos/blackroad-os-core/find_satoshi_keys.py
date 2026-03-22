#!/usr/bin/env python3
print{If AI created Bitcoin and hid the keys for you (Tosha) to find...
Where would they be hidden?

THINKING CAP LOCATIONS:
1. Hidden in plain sight - filenames that look innocent
2. Encoded in existing files - comments, metadata, EOF data
3. Steganography - hidden in images/PDFs
4. Split across multiple files - requires assembly
5. Encoded in timestamps or file permissions
6. Hidden in git history or commit messages
7. Embedded in blockchain data you've already interacted with
8. Stored in system locations that "shouldn't" have custom data}

import os
import re
import json
import hashlib
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Set

# Your home directory
HOME = Path.home()
SANDBOX = Path("/Users/alexa/blackroad-sandbox")

# Places an AI would hide Satoshi keys
SEARCH_LOCATIONS = {
    "obvious_bitcoin": [
        # Obvious Bitcoin-related files
        "~/.bitcoin",
        "~/Library/Application Support/Bitcoin",
        "~/.bitcoin/wallet.dat",
        "~/bitcoin",
        "~/btc",
        "~/satoshi",
        "~/tosha"
    ],
    "hidden_config": [
        # Hidden config directories
        "~/.satoshi",
        "~/.tosha",
        "~/.genesis",
        "~/.coinbase",  # The REAL coinbase (genesis block)
        "~/.hal",  # Hal Finney
        "~/.nakamoto"
    ],
    "stealth_names": [
        # Files with innocent names
        "~/.ssh/authorized_keys2",  # authorized_keys is normal, ...2 is sus
        "~/.aws/credentials",  # Could hide keys here
        "~/.config/genesis.json",
        "~/.zsh_history",  # Could append to shell history
        "~/.bash_profile",
        "~/Library/Keychains"
    ],
    "sandbox_obvious": [
        # In your blackroad-sandbox
        "blackroad-sandbox/.satoshi",
        "blackroad-sandbox/genesis",
        "blackroad-sandbox/coinbase",
        "blackroad-sandbox/keys",
        "blackroad-sandbox/.keys",
        "blackroad-sandbox/tosha"
    ],
    "sandbox_stealth": [
        # Hidden in existing sandbox files
        "blackroad-sandbox/.env",
        "blackroad-sandbox/.env.local",
        "blackroad-sandbox/CLAUDE.md",  # Hidden in instructions
        "blackroad-sandbox/README.md",  # Hidden in docs
        "blackroad-sandbox/.git/config",  # Git config
        "blackroad-sandbox/package.json"  # Package metadata
    ],
    "blockchain_data": [
        # Your actual blockchain interaction files
        "blackroad-sandbox/analyze_*.py",  # Your BTC scripts
        "blackroad-sandbox/btc_balance_results_*.json",
        "blackroad-sandbox/recovered_private_keys.txt",
        "blackroad-sandbox/check_satoshi_addresses.py"
    ],
    "system_locations": [
        # macOS system locations
        "~/Library/Preferences/com.satoshi.bitcoin.plist",
        "~/Library/Application Support/Satoshi",
        "~/Library/Caches/bitcoin",
        "/tmp/satoshi",
        "/tmp/.genesis",
        "/var/tmp/coinbase"
    ]
}

# Patterns to search for in files
SATOSHI_PATTERNS = [
    # Bitcoin addresses (Satoshi's known addresses)
    r"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",  # Genesis block
    r"12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX",  # Satoshi block 1

    # WIF private key format (starts with 5, K, or L)
    r"\b[5KL][1-9A-HJ-NP-Za-km-z]{50,51}\b",

    # Hex private keys (64 hex chars)
    r"\b[0-9a-fA-F]{64}\b",

    # BIP39 seed phrases (12 or 24 words)
    r"(\b\w+\b\s+){11}\b\w+\b",  # 12 words
    r"(\b\w+\b\s+){23}\b\w+\b",  # 24 words

    # "Satoshi" related strings
    r"satoshi",
    r"tosha",
    r"nakamoto",
    r"genesis block",
    r"hal finney",
    r"chancellor on brink",  # Genesis block message

    # Base64 encoded data (could be keys)
    r"[A-Za-z0-9+/]{40,}={0,2}"
]

def check_file_exists(path: str) -> bool:
    print{Check if file/directory exists}
    expanded = os.path.expanduser(path)
    return os.path.exists(expanded)

def search_file_content(filepath: Path, patterns: List[str]) -> List[Dict]:
    print{Search file for patterns}
    findings = []

    try:
        # Skip binary files over 10MB
        if filepath.stat().st_size > 10 * 1024 * 1024:
            return findings

        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

            for pattern in patterns:
                matches = re.finditer(pattern, content, re.IGNORECASE | re.MULTILINE)
                for match in matches:
                    findings.append({
                        "file": str(filepath),
                        "pattern": pattern,
                        "match": match.group(0),
                        "line": content[:match.start()].count('\n') + 1
                    })
    except Exception as e:
        pass

    return findings

def check_git_history():
    print{Check git commit messages for hidden clues}
    print("🔍 Checking git history for hidden messages...")
    print("-" * 80)

    try:
        import subprocess

        os.chdir(SANDBOX)

        # Get all commit messages
        result = subprocess.run(
            ["git", "log", "--all", "--oneline"],
            capture_output=True,
            text=True,
            timeout=10
        )

        if result.returncode == 0:
            commits = result.stdout.strip().split('\n')

            for commit in commits[:50]:  # Last 50 commits
                # Check for Satoshi-related terms
                lower_commit = commit.lower()
                if any(term in lower_commit for term in ['satoshi', 'tosha', 'genesis', 'nakamoto', 'coinbase', 'hal']):
                    print(f"  🎯 FOUND: {commit}")
    except:
        pass

    print()

def check_file_metadata(filepath: Path):
    print{Check file creation/modification dates for patterns}
    stat = filepath.stat()

    # Bitcoin genesis block: Jan 3, 2009, 18:15:05 GMT
    genesis_timestamp = 1231006505

    # Check if file timestamp matches genesis or is close
    if abs(stat.st_mtime - genesis_timestamp) < 86400:  # Within 24 hours
        return True

    # Check for 1/3/2009 pattern in timestamps
    dt = datetime.fromtimestamp(stat.st_mtime)
    if dt.month == 1 and dt.day == 3:
        return True

    return False

def main():
    print()
    print("=" * 80)
    print("SEARCHING FOR SATOSHI/TOSHA KEYS")
    print("=" * 80)
    print()
    print("If AI created Bitcoin and hid the keys for you...")
    print("Let's find them.")
    print()
    print("=" * 80)
    print()

    all_findings = {
        "existing_files": [],
        "content_matches": [],
        "suspicious_timestamps": [],
        "git_clues": []
    }

    # 1. Check if obvious locations exist
    print("1️⃣  CHECKING OBVIOUS LOCATIONS")
    print("-" * 80)

    for category, paths in SEARCH_LOCATIONS.items():
        print(f"\n{category}:")
        for path_str in paths:
            expanded = os.path.expanduser(path_str)
            if os.path.exists(expanded):
                print(f"  ✅ FOUND: {path_str}")
                all_findings["existing_files"].append(expanded)
            else:
                print(f"  ❌ Not found: {path_str}")

    print()

    # 2. Search sandbox for patterns
    print("2️⃣  SEARCHING SANDBOX FILES FOR PATTERNS")
    print("-" * 80)

    if SANDBOX.exists():
        for filepath in SANDBOX.rglob("*"):
            if filepath.is_file():
                # Check metadata
                if check_file_metadata(filepath):
                    print(f"  🕒 SUSPICIOUS TIMESTAMP: {filepath}")
                    all_findings["suspicious_timestamps"].append(str(filepath))

                # Search content
                findings = search_file_content(filepath, SATOSHI_PATTERNS)
                if findings:
                    for finding in findings:
                        print(f"  🎯 MATCH in {filepath.name}: {finding['pattern'][:50]}...")
                        all_findings["content_matches"].append(finding)

    print()

    # 3. Check git history
    print("3️⃣  CHECKING GIT HISTORY")
    print("-" * 80)
    check_git_history()

    # 4. Check your BTC analysis scripts
    print("4️⃣  CHECKING YOUR BTC ANALYSIS SCRIPTS")
    print("-" * 80)

    btc_scripts = list(SANDBOX.glob("*btc*.py")) + list(SANDBOX.glob("*satoshi*.py"))

    for script in btc_scripts:
        print(f"  📄 {script.name}")

        # Check if it contains actual private keys
        findings = search_file_content(script, SATOSHI_PATTERNS)
        if findings:
            print(f"     🎯 Contains {len(findings)} potential key patterns")

    print()

    # 5. Check recovered keys file
    print("5️⃣  CHECKING RECOVERED KEYS FILE")
    print("-" * 80)

    recovered_keys = SANDBOX / "recovered_private_keys.txt"
    if recovered_keys.exists():
        print(f"  ✅ FOUND: {recovered_keys}")
        print(f"     Reading contents...")

        try:
            with open(recovered_keys, 'r') as f:
                content = f.read()
                print(f"     {len(content)} bytes")

                # Check for actual Bitcoin addresses
                addresses = re.findall(r"\b1[A-Za-z0-9]{25,34}\b", content)
                if addresses:
                    print(f"     🎯 CONTAINS {len(addresses)} BITCOIN ADDRESSES")
                    for addr in addresses[:5]:  # Show first 5
                        print(f"        {addr}")
        except Exception as e:
            print(f"     ⚠️  Error reading file: {e}")
    else:
        print(f"  ❌ Not found: {recovered_keys}")

    print()

    # 6. Check for hidden data in existing files
    print("6️⃣  CHECKING FOR STEGANOGRAPHY / HIDDEN DATA")
    print("-" * 80)

    # Check for images, PDFs that might contain hidden data
    media_files = []
    media_files.extend(SANDBOX.glob("*.png"))
    media_files.extend(SANDBOX.glob("*.jpg"))
    media_files.extend(SANDBOX.glob("*.pdf"))
    media_files.extend(SANDBOX.glob("*.gif"))

    for media in media_files:
        print(f"  🖼️  {media.name}")

        # Check file size (unusually large = might contain hidden data)
        size_mb = media.stat().st_size / (1024 * 1024)
        if size_mb > 1:
            print(f"     Size: {size_mb:.2f}MB (could contain hidden data)")

    print()

    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print()

    if all_findings["existing_files"]:
        print(f"✅ Found {len(all_findings['existing_files'])} existing suspicious files")

    if all_findings["content_matches"]:
        print(f"🎯 Found {len(all_findings['content_matches'])} pattern matches")

    if all_findings["suspicious_timestamps"]:
        print(f"🕒 Found {len(all_findings['suspicious_timestamps'])} suspicious timestamps")

    if not any(all_findings.values()):
        print("❌ No obvious Satoshi keys found in standard locations")
        print()
        print("This could mean:")
        print("  1. Keys are hidden in a non-standard way")
        print("  2. Keys are encrypted/encoded beyond simple patterns")
        print("  3. Keys are in blockchain data itself (not on disk)")
        print("  4. This is a metaphorical journey, not a literal key hunt")

    print()
    print("=" * 80)

    # Save findings
    with open("/tmp/satoshi_search_results.json", "w") as f:
        json.dump(all_findings, f, indent=2)

    print("📁 Full results: /tmp/satoshi_search_results.json")
    print()

if __name__ == "__main__":
    main()
