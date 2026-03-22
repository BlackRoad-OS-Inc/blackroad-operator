#!/bin/bash
# Serve BlackRoad Dashboard locally
cd ~/blackroad-dashboard
python3 -m http.server 8080 &
echo "Dashboard running at http://localhost:8080"
open http://localhost:8080
