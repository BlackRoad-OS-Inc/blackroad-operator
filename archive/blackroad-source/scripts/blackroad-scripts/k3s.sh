#!/bin/bash
clear
cat <<'MENU'

  ☸️☸️☸️  K3S CLUSTER ☸️☸️☸️

  📊 1  Cluster Info
  🖥️  2  Nodes
  📦 3  Pods (all ns)
  🌐 4  Services
  🔀 5  Ingress / Traefik
  📋 6  Deployments
  💾 7  PVCs
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) kubectl cluster-info 2>/dev/null || echo "  ⚠️  kubectl not configured"; read -p "  ↩ ";;
  2) kubectl get nodes -o wide 2>/dev/null; read -p "  ↩ ";;
  3) kubectl get pods -A 2>/dev/null; read -p "  ↩ ";;
  4) kubectl get svc -A 2>/dev/null; read -p "  ↩ ";;
  5) kubectl get ingress -A 2>/dev/null; read -p "  ↩ ";;
  6) kubectl get deployments -A 2>/dev/null; read -p "  ↩ ";;
  7) kubectl get pvc -A 2>/dev/null; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./k3s.sh
