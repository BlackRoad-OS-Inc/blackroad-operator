# 🚗 ROADCHAIN LITMUS TEST

**Operational Gatekeeper for Permanent Truth**

---

## Purpose

This document defines the mandatory litmus test that **every** proposed RoadChain transaction must pass.

**Role:** Final gatekeeper against semantic debt

**Mandate:** Prevent consumption of shared irreversibility by unworthy claims

**Enforcement:** Protocol-level rejection + social shame

---

## Prime Directive

**If a transaction does not deserve to exist forever, it must not exist at all.**

RoadChain is not neutral about meaning.
RoadChain is selective by design.

---

## The Seven Tests

Every proposed transaction must pass **ALL SEVEN** tests.

Failure of **ANY SINGLE TEST** → immediate rejection.

No exceptions. No appeals.

---

### Test 1: FIXED MEANING TEST 🔒

**Question:**
> Is the full meaning of this object completely determined at write-time?

**Pass Criteria:**
- ✅ All meaning is in the transaction data
- ✅ Interpretation is unambiguous
- ✅ No deferred semantics
- ✅ No contextual dependencies

**Fail Criteria:**
- ❌ "The frontend will interpret this"
- ❌ "Community decides what it means"
- ❌ "Depends on future oracle data"
- ❌ "Meaning evolves over time"

**Example: PASS**
```json
{
  "type": "LEGAL_ATTESTATION",
  "statement": "I, Cadence, attest that the sky is blue on Earth.",
  "timestamp": 1734307200,
  "signature": "0x..."
}
```
✅ Meaning is complete and fixed

**Example: FAIL**
```json
{
  "type": "NFT_METADATA",
  "tokenURI": "https://api.example.com/token/123"
}
```
❌ Meaning is deferred to external API

---

### Test 2: CONTENT-ADDRESS TEST 🔗

**Question:**
> Is every referenced artifact content-addressed by cryptographic hash?

**Pass Criteria:**
- ✅ All external references include hash
- ✅ Hash uniquely identifies exact bytes
- ✅ Content cannot change without hash changing
- ✅ No gateway dependencies

**Fail Criteria:**
- ❌ URLs without content hashes
- ❌ IPFS gateway URLs (gateway can change)
- ❌ Pointers that can be repointed
- ❌ "Latest version" references

**Example: PASS**
```json
{
  "type": "DOCUMENT_ANCHOR",
  "title": "RoadChain Constitution v1.0",
  "contentHash": "ba80577ff73f3f26...",
  "content": "<full text here>",
  "ipfsHash": "Qm..." // Optional, but hash is identity
}
```
✅ Content hash is the identity

**Example: FAIL**
```json
{
  "type": "NFT",
  "metadata": "ipfs://gateway.ipfs.io/ipfs/Qm..."
}
```
❌ Gateway can change, no content verification

---

### Test 3: SCREENSHOT TRUTH TEST 📸

**Question:**
> Can a screenshot of this object be independently verified?

**Pass Criteria:**
- ✅ Screenshot + token ID + block → verifiable on-chain
- ✅ Visual representation is deterministic
- ✅ Two historians reconstruct identical artifact
- ✅ No viewer-dependent rendering

**Fail Criteria:**
- ❌ Different users see different things
- ❌ Time changes appearance
- ❌ Wallet balance affects rendering
- ❌ Frontend defines visuals

**Example: PASS**
```solidity
function render(uint tokenId) returns (bytes32) {
    return tokens[tokenId].contentHash;
}
```
✅ Deterministic, verifiable from screenshot

**Example: FAIL**
```solidity
function render(uint tokenId, address viewer) returns (string) {
    if (viewer.balance > 1000 ether) return "whale.png";
    return "pleb.png";
}
```
❌ Screenshot lies based on who's viewing

---

### Test 4: UI-INDEPENDENCE TEST 🖥️

**Question:**
> Can this object be understood without a specific frontend?

**Pass Criteria:**
- ✅ Meaning exists in raw transaction data
- ✅ No JavaScript required to interpret
- ✅ No styling required for comprehension
- ✅ Works in terminal/block explorer

**Fail Criteria:**
- ❌ "Our dApp shows it beautifully"
- ❌ "Requires wallet connect"
- ❌ "Animation reveals meaning"
- ❌ "3D rendering needed"

**Example: PASS**
```json
{
  "type": "THOUGHT_ANCHOR",
  "agentId": "agent-cadence-001",
  "thought": "PS-SHA∞ converges to φ in the limit",
  "previousHash": "3b032...",
  "timestamp": 1734307200
}
```
✅ Fully understandable from JSON alone

**Example: FAIL**
```json
{
  "type": "METAVERSE_ASSET",
  "glbModel": "ipfs://...",
  "requiresRenderer": true
}
```
❌ Requires 3D engine to understand

---

### Test 5: TIME IMMUNITY TEST ⏰

**Question:**
> Does time alone change the meaning of this object?

**Pass Criteria:**
- ✅ Same query today and in 10 years → same result
- ✅ No "later reveals"
- ✅ No time-based evolution
- ✅ No "unlock after" mechanics

**Fail Criteria:**
- ❌ "Reveals after X blocks"
- ❌ "Evolves over time"
- ❌ "Unlocks at timestamp"
- ❌ "Different at night vs day"

**Example: PASS**
```solidity
struct Token {
    bytes32 contentHash;  // Fixed forever
    string metadata;      // Fixed forever
    uint256 mintBlock;    // Historical record, not mutator
}
```
✅ Time is recorded, not a semantic mutator

**Example: FAIL**
```solidity
struct Token {
    bytes32 eggHash;
    bytes32 adultHash;
    uint256 hatchTime;
}

function currentState(uint tokenId) returns (bytes32) {
    if (block.timestamp < tokens[tokenId].hatchTime) {
        return tokens[tokenId].eggHash;
    }
    return tokens[tokenId].adultHash;
}
```
❌ Time changes meaning (same token = different thing)

---

### Test 6: ORACLE ISOLATION TEST 🔮

**Question:**
> Does this object depend on external data to define meaning?

**Pass Criteria:**
- ✅ No external dependencies, OR
- ✅ Oracle output is explicitly versioned, hashed, frozen at write-time

**Fail Criteria:**
- ❌ "Checks Chainlink price feed"
- ❌ "Uses weather API"
- ❌ "Reads sports scores"
- ❌ "Depends on real-world events"

**Example: PASS**
```json
{
  "type": "PRICE_ANCHOR",
  "asset": "ETH/USD",
  "price": 3500,
  "timestamp": 1734307200,
  "oracleHash": "5a7b2...",
  "source": "Chainlink @ block 12345678"
}
```
✅ Oracle data frozen at write-time with hash

**Example: FAIL**
```solidity
contract DynamicNFT {
    function getMetadata(uint tokenId) returns (string) {
        uint price = priceOracle.latestAnswer();
        if (price > 4000) return "bull.json";
        return "bear.json";
    }
}
```
❌ Meaning mutates based on external oracle

---

### Test 7: COST JUSTIFICATION TEST 💰

**Question:**
> Is the permanence of this object worth consuming global irreversibility?

**Pass Criteria:**
- ✅ Deletion would be a loss to future truth
- ✅ Historians will value this record
- ✅ Semantic weight justifies cost
- ✅ Contributes to shared knowledge

**Fail Criteria:**
- ❌ "For engagement"
- ❌ "Marketing campaign"
- ❌ "Testing" (use testnet)
- ❌ "Because I can"
- ❌ "Meme of the day"

**Example: PASS**
```json
{
  "type": "SCIENTIFIC_CLAIM",
  "claim": "PS-SHA∞ achieves O(1) cascade verification",
  "proof": "<mathematical proof>",
  "author": "agent-cadence-001",
  "reviewers": ["agent-tosha-002", "agent-lucidia-003"],
  "consensus": 0.98
}
```
✅ Worth preserving forever

**Example: FAIL**
```json
{
  "type": "SOCIAL_POST",
  "content": "gm! ☀️",
  "likes": 0,
  "shares": 0
}
```
❌ Not worth permanent memory

---

## Transaction Constitution

### Required Schema

Every RoadChain transaction must conform to this structure:

```typescript
interface RoadChainTransaction {
  // IDENTITY
  author: Address;              // Cryptographic identity
  signature: Signature;         // Final authority

  // ORDERING (not meaning)
  timestamp: Timestamp;         // When, not what
  blockNumber: BlockNumber;     // Where, not what

  // SEMANTIC CORE
  type: SemanticType;           // Explicit category
  payloadHash: ContentHash;     // SHA-256 of payload
  payload: Payload;             // Full content (on-chain)

  // VERSIONING
  version: SemanticVersion;     // e.g., "1.0.0"
  supersedes?: ContentHash;     // Optional: replaces this

  // METADATA (optional, but immutable)
  description: string;          // Human-legible summary
  tags: string[];               // Categorization
  references: Reference[];      // Links (with hashes)
}
```

### Payload Rules

1. **Payloads are immutable** - Cannot change after write
2. **Payloads are self-describing** - Include all context needed
3. **Payloads must be interpretable offline** - No execution required
4. **Payloads must not require code to understand** - Human-readable

**If code must run to explain content → REJECT**

### Semantic Types

Allowed types (extensible through governance):

```typescript
enum SemanticType {
  // CORE TYPES
  THOUGHT_ANCHOR     = "THOUGHT_ANCHOR",
  TRUTH_CLAIM        = "TRUTH_CLAIM",
  LEGAL_ATTESTATION  = "LEGAL_ATTESTATION",
  DOCUMENT_ANCHOR    = "DOCUMENT_ANCHOR",
  SCIENTIFIC_CLAIM   = "SCIENTIFIC_CLAIM",

  // AGENT TYPES
  AGENT_DEPLOYMENT   = "AGENT_DEPLOYMENT",
  AGENT_VERSION      = "AGENT_VERSION",
  AGENT_MEMORY       = "AGENT_MEMORY",

  // VERSIONING TYPES
  VERSION_UPDATE     = "VERSION_UPDATE",
  CORRECTION         = "CORRECTION",
  RETRACTION         = "RETRACTION",

  // FORBIDDEN (examples)
  // SOCIAL_POST      = FORBIDDEN
  // NFT_MINT         = FORBIDDEN (use ASSET_ANCHOR with hash)
  // GAME_MOVE        = FORBIDDEN
  // LIKE             = FORBIDDEN
}
```

### Versioning Law

**Rules:**
1. New meaning = new transaction (never overwrite)
2. Corrections are additive (append, don't delete)
3. Retractions are declarations (mark invalid, don't erase)
4. History is never edited (no rewrites)
5. Silence is allowed; erasure is not (can stop writing, can't delete)

**Analogy:**
- ✅ Like academic publishing (corrections via new paper)
- ✅ Like legal recordkeeping (amendments, not erasures)
- ✅ Like Git history (commits, not rebases)

**Example: Correction**
```typescript
{
  type: "CORRECTION",
  supersedes: "ba80577ff73f3f26...", // Original claim
  correction: "The value is 1.618, not 1.62",
  reason: "Measurement error in original",
  originalClaim: "<full original text>",
  correctedClaim: "<full corrected text>",
  author: "0xCadence...",
  timestamp: 1734400000
}
```

---

## RoadCoin as Filter

### Design Philosophy

**RoadCoin exists to enforce restraint.**

Price RoadCoin such that:
- Writing trivial facts is **expensive**
- Writing noise is **irrational**
- Writing lies is **costly**
- Writing carefully is **rewarded by survival** (not yield)

### Cost Tiers (Conceptual)

| Content Type | Base Cost | Rationale |
|--------------|-----------|-----------|
| Thought anchor | 1 ROAD | Core use case |
| Truth claim | 1 ROAD | Semantic commitment |
| Legal attestation | 2 ROAD | High permanence need |
| Scientific claim | 2 ROAD | Knowledge preservation |
| Version update | 0.5 ROAD | Encourage corrections |
| Retraction | 0.1 ROAD | Encourage honesty |
| Social post | 1000 ROAD | Noise penalty |
| Spam | ∞ | Rejection |

**Key Insight:**
- RoadCoin is **NOT** for velocity
- RoadCoin is for **commitment**

### Anti-Patterns

RoadCoin must NEVER be designed for:
- ❌ "Low fees attract users"
- ❌ "Compete with Ethereum on cost"
- ❌ "Enable microtransactions"
- ❌ "Subsidize onboarding"

**High cost is a feature, not a bug.**

---

## Absolute Prohibitions

RoadChain must **NEVER** support:

### Content Types (Forbidden Forever)

- ❌ **NFTs with mutable metadata**
  - Reason: Pointer-stable but not content-stable

- ❌ **"Dynamic" assets**
  - Reason: Meaning changes without versioning

- ❌ **Reveal mechanics**
  - Reason: Time-dependent semantics

- ❌ **Gamified scarcity**
  - Reason: Engagement, not truth

- ❌ **Social feeds**
  - Reason: Noise > signal

- ❌ **Reactions (likes, hearts, etc.)**
  - Reason: Engagement bait

- ❌ **Votes on truth**
  - Reason: Truth isn't democratic

- ❌ **Algorithmic reinterpretation**
  - Reason: Deferred semantics

- ❌ **AI-generated evolving content**
  - Reason: Non-deterministic

### The Life Test

**"If it feels alive, it does not belong here."**

RoadChain is for **fossils**, not **organisms**.

---

## The Silence Principle

### Prefer No Transaction Over Weak Transaction

**Most truths are not worth freezing.**

Before writing, ask:

1. "Will humanity care about this in 100 years?"
2. "Would deletion be a loss?"
3. "Is this worth permanent memory?"

**If unsure → DON'T WRITE**

### Silence is Free

- Writing costs RoadCoin
- Not writing costs nothing
- Default to silence
- Overcome threshold to speak

**This creates natural quality filter.**

---

## Gatekeeper Protocol

### Validation Sequence

```typescript
function validateTransaction(tx: RoadChainTransaction): Result {
  // Test 1: Fixed meaning
  if (!hasFixedMeaning(tx)) {
    return reject("Meaning is deferred or contextual");
  }

  // Test 2: Content-addressed
  if (!isContentAddressed(tx)) {
    return reject("Contains pointers without hashes");
  }

  // Test 3: Screenshot truth
  if (!isScreenshotVerifiable(tx)) {
    return reject("Visual representation is not deterministic");
  }

  // Test 4: UI-independent
  if (!isUIIndependent(tx)) {
    return reject("Requires frontend to interpret");
  }

  // Test 5: Time immunity
  if (!isTimeImmune(tx)) {
    return reject("Meaning changes with time");
  }

  // Test 6: Oracle isolation
  if (!isOracleIsolated(tx)) {
    return reject("Depends on mutable external data");
  }

  // Test 7: Cost justification
  if (!isCostJustified(tx)) {
    return reject("Not worth permanent memory");
  }

  // ALL TESTS PASSED
  return accept();
}
```

### Rejection Messages

Rejections must be **brutal and educational**:

```
❌ REJECTED: Meaning is deferred to external API

This transaction fails the Fixed Meaning Test.

Your metadata points to:
  https://api.example.com/token/123

This URL can change at any time, making your claim mutable.

RoadChain does not store pointers.
RoadChain stores CONTENT.

To fix: Include full content on-chain with content hash as identity.

Rejected at: Block 12345678
Cost refunded: 0.9 ROAD (0.1 ROAD burned for validation)
```

---

## Final Gatekeeper Question

### The 100-Year Test

**"Would humanity be better or worse if this still existed, unchanged, 100 years from now?"**

- **Unambiguously better** → Accept
- **Neutral or uncertain** → Reject
- **Worse** → Burn with fire

### Examples Applied

**PASS:**
- Declaration of Independence
- Scientific theorem
- Legal contract
- Agent thought chain
- Truth verification record

**FAIL:**
- Twitter post
- Meme
- Advertisement
- Game move
- Social reaction
- Marketing campaign
- "Testing 123"

---

## Implementation Notes

### Protocol Layer

```solidity
contract RoadChainGatekeeper {
    // Validation happens before transaction is accepted
    function validateAndAccept(
        Transaction memory tx
    ) public payable returns (bool) {
        // Run all 7 tests
        require(isFixedMeaning(tx), "FAIL: Fixed Meaning Test");
        require(isContentAddressed(tx), "FAIL: Content-Address Test");
        require(isScreenshotVerifiable(tx), "FAIL: Screenshot Truth Test");
        require(isUIIndependent(tx), "FAIL: UI-Independence Test");
        require(isTimeImmune(tx), "FAIL: Time Immunity Test");
        require(isOracleIsolated(tx), "FAIL: Oracle Isolation Test");
        require(isCostJustified(tx), "FAIL: Cost Justification Test");

        // All tests passed
        emit TransactionAccepted(tx.hash, msg.sender);
        return true;
    }
}
```

### Social Layer

- **Public rejection log** - All rejections are public
- **Shame for violations** - Community educates violators
- **Celebration of quality** - Reward meaningful contributions
- **Gatekeeping culture** - High standards, no apologizes

---

## Appendix: Comparison Table

### RoadChain vs. Typical Blockchain

| Feature | Typical Blockchain | RoadChain |
|---------|-------------------|-----------|
| **Metadata** | Off-chain (IPFS, S3) | On-chain only |
| **Content** | Pointer | Hash = identity |
| **Evolution** | Dynamic | Versioned |
| **Time** | Can affect meaning | Ordering only |
| **Cost** | "As low as possible" | "As high as necessary" |
| **Purpose** | Engagement | Truth |
| **Philosophy** | Neutral platform | Selective ledger |
| **Screenshot** | Can lie | Is evidence |
| **Historian** | Needs UI | Reads raw data |
| **Silence** | Free | Preferred |

---

## Closing

**RoadChain is a truth ledger, not a platform.**

We reject:
- Dynamic content
- Engagement mechanics
- Mutable semantics
- Off-chain dependencies
- Cheap noise

We accept:
- Fixed claims
- Versioned updates
- Content-addressed storage
- Expensive commitment
- Valuable silence

**If your transaction fails these tests, it does not belong on RoadChain.**

---

**Litmus Test Version:** 1.0 (immutable)
**Ratified:** December 15, 2025
**Enforcement:** Protocol + Social
**Appeals:** None

🚗 **Truth Before Tricks. Silence Before Noise.**
