#!/bin/bash

#################################################################################
# BlackRoad IP Bitcoin Blockchain Timestamping Script
#
# Purpose: Create immutable proof of existence for BlackRoad intellectual property
# Method: OpenTimestamps protocol on Bitcoin blockchain
# Author: Alexa Louise Amundson / BlackRoad
# Date: November 9, 2025
#################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================================="
echo "BlackRoad IP Bitcoin Timestamping Utility"
echo "=================================================="
echo ""

# Check if OpenTimestamps client is installed
if ! command -v ots &> /dev/null; then
    echo -e "${RED}ERROR: OpenTimestamps client not found${NC}"
    echo ""
    echo "Please install OpenTimestamps:"
    echo "  pip install opentimestamps-client"
    echo "  OR"
    echo "  npm install -g opentimestamps"
    echo ""
    echo "For more info: https://opentimestamps.org/"
    exit 1
fi

echo -e "${GREEN}✓ OpenTimestamps client found${NC}"
echo ""

# Directory setup
LEGAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$LEGAL_DIR")"
TIMESTAMP_DIR="$LEGAL_DIR/blockchain_timestamps"
DATE_STAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$TIMESTAMP_DIR"

echo "Legal directory: $LEGAL_DIR"
echo "Repository root: $REPO_ROOT"
echo "Timestamp output: $TIMESTAMP_DIR"
echo ""

#################################################################################
# STEP 1: Generate master SHA-256 manifest hash
#################################################################################

echo "=================================================="
echo "STEP 1: Generating Master Manifest Hash"
echo "=================================================="

MANIFEST_FILE="$LEGAL_DIR/SHA256_MANIFEST_$(date +%Y%m%d).txt"

if [ ! -f "$MANIFEST_FILE" ]; then
    echo -e "${YELLOW}Manifest not found. Generating now...${NC}"
    find "$REPO_ROOT" -type f \( \
        -name "*.sol" -o \
        -name "*.md" -o \
        -name "*.ts" -o \
        -name "*.tsx" -o \
        -name "*.js" -o \
        -name "*.py" -o \
        -name "*.yaml" -o \
        -name "*.json" -o \
        -name "*.svg" -o \
        -name "*.pdf" \
    \) \
    ! -path "*/node_modules/*" \
    ! -path "*/.next/*" \
    ! -path "*/dist/*" \
    ! -path "*/.git/*" \
    -exec sha256sum {} \; > "$MANIFEST_FILE"

    echo -e "${GREEN}✓ Manifest generated${NC}"
else
    echo -e "${GREEN}✓ Using existing manifest: $MANIFEST_FILE${NC}"
fi

# Hash the manifest itself
MANIFEST_HASH=$(sha256sum "$MANIFEST_FILE" | awk '{print $1}')
echo ""
echo -e "${GREEN}Master Manifest SHA-256:${NC}"
echo "$MANIFEST_HASH"
echo ""

# Save manifest hash
echo "$MANIFEST_HASH" > "$TIMESTAMP_DIR/manifest_hash_${DATE_STAMP}.txt"

#################################################################################
# STEP 2: Hash the IP Declaration document
#################################################################################

echo "=================================================="
echo "STEP 2: Hashing IP Declaration Document"
echo "=================================================="

IP_DECLARATION="$LEGAL_DIR/IP_DECLARATION_AND_COPYRIGHT.md"

if [ ! -f "$IP_DECLARATION" ]; then
    echo -e "${RED}ERROR: IP Declaration not found at $IP_DECLARATION${NC}"
    exit 1
fi

IP_HASH=$(sha256sum "$IP_DECLARATION" | awk '{print $1}')
echo -e "${GREEN}IP Declaration SHA-256:${NC}"
echo "$IP_HASH"
echo ""

# Save IP declaration hash
echo "$IP_HASH" > "$TIMESTAMP_DIR/ip_declaration_hash_${DATE_STAMP}.txt"

#################################################################################
# STEP 3: Create combined proof document
#################################################################################

echo "=================================================="
echo "STEP 3: Creating Combined Proof Document"
echo "=================================================="

PROOF_DOC="$TIMESTAMP_DIR/blackroad_ip_proof_${DATE_STAMP}.txt"

cat > "$PROOF_DOC" << EOF
BlackRoad Intellectual Property Blockchain Proof
=================================================

Timestamp Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Creator: Alexa Louise Amundson (amundsonalexa@gmail.com)
Entity: BlackRoad
Purpose: Immutable proof of IP ownership and creation date

=================================================
DOCUMENT HASHES
=================================================

1. Master SHA-256 Manifest Hash:
   $MANIFEST_HASH

2. IP Declaration Document Hash:
   $IP_HASH

=================================================
FILE INVENTORY SUMMARY
=================================================

Total Files Hashed: $(wc -l < "$MANIFEST_FILE")
Manifest File: $(basename "$MANIFEST_FILE")

Key Components:
- RoadCoin smart contract (ERC-20 token)
- BlackRoad Prism Console (AI orchestration platform)
- Quantum-Math-Lab (quantum computing education)
- Multiple whitepapers (11,568+ lines of research)
- Brand assets (logos, domains, visual identity)
- Legal templates and documentation

=================================================
BLOCKCHAIN TIMESTAMPING PROTOCOL
=================================================

Method: OpenTimestamps (https://opentimestamps.org/)
Blockchain: Bitcoin
Process: SHA-256 hash → Bitcoin transaction → Merkle tree inclusion proof

This hash will be permanently recorded on the Bitcoin blockchain,
providing cryptographic proof that this intellectual property
existed at this specific point in time.

=================================================
LEGAL EFFECT
=================================================

This timestamp serves as:
1. Proof of existence at a specific date and time
2. Defense against future IP ownership claims
3. Establishment of prior art for patent purposes
4. Immutable record independent of any centralized authority

=================================================
VERIFICATION
=================================================

To verify this timestamp in the future:

1. Install OpenTimestamps client:
   pip install opentimestamps-client

2. Verify the .ots proof file:
   ots verify blackroad_ip_proof_${DATE_STAMP}.txt.ots

3. Verify against Bitcoin blockchain:
   ots info blackroad_ip_proof_${DATE_STAMP}.txt.ots

=================================================

Digital Signature (SHA-256 of this document):
$(sha256sum "$PROOF_DOC" | awk '{print $1}')

=================================================
COPYRIGHT NOTICE
=================================================

Copyright © 2024-2025 Alexa Louise Amundson / BlackRoad
All Rights Reserved.

This proof document is part of the BlackRoad intellectual property
protection strategy and is maintained as evidence of ownership.

=================================================
EOF

echo -e "${GREEN}✓ Proof document created: $PROOF_DOC${NC}"
echo ""

#################################################################################
# STEP 4: Submit to Bitcoin blockchain via OpenTimestamps
#################################################################################

echo "=================================================="
echo "STEP 4: Submitting to Bitcoin Blockchain"
echo "=================================================="
echo ""
echo "This will create an OpenTimestamps proof file (.ots)"
echo "The proof will be anchored to the Bitcoin blockchain."
echo ""

# Timestamp the proof document
echo "Timestamping proof document..."
ots stamp "$PROOF_DOC"

if [ -f "${PROOF_DOC}.ots" ]; then
    echo -e "${GREEN}✓ Timestamp created: ${PROOF_DOC}.ots${NC}"
    echo ""

    # Also timestamp the manifest and IP declaration directly
    echo "Timestamping manifest file..."
    ots stamp "$MANIFEST_FILE"

    echo "Timestamping IP declaration..."
    ots stamp "$IP_DECLARATION"

    echo ""
    echo -e "${GREEN}✓ All files timestamped successfully${NC}"
else
    echo -e "${RED}ERROR: Timestamp creation failed${NC}"
    exit 1
fi

#################################################################################
# STEP 5: Wait for blockchain confirmation (optional)
#################################################################################

echo ""
echo "=================================================="
echo "STEP 5: Blockchain Confirmation Status"
echo "=================================================="
echo ""
echo -e "${YELLOW}NOTE: Bitcoin blockchain confirmation may take several hours${NC}"
echo ""
echo "The .ots files have been created, but they need to be upgraded"
echo "once the Bitcoin transaction is confirmed (typically 1-6 hours)."
echo ""
echo "To check status later, run:"
echo "  ots info ${PROOF_DOC}.ots"
echo ""
echo "To upgrade the timestamp once confirmed:"
echo "  ots upgrade ${PROOF_DOC}.ots"
echo ""
echo "Current status:"
ots info "${PROOF_DOC}.ots" || echo "Pending Bitcoin confirmation..."

#################################################################################
# STEP 6: Generate summary report
#################################################################################

echo ""
echo "=================================================="
echo "STEP 6: Generating Summary Report"
echo "=================================================="

SUMMARY_REPORT="$TIMESTAMP_DIR/timestamp_summary_${DATE_STAMP}.md"

cat > "$SUMMARY_REPORT" << EOF
# BlackRoad IP Blockchain Timestamp Summary

**Date:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Creator:** Alexa Louise Amundson
**Email:** amundsonalexa@gmail.com

## Timestamped Documents

### 1. Master File Manifest
- **File:** $(basename "$MANIFEST_FILE")
- **SHA-256:** \`$MANIFEST_HASH\`
- **Files Included:** $(wc -l < "$MANIFEST_FILE")
- **Proof:** \`$(basename "$MANIFEST_FILE").ots\`

### 2. IP Declaration
- **File:** IP_DECLARATION_AND_COPYRIGHT.md
- **SHA-256:** \`$IP_HASH\`
- **Proof:** \`IP_DECLARATION_AND_COPYRIGHT.md.ots\`

### 3. Combined Proof Document
- **File:** blackroad_ip_proof_${DATE_STAMP}.txt
- **SHA-256:** \`$(sha256sum "$PROOF_DOC" | awk '{print $1}')\`
- **Proof:** \`blackroad_ip_proof_${DATE_STAMP}.txt.ots\`

## Verification Instructions

### Using OpenTimestamps CLI

\`\`\`bash
# Check timestamp status
ots info blackroad_ip_proof_${DATE_STAMP}.txt.ots

# Upgrade timestamp after Bitcoin confirmation
ots upgrade blackroad_ip_proof_${DATE_STAMP}.txt.ots

# Verify timestamp
ots verify blackroad_ip_proof_${DATE_STAMP}.txt.ots
\`\`\`

### Using OpenTimestamps Web Interface

Visit: https://opentimestamps.org/
Upload: \`blackroad_ip_proof_${DATE_STAMP}.txt.ots\`

## What This Proves

1. **Proof of Existence:** These documents existed on or before $(date -u +"%Y-%m-%d")
2. **Content Integrity:** SHA-256 hashes verify document contents have not been altered
3. **Blockchain Anchoring:** Bitcoin blockchain provides immutable, decentralized timestamp
4. **Legal Defense:** Establishes prior art and ownership claims

## Important Files Location

All files are stored in:
\`\`\`
$TIMESTAMP_DIR/
\`\`\`

Keep these files secure and backed up in multiple locations:
- Local encrypted backups
- Cloud storage (encrypted)
- USB/hardware storage
- Printed paper copies of hashes and summaries

## Next Steps

1. **Wait for confirmation** (1-6 hours typically)
2. **Run upgrade command** to complete timestamp
3. **Verify timestamp** once confirmed
4. **Update IP Declaration** with:
   - Timestamp hash
   - Bitcoin block height
   - Confirmation date
5. **File with corporate records** upon BlackRoad incorporation

## Support

For questions or issues:
- Email: amundsonalexa@gmail.com
- OpenTimestamps: https://opentimestamps.org/

---

**Copyright © 2025 Alexa Louise Amundson / BlackRoad**
**All Rights Reserved**
EOF

echo -e "${GREEN}✓ Summary report created: $SUMMARY_REPORT${NC}"
echo ""

#################################################################################
# FINAL OUTPUT
#################################################################################

echo ""
echo "=================================================="
echo "✓ BLOCKCHAIN TIMESTAMPING COMPLETE"
echo "=================================================="
echo ""
echo "Files created:"
echo "  1. $PROOF_DOC"
echo "  2. ${PROOF_DOC}.ots"
echo "  3. ${MANIFEST_FILE}.ots"
echo "  4. ${IP_DECLARATION}.ots"
echo "  5. $SUMMARY_REPORT"
echo ""
echo -e "${GREEN}All files saved to: $TIMESTAMP_DIR/${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT:${NC}"
echo "  • Wait 1-6 hours for Bitcoin blockchain confirmation"
echo "  • Run: ots upgrade ${PROOF_DOC}.ots"
echo "  • Verify: ots verify ${PROOF_DOC}.ots"
echo "  • Backup all .ots files in multiple secure locations"
echo ""
echo "=================================================="
echo ""

# Create a quick reference card
cat > "$TIMESTAMP_DIR/QUICK_REFERENCE.txt" << EOF
=================================================
BLACKROAD IP TIMESTAMP QUICK REFERENCE
=================================================

MASTER HASH: $MANIFEST_HASH
IP DECLARATION HASH: $IP_HASH
DATE: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

VERIFY COMMANDS:
  ots info ${PROOF_DOC}.ots
  ots upgrade ${PROOF_DOC}.ots
  ots verify ${PROOF_DOC}.ots

BACKUP LOCATIONS NEEDED:
  [ ] Local encrypted drive
  [ ] Cloud storage (Google Drive, Dropbox, etc.)
  [ ] USB drive / hardware storage
  [ ] Printed paper copy

NEXT ACTIONS:
  [ ] Wait for Bitcoin confirmation (1-6 hours)
  [ ] Run upgrade command
  [ ] Verify timestamp
  [ ] Update IP declaration with block height
  [ ] Store in corporate records

=================================================
EOF

echo -e "${GREEN}Quick reference saved: $TIMESTAMP_DIR/QUICK_REFERENCE.txt${NC}"
echo ""
echo "Thank you for protecting BlackRoad intellectual property!"
echo ""
