#!/bin/bash
# Restore config and start workerd
cp ~/workerd-config/runtime.capnp /tmp/workerd/runtime.capnp 2>/dev/null || true
cd /tmp/workerd
/home/blackroad/.npm-global/bin/workerd serve runtime.capnp >> ~/workerd.log 2>&1
