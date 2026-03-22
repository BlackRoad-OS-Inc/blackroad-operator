const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage
const accounts = new Map();
const transactions = new Map();
const invoices = new Map();
const expenses = new Map();
const budgets = new Map();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'finance-accounting-automation',
    uptime: process.uptime(),
    stats: {
      accounts: accounts.size,
      transactions: transactions.size,
      invoices: invoices.size
    }
  });
});

// Account Management
app.post('/api/v1/accounts', async (req, res) => {
  const account = {
    id: uuidv4(),
    ...req.body,
    balance: 0,
    createdAt: new Date().toISOString()
  };
  accounts.set(account.id, account);
  res.json({ account });
});

app.get('/api/v1/accounts', (req, res) => {
  res.json({ accounts: Array.from(accounts.values()) });
});

// Transactions
app.post('/api/v1/transactions', async (req, res) => {
  const transaction = {
    id: uuidv4(),
    ...req.body,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
  transactions.set(transaction.id, transaction);

  // Update account balances
  if (req.body.fromAccount) {
    const from = accounts.get(req.body.fromAccount);
    if (from) from.balance -= req.body.amount;
  }
  if (req.body.toAccount) {
    const to = accounts.get(req.body.toAccount);
    if (to) to.balance += req.body.amount;
  }

  // Integrate with RoadCoin if crypto payment
  if (req.body.paymentMethod === 'roadcoin') {
    try {
      await axios.post('http://roadcoin:4220/api/v1/transactions', {
        from: req.body.fromAddress,
        to: req.body.toAddress,
        amount: req.body.amount
      });
    } catch (error) {
      console.error('RoadCoin payment failed:', error.message);
    }
  }

  res.json({ transaction });
});

// Invoicing
app.post('/api/v1/invoices', async (req, res) => {
  const invoice = {
    id: uuidv4(),
    invoiceNumber: `INV-${Date.now()}`,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  invoices.set(invoice.id, invoice);
  res.json({ invoice });
});

app.post('/api/v1/invoices/:id/pay', async (req, res) => {
  const invoice = invoices.get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  invoice.status = 'paid';
  invoice.paidAt = new Date().toISOString();

  // Create transaction
  const transaction = {
    id: uuidv4(),
    type: 'payment',
    invoiceId: invoice.id,
    amount: invoice.amount,
    timestamp: new Date().toISOString()
  };
  transactions.set(transaction.id, transaction);

  res.json({ invoice, transaction });
});

app.get('/api/v1/invoices', (req, res) => {
  res.json({ invoices: Array.from(invoices.values()) });
});

// Expense Management
app.post('/api/v1/expenses', async (req, res) => {
  const expense = {
    id: uuidv4(),
    ...req.body,
    status: 'pending',
    submittedAt: new Date().toISOString()
  };
  expenses.set(expense.id, expense);

  // AI categorization
  const llmGateway = process.env.LLM_GATEWAY_URL || 'http://llm-gateway:4002';
  try {
    const response = await axios.post(`${llmGateway}/api/v1/complete`, {
      prompt: `Categorize this expense: ${req.body.description}. Choose from: Travel, Meals, Office, Software, Marketing, Other`,
      maxTokens: 50
    });
    expense.category = response.data.completion?.trim() || 'Other';
  } catch (error) {
    expense.category = 'Uncategorized';
  }

  res.json({ expense });
});

app.post('/api/v1/expenses/:id/approve', async (req, res) => {
  const expense = expenses.get(req.params.id);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });

  expense.status = 'approved';
  expense.approvedAt = new Date().toISOString();
  expense.approvedBy = req.body.approverId;

  res.json({ expense });
});

// Budget Management
app.post('/api/v1/budgets', async (req, res) => {
  const budget = {
    id: uuidv4(),
    ...req.body,
    spent: 0,
    createdAt: new Date().toISOString()
  };
  budgets.set(budget.id, budget);
  res.json({ budget });
});

app.get('/api/v1/budgets/:id', (req, res) => {
  const budget = budgets.get(req.params.id);
  if (!budget) return res.status(404).json({ error: 'Budget not found' });
  res.json({ budget });
});

// Financial Reports
app.get('/api/v1/reports/summary', (req, res) => {
  const totalRevenue = Array.from(transactions.values())
    .filter(t => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Array.from(expenses.values())
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  res.json({
    revenue: totalRevenue,
    expenses: totalExpenses,
    profit: totalRevenue - totalExpenses,
    invoices: {
      total: invoices.size,
      paid: Array.from(invoices.values()).filter(i => i.status === 'paid').length,
      pending: Array.from(invoices.values()).filter(i => i.status === 'pending').length
    }
  });
});

const PORT = process.env.PORT || 4301;
app.listen(PORT, () => {
  console.log(`Finance Accounting Automation service listening on port ${PORT}`);
});
