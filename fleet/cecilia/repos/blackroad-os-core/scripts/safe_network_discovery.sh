#!/bin/bash
# Safe network discovery - identifies unknown devices via ARP
set -e

echo "=== Active Devices on 192.168.4.0/24 ==="
echo ""
printf "%-15s %-17s %-20s %s\n" "IP ADDRESS" "MAC ADDRESS" "VENDOR" "STATUS"
printf "%-15s %-17s %-20s %s\n" "----------" "-----------" "------" "------"

# MAC vendor lookup
get_vendor() {
  local mac="$1"
  local prefix="${mac:0:8}"
  
  case "$prefix" in
    b8:27:eb|dc:a6:32|e4:5f:01|d8:3a:dd|2c:cf:67) echo "Raspberry Pi" ;;
    48:b0:2d|00:04:4b) echo "NVIDIA Jetson" ;;
    b0:be:83|ac:de:48|88:66:5a) echo "Apple Mac" ;;
    44:ac:85) echo "Router/Gateway" ;;
    54:4c:8a) echo "Apple iPhone" ;;
    d4:be:dc|6c:4a:85|60:92:c8) echo "Generic Device" ;;
    fe:65:91) echo "Virtual/Bridge" ;;
    *) echo "Unknown" ;;
  esac
}

# Check if IP is known
is_known() {
  local ip="$1"
  case "$ip" in
    192.168.4.1) echo "Gateway/Router" ;;
    192.168.4.28) echo "Mac Operator (Alexa)" ;;
    192.168.4.38) echo "Lucidia Pi" ;;
    192.168.4.64) echo "BlackRoad Pi" ;;
    192.168.4.49) echo "Alice Pi" ;;
    192.168.4.68) echo "iPhone Koder" ;;
    *) echo "" ;;
  esac
}

# Process ARP table
arp -a | grep "192.168.4" | grep -v "incomplete" | while IFS= read -r line; do
  ip=$(echo "$line" | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}')
  mac=$(echo "$line" | grep -oE '([0-9a-f]{1,2}:){5}[0-9a-f]{1,2}')
  
  # Skip broadcast
  [ "$mac" = "ff:ff:ff:ff:ff:ff" ] && continue
  
  vendor=$(get_vendor "$mac")
  known=$(is_known "$ip")
  
  if [ -n "$known" ]; then
    printf "%-15s %-17s %-20s %s\n" "$ip" "$mac" "$vendor" "$known"
  else
    printf "%-15s %-17s %-20s %s\n" "$ip" "$mac" "$vendor" "⚠️  UNKNOWN - Check me!"
  fi
done | sort -t. -k4 -n

echo ""
echo "Summary:"
echo "  - Total devices: $(arp -a | grep '192.168.4' | grep -v incomplete | grep -v 'ff:ff:ff:ff:ff:ff' | wc -l | tr -d ' ')"
echo "  - Unknown devices marked with ⚠️  may be Jetson Orin or other new devices"
echo ""
