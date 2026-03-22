# RoadCoin Service

Native cryptocurrency for the Blackroad ecosystem. RoadCoin (ROAD) is a blockchain-based digital currency for transactions, rewards, and governance.

## Features

- **HD Wallets**: BIP39 mnemonic-based wallet generation
- **Blockchain**: Proof-of-work blockchain with mining
- **Transactions**: Send and receive ROAD tokens
- **Mining**: Block mining with rewards
- **Balance Tracking**: Real-time balance queries
- **Token Minting**: Admin-controlled token creation
- **Transaction History**: Complete blockchain explorer

## Token Details

- **Name**: RoadCoin
- **Symbol**: ROAD
- **Decimals**: 18
- **Total Supply**: 1,000,000,000 ROAD
- **Block Time**: 15 seconds
- **Block Reward**: 50 ROAD

## API Endpoints

### Token Info
- `GET /api/v1/info` - Get RoadCoin information

### Wallets
- `POST /api/v1/wallets` - Create new wallet
- `GET /api/v1/wallets/:address/balance` - Get wallet balance

### Transactions
- `POST /api/v1/transactions` - Send transaction
- `GET /api/v1/transactions/:txId` - Get transaction details

### Blockchain
- `GET /api/v1/blockchain` - Get full blockchain
- `GET /api/v1/blocks/:index` - Get specific block
- `POST /api/v1/mine` - Mine new block

### Admin
- `POST /api/v1/tokens/mint` - Mint new tokens (requires admin key)

## Configuration

```bash
PORT=4220
REDIS_URL=redis://localhost:6379
ADMIN_KEY=your-secret-admin-key
AUTO_MINE=true
MINER_ADDRESS=0x...
```

## Usage Examples

### Create Wallet
```bash
curl -X POST http://localhost:4220/api/v1/wallets \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

### Send Transaction
```bash
curl -X POST http://localhost:4220/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0xabc...",
    "to": "0xdef...",
    "amount": 100,
    "privateKey": "..."
  }'
```

### Mine Block
```bash
curl -X POST http://localhost:4220/api/v1/mine \
  -H "Content-Type: application/json" \
  -d '{"minerAddress": "0x..."}'
```

## Technology Stack

- **Ethers.js** - Ethereum wallet generation
- **BIP39** - Mnemonic seed phrases
- **Crypto** - Hash functions and signatures
- **Redis** - Wallet and state persistence

## Integration

- **RoadChain** - Blockchain infrastructure
- **Metaverse Campus** - In-world currency
- **Finance Service** - Payment processing
- **Rewards System** - User incentives

## Security Notes

⚠️ **Development Mode**: This implementation is for development/testing. For production:
- Use hardware security modules (HSM) for key storage
- Implement multi-signature wallets
- Add rate limiting and DDoS protection
- Use proper key management (never store private keys in plaintext)
- Implement transaction replay protection
- Add comprehensive audit logging
