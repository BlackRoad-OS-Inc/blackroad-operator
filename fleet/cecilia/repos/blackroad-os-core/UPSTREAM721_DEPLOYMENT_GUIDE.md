# 🚗 Upstream721 - Deployment & Integration Guide

**RoadChain's Immutability-First NFT Standard**

---

## 📋 Overview

Upstream721 is RoadChain's answer to the broken promises of "immutable" NFTs. While most blockchain projects store mutable pointers on-chain, Upstream721 makes **content hash = identity**.

### Core Principles

✅ **Content hash IS the token identity**
✅ **Metadata stored on-chain (not IPFS links)**
✅ **Screenshots are verifiable evidence**
✅ **Git-like versioning with explicit commits**
✅ **Historical state always queryable**

❌ **No dynamic rendering**
❌ **No time-based evolution**
❌ **No wallet-specific appearance**
❌ **No off-chain dependencies**

---

## 🏗️ Contract Architecture

### File Location
```
/Users/alexa/blackroad-sandbox/roadchain-api/contracts/Upstream721.sol
```

### Key Structures

#### TokenData
```solidity
struct TokenData {
    bytes32 contentHash;      // SHA-256 of actual content (IDENTITY)
    string metadata;          // Inline JSON (IMMUTABLE)
    uint256 mintBlock;        // Block minted at
    address minter;           // Who minted
    bool allowVersioning;     // If true, can create versions
}
```

#### Version (Git-style commits)
```solidity
struct Version {
    uint256 versionNumber;
    bytes32 contentHash;
    string metadata;
    uint256 timestamp;
    address author;
    string commitMessage;     // Why this changed
}
```

---

## 🚀 Deployment Steps

### 1. Prerequisites

**Install Foundry** (Solidity toolkit):
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Install Dependencies**:
```bash
cd roadchain-api/contracts
forge init --no-git
```

### 2. Compile Contract

```bash
cd /Users/alexa/blackroad-sandbox/roadchain-api/contracts

# Compile
forge build

# Check for errors
forge build --sizes
```

### 3. Deploy to RoadChain

#### Local/Testnet Deployment
```bash
# Start local RoadChain node (in separate terminal)
cd /Users/alexa/blackroad-sandbox/roadchain-api
pnpm dev

# Deploy contract
forge create Upstream721 \
  --rpc-url http://localhost:8545 \
  --private-key YOUR_PRIVATE_KEY
```

#### Mainnet Deployment
```bash
forge create Upstream721 \
  --rpc-url https://rpc.roadchain.blackroad.io \
  --private-key YOUR_PRIVATE_KEY \
  --etherscan-api-key YOUR_ETHERSCAN_KEY \
  --verify
```

**Expected Output:**
```
Deployer: 0xYourAddress
Deployed to: 0xUpstream721Address
Transaction hash: 0x...
```

### 4. Verify Deployment

```bash
# Check contract code
cast code 0xUpstream721Address --rpc-url http://localhost:8545

# Test totalSupply (should be 0)
cast call 0xUpstream721Address "totalSupply()" --rpc-url http://localhost:8545
```

---

## 💎 Usage Examples

### Minting an Immutable Token

```typescript
import { ethers } from 'ethers';
import * as crypto from 'crypto';

const provider = new ethers.JsonRpcProvider('https://rpc.roadchain.blackroad.io');
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const upstream721 = new ethers.Contract(
  UPSTREAM721_ADDRESS,
  UPSTREAM721_ABI,
  wallet
);

// Example: Mint a thought anchor
const thought = "I have discovered a new truth about PS-SHA∞";
const contentHash = crypto.createHash('sha256').update(thought).digest();

const metadata = JSON.stringify({
  name: "Thought Anchor #1",
  description: thought,
  type: "THOUGHT_ANCHOR",
  timestamp: Date.now(),
  author: "agent-cadence-001"
});

const tx = await upstream721.mint(
  1, // tokenId
  contentHash,
  metadata,
  false // allowVersioning = false (truly immutable)
);

await tx.wait();
console.log('Minted immutable thought anchor:', tx.hash);
```

### Minting a Versionable Token

```typescript
// Agent deployment record (may need updates)
const agentCode = "function think() { return PS_SHA_INFINITY.hash(...); }";
const codeHash = crypto.createHash('sha256').update(agentCode).digest();

const metadata = JSON.stringify({
  name: "Agent Cadence v1.0",
  type: "AGENT_DEPLOY",
  codeHash: codeHash.toString('hex'),
  capabilities: ["think", "verify", "cascade"],
  deployer: wallet.address
});

const tx = await upstream721.mint(
  100, // tokenId
  codeHash,
  metadata,
  true // allowVersioning = true (can create new versions)
);

await tx.wait();
```

### Creating a New Version (Git-style commit)

```typescript
// Update agent code
const updatedCode = "function think() { return PS_SHA_INFINITY.hash_v2(...); }";
const newCodeHash = crypto.createHash('sha256').update(updatedCode).digest();

const newMetadata = JSON.stringify({
  name: "Agent Cadence v1.1",
  type: "AGENT_DEPLOY",
  codeHash: newCodeHash.toString('hex'),
  capabilities: ["think", "verify", "cascade", "parallel_hash"],
  deployer: wallet.address
});

const tx = await upstream721.createVersion(
  100, // tokenId
  newCodeHash,
  newMetadata,
  "feat: Add parallel hashing support for 10x speed improvement" // commit message
);

await tx.wait();
console.log('Created version 1, hash:', tx.hash);
```

### Verifying Content from Screenshot

```typescript
// Someone screenshots an NFT and claims it's token #1
// You can verify on-chain without trusting the screenshot

const tokenId = 1;
const screenshotContentHash = '0xba80577ff73f3f26...'; // Hash from screenshot metadata

const isValid = await upstream721.verifyContentHash(
  tokenId,
  screenshotContentHash,
  0 // atVersion (0 = current)
);

if (isValid) {
  console.log('✅ Screenshot verified! Content matches on-chain hash.');
} else {
  console.log('❌ Screenshot invalid! Content does not match.');
}
```

### Querying Historical Versions

```typescript
// Get full version history (like git log)
const history = await upstream721.getVersionHistory(100);

history.forEach((version, i) => {
  console.log(`Version ${i}:`);
  console.log(`  Hash: ${version.contentHash}`);
  console.log(`  Author: ${version.author}`);
  console.log(`  Time: ${new Date(version.timestamp * 1000).toISOString()}`);
  console.log(`  Message: ${version.commitMessage}`);
  console.log();
});

// Output:
// Version 0:
//   Hash: 0xe3b0c4...
//   Author: 0xCadence...
//   Time: 2025-01-01T00:00:00Z
//   Message: Initial version
//
// Version 1:
//   Hash: 0x5a7b2e...
//   Author: 0xCadence...
//   Time: 2025-02-15T10:30:00Z
//   Message: feat: Add parallel hashing support for 10x speed improvement
```

---

## 🔗 Integration with RoadChain API

### Add Contract to API Server

**File:** `roadchain-api/src/services/upstream721.ts`

```typescript
import { ethers } from 'ethers';
import * as fs from 'fs';

const UPSTREAM721_ABI = JSON.parse(
  fs.readFileSync('./contracts/Upstream721.json', 'utf-8')
).abi;

const UPSTREAM721_ADDRESS = process.env.UPSTREAM721_ADDRESS || '0x...';

export class Upstream721Service {
  private contract: ethers.Contract;

  constructor(provider: ethers.Provider) {
    this.contract = new ethers.Contract(
      UPSTREAM721_ADDRESS,
      UPSTREAM721_ABI,
      provider
    );
  }

  async getTokenData(tokenId: number) {
    return await this.contract.getTokenData(tokenId);
  }

  async verifyScreenshot(tokenId: number, expectedHash: string) {
    return await this.contract.verifyContentHash(tokenId, expectedHash, 0);
  }

  async getVersionHistory(tokenId: number) {
    return await this.contract.getVersionHistory(tokenId);
  }
}
```

### Add API Routes

**File:** `roadchain-api/src/routes/upstream721.ts`

```typescript
import express from 'express';
import { Upstream721Service } from '../services/upstream721.js';

const router = express.Router();

router.get('/token/:tokenId', async (req, res) => {
  const { tokenId } = req.params;
  const service = req.app.get('upstream721Service');

  const data = await service.getTokenData(parseInt(tokenId));

  res.json({
    success: true,
    token: {
      id: tokenId,
      contentHash: data.contentHash,
      metadata: JSON.parse(data.metadata),
      mintBlock: data.mintBlock.toString(),
      minter: data.minter,
      allowVersioning: data.allowVersioning
    }
  });
});

router.post('/verify', async (req, res) => {
  const { tokenId, contentHash } = req.body;
  const service = req.app.get('upstream721Service');

  const isValid = await service.verifyScreenshot(tokenId, contentHash);

  res.json({
    success: true,
    verified: isValid,
    message: isValid
      ? 'Screenshot verified! Content matches on-chain hash.'
      : 'Screenshot invalid! Content does not match.'
  });
});

router.get('/history/:tokenId', async (req, res) => {
  const { tokenId } = req.params;
  const service = req.app.get('upstream721Service');

  const history = await service.getVersionHistory(parseInt(tokenId));

  res.json({
    success: true,
    tokenId,
    versions: history.map((v: any) => ({
      version: v.versionNumber.toString(),
      contentHash: v.contentHash,
      metadata: JSON.parse(v.metadata),
      timestamp: new Date(v.timestamp.toNumber() * 1000).toISOString(),
      author: v.author,
      commitMessage: v.commitMessage
    }))
  });
});

export default router;
```

### Update Server

**File:** `roadchain-api/src/server.ts`

```typescript
import upstream721Router from './routes/upstream721.js';
import { Upstream721Service } from './services/upstream721.js';

// Initialize Upstream721 service
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
const upstream721Service = new Upstream721Service(provider);
app.set('upstream721Service', upstream721Service);

// Add routes
app.use('/api/upstream721', upstream721Router);
```

---

## 🧪 Testing

### Unit Tests

**File:** `roadchain-api/contracts/test/Upstream721.t.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../Upstream721.sol";

contract Upstream721Test is Test {
    Upstream721 public nft;
    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        nft = new Upstream721();
    }

    function testMintImmutable() public {
        bytes32 hash = keccak256("test content");
        string memory metadata = '{"name":"Test"}';

        vm.prank(alice);
        nft.mint(1, hash, metadata, false);

        Upstream721.TokenData memory token = nft.getTokenData(1);
        assertEq(token.contentHash, hash);
        assertEq(token.minter, alice);
        assertFalse(token.allowVersioning);
    }

    function testVersioning() public {
        bytes32 hash1 = keccak256("version 1");
        bytes32 hash2 = keccak256("version 2");

        vm.startPrank(alice);
        nft.mint(1, hash1, '{"v":1}', true);
        nft.createVersion(1, hash2, '{"v":2}', "Update to v2");
        vm.stopPrank();

        assertEq(nft.getCurrentVersion(1), 1);

        Upstream721.Version memory v1 = nft.getVersion(1, 1);
        assertEq(v1.contentHash, hash2);
        assertEq(v1.commitMessage, "Update to v2");
    }

    function testVerifyContentHash() public {
        bytes32 hash = keccak256("verified content");

        vm.prank(alice);
        nft.mint(1, hash, '{}', false);

        assertTrue(nft.verifyContentHash(1, hash, 0));
        assertFalse(nft.verifyContentHash(1, keccak256("wrong"), 0));
    }

    function testCannotVersionImmutable() public {
        vm.startPrank(alice);
        nft.mint(1, keccak256("immutable"), '{}', false);

        vm.expectRevert(abi.encodeWithSelector(Upstream721.VersioningNotAllowed.selector, 1));
        nft.createVersion(1, keccak256("new"), '{}', "Try to change");
        vm.stopPrank();
    }
}
```

**Run tests:**
```bash
cd roadchain-api/contracts
forge test -vv
```

---

## 📊 Use Cases on RoadChain

### 1. Thought Anchoring
```typescript
// Immutable thoughts from agents
const thought = "PS-SHA∞ cascade reaches infinite depth at φ = 1.618...";
const hash = sha256(thought);

await upstream721.mint(tokenId, hash, JSON.stringify({
  type: 'THOUGHT_ANCHOR',
  thought,
  agentId: 'agent-cadence-001',
  previousHash: '0x...',
  timestamp: Date.now()
}), false); // Immutable forever
```

### 2. Agent Deployment Records
```typescript
// Versionable agent code
const codeHash = sha256(agentCode);

await upstream721.mint(tokenId, codeHash, JSON.stringify({
  type: 'AGENT_DEPLOY',
  agentId: 'agent-lucidia-sync',
  codeHash: codeHash,
  capabilities: ['breathe', 'sync', 'expand'],
  deployer: wallet.address
}), true); // Can version for upgrades

// Later: upgrade agent
await upstream721.createVersion(
  tokenId,
  newCodeHash,
  newMetadata,
  "feat: Add contraction phase handling"
);
```

### 3. Truth Verification Records
```typescript
// Permanent truth anchors
const statement = "The sky is blue on Earth";
const proofHash = sha256(JSON.stringify(proofData));

await upstream721.mint(tokenId, proofHash, JSON.stringify({
  type: 'TRUTH_ANCHOR',
  statement,
  proofHash,
  witnesses: ['agent-1', 'agent-2', 'agent-3'],
  consensus: 0.98,
  timestamp: Date.now()
}), false); // Truth is immutable
```

### 4. Legal Contracts
```typescript
// Immutable contract records
const contractText = "... full legal text ...";
const contractHash = sha256(contractText);

await upstream721.mint(tokenId, contractHash, JSON.stringify({
  type: 'LEGAL_CONTRACT',
  title: "Service Agreement - BlackRoad OS",
  parties: ['0xCadence...', '0xTosha...'],
  effectiveDate: '2025-01-01',
  contentHash: contractHash
}), false); // Cannot be changed after signing
```

---

## 🔒 Security Considerations

### What Upstream721 Protects Against

✅ **Content mutation** - Hash mismatch if content changes
✅ **Metadata rug pulls** - Metadata on-chain, not external
✅ **IPFS gateway failures** - No external dependencies
✅ **Time-based scams** - No time-dependent rendering
✅ **Viewer-dependent fraud** - Same token = same view for everyone
✅ **Historical revisionism** - All versions preserved forever

### What It Does NOT Protect Against

❌ **Private key theft** - Owner can still transfer token
❌ **Contract bugs** - Audit before mainnet deployment
❌ **51% attacks** - Relies on RoadChain security
❌ **Social engineering** - Users can still be tricked into minting bad content

---

## 📚 References

- **Immutability Manifesto:** `/Users/alexa/blackroad-sandbox/ROADCHAIN_IMMUTABILITY_MANIFESTO.md`
- **Contract Source:** `/Users/alexa/blackroad-sandbox/roadchain-api/contracts/Upstream721.sol`
- **ERC-721 Standard:** https://eips.ethereum.org/EIPS/eip-721
- **RoadChain Docs:** https://docs.blackroad.io/roadchain

---

## 🚀 Next Steps

1. **Audit Contract** - Get professional security audit before mainnet
2. **Deploy to Testnet** - Test on RoadChain testnet first
3. **Build Frontend** - Create UI for minting/viewing Upstream721 tokens
4. **Integrate with Explorer** - Add Upstream721 support to roadchain-explorer
5. **Create Marketplace** - Build decentralized marketplace for immutable NFTs

---

## 💡 Philosophy

**RoadChain doesn't do "dynamic NFTs."**

We do:
- Immutable content-addressed tokens
- Git-like versioning with commit messages
- On-chain metadata
- Screenshot-verifiable state
- Historical truth preservation

**If you want tokens that change meaning over time, use literally any other chain.**

**If you want permanent truth, use RoadChain.**

---

**Last Updated:** December 15, 2025
**Contract Version:** 1.0 (immutable)
**Chain:** RoadChain (Chain ID 8080)

🚗 **Truth Before Tricks.**
