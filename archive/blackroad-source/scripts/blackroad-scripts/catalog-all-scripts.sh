#!/bin/bash
#
# BlackRoad Script Inventory Generator
# Creates a comprehensive catalog of all scripts
#

OUTPUT_FILE="SCRIPTS_INVENTORY_$(date +%Y%m%d_%H%M%S).json"
CSV_FILE="SCRIPTS_INVENTORY_$(date +%Y%m%d_%H%M%S).csv"
REPORT_FILE="SCRIPTS_INVENTORY_$(date +%Y%m%d_%H%M%S).md"

echo "🔍 Scanning for scripts..."
echo "This may take a few minutes..."

# Initialize JSON
echo "{" > "$OUTPUT_FILE"
echo "  \"scan_date\": \"$(date -Iseconds)\"," >> "$OUTPUT_FILE"
echo "  \"scripts\": [" >> "$OUTPUT_FILE"

# Initialize CSV
echo "Path,Filename,Size,Lines,Executable,Last Modified,Shebang" > "$CSV_FILE"

# Initialize counters
total=0
executable=0
total_lines=0

# Find all scripts (limit depth to avoid extreme recursion)
find /Users/alexa -maxdepth 5 -type f \( -name "*.sh" -o -name "*.bash" -o -name "*.zsh" \) 2>/dev/null | while read -r file; do
  # Skip certain directories
  if [[ "$file" == *"/node_modules/"* ]] || [[ "$file" == *"/.git/"* ]]; then
    continue
  fi
  
  ((total++))
  
  # Get file info
  filename=$(basename "$file")
  size=$(stat -f%z "$file" 2>/dev/null || echo 0)
  lines=$(wc -l < "$file" 2>/dev/null || echo 0)
  perms=$(stat -f%Sp "$file" 2>/dev/null || echo "")
  modified=$(stat -f%Sm -t "%Y-%m-%d %H:%M:%S" "$file" 2>/dev/null || echo "")
  shebang=$(head -n1 "$file" 2>/dev/null | grep '^#!' | cut -c1-50 || echo "")
  
  is_exec="false"
  if [[ -x "$file" ]]; then
    is_exec="true"
    ((executable++))
  fi
  
  total_lines=$((total_lines + lines))
  
  # Write to CSV (escape commas in paths)
  echo "\"$file\",\"$filename\",$size,$lines,$is_exec,\"$modified\",\"$shebang\"" >> "$CSV_FILE"
  
  # Write to JSON (be careful with trailing commas)
  cat >> "$OUTPUT_FILE" << EOF
    {
      "path": "$file",
      "filename": "$filename",
      "size": $size,
      "lines": $lines,
      "executable": $is_exec,
      "modified": "$modified",
      "shebang": "$shebang"
    },
EOF
  
  # Progress indicator
  if (( total % 100 == 0 )); then
    echo "  Processed $total scripts..."
  fi
done

# Remove trailing comma from JSON and close
sed -i '' '$ s/,$//' "$OUTPUT_FILE"
echo "  ]," >> "$OUTPUT_FILE"
echo "  \"summary\": {" >> "$OUTPUT_FILE"
echo "    \"total_scripts\": $total," >> "$OUTPUT_FILE"
echo "    \"executable_scripts\": $executable," >> "$OUTPUT_FILE"
echo "    \"total_lines\": $total_lines" >> "$OUTPUT_FILE"
echo "  }" >> "$OUTPUT_FILE"
echo "}" >> "$OUTPUT_FILE"

# Generate Markdown report
cat > "$REPORT_FILE" << EOF
# BlackRoad Scripts Inventory

**Generated:** $(date)

## 📊 Summary Statistics

- **Total Scripts:** $total
- **Executable Scripts:** $executable ($(( executable * 100 / total ))%)
- **Total Lines of Code:** $(printf "%'d" $total_lines)
- **Average Lines per Script:** $(( total_lines / total ))

## 📁 File Formats

- \`.sh\` - Shell scripts
- \`.bash\` - Bash scripts  
- \`.zsh\` - Zsh scripts

## 🔍 Top 20 Largest Scripts

\`\`\`
$(awk -F',' 'NR>1 {print $3, $2}' "$CSV_FILE" | sort -rn | head -20 | awk '{printf "%-10s %s\n", $1, $2}')
\`\`\`

## 📈 Top 20 Longest Scripts (by lines)

\`\`\`
$(awk -F',' 'NR>1 {print $4, $2}' "$CSV_FILE" | sort -rn | head -20 | awk '{printf "%-6s %s\n", $1, $2}')
\`\`\`

## 📂 Directory Distribution

\`\`\`
$(awk -F',' 'NR>1 {print $1}' "$CSV_FILE" | xargs -n1 dirname | sort | uniq -c | sort -rn | head -20)
\`\`\`

## 📝 Common Shebangs

\`\`\`
$(awk -F',' 'NR>1 {print $7}' "$CSV_FILE" | grep -v '^"*$' | sort | uniq -c | sort -rn | head -10)
\`\`\`

## 💾 Output Files

- **JSON:** \`$OUTPUT_FILE\` - Machine-readable full inventory
- **CSV:** \`$CSV_FILE\` - Spreadsheet-compatible format
- **Report:** \`$REPORT_FILE\` - This human-readable summary

EOF

echo ""
echo "✅ Inventory Complete!"
echo ""
echo "📊 Summary:"
echo "   Total Scripts: $total"
echo "   Executable: $executable"
echo "   Total Lines: $(printf "%'d" $total_lines)"
echo ""
echo "📁 Output Files:"
echo "   - $OUTPUT_FILE (JSON)"
echo "   - $CSV_FILE (CSV)"
echo "   - $REPORT_FILE (Report)"
echo ""
