#!/bin/bash
set -e
echo "Setting up roadchain..."; [ ! -d "roadchain" ] && gh repo clone BlackRoad-OS-Inc/roadchain; echo Done.
