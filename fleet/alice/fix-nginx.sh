#!/bin/bash
# Fix nginx port 80 binding - run with sudo
set -e
echo 'Restarting nginx...'
systemctl restart nginx
sleep 1
ss -tlnp | grep ':80 '
if ss -tlnp | grep -q ':80 '; then
    echo 'SUCCESS: nginx now listening on port 80'
else
    echo 'WARN: port 80 still not bound, checking why...'
    nginx -t 2>&1
fi
