#!/bin/bash
# BlackRoad OS — workerd startup script
# Reads secrets from ~/.blackroad/stripe/secrets.env

WORKERD=/home/blackroad/.npm-global/bin/workerd
WORKERD_DIR=~/blackroad-workerd
LOG=~/workerd.log

# Load secrets
if [ -f ~/.blackroad/stripe/secrets.env ]; then
  set -a; source ~/.blackroad/stripe/secrets.env; set +a
fi

# Build runtime capnp with secrets substituted
python3 - << PYEOF
import os, re
template = open('$WORKERD_DIR/workerd.capnp').read()
sk = os.environ.get('STRIPE_SECRET_KEY', '')
wh = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
template = re.sub(r'text = "" \)', f'text = "{sk}" )', template, count=1)
template = re.sub(r'text = "" \)', f'text = "{wh}" )', template, count=1)
open('/tmp/workerd-runtime.capnp', 'w').write(template)
# Copy workers dir reference
import shutil, os
os.makedirs('/tmp/workerd-workers', exist_ok=True)
for f in os.listdir('$WORKERD_DIR/workers'):
    shutil.copy2(f'$WORKERD_DIR/workers/{f}', f'/tmp/workerd-workers/{f}')
PYEOF

cd /tmp
# Rewrite paths in capnp to use /tmp/workerd-workers/
python3 -c "
c = open('workerd-runtime.capnp').read()
c = c.replace('embed \"workers/', 'embed \"workerd-workers/')
open('workerd-runtime.capnp', 'w').write(c)
"

$WORKERD serve /tmp/workerd-runtime.capnp >> $LOG 2>&1
