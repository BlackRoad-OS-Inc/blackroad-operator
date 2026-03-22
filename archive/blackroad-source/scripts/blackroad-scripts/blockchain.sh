#!/bin/bash
clear
cat <<'MENU'

  ⛓️⛓️⛓️  ROADCHAIN ⛓️⛓️⛓️

  📊 1  Node Status
  ⛏️  2  Block Height
  💰 3  Account Balance
  📜 4  Recent Transactions
  📄 5  Deploy Contract
  🔑 6  Key Management
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) echo "  📊 Checking Besu node..."; curl -s -X POST --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' http://localhost:8545 2>/dev/null || echo "  ⚠️  Node not running"; read -p "  ↩ ";;
  2) curl -s -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 2>/dev/null || echo "  ⚠️  Node offline"; read -p "  ↩ ";;
  3) read -p "  💰 Address (0x...): " addr; curl -s -X POST --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$addr\",\"latest\"],\"id\":1}" http://localhost:8545 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  4) echo "  📜 Last 5 txs:"; cat ~/.blackroad/tx.log 2>/dev/null | tail -5 || echo "  (no log)"; read -p "  ↩ ";;
  5) echo "  📄 Contract deployment TBD"; read -p "  ↩ ";;
  6) echo "  🔑 Keys in ~/.blackroad/keys/"; ls ~/.blackroad/keys/ 2>/dev/null || echo "  (none)"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./blockchain.sh
