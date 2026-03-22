#!/bin/bash
# Inline mesh.js into worker.js as MESH_JS constant
SDK=$(cat mesh.js | sed "s/\`/\\\\\`/g" | sed 's/\$/\\$/g')
# Read worker template (everything except the MESH_JS const)
head -80 worker.js > /tmp/worker-built.js
echo "const MESH_JS = \`$SDK\`;" >> /tmp/worker-built.js
grep -n "^const HTML" worker.js | head -1 | cut -d: -f1 | xargs -I{} tail -n +{} worker.js >> /tmp/worker-built.js
cp /tmp/worker-built.js worker-built.js
echo "Built worker-built.js ($(wc -l < worker-built.js) lines)"
