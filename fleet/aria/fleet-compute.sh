#!/bin/bash
# fleet-compute.sh — distributed compute across all Pis
# Splits work and runs in parallel on all nodes

CMD="$1"
case "$CMD" in
  status)
    echo "=== FLEET COMPUTE STATUS ==="
    for node in pi@192.168.4.49 blackroad@192.168.4.98 pi@192.168.4.101 blackroad@192.168.4.38 blackroad@192.168.4.96; do
      name=$(echo "$node" | cut -d@ -f2 | sed 's/192.168.4.49/Alice/;s/192.168.4.98/Aria/;s/192.168.4.101/Octavia/;s/192.168.4.38/Lucidia/;s/192.168.4.96/Cecilia/')
      info=$(ssh -o ConnectTimeout=3 -o BatchMode=yes "$node" "
        cores=\$(nproc)
        load=\$(cat /proc/loadavg | awk '{print \$1}')
        mem=\$(free -m | awk 'NR==2{printf \"%dMB/%dMB\", \$3, \$2}')
        disk=\$(df -h / | tail -1 | awk '{print \$5}')
        hailo=\$(ls /dev/hailo0 2>/dev/null && echo 'Hailo-8' || echo 'no-hailo')
        nvme=\$(df -h /mnt/nvme 2>/dev/null | tail -1 | awk '{print \$4\"free\"}' || echo 'no-nvme')
        echo \"\$cores cores | load:\$load | ram:\$mem | disk:\$disk | \$hailo | \$nvme\"
      " 2>/dev/null)
      printf "  %-10s %s\n" "$name" "$info"
    done
    ;;
  
  benchmark)
    echo "=== FLEET BENCHMARK ==="
    for node in pi@192.168.4.49 blackroad@192.168.4.98 pi@192.168.4.101 blackroad@192.168.4.38 blackroad@192.168.4.96; do
      name=$(echo "$node" | cut -d@ -f2 | sed 's/192.168.4.49/Alice/;s/192.168.4.98/Aria/;s/192.168.4.101/Octavia/;s/192.168.4.38/Lucidia/;s/192.168.4.96/Cecilia/')
      (
        result=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "$node" "
          start=\$(date +%s%N)
          python3 -c 'sum(i*i for i in range(10000000))' 2>/dev/null
          end=\$(date +%s%N)
          ms=\$(( (end - start) / 1000000 ))
          echo \"\${ms}ms\"
        " 2>/dev/null)
        echo "  $name: $result"
      ) &
    done
    wait
    ;;

  *)
    echo "Usage: fleet-compute.sh [status|benchmark]"
    ;;
esac
