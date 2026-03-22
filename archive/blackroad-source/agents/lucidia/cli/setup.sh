#!/usr/bin/env bash
set -e

cd ~/lucidia-cli
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create symlink for global access
mkdir -p ~/.local/bin
cat <<'WRAPPER' > ~/.local/bin/lucidia
#!/usr/bin/env bash
source ~/lucidia-cli/.venv/bin/activate
python ~/lucidia-cli/lucidia.py "$@"
WRAPPER
chmod +x ~/.local/bin/lucidia

echo "✓ Lucidia installed"
echo "Add ~/.local/bin to PATH if needed:"
echo '  export PATH="$HOME/.local/bin:$PATH"'
