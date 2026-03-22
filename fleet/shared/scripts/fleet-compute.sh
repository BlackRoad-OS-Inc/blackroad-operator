#!/bin/bash
# fleet-compute.sh — distributed compute across ALL 8 nodes
# 5 Pis + 2 droplets + 1 Mac

NODES=(
  "pi@192.168.4.49|Alice|pi"
  "blackroad@192.168.4.98|Aria|pi"
  "pi@192.168.4.101|Octavia|pi"
  "blackroad@192.168.4.38|Lucidia|pi"
  "blackroad@192.168.4.96|Cecilia|pi"
  "root@codex-infinity|Gematria|droplet"
  "root@shellfish|Anastasia|droplet"
)

CMD="$1"
case "$CMD" in
  status)
    echo "=== FLEET STATUS (7 nodes) ==="
    for entry in "${NODES[@]}"; do
      IFS='|' read -r host name type <<< "$entry"
      info=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "$host" "
        cores=\$(nproc)
        load=\$(cat /proc/loadavg | awk '{print \$1}')
        mem=\$(free -m | awk 'NR==2{printf \"%dMB/%dMB\", \$3, \$2}')
        disk=\$(df -h / | tail -1 | awk '{print \$5}')
        hailo=\$(ls /dev/hailo0 2>/dev/null && echo 'Hailo-8' || echo '-')
        cpu=\$(cat /proc/cpuinfo | grep 'model name' | head -1 | sed 's/.*: //')
        echo \"\$cores cores | \$cpu | load:\$load | ram:\$mem | disk:\$disk | \$hailo\"
      " 2>/dev/null)
      printf "  %-12s [%-7s] %s\n" "$name" "$type" "$info"
    done
    # Mac
    cores=$(sysctl -n hw.ncpu 2>/dev/null)
    load=$(sysctl -n vm.loadavg 2>/dev/null | awk '{print $2}')
    mem=$(vm_stat 2>/dev/null | awk '/Pages free/{free=$3} /Pages active/{active=$3} END{printf "%dMB/%dMB", (active*16384)/1048576, 8192}')
    disk=$(df -h / | tail -1 | awk '{print $5}')
    printf "  %-12s [%-7s] %s cores | Apple M2 | load:%s | ram:%s | disk:%s\n" "Alexandria" "mac" "$cores" "$load" "$mem" "$disk"
    ;;

  benchmark)
    echo "=== FLEET BENCHMARK (all nodes) ==="
    for entry in "${NODES[@]}"; do
      IFS='|' read -r host name type <<< "$entry"
      (
        result=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "$host" "
          start=\$(date +%s%N)
          python3 -c 'sum(i*i for i in range(10000000))' 2>/dev/null
          end=\$(date +%s%N)
          ms=\$(( (end - start) / 1000000 ))
          echo \"\${ms}ms\"
        " 2>/dev/null)
        printf "  %-12s [%-7s] %s\n" "$name" "$type" "$result"
      ) &
    done
    # Mac benchmark
    (
      start=$(python3 -c "import time; print(int(time.time()*1000))")
      python3 -c 'sum(i*i for i in range(10000000))' 2>/dev/null
      end=$(python3 -c "import time; print(int(time.time()*1000))")
      ms=$((end - start))
      printf "  %-12s [%-7s] %sms\n" "Alexandria" "mac" "$ms"
    ) &
    wait
    ;;

  run)
    shift
    CMD_TO_RUN="$*"
    echo "=== Fleet Run: $CMD_TO_RUN ==="
    for entry in "${NODES[@]}"; do
      IFS='|' read -r host name type <<< "$entry"
      (
        result=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "$host" "$CMD_TO_RUN" 2>/dev/null)
        echo "[$name] $result"
      ) &
    done
    wait
    echo "=== Done ==="
    ;;

  *)
    echo "Usage: fleet-compute.sh [status|benchmark|run 'command']"
    ;;
esac
