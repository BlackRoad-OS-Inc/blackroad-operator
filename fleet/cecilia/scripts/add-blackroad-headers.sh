#!/bin/bash
# Add BlackRoad IP headers to all scripts

HEADER=$(cat ~/BLACKROAD_SCRIPT_HEADER.txt)

count=0
for script in ~/*.sh ~/bin/*; do
    if [[ -f "$script" && -x "$script" ]]; then
        # Check if header already exists
        if ! grep -q "BLACKROAD OS, INC" "$script" 2>/dev/null; then
            # Get the shebang line
            firstline=$(head -1 "$script")
            if [[ "$firstline" == "#!/"* ]]; then
                # Insert header after shebang
                tmp=$(mktemp)
                echo "$firstline" > "$tmp"
                echo "$HEADER" >> "$tmp"
                tail -n +2 "$script" >> "$tmp"
                mv "$tmp" "$script"
                ((count++))
            fi
        fi
    fi
done
echo "Added headers to $count scripts"
