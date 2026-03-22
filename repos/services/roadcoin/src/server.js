const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { ethers } = require('ethers');
const bip39 = require('bip39');
const redis = require('redis');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'roadcoin.log' })
  ]
});

// Middleware
app.use(cors());
app.use(express.json());

// Redis for wallet and transaction storage
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

// RoadCoin configuration
const ROADCOIN_CONFIG = {
  name: 'RoadCoin',
  symbol: 'ROAD',
  decimals: 18,
  totalSupply: 1000000000, // 1 billion ROAD
  blockTime: 15, // seconds
  rewardPerBlock: 50
};

// In-memory blockchain (simplified - use real blockchain in production)
const blockchain = [];
const pendingTransactions = [];
const wallets = new Map();
const balances = new Map();

// Genesis block
if (blockchain.length === 0) {
  blockchain.push({
    index: 0,
    timestamp: Date.now(),
    transactions: [],
    previousHash: '0',
    hash: calculateHash(0, Date.now(), [], '0', 0),
    nonce: 0
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'roadcoin',
    uptime: process.uptime(),
    blockchain: {
      height: blockchain.length,
      pendingTx: pendingTransactions.length
    },
    token: ROADCOIN_CONFIG
  });
});

// API: Get RoadCoin info
app.get('/api/v1/info', (req, res) => {
  res.json({
    ...ROADCOIN_CONFIG,
    currentSupply: calculateCurrentSupply(),
    blockHeight: blockchain.length,
    difficulty: 4
  });
});

// API: Create wallet
app.post('/api/v1/wallets', async (req, res) => {
  try {
    const { userId } = req.body;

    // Generate mnemonic
    const mnemonic = bip39.generateMnemonic();

    // Create HD wallet
    const hdNode = ethers.HDNodeWallet.fromMnemonic(
      ethers.Mnemonic.fromPhrase(mnemonic)
    );

    const wallet = {
      id: uuidv4(),
      userId,
      address: hdNode.address,
      publicKey: hdNode.publicKey,
      mnemonic: mnemonic, // In production, encrypt this!
      createdAt: new Date().toISOString()
    };

    // Store wallet
    wallets.set(wallet.address, wallet);
    await redisClient.set(`wallet:${wallet.address}`, JSON.stringify(wallet));

    // Initialize balance
    balances.set(wallet.address, 0);

    logger.info(`Created wallet: ${wallet.address} for user: ${userId}`);

    res.json({
      wallet: {
        id: wallet.id,
        address: wallet.address,
        mnemonic: wallet.mnemonic
      }
    });
  } catch (error) {
    logger.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

// API: Get wallet balance
app.get('/api/v1/wallets/:address/balance', async (req, res) => {
  try {
    const { address } = req.params;

    const balance = balances.get(address) || 0;

    res.json({
      address,
      balance,
      symbol: ROADCOIN_CONFIG.symbol
    });
  } catch (error) {
    logger.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// API: Send transaction
app.post('/api/v1/transactions', async (req, res) => {
  try {
    const { from, to, amount, privateKey } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify balance
    const senderBalance = balances.get(from) || 0;
    if (senderBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = {
      id: uuidv4(),
      from,
      to,
      amount,
      timestamp: Date.now(),
      fee: calculateFee(amount),
      status: 'pending'
    };

    // Sign transaction (simplified)
    transaction.signature = signTransaction(transaction, privateKey);

    // Add to pending pool
    pendingTransactions.push(transaction);

    logger.info(`Transaction created: ${transaction.id} from ${from} to ${to}`);

    res.json({ transaction });
  } catch (error) {
    logger.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Transaction failed' });
  }
});

// API: Get transaction
app.get('/api/v1/transactions/:txId', async (req, res) => {
  try {
    const { txId } = req.params;

    // Search in blockchain
    for (const block of blockchain) {
      const tx = block.transactions.find(t => t.id === txId);
      if (tx) {
        return res.json({
          transaction: tx,
          block: {
            index: block.index,
            hash: block.hash,
            timestamp: block.timestamp
          }
        });
      }
    }

    // Search in pending
    const pendingTx = pendingTransactions.find(t => t.id === txId);
    if (pendingTx) {
      return res.json({
        transaction: pendingTx,
        status: 'pending'
      });
    }

    res.status(404).json({ error: 'Transaction not found' });
  } catch (error) {
    logger.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// API: Get blockchain
app.get('/api/v1/blockchain', (req, res) => {
  res.json({
    chain: blockchain,
    length: blockchain.length
  });
});

// API: Get block
app.get('/api/v1/blocks/:index', (req, res) => {
  const { index } = req.params;
  const block = blockchain[parseInt(index)];

  if (!block) {
    return res.status(404).json({ error: 'Block not found' });
  }

  res.json({ block });
});

// API: Mine block (for testing)
app.post('/api/v1/mine', async (req, res) => {
  try {
    const { minerAddress } = req.body;

    if (!minerAddress) {
      return res.status(400).json({ error: 'Miner address required' });
    }

    const block = mineBlock(minerAddress);
    logger.info(`Block mined: ${block.hash} by ${minerAddress}`);

    res.json({ block });
  } catch (error) {
    logger.error('Error mining block:', error);
    res.status(500).json({ error: 'Mining failed' });
  }
});

// API: Token operations
app.post('/api/v1/tokens/mint', async (req, res) => {
  try {
    const { address, amount, adminKey } = req.body;

    // Verify admin (simplified)
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const currentBalance = balances.get(address) || 0;
    balances.set(address, currentBalance + amount);

    logger.info(`Minted ${amount} ROAD to ${address}`);

    res.json({
      success: true,
      address,
      newBalance: balances.get(address)
    });
  } catch (error) {
    logger.error('Error minting tokens:', error);
    res.status(500).json({ error: 'Minting failed' });
  }
});

// Helper functions
function calculateHash(index, timestamp, transactions, previousHash, nonce) {
  return crypto
    .createHash('sha256')
    .update(index + timestamp + JSON.stringify(transactions) + previousHash + nonce)
    .digest('hex');
}

function mineBlock(minerAddress) {
  const lastBlock = blockchain[blockchain.length - 1];
  const index = lastBlock.index + 1;
  const timestamp = Date.now();
  const transactions = [...pendingTransactions];

  // Add mining reward transaction
  transactions.push({
    id: uuidv4(),
    from: 'COINBASE',
    to: minerAddress,
    amount: ROADCOIN_CONFIG.rewardPerBlock,
    timestamp,
    fee: 0,
    status: 'confirmed'
  });

  let nonce = 0;
  let hash = '';
  const difficulty = 4; // Number of leading zeros

  // Proof of work
  while (!hash.startsWith('0'.repeat(difficulty))) {
    nonce++;
    hash = calculateHash(index, timestamp, transactions, lastBlock.hash, nonce);
  }

  const block = {
    index,
    timestamp,
    transactions,
    previousHash: lastBlock.hash,
    hash,
    nonce
  };

  blockchain.push(block);

  // Update balances
  transactions.forEach(tx => {
    if (tx.from !== 'COINBASE') {
      const fromBalance = balances.get(tx.from) || 0;
      balances.set(tx.from, fromBalance - tx.amount - tx.fee);
    }

    const toBalance = balances.get(tx.to) || 0;
    balances.set(tx.to, toBalance + tx.amount);
  });

  // Clear pending transactions
  pendingTransactions.length = 0;

  return block;
}

function signTransaction(transaction, privateKey) {
  // Simplified signing (use proper ECDSA in production)
  const data = JSON.stringify({
    from: transaction.from,
    to: transaction.to,
    amount: transaction.amount,
    timestamp: transaction.timestamp
  });

  return crypto
    .createHmac('sha256', privateKey || 'default-key')
    .update(data)
    .digest('hex');
}

function calculateFee(amount) {
  return Math.max(0.001, amount * 0.001); // 0.1% fee
}

function calculateCurrentSupply() {
  const minedBlocks = blockchain.length - 1; // Exclude genesis
  return minedBlocks * ROADCOIN_CONFIG.rewardPerBlock;
}

// Auto-mining (for development)
if (process.env.AUTO_MINE === 'true') {
  setInterval(() => {
    if (pendingTransactions.length > 0) {
      mineBlock(process.env.MINER_ADDRESS || '0x0000000000000000000000000000000000000000');
      logger.info('Auto-mined block');
    }
  }, ROADCOIN_CONFIG.blockTime * 1000);
}

const PORT = process.env.PORT || 4220;
app.listen(PORT, () => {
  logger.info(`RoadCoin service running on port ${PORT}`);
  console.log(`RoadCoin (${ROADCOIN_CONFIG.symbol}) service listening on port ${PORT}`);
});
