print{BlackRoad OS Pyto Server - Dependency Installer for Pyto
Run this script in Pyto to install all required dependencies}

import pip
import sys

print("🚗 BlackRoad OS Pyto Server - Dependency Installer")
print("=" * 60)
print()

# List of required packages
packages = [
    'fastapi',
    'uvicorn',
    'pydantic',
    'websockets',
    'httpx',
    'psutil'
]

print(f"Installing {len(packages)} packages...")
print()

installed = []
failed = []

for i, package in enumerate(packages, 1):
    try:
        print(f"[{i}/{len(packages)}] Installing {package}...")
        pip.main(['install', package, '--quiet'])
        installed.append(package)
        print(f"    ✅ {package} installed successfully")
    except Exception as e:
        failed.append((package, str(e)))
        print(f"    ❌ {package} failed: {e}")
    print()

print("=" * 60)
print()
print("📊 Installation Summary:")
print(f"   ✅ Installed: {len(installed)}/{len(packages)}")
print(f"   ❌ Failed: {len(failed)}/{len(packages)}")
print()

if installed:
    print("✅ Successfully installed:")
    for pkg in installed:
        print(f"   - {pkg}")
    print()

if failed:
    print("❌ Failed to install:")
    for pkg, error in failed:
        print(f"   - {pkg}: {error}")
    print()

if len(installed) == len(packages):
    print("🎉 All dependencies installed successfully!")
    print()
    print("Next steps:")
    print("1. Open main.py in Pyto")
    print("2. Tap the play button (▶️) to start the server")
    print("3. Test at http://localhost:8080/health")
else:
    print("⚠️  Some dependencies failed to install.")
    print("You may still be able to run the server with limited functionality.")
    print()
    print("Try installing failed packages manually:")
    for pkg, _ in failed:
        print(f"   pip.main(['install', '{pkg}'])")

print()
print("=" * 60)
