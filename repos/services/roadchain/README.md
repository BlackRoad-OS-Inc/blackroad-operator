# RoadChain Service

Blockchain infrastructure powering the Blackroad ecosystem with smart contracts, proof-of-stake consensus, and distributed ledger technology.

## Features

- **Proof-of-Stake Consensus**: Energy-efficient block validation
- **Smart Contracts**: Deploy and execute decentralized applications
- **P2P Network**: WebSocket-based peer-to-peer communication
- **State Management**: Merkle tree-based world state
- **Validators**: Stake-based block production
- **Transaction Processing**: Fast and secure transaction handling
- **Account Model**: Ethereum-compatible account system

## Chain Configuration

- **Chain ID**: 1337
- **Network ID**: 1337
- **Consensus**: Proof of Stake
- **Block Time**: 10 seconds
- **Validator Reward**: 10 ROAD
- **Minimum Stake**: 1000 ROAD

## API Endpoints

### Chain Info
- `GET /api/v1/chain/info` - Get chain information

### Blocks
- `GET /api/v1/blocks/:index` - Get specific block
- `GET /api/v1/blocks?limit=N` - Get latest N blocks

### Transactions
- `POST /api/v1/transactions` - Submit transaction
- `GET /api/v1/transactions/:txId` - Get transaction details

### Smart Contracts
- `POST /api/v1/contracts/deploy` - Deploy contract
- `POST /api/v1/contracts/call` - Call contract method
- `GET /api/v1/contracts/:address` - Get contract details

### Accounts
- `GET /api/v1/accounts/:address` - Get account state

### Validators
- `POST /api/v1/validators/register` - Register as validator
- `GET /api/v1/validators` - List all validators

### Health
- `GET /health` - Node health status

## Configuration

```bash
PORT=4221
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
BLOCK_TIME=10
MIN_STAKE=1000
```

## Usage Examples

### Submit Transaction

```bash
curl -X POST http://localhost:4221/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0xabc...",
    "to": "0xdef...",
    "value": 100,
    "signature": "0x..."
  }'
```

### Deploy Smart Contract

```bash
curl -X POST http://localhost:4221/api/v1/contracts/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "bytecode": "0x60806040...",
    "abi": [...],
    "from": "0x..."
  }'
```

### Register Validator

```bash
curl -X POST http://localhost:4221/api/v1/validators/register \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x...",
    "stake": 5000
  }'
```

## Technology Stack

- **Ethers.js** - Ethereum utilities
- **WebSocket** - P2P networking
- **Crypto** - Hash functions
- **LevelDB** - Blockchain storage
- **Elliptic** - ECDSA signatures

## Architecture

```
┌──────────────┐
│   Clients    │
└──────┬───────┘
       │
┌──────▼──────────────┐
│  RoadChain Node     │
│  ┌──────────────┐   │
│  │  Consensus   │   │  (PoS)
│  ├──────────────┤   │
│  │   EVM        │   │  (Smart Contracts)
│  ├──────────────┤   │
│  │ State DB     │   │  (World State)
│  ├──────────────┤   │
│  │  P2P Layer   │   │  (Network)
│  └──────────────┘   │
└─────────────────────┘
       │
       ├─────────────────┬─────────────┐
┌──────▼──────┐   ┌──────▼──────┐  ┌──▼────┐
│   Peer 1    │   │   Peer 2    │  │ Peer N│
└─────────────┘   └─────────────┘  └───────┘
```

## Integration

- **RoadCoin** - Native currency
- **Smart Contract DApps** - Decentralized applications
- **Metaverse** - On-chain asset ownership
- **Finance Service** - Payment settlement

## Security Considerations

⚠️ **Development Version**: For production deployment:
- Implement proper EVM (Ethereum Virtual Machine)
- Add comprehensive consensus rules
- Use cryptographic signatures (ECDSA)
- Implement state pruning and checkpointing
- Add DDoS protection
- Use secure key management
- Implement proper finality rules
- Add network encryption
