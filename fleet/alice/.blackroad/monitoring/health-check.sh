#!/bin/bash
echo "{
  \"hostname\": \"$(hostname)\",
  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
  \"uptime\": \"$(uptime -p)\",
  \"memory\": \"$(free -h | grep Mem | awk '{print $3 "/" $2}')\",
  \"disk\": \"$(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')\",
  \"cpu\": \"$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')\"
}"
