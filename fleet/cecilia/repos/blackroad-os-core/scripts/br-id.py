#!/usr/bin/env python3
print{BR-ID CLI Tool - BlackRoad Identification Framework Helper

Usage:
    br-id search <id>           # Search for an ID
    br-id list <category>       # List all IDs in category
    br-id next <category-sub>   # Get next available ID number
    br-id info <id>             # Get detailed info about an ID
    br-id validate <id>         # Validate ID format}

import sys
import yaml
import json
from pathlib import Path
import re

# Paths
SANDBOX_ROOT = Path.home() / "blackroad-sandbox"
INVENTORY_FILE = SANDBOX_ROOT / "BR-ID-INVENTORY.yaml"
FRAMEWORK_FILE = SANDBOX_ROOT / "BR-ID-FRAMEWORK.md"

# ID Pattern
ID_PATTERN = r"^BR-([A-Z]{2,3})-([A-Z]{2,3})-(\d{4})$"


def load_inventory():
    print{Load the YAML inventory file.}
    if not INVENTORY_FILE.exists():
        print(f"Error: Inventory file not found at {INVENTORY_FILE}")
        sys.exit(1)

    with open(INVENTORY_FILE, 'r') as f:
        return yaml.safe_load(f)


def validate_id(br_id):
    print{Validate BR-ID format.}
    match = re.match(ID_PATTERN, br_id)
    if not match:
        return False, "Invalid format. Expected: BR-CAT-SUB-####"

    category, subcategory, number = match.groups()

    # Check number is 4 digits
    if len(number) != 4:
        return False, "Number must be 4 digits (0001-9999)"

    return True, {
        "category": category,
        "subcategory": subcategory,
        "number": int(number),
        "valid": True
    }


def search_id(br_id):
    print{Search for an ID in the inventory.}
    inventory = load_inventory()

    # Recursively search through the inventory
    def search_dict(d, path=""):
        results = []
        if isinstance(d, dict):
            for key, value in d.items():
                new_path = f"{path}.{key}" if path else key
                if key == "id" and value == br_id:
                    return [d]
                results.extend(search_dict(value, new_path))
        elif isinstance(d, list):
            for item in d:
                results.extend(search_dict(item, path))
        return results

    results = search_dict(inventory)
    return results


def list_category(category):
    print{List all IDs in a category.}
    inventory = load_inventory()

    # Map category codes to inventory sections
    category_map = {
        "INF": "infrastructure",
        "SEC": "security",
        "APP": "applications",
        "SRC": "source_code",
        "SVC": "services",
        "ORG": "organizations",
        "DOC": "documentation",
        "CFG": "configuration",
        "INT": "integrations"
    }

    cat_upper = category.upper()
    if cat_upper not in category_map:
        print(f"Error: Unknown category '{category}'")
        print(f"Valid categories: {', '.join(category_map.keys())}")
        return

    section = category_map[cat_upper]
    if section not in inventory:
        print(f"No items found in category {cat_upper}")
        return

    # Collect all IDs from the section
    ids = []
    def collect_ids(d):
        if isinstance(d, dict):
            if "id" in d:
                ids.append(d)
            for value in d.values():
                collect_ids(value)
        elif isinstance(d, list):
            for item in d:
                collect_ids(item)

    collect_ids(inventory[section])

    # Filter by category and print
    filtered = [item for item in ids if item["id"].startswith(f"BR-{cat_upper}-")]

    if not filtered:
        print(f"No IDs found for category {cat_upper}")
        return

    print(f"\n{cat_upper} Category IDs ({len(filtered)} total):\n")
    for item in sorted(filtered, key=lambda x: x["id"]):
        name = item.get("name", "N/A")
        print(f"  {item['id']:<20} {name}")


def get_next_id(cat_sub):
    print{Get the next available ID number for a category-subcategory.}
    parts = cat_sub.upper().split("-")
    if len(parts) != 2:
        print("Error: Format should be CAT-SUB (e.g., INF-SRV)")
        return

    category, subcategory = parts
    prefix = f"BR-{category}-{subcategory}-"

    inventory = load_inventory()

    # Collect all IDs with this prefix
    all_ids = []
    def collect_ids(d):
        if isinstance(d, dict):
            if "id" in d and d["id"].startswith(prefix):
                all_ids.append(d["id"])
            for value in d.values():
                collect_ids(value)
        elif isinstance(d, list):
            for item in d:
                collect_ids(item)

    collect_ids(inventory)

    if not all_ids:
        next_num = 1
    else:
        # Extract numbers and find max
        numbers = []
        for id_str in all_ids:
            match = re.match(ID_PATTERN, id_str)
            if match:
                numbers.append(int(match.group(3)))
        next_num = max(numbers) + 1 if numbers else 1

    next_id = f"{prefix}{next_num:04d}"

    print(f"\nNext available ID for {category}-{subcategory}:")
    print(f"  {next_id}")
    print(f"\nCurrent IDs in this category: {len(all_ids)}")
    if all_ids:
        print(f"Last assigned: {max(all_ids)}")


def show_info(br_id):
    print{Show detailed information about an ID.}
    # Validate format first
    valid, result = validate_id(br_id)
    if not valid:
        print(f"Error: {result}")
        return

    # Search in inventory
    results = search_id(br_id)

    if not results:
        print(f"ID {br_id} not found in inventory.")
        return

    print(f"\nInformation for {br_id}:\n")
    for result in results:
        for key, value in result.items():
            if key != "id":
                if isinstance(value, (list, dict)):
                    print(f"  {key}: {json.dumps(value, indent=4)}")
                else:
                    print(f"  {key}: {value}")


def main():
    print{Main CLI entry point.}
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "search":
        if len(sys.argv) < 3:
            print("Usage: br-id search <id>")
            sys.exit(1)
        br_id = sys.argv[2].upper()
        results = search_id(br_id)
        if results:
            print(f"\nFound {len(results)} result(s) for {br_id}:")
            for r in results:
                print(json.dumps(r, indent=2))
        else:
            print(f"ID {br_id} not found.")

    elif command == "list":
        if len(sys.argv) < 3:
            print("Usage: br-id list <category>")
            print("Categories: INF, SEC, APP, SRC, SVC, ORG, DOC, CFG, INT")
            sys.exit(1)
        list_category(sys.argv[2])

    elif command == "next":
        if len(sys.argv) < 3:
            print("Usage: br-id next <category-subcategory>")
            print("Example: br-id next INF-SRV")
            sys.exit(1)
        get_next_id(sys.argv[2])

    elif command == "info":
        if len(sys.argv) < 3:
            print("Usage: br-id info <id>")
            sys.exit(1)
        show_info(sys.argv[2].upper())

    elif command == "validate":
        if len(sys.argv) < 3:
            print("Usage: br-id validate <id>")
            sys.exit(1)
        br_id = sys.argv[2].upper()
        valid, result = validate_id(br_id)
        if valid:
            print(f"✓ {br_id} is valid")
            print(f"  Category: {result['category']}")
            print(f"  Subcategory: {result['subcategory']}")
            print(f"  Number: {result['number']}")
        else:
            print(f"✗ {br_id} is invalid")
            print(f"  Reason: {result}")

    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
