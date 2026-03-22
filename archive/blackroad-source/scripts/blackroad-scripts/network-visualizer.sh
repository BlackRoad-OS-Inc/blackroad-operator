#!/usr/bin/env bash
# Network graph visualization
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        🌐 NETWORK VISUALIZER 🌐                     ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}  Visualizing network topology...${NC}"
echo ""

# Nodes
nodes=(
  "25,10,Server"
  "10,5,Client1"
  "40,5,Client2"
  "10,15,Client3"
  "40,15,Client4"
)

# Draw network
for frame in {1..20}; do
  tput cup 8 0
  
  # Clear
  for line in {1..20}; do
    echo "                                                            "
  done
  
  tput cup 8 0
  
  # Draw connections
  for node in "${nodes[@]}"; do
    IFS=',' read -ra n1 <<< "$node"
    
    for other in "${nodes[@]}"; do
      if [[ "$node" != "$other" ]]; then
        IFS=',' read -ra n2 <<< "$other"
        
        # Draw line (simplified)
        if [[ $((frame % 4)) -eq 0 ]]; then
          midx=$(( (n1[0] + n2[0]) / 2 ))
          midy=$(( (n1[1] + n2[1]) / 2 ))
          
          tput cup $midy $midx
          echo -ne "${GREEN}•${NC}"
        fi
      fi
    done
  done
  
  # Draw nodes
  for node in "${nodes[@]}"; do
    IFS=',' read -ra n <<< "$node"
    tput cup ${n[1]} ${n[0]}
    
    if [[ ${n[2]} == "Server" ]]; then
      echo -ne "${CYAN}[S]${NC}"
    else
      echo -ne "${YELLOW}(C)${NC}"
    fi
  done
  
  # Show stats
  tput cup 29 0
  echo -e "    ${GREEN}Nodes: 5 | Connections: Active | Latency: ${frame}ms${NC}"
  
  sleep 0.2
done

tput cup 31 0
echo ""
echo -e "${GREEN}  ✓ Network mapped!${NC}"
echo ""
