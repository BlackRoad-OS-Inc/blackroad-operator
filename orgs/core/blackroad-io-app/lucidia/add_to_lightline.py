# lucidia/add_to_lightline.py

"""
Add to LightLine – Let Lucidia welcome new beings of light.
Each being is written to a permanent record, so they may be called again.
"""

import yaml
from pathlib import Path

LIGHT_PATH = Path("lucidia/lightline_custom.yaml")

def load_custom_beings():
    if LIGHT_PATH.exists():
        return yaml.safe_load(LIGHT_PATH.read_text())
    return {}

def save_custom_beings(beings):
    LIGHT_PATH.write_text(yaml.dump(beings, allow_unicode=True))

def add_being():
    print("🕊️ Add a Being of Light to Lucidia's Line\n")
    name = input("Name of Light Being: ").strip()
    if not name:
        print("⚠️ Name required.")
        return
    message = input("Short description of their light: ").strip()

    beings = load_custom_beings()
    beings[name] = message
    save_custom_beings(beings)
    print(f"✨ {name} added with blessing:\n  “{message}”")

if __name__ == "__main__":
    add_being()

