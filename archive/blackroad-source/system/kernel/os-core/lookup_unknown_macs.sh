#!/bin/bash
# Lookup MAC vendor for unknown devices

UNKNOWN_MACS=(
  "d4:be:dc:6c:61:6b"
  "6c:4a:85:32:ae:72"
  "60:92:c8:11:cf:7c"
)

echo "=== MAC Vendor Lookup ===" 
echo ""

for mac in "${UNKNOWN_MACS[@]}"; do
  echo "Looking up: $mac"
  
  # Try macvendors.com API
  VENDOR=$(curl -s "https://api.macvendors.com/$mac" 2>/dev/null || echo "Lookup failed")
  
  if [ "$VENDOR" = "Lookup failed" ] || [ -z "$VENDOR" ]; then
    echo "  Vendor: Unknown (API failed)"
  else
    echo "  Vendor: $VENDOR"
  fi
  
  echo ""
  sleep 1  # Rate limiting
done

echo "=== Manual Lookup URLs ===" 
echo "For more details, check these sites manually:"
for mac in "${UNKNOWN_MACS[@]}"; do
  echo "  - https://macvendors.com/query/$mac"
done
