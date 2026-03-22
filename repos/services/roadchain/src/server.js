const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const WebSocket = require('ws');
const http = require('http');
const { ethers } = require('ethers');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'roadchain.log' })
  ]
});

// Middleware
app.use(cors());
app.use(express.json());

// RoadChain configuration
const CHAIN_CONFIG = {
  name: 'RoadChain',
  chainId: 1337,
  networkId: 1337,
  consensus: 'proof-of-stake',
  blockTime: 10, // seconds
  validatorReward: 10,
  minStake: 1000
};

// Blockchain state
const blockchain = [];
const stateDB = new Map(); // World state
const smartContracts = new Map();
const validators = new Map();
const peers = new Set();
const pendingTransactions = [];

// Genesis block
if (blockchain.length === 0) {
  const genesis = {
    index: 0,
    timestamp: Date.now(),
    transactions: [],
    stateRoot: calculateStateRoot(),
    previousHash: '0',
    hash: '0',
    validator: 'genesis',
    signature: '',
    nonce: 0
  };
  genesis.hash = calculateBlockHash(genesis);
  blockchain.push(genesis);
  logger.info('Genesis block created');
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'roadchain',
    uptime: process.uptime(),
    chain: {
      name: CHAIN_CONFIG.name,
      height: blockchain.length,
      validators: validators.size,
      peers: peers.size,
      pendingTx: pendingTransactions.length
    }
  });
});

// API: Get chain info
app.get('/api/v1/chain/info', (req, res) => {
  res.json({
    ...CHAIN_CONFIG,
    currentHeight: blockchain.length,
    latestBlock: blockchain[blockchain.length - 1],
    validators: Array.from(validators.values()).map(v => ({
      address: v.address,
      stake: v.stake,
      active: v.active
    }))
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

// API: Get latest blocks
app.get('/api/v1/blocks', (req, res) => {
  const { limit = 10 } = req.query;
  const blocks = blockchain.slice(-parseInt(limit)).reverse();
  res.json({ blocks, total: blockchain.length });
});

// API: Submit transaction
app.post('/api/v1/transactions', async (req, res) => {
  try {
    const { from, to, value, data, signature } = req.body;

    const transaction = {
      id: uuidv4(),
      from,
      to,
      value: value || 0,
      data: data || '',
      nonce: getAccountNonce(from),
      timestamp: Date.now(),
      signature,
      status: 'pending'
    };

    // Verify signature
    if (!verifyTransactionSignature(transaction)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    pendingTransactions.push(transaction);
    broadcastTransaction(transaction);

    logger.info(`Transaction submitted: ${transaction.id}`);

    res.json({ transaction });
  } catch (error) {
    logger.error('Error submitting transaction:', error);
    res.status(500).json({ error: 'Transaction submission failed' });
  }
});

// API: Get transaction
app.get('/api/v1/transactions/:txId', (req, res) => {
  const { txId } = req.params;

  // Search blockchain
  for (const block of blockchain) {
    const tx = block.transactions.find(t => t.id === txId);
    if (tx) {
      return res.json({
        transaction: tx,
        block: {
          index: block.index,
          hash: block.hash,
          timestamp: block.timestamp
        },
        confirmations: blockchain.length - block.index
      });
    }
  }

  // Search pending
  const pending = pendingTransactions.find(t => t.id === txId);
  if (pending) {
    return res.json({ transaction: pending, status: 'pending' });
  }

  res.status(404).json({ error: 'Transaction not found' });
});

// API: Deploy smart contract
app.post('/api/v1/contracts/deploy', async (req, res) => {
  try {
    const { bytecode, abi, from, args } = req.body;

    const contractAddress = generateContractAddress(from, getAccountNonce(from));

    const contract = {
      address: contractAddress,
      bytecode,
      abi,
      storage: new Map(),
      creator: from,
      createdAt: Date.now(),
      balance: 0
    };

    smartContracts.set(contractAddress, contract);

    // Create deployment transaction
    const tx = {
      id: uuidv4(),
      from,
      to: null,
      value: 0,
      data: bytecode,
      contractAddress,
      timestamp: Date.now(),
      status: 'pending'
    };

    pendingTransactions.push(tx);

    logger.info(`Contract deployed: ${contractAddress}`);

    res.json({
      contractAddress,
      transactionId: tx.id
    });
  } catch (error) {
    logger.error('Error deploying contract:', error);
    res.status(500).json({ error: 'Contract deployment failed' });
  }
});

// API: Call smart contract
app.post('/api/v1/contracts/call', async (req, res) => {
  try {
    const { contractAddress, method, args, from } = req.body;

    const contract = smartContracts.get(contractAddress);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Execute contract (simplified - use proper VM in production)
    const result = await executeContract(contract, method, args, from);

    res.json({ result });
  } catch (error) {
    logger.error('Error calling contract:', error);
    res.status(500).json({ error: 'Contract execution failed' });
  }
});

// API: Get contract
app.get('/api/v1/contracts/:address', (req, res) => {
  const { address } = req.params;
  const contract = smartContracts.get(address);

  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }

  res.json({
    address: contract.address,
    abi: contract.abi,
    creator: contract.creator,
    createdAt: contract.createdAt,
    balance: contract.balance
  });
});

// API: Get account state
app.get('/api/v1/accounts/:address', (req, res) => {
  const { address } = req.params;
  const account = stateDB.get(address) || {
    address,
    balance: 0,
    nonce: 0,
    codeHash: null
  };

  res.json({ account });
});

// API: Become validator
app.post('/api/v1/validators/register', async (req, res) => {
  try {
    const { address, stake } = req.body;

    if (stake < CHAIN_CONFIG.minStake) {
      return res.status(400).json({
        error: `Minimum stake is ${CHAIN_CONFIG.minStake}`
      });
    }

    const validator = {
      address,
      stake,
      active: true,
      joinedAt: Date.now(),
      blocksProduced: 0
    };

    validators.set(address, validator);

    logger.info(`Validator registered: ${address} with stake ${stake}`);

    res.json({ validator });
  } catch (error) {
    logger.error('Error registering validator:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// API: Get validators
app.get('/api/v1/validators', (req, res) => {
  const validatorList = Array.from(validators.values());
  res.json({ validators: validatorList });
});

// WebSocket P2P network
wss.on('connection', (ws, req) => {
  logger.info('New peer connected');
  peers.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handlePeerMessage(ws, data);
    } catch (error) {
      logger.error('Error handling peer message:', error);
    }
  });

  ws.on('close', () => {
    peers.delete(ws);
    logger.info('Peer disconnected');
  });

  // Send chain info
  ws.send(JSON.stringify({
    type: 'chain-info',
    height: blockchain.length,
    latestHash: blockchain[blockchain.length - 1].hash
  }));
});

// Helper functions
function calculateBlockHash(block) {
  const data = {
    index: block.index,
    timestamp: block.timestamp,
    transactions: block.transactions,
    stateRoot: block.stateRoot,
    previousHash: block.previousHash,
    validator: block.validator,
    nonce: block.nonce
  };

  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

function calculateStateRoot() {
  const stateArray = Array.from(stateDB.entries()).sort();
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(stateArray))
    .digest('hex');
}

function verifyTransactionSignature(transaction) {
  // Simplified verification (use proper ECDSA in production)
  return transaction.signature && transaction.signature.length > 0;
}

function getAccountNonce(address) {
  const account = stateDB.get(address);
  return account ? account.nonce : 0;
}

function generateContractAddress(from, nonce) {
  return ethers.getCreateAddress({ from, nonce });
}

async function executeContract(contract, method, args, caller) {
  // Simplified contract execution (use proper EVM in production)
  logger.info(`Executing contract ${contract.address}.${method}`);

  // Mock execution result
  return {
    success: true,
    returnValue: null,
    gasUsed: 21000
  };
}

function broadcastTransaction(transaction) {
  const message = JSON.stringify({
    type: 'new-transaction',
    transaction
  });

  peers.forEach(peer => {
    if (peer.readyState === WebSocket.OPEN) {
      peer.send(message);
    }
  });
}

function broadcastBlock(block) {
  const message = JSON.stringify({
    type: 'new-block',
    block
  });

  peers.forEach(peer => {
    if (peer.readyState === WebSocket.OPEN) {
      peer.send(message);
    }
  });
}

function handlePeerMessage(ws, data) {
  switch (data.type) {
    case 'request-chain':
      ws.send(JSON.stringify({
        type: 'chain',
        blockchain: blockchain
      }));
      break;

    case 'new-transaction':
      if (!pendingTransactions.find(t => t.id === data.transaction.id)) {
        pendingTransactions.push(data.transaction);
        logger.info(`Received transaction from peer: ${data.transaction.id}`);
      }
      break;

    case 'new-block':
      if (data.block.index === blockchain.length) {
        if (verifyBlock(data.block)) {
          blockchain.push(data.block);
          logger.info(`Received valid block from peer: ${data.block.index}`);
        }
      }
      break;
  }
}

function verifyBlock(block) {
  // Simplified verification
  if (block.index !== blockchain.length) return false;
  if (block.previousHash !== blockchain[blockchain.length - 1].hash) return false;
  if (calculateBlockHash(block) !== block.hash) return false;
  return true;
}

// Consensus - Proof of Stake block production
async function produceBlock() {
  if (pendingTransactions.length === 0) return;

  // Select validator (simplified round-robin)
  const validatorList = Array.from(validators.values()).filter(v => v.active);
  if (validatorList.length === 0) return;

  const validator = validatorList[blockchain.length % validatorList.length];

  const lastBlock = blockchain[blockchain.length - 1];
  const transactions = pendingTransactions.splice(0, 100); // Max 100 tx per block

  // Process transactions and update state
  transactions.forEach(tx => {
    const fromAccount = stateDB.get(tx.from) || { address: tx.from, balance: 0, nonce: 0 };
    const toAccount = stateDB.get(tx.to) || { address: tx.to, balance: 0, nonce: 0 };

    fromAccount.balance -= tx.value;
    fromAccount.nonce += 1;
    toAccount.balance += tx.value;

    stateDB.set(tx.from, fromAccount);
    stateDB.set(tx.to, toAccount);

    tx.status = 'confirmed';
  });

  const block = {
    index: blockchain.length,
    timestamp: Date.now(),
    transactions,
    stateRoot: calculateStateRoot(),
    previousHash: lastBlock.hash,
    hash: '',
    validator: validator.address,
    signature: '',
    nonce: 0
  };

  block.hash = calculateBlockHash(block);
  block.signature = 'validator-signature'; // Simplified

  blockchain.push(block);
  validator.blocksProduced += 1;

  broadcastBlock(block);
  logger.info(`Block ${block.index} produced by ${validator.address}`);
}

// Auto block production
setInterval(produceBlock, CHAIN_CONFIG.blockTime * 1000);

const PORT = process.env.PORT || 4221;
server.listen(PORT, () => {
  logger.info(`RoadChain node running on port ${PORT}`);
  console.log(`RoadChain blockchain node listening on port ${PORT}`);
});
